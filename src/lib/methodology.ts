// Реестр методичек.
//
// Ключ — нормализованное имя подсекции (поле Question.subsection из markdown)
// или slug секции (для секций без подкатегорий, где subsection = null).
//
// Сравнение нормализованное: без учёта регистра и лишних пробелов.
// Значения — пути к статическим файлам в /public.

export type MethodologyFiles = {
  pdf: string;
  epub: string;
  hint?: string;
};

const REGISTRY: Record<string, MethodologyFiles> = {
  // JS fundamentals
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
  "prototypes / objects / classes": {
    pdf: "/methodology/prototypes-objects-classes.pdf",
    epub: "/methodology/prototypes-objects-classes.epub",
    hint: "LEARN IT FOR 7 DAYS",
  },

  // TypeScript
  "basics / types": {
    pdf: "/methodology/ts-basics-types.pdf",
    epub: "/methodology/ts-basics-types.epub",
    hint: "LEARN IT FOR 7 DAYS",
  },
  "generics / advanced ts": {
    pdf: "/methodology/ts-generics-advanced.pdf",
    epub: "/methodology/ts-generics-advanced.epub",
    hint: "LEARN IT FOR 7 DAYS",
  },
  "ts architecture": {
    pdf: "/methodology/ts-architecture.pdf",
    epub: "/methodology/ts-architecture.epub",
    hint: "LEARN IT FOR 7 DAYS",
  },

  // React core
  rendering: {
    pdf: "/methodology/react-rendering.pdf",
    epub: "/methodology/react-rendering.epub",
    hint: "LEARN IT FOR 7 DAYS",
  },
  hooks: {
    pdf: "/methodology/react-hooks.pdf",
    epub: "/methodology/react-hooks.epub",
    hint: "LEARN IT FOR 7 DAYS",
  },
  effects: {
    pdf: "/methodology/react-effects.pdf",
    epub: "/methodology/react-effects.epub",
    hint: "LEARN IT FOR 7 DAYS",
  },
  "react 18+ / concurrency": {
    pdf: "/methodology/react-concurrency.pdf",
    epub: "/methodology/react-concurrency.epub",
    hint: "LEARN IT FOR 7 DAYS",
  },

  // Section-level (subsection = null) — ключ совпадает со slug секции из БД.
  "state-management": {
    pdf: "/methodology/state-management.pdf",
    epub: "/methodology/state-management.epub",
    hint: "LEARN IT FOR 7 DAYS",
  },
};

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export function methodologyFor(
  subsection: string | null | undefined,
  sectionSlug?: string | null,
): MethodologyFiles | null {
  if (subsection) {
    const hit = REGISTRY[normalize(subsection)];
    if (hit) return hit;
  }
  if (sectionSlug) {
    const hit = REGISTRY[normalize(sectionSlug)];
    if (hit) return hit;
  }
  return null;
}
