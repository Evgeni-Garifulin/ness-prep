"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Промпт для нейросети: контекст роли + сам вопрос + структура нужного объяснения.
// Цель — пользователь жмёт COPY PROMPT, идёт в любой LLM (Claude / ChatGPT) и
// получает развёрнутый разбор темы вместо зазубривания.
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

function CopyPromptButton({
  question,
  className,
}: {
  question: string;
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");

  const onCopy = async () => {
    const prompt = buildPrompt(question);
    try {
      await navigator.clipboard.writeText(prompt);
      setState("copied");
      setTimeout(() => setState("idle"), 1500);
    } catch {
      // Fallback: создаём textarea, выделяем, document.execCommand. Старый трюк
      // на случай когда navigator.clipboard недоступен (http-локалка, безопасный
      // контекст и т.п.).
      try {
        const ta = document.createElement("textarea");
        ta.value = prompt;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setState("copied");
        setTimeout(() => setState("idle"), 1500);
      } catch {
        setState("error");
        setTimeout(() => setState("idle"), 1500);
      }
    }
  };

  const label =
    state === "copied" ? "COPIED" : state === "error" ? "ERROR" : "COPY PROMPT";

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label="Скопировать промпт для разбора темы с нейросетью"
      className={cn(
        "yzy-label transition-colors whitespace-nowrap",
        state === "copied"
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {label}
    </button>
  );
}

type Mode = "tech" | "social";

type Props = {
  questionId: string;
  number: number;
  text: string;
  initialAnswer: string;
  initialConfirmed?: boolean;
  initialNote?: string;
  hintEasy: string;
  hintFull: string;
  correctAnswer: string;
  /**
   * tech (default) — стандартная карточка: HINT A / HINT B / REVEAL ANSWER,
   *   textarea для собственного ответа, автосохранение, лейбл ANSWERED при заполнении.
   * social — гайд-режим: ни textarea, ни тогглов; сразу показан блок
   *   RECOMMENDED ANSWER WAY с готовым подходом к ответу на behavioral-вопрос.
   */
  mode?: Mode;
};

const SAVE_DEBOUNCE_MS = 700;

export function QuestionCard(props: Props) {
  if (props.mode === "social") {
    return <SocialCard {...props} />;
  }
  return <TechCard {...props} />;
}

function SocialCard({ number, text, correctAnswer }: Props) {
  const [open, setOpen] = useState(false);
  const hasAnswer = correctAnswer.trim().length > 0;

  return (
    <article className="border border-foreground bg-card p-4 sm:p-6">
      <header className="flex items-baseline gap-4">
        <div className="text-sm sm:text-base leading-snug font-medium tabular-nums shrink-0 min-w-[2ch] text-muted-foreground">
          {String(number).padStart(2, "0")}
        </div>
        <h3 className="flex-1 min-w-0 text-sm sm:text-base leading-snug font-medium tracking-tight">
          {text}
        </h3>
      </header>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
        {hasAnswer ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className={cn(
              "yzy-label transition-colors",
              open
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {open ? "HIDE RECOMMENDED ANSWER WAY" : "REVEAL RECOMMENDED ANSWER WAY"}
          </button>
        ) : (
          <span className="yzy-meta text-muted-foreground">
            RECOMMENDED ANSWER WAY NOT YET FILLED IN.
          </span>
        )}
        <CopyPromptButton question={text} />
      </div>

      {hasAnswer && open && (
        <div className="mt-3 border border-foreground p-4">
          <div className="yzy-label text-muted-foreground mb-2">
            RECOMMENDED ANSWER WAY
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {correctAnswer}
          </p>
        </div>
      )}
    </article>
  );
}

function TechCard({
  questionId,
  number,
  text,
  initialAnswer,
  initialConfirmed,
  initialNote,
  hintEasy,
  hintFull,
  correctAnswer,
}: Props) {
  const [answer, setAnswer] = useState(initialAnswer ?? "");
  const [confirmed, setConfirmed] = useState(initialConfirmed ?? false);
  const [showEasy, setShowEasy] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [showCorrect, setShowCorrect] = useState(false);
  const [savedState, setSavedState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [, startTransition] = useTransition();

  // Заметка пользователя (отдельная сущность от ответа). Хранится в БД через
  // /api/question-notes. modalOpen открывает попап для создания/редактирования.
  const [note, setNote] = useState(initialNote ?? "");
  const [modalOpen, setModalOpen] = useState(false);

  const lastSavedRef = useRef(initialAnswer ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Тоггл +/-: явно помечает «ответ дан / забран». Хранится отдельно от текста
  // в Answer.confirmed. Одновременно сворачивает карточку до заголовка.
  const setConfirmedRemote = (next: boolean) => {
    setConfirmed(next);
    fetch("/api/answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, confirmed: next }),
    }).catch(() => {
      /* при ошибке сети оставляем optimistic — пользователь увидит расхождение
         только если перезагрузит страницу */
    });
  };

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
            confirmed && "line-through text-muted-foreground",
          )}
        >
          {text}
        </h3>
        {/* +/− справа: явный жест «ответ дан / забран». Когда confirmed=true,
            остальное тело карточки прячется (см. {!confirmed && ...}). */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setConfirmedRemote(true)}
            aria-label="Пометить ответ данным"
            disabled={confirmed}
            className={cn(
              "h-7 w-7 leading-none text-xl font-medium transition-colors",
              confirmed
                ? "text-muted-foreground/40 cursor-default"
                : "text-foreground hover:text-muted-foreground",
            )}
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setConfirmedRemote(false)}
            aria-label="Забрать ответ"
            disabled={!confirmed}
            className={cn(
              "h-7 w-7 leading-none text-xl font-medium transition-colors",
              !confirmed
                ? "text-muted-foreground/40 cursor-default"
                : "text-foreground hover:text-muted-foreground",
            )}
          >
            −
          </button>
        </div>
      </header>

      {!confirmed && (
      <>
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
        {/* WRITE NOTE показываем только когда заметки ещё нет — иначе
            edit/delete живут на самой плашке заметки под textarea. */}
        {note.trim().length === 0 && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="yzy-label text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
          >
            WRITE NOTE
          </button>
        )}
        <CopyPromptButton question={text} />
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

      {note.trim().length > 0 && (
        <div className="mt-5 border border-foreground p-4">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="yzy-label text-muted-foreground">NOTE</div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="yzy-label text-muted-foreground hover:text-foreground transition-colors"
              >
                EDIT
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!confirm("Удалить заметку?")) return;
                  try {
                    const res = await fetch("/api/question-notes", {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ questionId }),
                    });
                    if (res.ok) setNote("");
                  } catch {
                    /* silent */
                  }
                }}
                className="yzy-label text-muted-foreground hover:text-foreground transition-colors"
              >
                DELETE
              </button>
            </div>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{note}</p>
        </div>
      )}

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
      </>
      )}

      {modalOpen && (
        <NoteModal
          questionId={questionId}
          questionText={text}
          initialContent={note}
          onClose={() => setModalOpen(false)}
          onSaved={(saved) => {
            setNote(saved);
            setModalOpen(false);
          }}
        />
      )}
    </article>
  );
}

function NoteModal({
  questionId,
  questionText,
  initialContent,
  onClose,
  onSaved,
}: {
  questionId: string;
  questionText: string;
  initialContent: string;
  onClose: () => void;
  onSaved: (content: string) => void;
}) {
  const [draft, setDraft] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ESC закрывает модалку, лочим scroll фона.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const onSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/question-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, content: draft }),
      });
      if (!res.ok) {
        setError("Не удалось сохранить");
        return;
      }
      const body = await res.json().catch(() => ({}));
      onSaved((body.content as string | undefined) ?? draft);
    } catch {
      setError("Сетевая ошибка");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        // клик по подложке закрывает; внутренний клик не всплывает
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl border border-foreground bg-background p-5 sm:p-6">
        <p className="yzy-label text-muted-foreground">NOTE FOR</p>
        <h3 className="mt-1 text-sm sm:text-base font-medium leading-snug tracking-tight">
          {questionText}
        </h3>

        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type your note…"
          rows={8}
          autoFocus
          className="mt-4 text-sm leading-relaxed"
        />

        {error && (
          <p className="mt-3 yzy-label text-foreground border border-foreground px-3 py-2">
            {error}
          </p>
        )}

        <div className="mt-5 flex items-center justify-end gap-5">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="yzy-label text-muted-foreground hover:text-foreground transition-colors"
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving || draft.trim().length === 0}
            className={cn(
              "yzy-label transition-colors",
              draft.trim().length === 0 || saving
                ? "text-muted-foreground cursor-not-allowed"
                : "text-foreground hover:text-muted-foreground",
            )}
          >
            {saving ? "SAVING…" : "SAVE"}
          </button>
        </div>
      </div>
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
