import { methodologyFor } from "@/lib/methodology";

// Две кнопки-ссылки на скачивание методички подсекции — PDF и EPUB.
// Отображаются справа от заголовка подкатегории на странице секции.
//
// Если для данной подсекции методички нет — компонент рендерит null и
// заголовок остаётся как был.
//
// Стиль — yzy-label, моноширинный, монохром. На мобилке кнопки уезжают
// под заголовок (flex-wrap у родителя), на sm+ — стоят в ряд справа.
export function SubsectionDownloads({ subsection }: { subsection: string | null | undefined }) {
  const files = methodologyFor(subsection);
  if (!files) return null;

  const itemClass =
    "yzy-label inline-flex items-center gap-2 px-2.5 h-7 " +
    "border border-foreground text-foreground hover:bg-foreground hover:text-background " +
    "transition-colors";

  return (
    <div className="flex items-center gap-2 shrink-0">
      <a href={files.pdf} download className={itemClass} aria-label="Скачать методичку в PDF">
        <span aria-hidden>↓</span>
        <span>PDF</span>
      </a>
      <a
        href={files.epub}
        download
        className={itemClass}
        aria-label="Скачать методичку в формате EPUB (для Apple Books / iBooks)"
        title="EPUB — открывается в Apple Books / iBooks"
      >
        <span aria-hidden>↓</span>
        <span>iBOOKS</span>
      </a>
    </div>
  );
}
