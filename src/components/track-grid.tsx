import Link from "next/link";

type Section = {
  slug: string;
  title: string;
  order: number;
  totalQuestions: number;
  answered: number;
  displayNumber: number;
};

export function TrackGrid({
  sections,
  accent,
}: {
  sections: Section[];
  accent: "emerald" | "sky";
}) {
  const accentBar = accent === "emerald" ? "bg-emerald-500" : "bg-sky-500";
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {sections.map((s) => {
        const pct = s.totalQuestions
          ? Math.round((s.answered / s.totalQuestions) * 100)
          : 0;
        return (
          <li key={s.slug}>
            <Link
              href={`/sections/${s.slug}`}
              className="block h-full rounded-lg border border-border bg-card p-4 hover:bg-accent transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {String(s.displayNumber).padStart(2, "0")}
                  </p>
                  <h2 className="text-sm sm:text-base font-semibold leading-snug">
                    {s.title}
                  </h2>
                </div>
                <span className="shrink-0 rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
                  {s.answered}/{s.totalQuestions}
                </span>
              </div>
              <div className="mt-3 h-1 w-full rounded bg-muted overflow-hidden">
                <div className={`h-full ${accentBar}`} style={{ width: `${pct}%` }} />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
