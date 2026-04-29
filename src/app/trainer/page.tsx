import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { TrainerSession } from "@/components/trainer-session";
import { RefreshTestButton } from "@/components/refresh-test-button";
import { categoryFor } from "@/lib/categories";

export const dynamic = "force-dynamic";

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
    },
  });
  const techPool = allQuestions.filter(
    (q) => categoryFor(q.sectionSlug) === "tech",
  );

  // Шафлим случайно при каждой загрузке. Берём 25 (или сколько есть).
  const shuffled = [...techPool].sort(() => Math.random() - 0.5);
  const session = shuffled.slice(0, SESSION_SIZE);

  // Статы пользователя по всем вопросам — для нижнего списка.
  const allStats = await prisma.trainerStat.findMany({
    where: { username },
    include: { question: { select: { text: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <>
      <SiteHeader username={username} />
      <main className="mx-auto max-w-3xl px-4 sm:px-8 py-8 sm:py-12">
        <div className="flex items-baseline justify-between gap-4">
          <p className="yzy-label text-muted-foreground">SEASON — Q2 / 2026</p>
          <RefreshTestButton />
        </div>
        <h1 className="mt-3 text-3xl sm:text-5xl font-medium uppercase leading-[1.05] tracking-tight">
          Trainer
        </h1>
        <div className="mt-4 yzy-label text-foreground space-y-1 leading-relaxed whitespace-pre-wrap">
          <p>NO INPUT    NO TIMER    JUST RECALL</p>
          <p>SEE THE QUESTION    ANSWER IT IN YOUR HEAD    REVEAL    JUDGE</p>
          <p>+ IF YOU KNEW IT       − IF YOU MISSED</p>
          <p>{SESSION_SIZE} CARDS PER ROUND    WEAK SPOTS STACK BELOW</p>
        </div>

        <TrainerSession
          questions={session.map((q) => ({
            id: q.id,
            number: q.number,
            text: q.text,
            hintEasy: q.hintEasy,
            hintFull: q.hintFull,
            answer: q.answer,
          }))}
          initialStats={allStats.map((s) => ({
            questionId: s.questionId,
            text: s.question.text,
            knownCount: s.knownCount,
            unknownCount: s.unknownCount,
          }))}
        />
      </main>
    </>
  );
}
