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
        "border border-foreground bg-card p-4 sm:p-6",
        isAnswered && "bg-foreground text-background",
      )}
    >
      <header className="flex items-start gap-4">
        <div
          className={cn(
            "yzy-label tabular-nums shrink-0 mt-1 min-w-7",
            isAnswered ? "opacity-100" : "opacity-60",
          )}
        >
          {String(number).padStart(2, "0")}
        </div>
        <h3 className="text-sm sm:text-base leading-snug font-medium tracking-tight">
          {text}
        </h3>
      </header>

      <div className="mt-5 flex flex-wrap items-center gap-3 text-xs">
        <ToggleLink active={showEasy} disabled={!hasEasy} onClick={() => setShowEasy((v) => !v)}>
          {showEasy ? "Hide hint A" : "Hint A"}
        </ToggleLink>
        <ToggleLink active={showFull} disabled={!hasFull} onClick={() => setShowFull((v) => !v)}>
          {showFull ? "Hide hint B" : "Hint B"}
        </ToggleLink>
        <ToggleLink
          active={showCorrect}
          disabled={!hasCorrect}
          onClick={() => setShowCorrect((v) => !v)}
        >
          {showCorrect ? "Hide answer" : "Reveal answer"}
        </ToggleLink>
        <span
          className={cn(
            "ml-auto yzy-label tabular-nums",
            savedState === "saving" && "opacity-60",
            savedState === "saved" && "opacity-100",
            savedState === "error" && "opacity-100",
            savedState === "idle" && "opacity-0",
          )}
          aria-live="polite"
        >
          {savedState === "saving" && "Saving…"}
          {savedState === "saved" && "Saved"}
          {savedState === "error" && "Error"}
        </span>
      </div>

      {showEasy && hasEasy && <Hint label="Hint A — light">{hintEasy}</Hint>}
      {showFull && hasFull && <Hint label="Hint B — full">{hintFull}</Hint>}

      <div className="mt-5">
        <label className="yzy-label opacity-60 block mb-2">Your answer</label>
        <Textarea
          rows={3}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer…"
          className={cn(
            "text-sm",
            isAnswered &&
              "border-background bg-transparent text-background placeholder:text-background/50 focus-visible:ring-background",
          )}
        />
      </div>

      {showCorrect && hasCorrect && (
        <div className="mt-5 border border-current p-4">
          <div className="yzy-label opacity-60 mb-2">Reference answer</div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{correctAnswer}</p>
        </div>
      )}

      {!hasEasy && !hasFull && !hasCorrect && (
        <p className="mt-4 yzy-meta opacity-50">
          Hints and reference not yet filled in.
        </p>
      )}
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
        "yzy-label transition-opacity",
        disabled && "opacity-30 cursor-not-allowed",
        !disabled && active && "underline underline-offset-4 decoration-1",
        !disabled && !active && "opacity-70 hover:opacity-100",
      )}
    >
      {children}
    </button>
  );
}

function Hint({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 border border-current p-4">
      <div className="yzy-label opacity-60 mb-2">{label}</div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{children}</p>
    </div>
  );
}
