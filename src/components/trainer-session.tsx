"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Question = {
  id: string;
  number: number;
  text: string;
  hintEasy: string;
  hintFull: string;
  answer: string;
};

type Stat = {
  questionId: string;
  text: string;
  knownCount: number;
  unknownCount: number;
};

function buildPrompt(question: string) {
  return `Я готовлюсь к собеседованию на senior frontend. Помоги разобрать тему по вопросу:

«${question}»

Цель — понять, а не зазубрить. Структурируй ответ так:
1. Что это и зачем нужно — простыми словами
2. Как работает под капотом (но без занудства)
3. Минимальный наглядный пример
4. Реальные кейсы из фронтенд-разработки, где это пригождается
5. Типичные ошибки и подводные камни
6. Что часто спрашивают рядом, если копают глубже

Пиши по-русски, без воды и без маркетинга. Если есть несколько подходов — сравни.`;
}

type Phase = "idle" | "running" | "done";

export function TrainerSession({
  questions,
  initialStats,
}: {
  questions: Question[];
  initialStats: Stat[];
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [index, setIndex] = useState(0);
  const [round, setRound] = useState({ known: 0, unknown: 0 });
  const [stats, setStats] = useState<Map<string, Stat>>(() => {
    const m = new Map<string, Stat>();
    for (const s of initialStats) m.set(s.questionId, s);
    return m;
  });
  const [showEasy, setShowEasy] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const [busy, setBusy] = useState(false);

  const total = questions.length;

  const onMark = async (result: "known" | "unknown") => {
    if (busy || phase !== "running") return;
    if (index >= total) return;
    setBusy(true);

    const q = questions[index];

    // Optimistic — обновляем глобальный счётчик и статистику раунда сразу.
    const prev = stats.get(q.id) ?? {
      questionId: q.id,
      text: q.text,
      knownCount: 0,
      unknownCount: 0,
    };
    const optimistic: Stat = {
      ...prev,
      knownCount: prev.knownCount + (result === "known" ? 1 : 0),
      unknownCount: prev.unknownCount + (result === "unknown" ? 1 : 0),
    };
    const nextStats = new Map(stats);
    nextStats.set(q.id, optimistic);
    setStats(nextStats);
    setRound((r) => ({
      known: r.known + (result === "known" ? 1 : 0),
      unknown: r.unknown + (result === "unknown" ? 1 : 0),
    }));

    try {
      await fetch("/api/trainer/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: q.id, result }),
      });
    } catch {
      /* при ошибке оставляем оптимистичное обновление; в логике это не критично */
    } finally {
      setBusy(false);
      // Переход дальше: либо следующая карта, либо done.
      if (index === total - 1) {
        setPhase("done");
      } else {
        setIndex(index + 1);
        setShowEasy(false);
        setShowFull(false);
        setShowAnswer(false);
      }
    }
  };

  const onCopy = async (text: string) => {
    const prompt = buildPrompt(text);
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 1500);
    } catch {
      setCopyState("error");
      setTimeout(() => setCopyState("idle"), 1500);
    }
  };

  const onStart = () => {
    setIndex(0);
    setRound({ known: 0, unknown: 0 });
    setShowEasy(false);
    setShowFull(false);
    setShowAnswer(false);
    setPhase("running");
  };

  const onClearAll = async () => {
    if (!confirm("Снести всю статистику тренажёра? Это нельзя откатить.")) return;
    try {
      const res = await fetch("/api/trainer/clear", { method: "DELETE" });
      if (res.ok) {
        setStats(new Map());
        setRound({ known: 0, unknown: 0 });
        setPhase("idle");
        setIndex(0);
      }
    } catch {
      /* silent — пользователь увидит, что не очистилось */
    }
  };

  // Сводка для нижнего списка
  const knownList = useMemo(
    () =>
      Array.from(stats.values())
        .filter((s) => s.knownCount > 0)
        .sort((a, b) => b.knownCount - a.knownCount),
    [stats],
  );
  const unknownList = useMemo(
    () =>
      Array.from(stats.values())
        .filter((s) => s.unknownCount > 0)
        .sort((a, b) => b.unknownCount - a.unknownCount),
    [stats],
  );

  if (total === 0) {
    return (
      <p className="mt-6 yzy-meta text-muted-foreground">
        NO QUESTIONS WITH FILLED ANSWERS YET — TRAINER NEEDS REFERENCE ANSWERS
        TO RUN.
      </p>
    );
  }

  return (
    <div className="mt-6">
      {/* Прогресс — только во время прохождения */}
      {phase === "running" && (
        <>
          <div className="flex items-end justify-between gap-4">
            <span className="yzy-meta text-muted-foreground tabular-nums">
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(total).padStart(2, "0")}
            </span>
            <span className="text-2xl sm:text-3xl font-medium tabular-nums leading-none">
              {Math.round(((index + 1) / total) * 100)}%
            </span>
          </div>
          <div className="mt-3 h-px w-full bg-foreground/20">
            <div
              className="h-px bg-foreground"
              style={{ width: `${Math.round(((index + 1) / total) * 100)}%` }}
            />
          </div>
        </>
      )}

      {/* Карточка / экран начала / экран финала */}
      <div className="mt-6">
        {phase === "idle" && (
          <div className="py-16 sm:py-24 flex flex-col items-center text-center">
            <button
              type="button"
              onClick={onStart}
              className="text-3xl sm:text-5xl font-medium uppercase tracking-tight leading-none text-foreground hover:text-muted-foreground transition-colors"
            >
              Start
            </button>
            <p className="mt-6 yzy-meta text-muted-foreground whitespace-pre-wrap">
              {total} CARDS    SELF-ASSESS EACH ONE
            </p>
          </div>
        )}

        {phase === "running" && (
          <RunningCard
            q={questions[index]}
            stat={
              stats.get(questions[index].id) ?? {
                questionId: questions[index].id,
                text: questions[index].text,
                knownCount: 0,
                unknownCount: 0,
              }
            }
            showEasy={showEasy}
            showFull={showFull}
            showAnswer={showAnswer}
            onToggleEasy={() => setShowEasy((v) => !v)}
            onToggleFull={() => setShowFull((v) => !v)}
            onToggleAnswer={() => setShowAnswer((v) => !v)}
            copyState={copyState}
            onCopy={() => onCopy(questions[index].text)}
            busy={busy}
            onPlus={() => onMark("known")}
            onMinus={() => onMark("unknown")}
          />
        )}

        {phase === "done" && (
          <div className="border border-foreground bg-card p-8 sm:p-12 flex flex-col items-center text-center">
            <p className="yzy-label text-muted-foreground">RESULT</p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-medium uppercase tracking-tight">
              Test passed
            </h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground">
              Your result for this round
            </p>
            <p className="mt-2 text-2xl sm:text-3xl font-medium tabular-nums">
              +{round.known} / −{round.unknown}
            </p>
            <button
              type="button"
              onClick={() => {
                router.refresh();
                onStart();
              }}
              className="mt-6 yzy-label text-foreground border border-foreground px-8 py-4 text-base hover:bg-foreground hover:text-background transition-colors"
            >
              START AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Нижний список — простые две колонки без бордеров */}
      <section className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
        <StatList label="KNOWN" sign="+" entries={knownList} kind="known" />
        <StatList label="UNKNOWN" sign="−" entries={unknownList} kind="unknown" />
      </section>

      {/* Кнопка очистки базы — только на странице тренера, внизу */}
      <div className="mt-12 flex items-center justify-center">
        <button
          type="button"
          onClick={onClearAll}
          className="yzy-label text-muted-foreground hover:text-foreground transition-colors"
        >
          CLEAR ALL STATS
        </button>
      </div>
    </div>
  );
}

function RunningCard({
  q,
  stat,
  showEasy,
  showFull,
  showAnswer,
  onToggleEasy,
  onToggleFull,
  onToggleAnswer,
  copyState,
  onCopy,
  busy,
  onPlus,
  onMinus,
}: {
  q: Question;
  stat: Stat;
  showEasy: boolean;
  showFull: boolean;
  showAnswer: boolean;
  onToggleEasy: () => void;
  onToggleFull: () => void;
  onToggleAnswer: () => void;
  copyState: "idle" | "copied" | "error";
  onCopy: () => void;
  busy: boolean;
  onPlus: () => void;
  onMinus: () => void;
}) {
  return (
    <article className="border border-foreground bg-card p-4 sm:p-6">
      <header className="flex items-baseline gap-4">
        <div className="text-sm sm:text-base leading-snug font-medium tabular-nums shrink-0 min-w-[2ch] text-muted-foreground">
          {String(q.number).padStart(2, "0")}
        </div>
        <h3 className="flex-1 min-w-0 text-sm sm:text-base leading-snug font-medium tracking-tight">
          {q.text}
        </h3>
        {(stat.knownCount > 0 || stat.unknownCount > 0) && (
          <span className="yzy-label tabular-nums text-muted-foreground whitespace-nowrap">
            +{stat.knownCount} / −{stat.unknownCount}
          </span>
        )}
      </header>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
        <ToggleLink active={showEasy} disabled={!q.hintEasy} onClick={onToggleEasy}>
          {showEasy ? "HIDE HINT A" : "HINT A"}
        </ToggleLink>
        <ToggleLink active={showFull} disabled={!q.hintFull} onClick={onToggleFull}>
          {showFull ? "HIDE HINT B" : "HINT B"}
        </ToggleLink>
        <ToggleLink
          active={showAnswer}
          disabled={!q.answer}
          onClick={onToggleAnswer}
        >
          {showAnswer ? "HIDE ANSWER" : "REVEAL ANSWER"}
        </ToggleLink>
        <button
          type="button"
          onClick={onCopy}
          className={cn(
            "yzy-label transition-colors whitespace-nowrap",
            copyState === "copied"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {copyState === "copied"
            ? "COPIED"
            : copyState === "error"
              ? "ERROR"
              : "COPY PROMPT"}
        </button>
      </div>

      {showEasy && q.hintEasy && <Hint label="HINT A — LIGHT">{q.hintEasy}</Hint>}
      {showFull && q.hintFull && <Hint label="HINT B — FULL">{q.hintFull}</Hint>}

      {showAnswer && q.answer && (
        <div className="mt-4 border border-foreground p-4">
          <div className="yzy-label text-muted-foreground mb-2">REFERENCE ANSWER</div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{q.answer}</p>
        </div>
      )}

      {/* +/− без обводок, разнесены к разным краям карточки */}
      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onPlus}
          disabled={busy}
          aria-label="Знаю ответ"
          className={cn(
            "h-12 w-12 text-3xl font-medium leading-none transition-colors",
            "text-foreground hover:text-muted-foreground",
            "disabled:opacity-40 disabled:cursor-not-allowed",
          )}
        >
          +
        </button>
        <button
          type="button"
          onClick={onMinus}
          disabled={busy}
          aria-label="Не знаю ответ"
          className={cn(
            "h-12 w-12 text-3xl font-medium leading-none transition-colors",
            "text-foreground hover:text-muted-foreground",
            "disabled:opacity-40 disabled:cursor-not-allowed",
          )}
        >
          −
        </button>
      </div>
    </article>
  );
}

function ToggleLink({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "yzy-label transition-colors",
        disabled && "opacity-30 cursor-not-allowed",
        !disabled &&
          (active
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"),
      )}
    >
      {children}
    </button>
  );
}

function Hint({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 border border-foreground p-4">
      <div className="yzy-label text-muted-foreground mb-2">{label}</div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{children}</p>
    </div>
  );
}

function StatList({
  label,
  sign,
  entries,
  kind,
}: {
  label: string;
  sign: string;
  entries: Stat[];
  kind: "known" | "unknown";
}) {
  return (
    <div>
      <div className="pb-2">
        <span className="yzy-label">
          {sign} {label}
        </span>
      </div>
      {entries.length === 0 ? (
        <p className="yzy-meta text-muted-foreground">
          {kind === "known" ? "Nothing marked yet" : "All clean so far"}
        </p>
      ) : (
        <ul className="space-y-2">
          {entries.map((e) => (
            <li key={e.questionId} className="flex items-baseline gap-3">
              <span className="flex-1 min-w-0 text-sm leading-snug">{e.text}</span>
              <span className="yzy-label tabular-nums text-muted-foreground whitespace-nowrap">
                {kind === "known" ? e.knownCount : e.unknownCount}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
