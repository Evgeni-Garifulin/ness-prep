import Link from "next/link";
import { stripSectionPrefix } from "@/lib/utils";

type Section = {
  slug: string;
  title: string;
  order: number;
  totalQuestions: number;
  answered: number;
  displayNumber: number;
};

// Возвращает плоский список <Link>-карточек. Обёртку в grid (1 vs 2 колонки)
// делает <LayoutGrid> снаружи. Никаких divide/border у списка — карточка сама
// несёт свою рамку.
export function TrackGrid({ sections }: { sections: Section[] }) {
  return (
    <>
      {sections.map((s) => {
        const pct = s.totalQuestions
          ? Math.round((s.answered / s.totalQuestions) * 100)
          : 0;
        return (
          <Link
            key={s.slug}
            href={`/sections/${s.slug}`}
            className="flex flex-col border border-foreground p-5 hover:bg-muted transition-colors"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="flex-1 min-w-0 text-base sm:text-lg font-medium uppercase tracking-tight">
                {stripSectionPrefix(s.title)}
              </h2>
              <span className="yzy-meta tabular-nums text-muted-foreground shrink-0">
                {s.answered}/{s.totalQuestions}
              </span>
            </div>
            <div className="mt-auto pt-6">
              <div className="h-px w-full bg-foreground/20 relative">
                <div
                  className="absolute left-0 top-0 h-px bg-foreground"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </Link>
        );
      })}
    </>
  );
}
