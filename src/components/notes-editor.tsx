"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Note = {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  updatedAt: string;
};

const SAVE_DEBOUNCE_MS = 800;

export function NotesEditor({ initialNotes }: { initialNotes: Note[] }) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [activeId, setActiveId] = useState<string | null>(initialNotes[0]?.id ?? null);
  const [showList, setShowList] = useState(false);
  const [, start] = useTransition();

  const active = useMemo(
    () => notes.find((n) => n.id === activeId) ?? null,
    [notes, activeId],
  );

  const onCreate = () => {
    start(async () => {
      const res = await fetch("/api/notes", { method: "POST" });
      if (!res.ok) return;
      const note: Note = await res.json();
      setNotes((prev) => [note, ...prev]);
      setActiveId(note.id);
      setShowList(false);
    });
  };

  const onDelete = (id: string) => {
    if (!confirm("Удалить заметку?")) return;
    start(async () => {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (!res.ok) return;
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (activeId === id) {
        const remaining = notes.filter((n) => n.id !== id);
        setActiveId(remaining[0]?.id ?? null);
      }
    });
  };

  const onTogglePin = (id: string) => {
    const target = notes.find((n) => n.id === id);
    if (!target) return;
    const next = !target.pinned;
    setNotes((prev) =>
      [...prev.map((n) => (n.id === id ? { ...n, pinned: next } : n))].sort(
        sortNotes,
      ),
    );
    start(async () => {
      await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: next }),
      });
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4">
      <aside
        className={cn(
          "rounded-lg border border-border bg-card",
          "md:block",
          showList ? "block" : "hidden md:block",
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border p-2">
          <span className="text-xs font-semibold text-muted-foreground">
            {notes.length} заметок
          </span>
          <Button size="sm" onClick={onCreate}>
            + Новая
          </Button>
        </div>
        <ul className="max-h-[60vh] md:max-h-[70vh] overflow-y-auto">
          {notes.length === 0 && (
            <li className="px-3 py-6 text-center text-xs text-muted-foreground">
              Пока пусто. Жми «Новая» — создастся первая заметка.
            </li>
          )}
          {notes.map((n) => (
            <li key={n.id}>
              <button
                onClick={() => {
                  setActiveId(n.id);
                  setShowList(false);
                }}
                className={cn(
                  "block w-full px-3 py-2 text-left hover:bg-accent border-b border-border/60",
                  activeId === n.id && "bg-accent",
                )}
              >
                <div className="flex items-center gap-1">
                  {n.pinned && <span className="text-amber-400 text-xs">★</span>}
                  <span className="truncate text-sm font-medium">
                    {n.title || "Без названия"}
                  </span>
                </div>
                <div className="mt-0.5 truncate text-xs text-muted-foreground">
                  {previewLine(n.content) || "Пусто"}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="rounded-lg border border-border bg-card p-3 sm:p-5">
        <div className="mb-3 flex items-center gap-2 md:hidden">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowList((v) => !v)}
          >
            {showList ? "Скрыть список" : "Список заметок"}
          </Button>
          <Button size="sm" onClick={onCreate}>
            + Новая
          </Button>
        </div>

        {!active ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Создай первую заметку, чтобы начать.
            <div className="mt-3">
              <Button onClick={onCreate}>+ Новая заметка</Button>
            </div>
          </div>
        ) : (
          <ActiveNoteEditor
            key={active.id}
            note={active}
            onLocalUpdate={(patch) =>
              setNotes((prev) =>
                [
                  ...prev.map((n) => (n.id === active.id ? { ...n, ...patch } : n)),
                ].sort(sortNotes),
              )
            }
            onDelete={() => onDelete(active.id)}
            onTogglePin={() => onTogglePin(active.id)}
          />
        )}
      </section>
    </div>
  );
}

function ActiveNoteEditor({
  note,
  onLocalUpdate,
  onDelete,
  onTogglePin,
}: {
  note: Note;
  onLocalUpdate: (patch: Partial<Note>) => void;
  onDelete: () => void;
  onTogglePin: () => void;
}) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [savedState, setSaved] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef({ title: note.title, content: note.content });

  useEffect(() => {
    if (
      title === lastSaved.current.title &&
      content === lastSaved.current.content
    ) {
      return;
    }
    setSaved("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/notes/${note.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content }),
        });
        if (!res.ok) throw new Error("save");
        lastSaved.current = { title, content };
        onLocalUpdate({
          title,
          content,
          updatedAt: new Date().toISOString(),
        });
        setSaved("saved");
        setTimeout(() => setSaved((s) => (s === "saved" ? "idle" : s)), 1000);
      } catch {
        setSaved("error");
      }
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Название"
          className="text-base sm:text-lg font-semibold flex-1 min-w-0"
        />
        <Button
          size="sm"
          variant={note.pinned ? "secondary" : "outline"}
          onClick={onTogglePin}
        >
          {note.pinned ? "★ Закреплено" : "☆ Закрепить"}
        </Button>
        <Button size="sm" variant="destructive" onClick={onDelete}>
          Удалить
        </Button>
      </div>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Черновик…"
        className="min-h-[40vh] sm:min-h-[50vh] text-sm sm:text-base font-mono leading-relaxed"
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Обновлено: {new Date(note.updatedAt).toLocaleString("ru-RU")}</span>
        <span
          className={cn(
            savedState === "saving" && "text-muted-foreground",
            savedState === "saved" && "text-emerald-400",
            savedState === "error" && "text-destructive",
          )}
        >
          {savedState === "saving" && "Сохраняю…"}
          {savedState === "saved" && "Сохранено"}
          {savedState === "error" && "Ошибка сохранения"}
        </span>
      </div>
    </div>
  );
}

function previewLine(s: string) {
  const line = (s || "").split("\n").find((l) => l.trim().length > 0) ?? "";
  return line.slice(0, 80);
}

function sortNotes(a: Note, b: Note) {
  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}
