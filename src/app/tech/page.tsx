import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { TrackGrid } from "@/components/track-grid";
import { ResetButton } from "@/components/reset-button";
import { categoryFor, sortKey } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function TechPage() {
  const username = getCurrentUser();
  if (!username) redirect("/login");

  const allSections = await prisma.section.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { questions: true } },
      questions: { select: { id: true } },
    },
  });

  const answers = await prisma.answer.findMany({
    where: { username },
    select: { questionId: true, text: true },
  });
  const answeredIds = new Set(
    answers.filter((a) => a.text.trim().length > 0).map((a) => a.questionId),
  );

  const techSections = allSections
    .filter((s) => categoryFor(s.slug) === "tech")
    .sort((a, b) => sortKey("tech", a.slug, a.order) - sortKey("tech", b.slug, b.order));

  const sections = techSections.map((s, idx) => ({
    slug: s.slug,
    title: s.title,
    order: s.order,
    totalQuestions: s._count.questions,
    answered: s.questions.filter((q) => answeredIds.has(q.id)).length,
    displayNumber: idx + 1,
  }));

  const total = sections.reduce((acc, s) => acc + s.totalQuestions, 0);
  const answered = sections.reduce((acc, s) => acc + s.answered, 0);
  const pct = total ? Math.round((answered / total) * 100) : 0;

  return (
    <>
      <SiteHeader username={username} />
      <main className="mx-auto max-w-6xl px-4 sm:px-8 py-8 sm:py-12">
        <Link
          href="/"
          className="yzy-label text-muted-foreground hover:text-foreground transition-colors"
        >
          INDEX
        </Link>
        <div className="mt-4 grid grid-cols-12 gap-4 items-end">
          <div className="col-span-12 md:col-span-8">
            <p className="yzy-label text-muted-foreground">TRACK 01 / 02</p>
            <h1 className="mt-2 text-3xl sm:text-5xl font-medium uppercase leading-[1.05] tracking-tight">
              Tech
            </h1>
            <p className="mt-3 yzy-meta text-muted-foreground">
              JS · TS · React · Performance · Architecture
            </p>
          </div>
          <div className="col-span-12 md:col-span-4 md:text-right">
            <p className="yzy-label text-muted-foreground">PROGRESS</p>
            <p className="mt-1 text-3xl font-medium tabular-nums">{pct}%</p>
            <p className="yzy-meta text-muted-foreground mt-0.5">
              {answered} / {total} · {sections.length} SECTIONS
            </p>
          </div>
        </div>
        <div className="mt-6 h-px w-full bg-foreground/20" />
        <div className="-mt-px h-px bg-foreground" style={{ width: `${pct}%` }} />

        <div className="mt-8">
          <TrackGrid sections={sections} />
        </div>

        <div className="mt-10 flex items-center justify-end">
          <ResetButton scope="all" label="RESET PROGRESS" />
        </div>
      </main>
    </>
  );
}
