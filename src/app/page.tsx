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
  const grandPct = grandTotal ? Math.round((grandAnswered / grandTotal) * 100) : 0;

  return (
    <>
      <SiteHeader username={username} />
      <main className="mx-auto max-w-6xl px-4 sm:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-12 gap-4 sm:gap-6 items-end">
          <div className="col-span-12 md:col-span-8">
            <p className="yzy-label text-muted-foreground">SEASON — Q2 / 2026</p>
            <h1 className="mt-3 text-3xl sm:text-5xl font-medium leading-[1.05] tracking-tight uppercase">
              Interview
              <br />
              Preparation
            </h1>
          </div>
          <div className="col-span-12 md:col-span-4 md:text-right">
            <p className="yzy-label text-muted-foreground">PROGRESS</p>
            <p className="mt-1 text-3xl sm:text-4xl font-medium tabular-nums">
              {grandPct}%
            </p>
            <p className="yzy-meta text-muted-foreground mt-0.5">
              {grandAnswered} / {grandTotal}
            </p>
          </div>
        </div>

        <div className="mt-8 h-px w-full bg-foreground" />

        <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-0 border border-foreground">
          {stats.map((track, idx) => {
            const pct = track.total
              ? Math.round((track.answered / track.total) * 100)
              : 0;
            return (
              <li
                key={track.key}
                className={
                  idx === 0
                    ? "border-b sm:border-b-0 sm:border-r border-foreground"
                    : ""
                }
              >
                <Link
                  href={track.href}
                  className="block h-full p-6 sm:p-8 hover:bg-muted transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <p className="yzy-label text-muted-foreground">
                      {String(idx + 1).padStart(2, "0")} / {String(stats.length).padStart(2, "0")}
                    </p>
                    <p className="yzy-meta tabular-nums text-muted-foreground">
                      {track.answered}/{track.total}
                    </p>
                  </div>
                  <h2 className="mt-8 text-2xl sm:text-3xl font-medium leading-tight uppercase tracking-tight">
                    {track.title}
                  </h2>
                  <p className="mt-3 text-sm text-muted-foreground max-w-md">
                    {track.subtitle}
                  </p>

                  <div className="mt-10 flex items-center justify-between">
                    <span className="yzy-label">ENTER</span>
                    <span className="yzy-meta tabular-nums text-muted-foreground">
                      {pct}%
                    </span>
                  </div>

                  <div className="mt-3 h-px w-full bg-foreground/20" />
                  <div
                    className="-mt-px h-px bg-foreground"
                    style={{ width: `${pct}%` }}
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-12 flex items-center justify-between">
          <p className="yzy-meta text-muted-foreground">USER · {username}</p>
          <ResetButton scope="all" label="RESET PROGRESS" />
        </div>
      </main>
    </>
  );
}
