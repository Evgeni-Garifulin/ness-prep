import { methodologyFor } from "@/lib/methodology";

// Мета-строка под заголовком подсекции (или под H1 для секций без
// подкатегорий):
//   LEARN IT FOR 7 DAYS    PDF    IBOOKS
//
// Стиль — yzy-label, серый по умолчанию, ховер чёрный. Без рамок и
// без иконок — единый стиль ссылок проекта (см. RESET SECTION).
//
// Поиск методички: сначала по subsection, потом fallback по
// sectionSlug — для секций, где subsection отсутствует.
//
// Если методички нет — компонент рендерит null.
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
