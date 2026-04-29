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
      <main className="mx-auto max-w-6xl px-4 sm:px-8 py-8 sm:py-12">
        <p className="yzy-label text-muted-foreground">Scratchpad</p>
        <h1 className="mt-2 text-3xl sm:text-5xl font-medium uppercase leading-[1.05] tracking-tight">
          Notes
        </h1>
        <p className="mt-3 yzy-meta text-muted-foreground">
          STAR stories · vocab · talking points
        </p>
        <div className="mt-6 h-px w-full bg-foreground" />

        <div className="mt-8">
          <NotesEditor
            initialNotes={notes.map((n) => ({
              id: n.id,
              title: n.title,
              content: n.content,
              pinned: n.pinned,
              updatedAt: n.updatedAt.toISOString(),
            }))}
          />
        </div>
      </main>
    </>
  );
}
