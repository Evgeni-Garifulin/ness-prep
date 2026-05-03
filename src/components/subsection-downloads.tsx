"use client";

import plansData from "@/../data/methodology-plans.json";
import { downloadIcs, type Plan } from "@/lib/ics";
import { methodologyFor } from "@/lib/methodology";

// Мета-блок под заголовком подсекции (или под H1 для секций без
// подкатегорий). Две строки в стиле yzy-label, без рамок и без иконок:
//
//   LEARN IT FOR 7 DAYS    PDF    IBOOKS
//   ADD IT TO CALENDAR .ICS
//
// PDF / IBOOKS — ссылки на статические файлы. ADD IT TO CALENDAR .ICS
// рендерится только если у методички есть planSlug; клик собирает
// .ics на лету (даты — от текущего дня) и триггерит скачивание.
export function SubsectionDownloads({
  subsection,
  sectionSlug,
}: {
  subsection?: string | null;
  sectionSlug?: string | null;
}) {
  const files = methodologyFor(subsection, sectionSlug);
  if (!files) return null;

  const linkClass =
    "yzy-label text-muted-foreground hover:text-foreground transition-colors";

  const plans = plansData as Record<string, Plan>;
  const plan = files.planSlug ? plans[files.planSlug] : undefined;

  return (
    <div className="mt-2 flex flex-col gap-y-1">
      <div className="flex flex-wrap items-center gap-x-5">
        {files.hint ? (
          <span className="yzy-label text-muted-foreground">{files.hint}</span>
        ) : null}
        <a
          href={files.pdf}
          download
          className={linkClass}
          aria-label="Скачать методичку в PDF"
        >
          PDF
        </a>
        <a
          href={files.epub}
          download
          className={linkClass}
          aria-label="Скачать методичку для Apple Books / iBooks"
          title="EPUB — открывается в Apple Books / iBooks"
        >
          IBOOKS
        </a>
      </div>
      {plan ? (
        <button
          type="button"
          onClick={() => {
            // Абсолютные URL для ссылок внутри события — берутся из
            // window.location.origin в момент клика, чтобы работало
            // на любом домене, где задеплоено.
            const origin =
              typeof window !== "undefined" ? window.location.origin : "";
            downloadIcs(plan, `itw-prep-${files.planSlug}.ics`, {
              pdf: `${origin}${files.pdf}`,
              epub: `${origin}${files.epub}`,
            });
          }}
          className={`${linkClass} self-start bg-transparent border-0 p-0 cursor-pointer`}
          aria-label="Скачать .ics — календарь на 7 дней с занятиями"
          title="Календарь на 7 дней — события с 19:00 до 21:00, напоминания утром в 10:00 и за час до начала. В описании — ссылки на PDF и EPUB методички."
        >
          ADD IT TO CALENDAR .ICS
        </button>
      ) : null}
    </div>
  );
}
