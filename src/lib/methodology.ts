// Реестр методичек по подкатегориям.
//
// Ключ — название подсекции ровно так, как оно приходит из БД (поле
// Question.subsection из markdown-источника). Сравнение нормализованное —
// без учёта регистра и лишних пробелов, чтобы «Event loop / async» и
// «EVENT LOOP / ASYNC» считались одним и тем же.
//
// Значения — пути к статическим файлам в /public, отдаются Next-ом
// как обычные ассеты.

export type MethodologyFiles = {
  pdf: string;
  epub: string;
};

const REGISTRY: Record<string, MethodologyFiles> = {
  "event loop / async": {
    pdf: "/methodology/event-loop-async.pdf",
    epub: "/methodology/event-loop-async.epub",
  },
};

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export function methodologyFor(subsection: string | null | undefined): MethodologyFiles | null {
  if (!subsection) return null;
  return REGISTRY[normalize(subsection)] ?? null;
}
