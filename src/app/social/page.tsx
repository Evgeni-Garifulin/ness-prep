import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { TrackGrid } from "@/components/track-grid";
import { categoryFor, sortKey } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function SocialPage() {
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

  const socialSections = allSections
    .filter((s) => categoryFor(s.slug) === "social")
    .sort(
      (a, b) => sortKey("social", a.slug, a.order) - sortKey("social", b.slug, b.order),
    );

  const sections = socialSections.map((s) => ({
    slug: s.slug,
    title: s.title,
    order: s.order,
    totalQuestions: s._count.questions,
    answered: s.questions.filter((q) => answeredIds.has(q.id)).length,
    displayNumber: sortKey("social", s.slug, s.order),
  }));

  const total = sections.reduce((acc, s) => acc + s.totalQuestions, 0);
  const answered = sections.reduce((acc, s) => acc + s.answered, 0);

  return (
    <>
      <SiteHeader username={username} />
      <main className="mx-auto max-w-5xl px-3 sm:px-6 py-4 sm:py-8">
        <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
          ← Обзор
        </Link>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-sky-400">
              Социальные вопросы
            </p>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              HR / English / Behavioral
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {answered} / {total} отвечено · {sections.length} разделов
            </p>
          </div>
        </div>
        <div className="mt-2 h-1.5 w-full rounded bg-muted overflow-hidden">
          <div
            className="h-full bg-sky-500"
            style={{ width: total ? `${Math.round((answered / total) * 100)}%` : "0%" }}
          />
        </div>
        <div className="mt-6">
          <TrackGrid sections={sections} accent="sky" />
        </div>
      </main>
    </>
  );
}
