import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { ResetButton } from "@/components/reset-button";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const username = getCurrentUser();
  if (!username) redirect("/login");

  const sections = await prisma.section.findMany({
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

  const totalQ = sections.reduce((acc, s) => acc + s._count.questions, 0);
  const totalAnswered = answers.filter((a) => a.text.trim().length > 0).length;

  return (
    <>
      <SiteHeader username={username} />
      <main className="mx-auto max-w-5xl px-3 sm:px-6 py-4 sm:py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Подготовка к собесу
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {totalAnswered} из {totalQ} вопросов отвечено
            </p>
          </div>
          <ResetButton scope="all" />
        </div>

        <div className="mt-2 h-1.5 w-full rounded bg-muted overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-[width]"
            style={{
              width: totalQ ? `${Math.round((totalAnswered / totalQ) * 100)}%` : "0%",
            }}
          />
        </div>

        <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sections.map((s) => {
            const total = s._count.questions;
            const answered = s.questions.filter((q) => answeredIds.has(q.id)).length;
            const pct = total ? Math.round((answered / total) * 100) : 0;
            return (
              <li key={s.slug}>
                <Link
                  href={`/sections/${s.slug}`}
                  className="block h-full rounded-lg border border-border bg-card p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {String(s.order).padStart(2, "0")}
                      </p>
                      <h2 className="text-sm sm:text-base font-semibold leading-snug truncate">
                        {s.title}
                      </h2>
                    </div>
                    <span className="shrink-0 rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
                      {answered}/{total}
                    </span>
                  </div>
                  <div className="mt-3 h-1 w-full rounded bg-muted overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
    </>
  );
}
