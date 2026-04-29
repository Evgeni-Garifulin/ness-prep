import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { ResetButton } from "@/components/reset-button";
import { TRACKS, categoryFor } from "@/lib/categories";

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

  const stats = TRACKS.map((track) => {
    const items = sections.filter((s) => categoryFor(s.slug) === track.key);
    const total = items.reduce((acc, s) => acc + s._count.questions, 0);
    const answered = items.reduce(
      (acc, s) => acc + s.questions.filter((q) => answeredIds.has(q.id)).length,
      0,
    );
    return { ...track, total, answered, sections: items.length };
  });

  const grandTotal = stats.reduce((a, s) => a + s.total, 0);
  const grandAnswered = stats.reduce((a, s) => a + s.answered, 0);

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
              {grandAnswered} из {grandTotal} вопросов отвечено
            </p>
          </div>
          <ResetButton scope="all" />
        </div>

        <div className="mt-2 h-1.5 w-full rounded bg-muted overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-[width]"
            style={{
              width: grandTotal ? `${Math.round((grandAnswered / grandTotal) * 100)}%` : "0%",
            }}
          />
        </div>

        <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {stats.map((track) => {
            const pct = track.total
              ? Math.round((track.answered / track.total) * 100)
              : 0;
            const accentBar =
              track.accent === "emerald" ? "bg-emerald-500" : "bg-sky-500";
            const accentRing =
              track.accent === "emerald"
                ? "hover:border-emerald-500/40"
                : "hover:border-sky-500/40";
            return (
              <li key={track.key}>
                <Link
                  href={track.href}
                  className={`group block h-full rounded-xl border border-border bg-card p-4 sm:p-6 transition-colors ${accentRing}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {track.sections} разделов · {track.total} вопросов
                      </p>
                      <h2 className="mt-1 text-base sm:text-lg font-semibold leading-tight">
                        {track.title}
                      </h2>
                      <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                        {track.subtitle}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
                      {track.answered}/{track.total}
                    </span>
                  </div>
                  <div className="mt-4 h-1.5 w-full rounded bg-muted overflow-hidden">
                    <div
                      className={`h-full ${accentBar}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Открыть {track.title.toLowerCase()} →
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="mt-8 text-xs text-muted-foreground">
          Подсказки, ответы и заметки сохраняются между визитами. Прогресс — у каждого свой.
        </p>
      </main>
    </>
  );
}
