import { methodologyFor } from "@/lib/methodology";

// Мета-строка под заголовком подсекции:
//   LEARN IT FOR 7 DAYS    PDF    IBOOKS
//
// Стиль — yzy-label, серый по умолчанию, ховер чёрный. Без рамок и
// без иконок — единый стиль ссылок проекта (см. RESET SECTION).
//
// Если для подсекции нет методички — компонент рендерит null, и под
// заголовком ничего не появляется.
export function SubsectionDownloads({ subsection }: { subsection: string | null | undefined }) {
  const files = methodologyFor(subsection);
  if (!files) return null;

  const linkClass =
    "yzy-label text-muted-foreground hover:text-foreground transition-colors";

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
    </div>
  );
}
