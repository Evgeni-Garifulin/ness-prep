"use client";

import { useEffect, useRef, useState, useTransition } from "react";
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
    <article className="border border-foreground bg-card p-4 sm:p-6">
      <header className="flex items-baseline gap-4">
        <div className="text-sm sm:text-base leading-snug font-medium tabular-nums shrink-0 min-w-[2ch] text-muted-foreground">
          {String(number).padStart(2, "0")}
        </div>
        <h3
          className={cn(
            "flex-1 min-w-0 text-sm sm:text-base leading-snug font-medium tracking-tight",
            isAnswered && "line-through text-muted-foreground",
          )}
        >
          {text}
        </h3>
        {isAnswered && (
          <span className="yzy-label shrink-0 text-foreground whitespace-nowrap self-center">
            ANSWERED
          </span>
        )}
      </header>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
        <ToggleLink
          active={showEasy}
          disabled={!hasEasy}
          onClick={() => setShowEasy((v) => !v)}
        >
          {showEasy ? "HIDE HINT A" : "HINT A"}
        </ToggleLink>
        <ToggleLink
          active={showFull}
          disabled={!hasFull}
          onClick={() => setShowFull((v) => !v)}
        >
          {showFull ? "HIDE HINT B" : "HINT B"}
        </ToggleLink>
        <ToggleLink
          active={showCorrect}
          disabled={!hasCorrect}
          onClick={() => setShowCorrect((v) => !v)}
        >
          {showCorrect ? "HIDE ANSWER" : "REVEAL ANSWER"}
        </ToggleLink>
        <span
          className={cn(
            "ml-auto yzy-label tabular-nums text-muted-foreground",
            savedState === "idle" && "opacity-0",
          )}
          aria-live="polite"
        >
          {savedState === "saving" && "SAVING…"}
          {savedState === "saved" && "SAVED"}
          {savedState === "error" && "ERROR"}
        </span>
      </div>

      {showEasy && hasEasy && <Hint label="HINT A — LIGHT">{hintEasy}</Hint>}
      {showFull && hasFull && <Hint label="HINT B — FULL">{hintFull}</Hint>}

      <div className="mt-5">
        <label className="yzy-label text-muted-foreground block mb-2">
          YOUR ANSWER
        </label>
        <Textarea
          rows={3}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer…"
          className="text-sm"
        />
      </div>

      {showCorrect && hasCorrect && (
        <div className="mt-5 border border-foreground p-4">
          <div className="yzy-label text-muted-foreground mb-2">REFERENCE ANSWER</div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{correctAnswer}</p>
        </div>
      )}

      {!hasEasy && !hasFull && !hasCorrect && (
        <p className="mt-4 yzy-meta text-muted-foreground">
          HINTS AND REFERENCE NOT YET FILLED IN.
        </p>
      )}
    </article>
  );
}

// Активный таб = чёрный, неактивный = светло-серый. Никаких подчёркиваний и
// инверсий — поведение как в макете.
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
