import { methodologyFor } from "@/lib/methodology";
import { IcsButton } from "@/components/ics-button";

// Серверный компонент. Раньше он был "use client" и тянул в клиентский
// бандл data/methodology-plans.json (~164KB) + lib/ics.ts на каждой
// секционной странице. Сейчас:
//   - lookup методички делается на сервере;
//   - PDF/IBOOKS — обычные ссылки (без JS);
//   - .ics — отдельный маленький клиентский компонент IcsButton, который
//     подгружает план календаря и генератор только в момент клика.
//
// Мета-блок под заголовком подсекции (или под H1 для секций без
// подкатегорий). Две строки в стиле yzy-label, без рамок и без иконок:
//
//   LEARN IT FOR 7 DAYS    PDF    IBOOKS
//   ADD IT TO CALENDAR .ICS
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
      {files.planSlug ? (
        <IcsButton
          planSlug={files.planSlug}
          pdf={files.pdf}
          epub={files.epub}
          className={`${linkClass} self-start bg-transparent border-0 p-0 cursor-pointer`}
        />
      ) : null}
    </div>
  );
}
