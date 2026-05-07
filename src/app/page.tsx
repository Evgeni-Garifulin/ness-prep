import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { PageHeader } from "@/components/page-header";
import { ResetButton } from "@/components/reset-button";
import { TRACKS, categoryFor } from "@/lib/categories";

export const dynamic = "force-dynamic";

// Sections + questionIds одинаковы для всех пользователей и меняются только
// при пересеве БД, поэтому держим их в Next-кеше и не дёргаем Postgres на
// каждый рендер главной. Тег `sections` оставлен на будущее — при ребилде
// можно будет вызвать revalidateTag после `npm run db:seed`.
const getSectionsWithCounts = unstable_cache(
  async () =>
    prisma.section.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: { select: { questions: true } },
        questions: { select: { id: true } },
      },
    }),
  ["home:sections-with-counts"],
  { revalidate: 3600, tags: ["sections"] },
);

export const metadata: Metadata = {
  title: "MAIN",
  description: "DRILL THE INSTINCT    TWO TRACKS    ONE GOAL",
};

export default async function HomePage() {
  const username = getCurrentUser();
  if (!username) redirect("/login");

  // Все запросы стартуют параллельно: sections тянутся из Next-кеша
  // (горячий путь — без обращения к Postgres), три пользовательских — из БД.
  const [sections, answers, trainerStats, notes] = await Promise.all([
    getSectionsWithCounts(),
    prisma.answer.findMany({
      where: { username },
      select: { questionId: true, text: true },
    }),
    prisma.trainerStat.findMany({
      where: { username },
      select: { knownCount: true, unknownCount: true },
    }),
    prisma.note.count({ where: { username } }),
  ]);
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

  // Trainer: учитываем только tech-карточки с заполненным эталонным ответом —
  // именно они попадают в drill-pool. Accuracy = known / (known + unknown).
  const trainerPoolSize = sections
    .filter((s) => categoryFor(s.slug) === "tech")
    .reduce((acc, s) => acc + s._count.questions, 0);
  const trainerKnown = trainerStats.reduce((a, s) => a + s.knownCount, 0);
  const trainerUnknown = trainerStats.reduce((a, s) => a + s.unknownCount, 0);
  const trainerTotal = trainerKnown + trainerUnknown;
  const trainerAccuracy = trainerTotal
    ? Math.round((trainerKnown / trainerTotal) * 100)
    : 0;

  type Tile = {
    key: string;
    title: string;
    subtitle: string;
    href: string;
    /** правый показатель в нижней строке (правее ENTER) */
    meta: string;
    /** ширина прогресс-полосы в процентах (0..100), null — без полосы */
    progress: number | null;
  };

  const tiles: Tile[] = [
    {
      key: "tech",
      title: "Tech",
      subtitle: stats[0].subtitle,
      href: "/tech",
      meta: `${stats[0].total ? Math.round((stats[0].answered / stats[0].total) * 100) : 0}%`,
      progress: stats[0].total ? Math.round((stats[0].answered / stats[0].total) * 100) : 0,
    },
    {
      key: "social",
      title: "Social",
      subtitle: stats[1].subtitle,
      href: "/social",
      meta: `${stats[1].total ? Math.round((stats[1].answered / stats[1].total) * 100) : 0}%`,
      progress: stats[1].total ? Math.round((stats[1].answered / stats[1].total) * 100) : 0,
    },
    {
      key: "trainer",
      title: "Trainer",
      subtitle: "RANDOM 25 · NO INPUT · KNOW IT OR FACE IT",
      href: "/trainer",
      meta: trainerTotal
        ? `${trainerAccuracy}%`
        : `${trainerPoolSize} READY`,
      progress: trainerTotal ? trainerAccuracy : null,
    },
    {
      key: "notes",
      title: "Notes",
      subtitle: "STAR STORIES · VOCAB · TALKING POINTS",
      href: "/notes",
      meta: `${notes} ${notes === 1 ? "NOTE" : "NOTES"}`,
      progress: null,
    },
    {
      key: "cv",
      title: "CV",
      subtitle: "ONE-PAGE BUILDER    LIVE PREVIEW    EXPORT TO PDF",
      href: "/cv",
      meta: "BUILDER",
      progress: null,
    },
  ];

  // Координаты «последней строки» сетки 2-в-ряд: для нечётного количества
  // плиток последний ряд содержит одну ячейку, и границы у неё не должны
  // дублироваться.
  const lastRowStart = Math.floor((tiles.length - 1) / 2) * 2;

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
          topRight={<ResetButton scope="all" label="RESET PROGRESS" />}
          title={
            <>
              Interview
              <br />
              Preparation
            </>
          }
          description={
            <>
              <p>FRONTEND INTERVIEW DRILL    RECALL OVER MEMORY</p>
              <p>TWO TRACKS    {grandTotal} CARDS</p>
            </>
          }
          progress={{ percent: grandPct }}
        />

        <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-0 border border-foreground">
          {tiles.map((tile, idx) => {
            // 2x2 на десктопе: правая колонка = idx % 2 === 1; нижняя строка =
            // idx >= 2. Бордеры: правый — у левых клеток на десктопе; нижний —
            // у верхних клеток. На мобиле — только нижний между всеми, кроме
            // последней.
            const isRightCol = idx % 2 === 1;
            const isBottomRow = idx >= lastRowStart;
            const borderClasses = [
              !isBottomRow ? "border-b border-foreground" : "",
              !isRightCol ? "sm:border-r border-foreground" : "",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <li key={tile.key} className={borderClasses}>
                <Link
                  href={tile.href}
                  className="flex flex-col h-full p-6 sm:p-8 hover:bg-muted transition-colors"
                >
                  <h2 className="text-2xl sm:text-3xl font-medium leading-tight uppercase tracking-tight">
                    {tile.title}
                  </h2>
                  <p className="mt-3 text-sm text-muted-foreground max-w-md">
                    {tile.subtitle}
                  </p>

                  <div className="mt-auto pt-10 flex items-center justify-between">
                    <span className="yzy-label">ENTER</span>
                    <span className="yzy-meta tabular-nums text-muted-foreground">
                      {tile.meta}
                    </span>
                  </div>
                  <div className="mt-3 h-px w-full bg-foreground/20 relative">
                    {tile.progress !== null && (
                      <div
                        className="absolute left-0 top-0 h-px bg-foreground"
                        style={{ width: `${tile.progress}%` }}
                      />
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-12 flex items-center justify-between">
          <p className="yzy-meta text-muted-foreground">USER · {username}</p>
        </div>
      </main>
    </>
  );
}
