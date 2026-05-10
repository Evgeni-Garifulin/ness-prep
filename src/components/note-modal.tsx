"use client";

import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Модалка редактирования заметки к вопросу. Вынесена в отдельный файл,
// чтобы question-card.tsx мог подгружать её через next/dynamic — модалка
// открывается редко (по клику WRITE NOTE / EDIT), нет смысла отдавать её
// в основном чанке секционной страницы.

export function NoteModal({
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

export default NoteModal;
