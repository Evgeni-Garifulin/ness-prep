import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { PageHeader } from "@/components/page-header";
import { TrainerSession } from "@/components/trainer-session";
import { ResetTestButton } from "@/components/reset-test-button";
import { categoryFor } from "@/lib/categories";
import { stripSectionPrefix } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TRAINER",
  description:
    "NO INPUT    NO TIMER    JUST RECALL    KNOW IT OR FACE IT",
};

const SESSION_SIZE = 25;

export default async function TrainerPage() {
  const username = getCurrentUser();
  if (!username) redirect("/login");

  // Тянем все tech-вопросы с заполненным эталонным ответом — иначе тренажёру
  // нечего раскрывать. Социальные секции исключаем (они не drill-формат).
  const allQuestions = await prisma.question.findMany({
    where: {
      answer: { not: "" },
    },
    select: {
      id: true,
      number: true,
      text: true,
      hintEasy: true,
      hintFull: true,
      answer: true,
      sectionSlug: true,
      subsection: true,
      section: { select: { title: true, order: true } },
    },
  });
  const techPool = allQuestions.filter(
    (q) => categoryFor(q.sectionSlug) === "tech",
  );

  // Статы пользователя по всем вопросам — для нижнего списка. Тянем секцию
  // вместе с вопросом, чтобы группировать +/− по теме на клиенте.
  const allStats = await prisma.trainerStat.findMany({
    where: { username },
    include: {
      question: {
        select: {
          text: true,
          section: { select: { title: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <>
      <SiteHeader username={username} />
      <main className="mx-auto max-w-6xl px-4 sm:px-8 py-8 sm:py-12">
        <PageHeader
          topLeft={
            <p className="yzy-label text-muted-foreground">
              SEASON — Q2 / 2026
            </p>
          }
          topRight={<ResetTestButton />}
          title="Trainer"
          description={
            <>
              <p>NO INPUT    NO TIMER    JUST RECALL</p>
              <p>
                SEE THE QUESTION    ANSWER IT IN YOUR HEAD    REVEAL    JUDGE
              </p>
              <p>+ IF YOU KNEW IT       − IF YOU MISSED</p>
              <p>{SESSION_SIZE} CARDS PER ROUND    WEAK SPOTS STACK BELOW</p>
            </>
          }
        />

        <TrainerSession
          sessionSize={SESSION_SIZE}
          pool={techPool.map((q) => ({
            id: q.id,
            number: q.number,
            text: q.text,
            hintEasy: q.hintEasy,
            hintFull: q.hintFull,
            answer: q.answer,
            sectionSlug: q.sectionSlug,
            sectionTitle: stripSectionPrefix(q.section.title).toUpperCase(),
            sectionOrder: q.section.order,
            subsection: q.subsection,
          }))}
          initialStats={allStats.map((s) => ({
            questionId: s.questionId,
            text: s.question.text,
            section: stripSectionPrefix(s.question.section.title).toUpperCase(),
            knownCount: s.knownCount,
            unknownCount: s.unknownCount,
          }))}
        />
      </main>
    </>
  );
}
