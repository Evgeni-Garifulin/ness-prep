import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { QuestionCard } from "@/components/question-card";
import { ResetButton } from "@/components/reset-button";

export const dynamic = "force-dynamic";

type Params = { slug: string };

export default async function SectionPage({ params }: { params: Params }) {
  const username = getCurrentUser();
  if (!username) redirect("/login");

  const section = await prisma.section.findUnique({
    where: { slug: params.slug },
    include: {
      questions: { orderBy: { order: "asc" } },
    },
  });
  if (!section) notFound();

  const answers = await prisma.answer.findMany({
    where: {
      username,
      questionId: { in: section.questions.map((q) => q.id) },
    },
  });
  const byQuestionId = new Map(answers.map((a) => [a.questionId, a.text]));

  // Group questions by subsection so the page mirrors the source markdown layout.
  const groups: { subsection: string | null; items: typeof section.questions }[] = [];
  for (const q of section.questions) {
    const last = groups[groups.length - 1];
    if (last && last.subsection === q.subsection) {
      last.items.push(q);
    } else {
      groups.push({ subsection: q.subsection, items: [q] });
    }
  }

  const total = section.questions.length;
  const answered = answers.filter((a) => a.text.trim().length > 0).length;
  const pct = total ? Math.round((answered / total) * 100) : 0;

  // Adjacent sections for prev/next nav
  const all = await prisma.section.findMany({
    select: { slug: true, title: true, order: true },
    orderBy: { order: "asc" },
  });
  const idx = all.findIndex((s) => s.slug === section.slug);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;

  return (
    <>
      <SiteHeader username={username} />
      <main className="mx-auto max-w-3xl px-3 sm:px-6 py-4 sm:py-8">
        <Link
          href="/"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ← Все секции
        </Link>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {String(section.order).padStart(2, "0")}
            </p>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {section.title}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {answered} / {total} отвечено · {pct}%
            </p>
          </div>
          <ResetButton scope="section" sectionSlug={section.slug} label="Сбросить раздел" />
        </div>

        <div className="mt-2 h-1.5 w-full rounded bg-muted overflow-hidden">
          <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
        </div>

        <div className="mt-6 space-y-8">
          {groups.map((g, gi) => (
            <section key={gi} className="space-y-3">
              {g.subsection && (
                <h2 className="text-sm sm:text-base font-semibold uppercase tracking-wide text-muted-foreground">
                  {g.subsection}
                </h2>
              )}
              <div className="space-y-3">
                {g.items.map((q) => (
                  <QuestionCard
                    key={q.id}
                    questionId={q.id}
                    number={q.number}
                    text={q.text}
                    initialAnswer={byQuestionId.get(q.id) ?? ""}
                    hintEasy={q.hintEasy}
                    hintFull={q.hintFull}
                    correctAnswer={q.answer}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        <nav className="mt-10 flex items-center justify-between gap-3 text-sm">
          {prev ? (
            <Link
              href={`/sections/${prev.slug}`}
              className="rounded-md border border-border px-3 py-2 hover:bg-accent flex-1 max-w-[48%]"
            >
              <div className="text-[11px] text-muted-foreground">← {String(prev.order).padStart(2, "0")}</div>
              <div className="truncate">{prev.title}</div>
            </Link>
          ) : <span />}
          {next ? (
            <Link
              href={`/sections/${next.slug}`}
              className="rounded-md border border-border px-3 py-2 hover:bg-accent text-right flex-1 max-w-[48%]"
            >
              <div className="text-[11px] text-muted-foreground">{String(next.order).padStart(2, "0")} →</div>
              <div className="truncate">{next.title}</div>
            </Link>
          ) : <span />}
        </nav>
      </main>
    </>
  );
}
