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
    // В техническом треке это просто 01..N, не оригинальный номер из MD.
    displayNumber: idx + 1,
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
            <p className="text-[11px] uppercase tracking-wide text-emerald-400">
              Технические вопросы
            </p>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              JS / TS / React / архитектура
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {answered} / {total} отвечено · {sections.length} разделов
            </p>
          </div>
          <ResetButton scope="all" label="Сбросить весь прогресс" />
        </div>
        <div className="mt-2 h-1.5 w-full rounded bg-muted overflow-hidden">
          <div
            className="h-full bg-emerald-500"
            style={{ width: total ? `${Math.round((answered / total) * 100)}%` : "0%" }}
          />
        </div>
        <div className="mt-6">
          <TrackGrid sections={sections} accent="emerald" />
        </div>
      </main>
    </>
  );
}
