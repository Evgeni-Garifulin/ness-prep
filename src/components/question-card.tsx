"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Props = {
  questionId: string;
  number: number;
  text: string;
  initialAnswer: string;
  hintEasy: string;
  hintFull: string;
  correctAnswer: string;
};

const SAVE_DEBOUNCE_MS = 700;

export function QuestionCard({
  questionId,
  number,
  text,
  initialAnswer,
  hintEasy,
  hintFull,
  correctAnswer,
}: Props) {
  const [answer, setAnswer] = useState(initialAnswer ?? "");
  const [showEasy, setShowEasy] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [showCorrect, setShowCorrect] = useState(false);
  const [savedState, setSavedState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [, startTransition] = useTransition();

  const lastSavedRef = useRef(initialAnswer ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (answer === lastSavedRef.current) return;
    setSavedState("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      startTransition(async () => {
        try {
          const res = await fetch("/api/answers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ questionId, text: answer }),
          });
          if (!res.ok) throw new Error("save failed");
          lastSavedRef.current = answer;
          setSavedState("saved");
          setTimeout(() => setSavedState((s) => (s === "saved" ? "idle" : s)), 1200);
        } catch {
          setSavedState("error");
        }
      });
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [answer, questionId]);

  const isAnswered = answer.trim().length > 0;
  const hasEasy = hintEasy.trim().length > 0;
  const hasFull = hintFull.trim().length > 0;
  const hasCorrect = correctAnswer.trim().length > 0;

  return (
    <article
      className={cn(
        "rounded-lg border border-border bg-card p-3 sm:p-5 shadow-sm",
        isAnswered && "ring-1 ring-emerald-500/30",
      )}
    >
      <header className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 h-7 min-w-7 rounded-md border border-border px-2 text-center text-xs font-mono leading-7",
            "shrink-0 text-muted-foreground",
            isAnswered && "border-emerald-500/40 text-emerald-400",
          )}
        >
          {number}
        </div>
        <h3 className="text-sm sm:text-base leading-snug font-medium">{text}</h3>
      </header>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={showEasy ? "secondary" : "outline"}
          disabled={!hasEasy}
          onClick={() => setShowEasy((v) => !v)}
        >
          {showEasy ? "Скрыть лёгкую" : "Лёгкая подсказка"}
        </Button>
        <Button
          size="sm"
          variant={showFull ? "secondary" : "outline"}
          disabled={!hasFull}
          onClick={() => setShowFull((v) => !v)}
        >
          {showFull ? "Скрыть полную" : "Полная подсказка"}
        </Button>
        <Button
          size="sm"
          variant={showCorrect ? "secondary" : "outline"}
          disabled={!hasCorrect}
          onClick={() => setShowCorrect((v) => !v)}
        >
          {showCorrect ? "Скрыть ответ" : "Показать ответ"}
        </Button>
        <span
          className={cn(
            "ml-auto text-xs",
            savedState === "saving" && "text-muted-foreground",
            savedState === "saved" && "text-emerald-400",
            savedState === "error" && "text-destructive",
          )}
          aria-live="polite"
        >
          {savedState === "saving" && "Сохраняю…"}
          {savedState === "saved" && "Сохранено"}
          {savedState === "error" && "Ошибка"}
        </span>
      </div>

      {showEasy && hasEasy && (
        <Hint kind="easy" text={hintEasy} />
      )}
      {showFull && hasFull && (
        <Hint kind="full" text={hintFull} />
      )}

      <div className="mt-3">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">
          Твой ответ
        </label>
        <Textarea
          rows={3}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Напиши ответ своими словами…"
          className="text-sm sm:text-base"
        />
      </div>

      {showCorrect && hasCorrect && (
        <div className="mt-3 rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm leading-relaxed">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-400">
            Правильный ответ
          </div>
          <p className="whitespace-pre-wrap">{correctAnswer}</p>
        </div>
      )}

      {!hasEasy && !hasFull && !hasCorrect && (
        <p className="mt-3 text-xs text-muted-foreground">
          Подсказки и эталонный ответ ещё не заполнены.
        </p>
      )}
    </article>
  );
}

function Hint({ kind, text }: { kind: "easy" | "full"; text: string }) {
  const palette =
    kind === "easy"
      ? "border-amber-500/30 bg-amber-500/5 text-amber-200"
      : "border-sky-500/30 bg-sky-500/5 text-sky-200";
  const label = kind === "easy" ? "Лёгкая подсказка" : "Полная подсказка";
  return (
    <div className={cn("mt-3 rounded-md border p-3 text-sm leading-relaxed", palette)}>
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-80">
        {label}
      </div>
      <p className="whitespace-pre-wrap text-foreground/90">{text}</p>
    </div>
  );
}
