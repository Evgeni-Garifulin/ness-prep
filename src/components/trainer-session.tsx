"use client";

import { useMemo, useState } from "react";
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

export function TrainerSession({
  questions,
  initialStats,
}: {
  questions: Question[];
  initialStats: Stat[];
}) {
  const [index, setIndex] = useState(0);
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

  if (questions.length === 0) {
    return (
      <p className="mt-6 yzy-meta text-muted-foreground">
        NO QUESTIONS WITH FILLED ANSWERS YET — TRAINER NEEDS REFERENCE ANSWERS TO RUN.
      </p>
    );
  }

  const total = questions.length;
  const q = questions[index];
  const stat = stats.get(q.id) ?? {
    questionId: q.id,
    text: q.text,
    knownCount: 0,
    unknownCount: 0,
  };

  // На переход к следующей карточке скрываем все панели — иначе видно ответ
  // на вопрос #2 от прошлого взаимодействия с #1.
  const goTo = (i: number) => {
    if (i < 0 || i >= total) return;
    setIndex(i);
    setShowEasy(false);
    setShowFull(false);
    setShowAnswer(false);
  };

  const onMark = async (result: "known" | "unknown") => {
    if (busy) return;
    setBusy(true);
    // Optimistic update
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

    try {
      const res = await fetch("/api/trainer/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: q.id, result }),
      });
      if (res.ok) {
        const body = await res.json();
        const synced: Stat = {
          questionId: q.id,
          text: q.text,
          knownCount: body.knownCount,
          unknownCount: body.unknownCount,
        };
        const m2 = new Map(stats);
        m2.set(q.id, synced);
        setStats(m2);
      }
    } catch {
      // на ошибке откатываем оптимистичное обновление
      setStats(stats);
    } finally {
      setBusy(false);
      // переезд на следующую карточку — естественный UX в drill-режиме
      if (index < total - 1) goTo(index + 1);
    }
  };

  const onCopy = async () => {
    const prompt = buildPrompt(q.text);
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 1500);
    } catch {
      setCopyState("error");
      setTimeout(() => setCopyState("idle"), 1500);
    }
  };

  const pct = Math.round(((index + 1) / total) * 100);

  // Сводка для нижнего списка — две колонки
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

  return (
    <div className="mt-6">
      {/* Прогресс */}
      <div className="flex items-baseline justify-between yzy-meta text-muted-foreground tabular-nums">
        <span>
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="mt-2 h-px w-full bg-foreground/20">
        <div className="h-px bg-foreground" style={{ width: `${pct}%` }} />
      </div>

      {/* Навигация: ←  card  → */}
      <div className="mt-6 grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          aria-label="Previous question"
          className={cn(
            "yzy-label transition-colors px-2",
            index === 0
              ? "text-muted-foreground/40 cursor-not-allowed"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          ←
        </button>

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
            <ToggleLink
              active={showEasy}
              disabled={!q.hintEasy}
              onClick={() => setShowEasy((v) => !v)}
            >
              {showEasy ? "HIDE HINT A" : "HINT A"}
            </ToggleLink>
            <ToggleLink
              active={showFull}
              disabled={!q.hintFull}
              onClick={() => setShowFull((v) => !v)}
            >
              {showFull ? "HIDE HINT B" : "HINT B"}
            </ToggleLink>
            <ToggleLink
              active={showAnswer}
              disabled={!q.answer}
              onClick={() => setShowAnswer((v) => !v)}
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

          {showEasy && q.hintEasy && (
            <Hint label="HINT A — LIGHT">{q.hintEasy}</Hint>
          )}
          {showFull && q.hintFull && (
            <Hint label="HINT B — FULL">{q.hintFull}</Hint>
          )}

          {showAnswer && q.answer && (
            <div className="mt-4 border border-foreground p-4">
              <div className="yzy-label text-muted-foreground mb-2">
                REFERENCE ANSWER
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {q.answer}
              </p>
            </div>
          )}

          {/* +/- большие кнопки */}
          <div className="mt-6 grid grid-cols-2 gap-px border border-foreground bg-foreground">
            <button
              type="button"
              onClick={() => onMark("known")}
              disabled={busy}
              aria-label="Знаю ответ"
              className={cn(
                "bg-background py-4 text-2xl font-medium transition-colors",
                "hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              +
            </button>
            <button
              type="button"
              onClick={() => onMark("unknown")}
              disabled={busy}
              aria-label="Не знаю ответ"
              className={cn(
                "bg-background py-4 text-2xl font-medium transition-colors",
                "hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              −
            </button>
          </div>
        </article>

        <button
          type="button"
          onClick={() => goTo(index + 1)}
          disabled={index === total - 1}
          aria-label="Next question"
          className={cn(
            "yzy-label transition-colors px-2",
            index === total - 1
              ? "text-muted-foreground/40 cursor-not-allowed"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          →
        </button>
      </div>

      {/* Нижний список: две колонки KNOWN / UNKNOWN */}
      <section className="mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px border border-foreground bg-foreground">
          <StatColumn label="KNOWN" sign="+" entries={knownList} kind="known" />
          <StatColumn
            label="UNKNOWN"
            sign="−"
            entries={unknownList}
            kind="unknown"
          />
        </div>
      </section>
    </div>
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

function StatColumn({
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
    <div className="bg-background">
      <div className="border-b border-foreground px-4 py-3 flex items-baseline justify-between">
        <span className="yzy-label">
          {sign} {label}
        </span>
        <span className="yzy-meta text-muted-foreground tabular-nums">
          {entries.length}
        </span>
      </div>
      {entries.length === 0 ? (
        <p className="px-4 py-6 yzy-meta text-muted-foreground text-center">
          {kind === "known" ? "Nothing marked yet" : "All clean so far"}
        </p>
      ) : (
        <ul className="divide-y divide-foreground/30">
          {entries.map((e) => (
            <li
              key={e.questionId}
              className="px-4 py-3 flex items-baseline gap-3"
            >
              <span className="flex-1 min-w-0 text-sm leading-snug">
                {e.text}
              </span>
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
