import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { NotesEditor } from "@/components/notes-editor";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const username = getCurrentUser();
  if (!username) redirect("/login");

  const notes = await prisma.note.findMany({
    where: { username },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
  });

  return (
    <>
      <SiteHeader username={username} />
      <main className="mx-auto max-w-5xl px-3 sm:px-6 py-4 sm:py-8">
        <header className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Заметки и черновики
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Сюда удобно складывать STAR-истории, шпоры по терминам, заготовки ответов.
          </p>
        </header>
        <NotesEditor
          initialNotes={notes.map((n) => ({
            id: n.id,
            title: n.title,
            content: n.content,
            pinned: n.pinned,
            updatedAt: n.updatedAt.toISOString(),
          }))}
        />
      </main>
    </>
  );
}
