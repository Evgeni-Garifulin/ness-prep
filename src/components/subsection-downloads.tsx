"use client";

import plansData from "@/../data/methodology-plans.json";
import { downloadIcs, type Plan } from "@/lib/ics";
import { methodologyFor } from "@/lib/methodology";

// Мета-строка под заголовком подсекции (или под H1 для секций без
// подкатегорий):
//   LEARN IT FOR 7 DAYS    PDF    IBOOKS    REMINDER
//
// Стиль — yzy-label, серый по умолчанию, ховер чёрный. Без рамок и
// без иконок — единый стиль ссылок проекта (см. RESET SECTION).
//
// Поиск методички: сначала по subsection, потом fallback по
// sectionSlug — для секций, где subsection отсутствует.
//
// REMINDER рендерится только если у методички есть planSlug и план
// найден в data/methodology-plans.json. Клик собирает .ics на лету
// (даты — от текущего дня) и триггерит скачивание.
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
    <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1">
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
      {plan ? (
        <button
          type="button"
          onClick={() =>
            downloadIcs(plan, `itw-prep-${files.planSlug}.ics`)
          }
          className={`${linkClass} bg-transparent border-0 p-0 cursor-pointer`}
          aria-label="Скачать .ics — календарь на 7 дней с занятиями"
          title="Календарь на 7 дней — события с 19:00 до 20:00, напоминания утром и за час"
        >
          REMINDER
        </button>
      ) : null}
    </div>
  );
}
