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

export function TrackGrid({ sections }: { sections: Section[] }) {
  return (
    <ul className="border border-foreground divide-y divide-foreground">
      {sections.map((s) => {
        const pct = s.totalQuestions
          ? Math.round((s.answered / s.totalQuestions) * 100)
          : 0;
        return (
          <li key={s.slug}>
            <Link
              href={`/sections/${s.slug}`}
              className="flex items-center gap-4 sm:gap-6 px-4 sm:px-6 py-5 hover:bg-muted transition-colors"
            >
              <span className="yzy-label tabular-nums w-10 shrink-0 text-muted-foreground">
                {String(s.displayNumber).padStart(2, "0")}
              </span>
              <h2 className="flex-1 min-w-0 text-base sm:text-lg font-medium uppercase tracking-tight truncate">
                {stripSectionPrefix(s.title)}
              </h2>
              <span className="yzy-meta tabular-nums text-muted-foreground">
                {s.answered}/{s.totalQuestions}
              </span>
              <div className="hidden sm:block w-24 h-px bg-foreground/20 relative shrink-0">
                <div
                  className="absolute left-0 top-0 h-px bg-foreground"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
