// Реестр методичек по подкатегориям.
//
// Ключ — название подсекции ровно так, как оно приходит из БД (поле
// Question.subsection из markdown-источника). Сравнение нормализованное —
// без учёта регистра и лишних пробелов, чтобы «Event loop / async» и
// «EVENT LOOP / ASYNC» считались одним и тем же.
//
// Значения — пути к статическим файлам в /public, отдаются Next-ом
// как обычные ассеты. `hint` — короткий лейбл слева от ссылок-скачивания
// (например, "LEARN IT FOR 7 DAYS").

export type MethodologyFiles = {
  pdf: string;
  epub: string;
  hint?: string;
};

const REGISTRY: Record<string, MethodologyFiles> = {
  "event loop / async": {
    pdf: "/methodology/event-loop-async.pdf",
    epub: "/methodology/event-loop-async.epub",
    hint: "LEARN IT FOR 7 DAYS",
  },
  "closures / scope / memory": {
    pdf: "/methodology/closures-scope-memory.pdf",
    epub: "/methodology/closures-scope-memory.epub",
    hint: "LEARN IT FOR 7 DAYS",
  },
};

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export function methodologyFor(subsection: string | null | undefined): MethodologyFiles | null {
  if (!subsection) return null;
  return REGISTRY[normalize(subsection)] ?? null;
}
