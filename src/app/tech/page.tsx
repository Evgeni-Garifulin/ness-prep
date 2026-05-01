import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { PageHeader } from "@/components/page-header";
import { TrackGrid } from "@/components/track-grid";
import { ResetButton } from "@/components/reset-button";
import { categoryFor, sortKey } from "@/lib/categories";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TECH",
  description: "JS    TS    REACT    PERFORMANCE    ARCHITECTURE",
};

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
        <PageHeader
          topLeft={
            <Link
              href="/"
              className="yzy-label text-muted-foreground hover:text-foreground transition-colors"
            >
              INDEX
            </Link>
          }
          topRight={<ResetButton scope="all" label="RESET PROGRESS" />}
          title="Tech"
          description={
            <>
              <p>JS    TS    REACT    PERFORMANCE    ARCHITECTURE</p>
              <p>
                {sections.length} SECTIONS    {answered} / {total}    {pct}%
              </p>
            </>
          }
        />
        <div className="mt-6 h-px w-full bg-foreground/20" />
        <div className="-mt-px h-px bg-foreground" style={{ width: `${pct}%` }} />

        <div className="mt-8">
          <TrackGrid sections={sections} />
        </div>

      </main>
    </>
  );
}
