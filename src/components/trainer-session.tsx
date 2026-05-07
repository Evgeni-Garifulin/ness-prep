"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type Question = {
  id: string;
  number: number;
  text: string;
  hintEasy: string;
  hintFull: string;
  answer: string;
  section: string;
};

type Stat = {
  questionId: string;
  text: string;
  section: string;
  knownCount: number;
  unknownCount: number;
};

type Phase = "idle" | "running" | "done";

export function TrainerSession({
  questions,
  initialStats,
}: {
  questions: Question[];
  initialStats: Stat[];
}) {
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
      section: q.section,
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

  const onStart = () => {
    setIndex(0);
    setRound({ known: 0, unknown: 0 });
    setShowEasy(false);
    setShowFull(false);
    setShowAnswer(false);
    setPhase("running");
  };

  // RESET-кнопка из шапки шлёт кастомное событие — слушаем его и откатываем
  // тренажёр на стартовый экран. Прогресс раунда сбрасывается, accumulated
  // stats остаются (их можно снести только CLEAR ALL STATS внизу страницы).
  useEffect(() => {
    const handler = () => {
      setPhase("idle");
      setIndex(0);
      setRound({ known: 0, unknown: 0 });
      setShowEasy(false);
      setShowFull(false);
      setShowAnswer(false);
    };
    window.addEventListener("trainer:reset", handler);
    return () => window.removeEventListener("trainer:reset", handler);
  }, []);

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

  // Сводка для нижнего списка — группируем по теме (section), считаем сколько
  // уникальных вопросов из этой темы попало в +/− список. Если вопрос отмечен
  // и так и этак — он учитывается в обоих списках, но один раз в каждом.
  const knownBySection = useMemo(
    () => groupBySection(stats, "known"),
    [stats],
  );
  const unknownBySection = useMemo(
    () => groupBySection(stats, "unknown"),
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
    <div className="mt-6 max-w-3xl mx-auto">
      {/* Сама сессия и нижний список ужe чем page-шапка — карточка вопроса
          в drill-режиме читается комфортнее в более узкой колонке. */}
      {/* Прогресс — только во время прохождения. Считается по числу
          отвеченных карточек в текущем раунде (round.known + round.unknown),
          а не по позиции. На стартовом первом вопросе это 0 / 25 = 0%. */}
      {phase === "running" && (() => {
        const answered = round.known + round.unknown;
        const pct = total > 0 ? Math.round((answered / total) * 100) : 0;
        return (
          <>
            <div className="flex items-end justify-between gap-4">
              <span className="yzy-meta text-muted-foreground tabular-nums">
                {String(answered).padStart(2, "0")} /{" "}
                {String(total).padStart(2, "0")}
              </span>
              <span className="text-2xl sm:text-3xl font-medium tabular-nums leading-none">
                {pct}%
              </span>
            </div>
            <div className="mt-3 h-px w-full bg-foreground/20">
              <div className="h-px bg-foreground" style={{ width: `${pct}%` }} />
            </div>
          </>
        );
      })()}

      {/* Карточка / экран начала / экран финала */}
      <div className="mt-6">
        {phase === "idle" && (
          <div className="py-16 sm:py-24 flex flex-col items-center text-center">
            <button
              type="button"
              onClick={onStart}
              aria-label="Start trainer"
              className="text-6xl sm:text-7xl font-bold uppercase tracking-tight leading-none text-foreground hover:text-muted-foreground transition-colors"
            >
              START
            </button>
            <p className="mt-8 yzy-label text-muted-foreground whitespace-pre-wrap">
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
                section: questions[index].section,
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
            busy={busy}
            onPlus={() => onMark("known")}
            onMinus={() => onMark("unknown")}
          />
        )}

        {phase === "done" && (
          <div className="py-16 sm:py-24 flex flex-col items-center text-center">
            <h2 className="text-5xl sm:text-6xl font-bold uppercase tracking-tight leading-none">
              TEST FINISHED
            </h2>
            <p className="mt-8 text-2xl sm:text-3xl font-medium tabular-nums">
              +{round.known} / −{round.unknown}
            </p>
            <button
              type="button"
              onClick={onStart}
              aria-label="Start again"
              className="mt-10 yzy-label text-muted-foreground hover:text-foreground transition-colors"
            >
              START AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Нижний список — простые две колонки без бордеров. Группируем по
          теме: слева тема, справа сколько вопросов из неё в списке. */}
      <section className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
        <StatList label="KNOWN" sign="+" entries={knownBySection} kind="known" />
        <StatList label="UNKNOWN" sign="−" entries={unknownBySection} kind="unknown" />
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
  busy: boolean;
  onPlus: () => void;
  onMinus: () => void;
}) {
  return (
    <article className="border border-foreground bg-card p-4 sm:p-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-4">
          <span className="yzy-label text-muted-foreground">{q.section}</span>
          {(stat.knownCount > 0 || stat.unknownCount > 0) && (
            <span className="yzy-label tabular-nums text-muted-foreground whitespace-nowrap">
              +{stat.knownCount} / −{stat.unknownCount}
            </span>
          )}
        </div>
        <h3 className="text-sm sm:text-base leading-snug font-medium tracking-tight">
          {q.text}
        </h3>
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
      </div>

      {showEasy && q.hintEasy && <Hint label="HINT A — LIGHT">{q.hintEasy}</Hint>}
      {showFull && q.hintFull && <Hint label="HINT B — FULL">{q.hintFull}</Hint>}

      {showAnswer && q.answer && (
        <div className="mt-4">
          <div className="yzy-label text-muted-foreground mb-2">REFERENCE ANSWER</div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{q.answer}</p>
        </div>
      )}

      {/* +/− без обводок. Равные интервалы: edge-to-+, +-to-−, −-to-edge. */}
      <div className="mt-6 flex items-center justify-evenly">
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
    <div className="mt-4">
      <div className="yzy-label text-muted-foreground mb-2">{label}</div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{children}</p>
    </div>
  );
}

type SectionGroup = {
  section: string;
  count: number;
  questions: { questionId: string; text: string; count: number }[];
};

function groupBySection(
  stats: Map<string, Stat>,
  kind: "known" | "unknown",
): SectionGroup[] {
  const m = new Map<string, SectionGroup>();
  for (const s of stats.values()) {
    const c = kind === "known" ? s.knownCount : s.unknownCount;
    if (c <= 0) continue;
    const key = s.section || "—";
    let g = m.get(key);
    if (!g) {
      g = { section: key, count: 0, questions: [] };
      m.set(key, g);
    }
    g.count += 1;
    g.questions.push({ questionId: s.questionId, text: s.text, count: c });
  }
  for (const g of m.values()) {
    g.questions.sort((a, b) => (b.count - a.count) || a.text.localeCompare(b.text));
  }
  return Array.from(m.values()).sort(
    (a, b) => (b.count - a.count) || a.section.localeCompare(b.section),
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
  entries: SectionGroup[];
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
        <ul className="space-y-4">
          {entries.map((g) => (
            <li key={g.section}>
              <div className="flex items-baseline gap-3">
                <span className="flex-1 min-w-0 yzy-label text-muted-foreground">
                  {g.section}
                </span>
                <span className="yzy-label tabular-nums text-muted-foreground whitespace-nowrap">
                  {g.count}
                </span>
              </div>
              <ul className="mt-2 pl-6 space-y-1">
                {g.questions.map((q) => (
                  <li key={q.questionId} className="flex items-baseline gap-3">
                    <span className="flex-1 min-w-0 text-sm leading-snug text-muted-foreground">
                      {q.text}
                    </span>
                    <span className="yzy-label tabular-nums text-muted-foreground whitespace-nowrap">
                      {q.count}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
