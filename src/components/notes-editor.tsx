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
      [...prev.map((n) => (n.id === id ? { ...n, pinned: next } : n))].sort(sortNotes),
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
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-0 border border-foreground">
      <aside
        className={cn(
          "border-foreground md:border-r",
          showList ? "block" : "hidden md:block",
          "border-b md:border-b-0",
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-foreground px-3 py-2">
          <span className="yzy-label text-muted-foreground">{notes.length} ITEMS</span>
          <button
            onClick={onCreate}
            className="yzy-label hover:opacity-60 transition-opacity"
          >
            + New
          </button>
        </div>
        <ul className="max-h-[60vh] md:max-h-[70vh] overflow-y-auto">
          {notes.length === 0 && (
            <li className="px-3 py-8 text-center yzy-meta text-muted-foreground">
              Empty — hit "+ New" to start
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
                  "block w-full px-3 py-3 text-left transition-colors border-b border-foreground/20",
                  activeId === n.id
                    ? "bg-foreground text-background"
                    : "hover:bg-foreground hover:text-background",
                )}
              >
                <div className="flex items-center gap-1">
                  {n.pinned && <span className="yzy-label">★</span>}
                  <span className="truncate text-sm font-medium uppercase tracking-tight">
                    {n.title || "UNTITLED"}
                  </span>
                </div>
                <div className="mt-1 truncate yzy-meta opacity-70">
                  {previewLine(n.content) || "Empty"}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-2 md:hidden">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowList((v) => !v)}
          >
            {showList ? "Hide list" : "Notes list"}
          </Button>
          <Button size="sm" onClick={onCreate}>
            + New
          </Button>
        </div>

        {!active ? (
          <div className="py-16 text-center">
            <p className="yzy-meta text-muted-foreground">No note selected</p>
            <div className="mt-4 inline-block">
              <Button onClick={onCreate}>+ Create note</Button>
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
  const [savedState, setSaved] = useState<"idle" | "saving" | "saved" | "error">("idle");
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="UNTITLED"
          className="text-base sm:text-lg font-medium uppercase tracking-tight flex-1 min-w-0 border-0 border-b border-foreground px-0 h-10 focus-visible:ring-0"
        />
        <Button
          size="sm"
          variant={note.pinned ? "default" : "outline"}
          onClick={onTogglePin}
        >
          {note.pinned ? "★ Pinned" : "☆ Pin"}
        </Button>
        <Button size="sm" variant="destructive" onClick={onDelete}>
          Delete
        </Button>
      </div>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Draft…"
        className="min-h-[40vh] sm:min-h-[55vh] text-sm leading-relaxed"
      />
      <div className="flex items-center justify-between yzy-meta text-muted-foreground">
        <span>UPD · {new Date(note.updatedAt).toLocaleString("ru-RU")}</span>
        <span
          className={cn(
            "yzy-label",
            savedState === "saving" && "opacity-60",
            savedState === "idle" && "opacity-0",
          )}
        >
          {savedState === "saving" && "Saving…"}
          {savedState === "saved" && "Saved"}
          {savedState === "error" && "Error"}
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
