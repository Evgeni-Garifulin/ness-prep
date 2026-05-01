import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { PageHeader } from "@/components/page-header";
import { QuestionCard } from "@/components/question-card";
import { ResetButton } from "@/components/reset-button";
import { SubsectionNav } from "@/components/subsection-nav";
import { categoryFor, sortKey } from "@/lib/categories";
import { stripSectionPrefix } from "@/lib/utils";

// Стабильный id для h2 подсекции — нужен для якорной навигации.
function subsectionId(name: string, idx: number): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-zа-я0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `subsection-${idx}`;
}

export const dynamic = "force-dynamic";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const section = await prisma.section.findUnique({
    where: { slug: params.slug },
    select: { title: true },
  });
  if (!section) return { title: "SECTION" };
  return {
    title: stripSectionPrefix(section.title).toUpperCase(),
    description: `DRILL THE TOPIC    ${stripSectionPrefix(section.title).toUpperCase()}`,
  };
}

export default async function SectionPage({ params }: { params: Params }) {
  const username = getCurrentUser();
  if (!username) redirect("/login");

  const section = await prisma.section.findUnique({
    where: { slug: params.slug },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!section) notFound();

  const questionIds = section.questions.map((q) => q.id);
  const [answers, qNotes] = await Promise.all([
    prisma.answer.findMany({
      where: { username, questionId: { in: questionIds } },
    }),
    prisma.questionNote.findMany({
      where: { username, questionId: { in: questionIds } },
    }),
  ]);
  const byQuestionId = new Map(answers.map((a) => [a.questionId, a.text]));
  const confirmedByQuestionId = new Map(
    answers.map((a) => [a.questionId, a.confirmed]),
  );
  const noteByQuestionId = new Map(qNotes.map((n) => [n.questionId, n.content]));

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

  const category = categoryFor(section.slug);
  const trackHref = category === "social" ? "/social" : "/tech";
  const trackLabel = category === "social" ? "SOCIAL" : "TECH";

  const all = await prisma.section.findMany({
    select: { slug: true, title: true, order: true },
    orderBy: { order: "asc" },
  });
  const sameTrack = all
    .filter((s) => categoryFor(s.slug) === category)
    .sort(
      (a, b) => sortKey(category, a.slug, a.order) - sortKey(category, b.slug, b.order),
    );
  const idx = sameTrack.findIndex((s) => s.slug === section.slug);
  const prev = idx > 0 ? sameTrack[idx - 1] : null;
  const next = idx >= 0 && idx < sameTrack.length - 1 ? sameTrack[idx + 1] : null;
  const positionLabel = `${String(idx + 1).padStart(2, "0")} / ${String(sameTrack.length).padStart(2, "0")}`;

  return (
    <>
      <SiteHeader username={username} />
      <main className="mx-auto max-w-6xl px-4 sm:px-8 py-8 sm:py-12">
        <PageHeader
          topLeft={
            <Link
              href={trackHref}
              className="yzy-label text-muted-foreground hover:text-foreground transition-colors"
            >
              {trackLabel}
            </Link>
          }
          topRight={
            <ResetButton
              scope="section"
              sectionSlug={section.slug}
              label="RESET SECTION"
            />
          }
          title={stripSectionPrefix(section.title)}
          description={
            <p>
              {trackLabel}    {positionLabel}
            </p>
          }
          progress={{ percent: pct }}
        />

        <SubsectionNav
          anchors={groups
            .filter((g) => g.subsection)
            .map((g, gi) => ({
              id: subsectionId(g.subsection ?? "", gi),
              label: g.subsection ?? "",
            }))}
        />

        <div className="mt-10 space-y-12">
          {groups.map((g, gi) => (
            <section key={gi} className="space-y-4 scroll-mt-24">
              {g.subsection && (
                <h2
                  id={subsectionId(g.subsection, gi)}
                  className="text-xl sm:text-2xl font-medium uppercase tracking-tight text-foreground scroll-mt-24"
                >
                  {g.subsection}
                </h2>
              )}
              <div className="space-y-3">
                {g.items.map((q) => (
                  <QuestionCard
                    key={q.id}
                    mode={category === "social" ? "social" : "tech"}
                    questionId={q.id}
                    number={q.number}
                    text={q.text}
                    initialAnswer={byQuestionId.get(q.id) ?? ""}
                    initialConfirmed={confirmedByQuestionId.get(q.id) ?? false}
                    initialNote={noteByQuestionId.get(q.id) ?? ""}
                    hintEasy={q.hintEasy}
                    hintFull={q.hintFull}
                    correctAnswer={q.answer}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        <nav className="mt-16 grid grid-cols-2 gap-px border border-foreground bg-foreground">
          {prev ? (
            <Link
              href={`/sections/${prev.slug}`}
              className="block bg-background hover:bg-muted transition-colors px-4 py-4"
            >
              <div className="yzy-label text-muted-foreground">PREVIOUS</div>
              <div className="mt-2 text-sm font-medium uppercase tracking-tight truncate">
                {stripSectionPrefix(prev.title)}
              </div>
            </Link>
          ) : (
            <span className="bg-background" />
          )}
          {next ? (
            <Link
              href={`/sections/${next.slug}`}
              className="block bg-background hover:bg-muted transition-colors px-4 py-4 text-right"
            >
              <div className="yzy-label text-muted-foreground">NEXT</div>
              <div className="mt-2 text-sm font-medium uppercase tracking-tight truncate">
                {stripSectionPrefix(next.title)}
              </div>
            </Link>
          ) : (
            <span className="bg-background" />
          )}
        </nav>
      </main>
    </>
  );
}
