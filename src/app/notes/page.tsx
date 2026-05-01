import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { PageHeader } from "@/components/page-header";
import { NotesEditor } from "@/components/notes-editor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "NOTES",
  description: "RAW DRAFTS    STAR STORIES    TALKING POINTS",
};

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
        <PageHeader
          topLeft={
            <p className="yzy-label text-muted-foreground">SCRATCHPAD</p>
          }
          title="Notes"
          description={
            <p>STAR STORIES    VOCAB    TALKING POINTS</p>
          }
        />

        <div className="mt-10">
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
