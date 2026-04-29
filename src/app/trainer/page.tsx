import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { TrainerSession } from "@/components/trainer-session";
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
        <p className="yzy-label text-muted-foreground">SEASON — Q2 / 2026</p>
        <h1 className="mt-3 text-3xl sm:text-5xl font-medium uppercase leading-[1.05] tracking-tight">
          Trainer
        </h1>
        <p className="mt-3 yzy-label text-foreground">
          KNOW IT. OR FACE IT. NO MIDDLE.
        </p>
        <p className="mt-1 yzy-meta text-muted-foreground">
          {SESSION_SIZE} random tech questions · self-assess each one
        </p>

        <div className="mt-6 h-px w-full bg-foreground" />

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
