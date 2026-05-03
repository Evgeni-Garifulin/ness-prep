// Реестр методичек.
//
// Ключ — нормализованное имя подсекции (поле Question.subsection из markdown)
// или slug секции (для секций без подкатегорий, где subsection = null).
//
// Сравнение нормализованное: без учёта регистра и лишних пробелов.
// Значения — пути к статическим файлам в /public.
//
// planSlug — ключ из data/methodology-plans.json, по которому собирается
// 7-дневный календарь .ics для кнопки REMINDER.

export type MethodologyFiles = {
  pdf: string;
  epub: string;
  hint?: string;
  // Если задан — на странице рендерится кнопка REMINDER, которая
  // скачивает .ics календарь на 7 дней по плану из data/methodology-plans.json.
  planSlug?: string;
};

const REGISTRY: Record<string, MethodologyFiles> = {
  // JS fundamentals
  "event loop / async": {
    pdf: "/methodology/event-loop-async.pdf",
    epub: "/methodology/event-loop-async.epub",
    hint: "LEARN IT FOR 7 DAYS",
    planSlug: "event-loop-async",
  },
  "closures / scope / memory": {
    pdf: "/methodology/closures-scope-memory.pdf",
    epub: "/methodology/closures-scope-memory.epub",
    hint: "LEARN IT FOR 7 DAYS",
    planSlug: "closures-scope-memory",
  },
  "prototypes / objects / classes": {
    pdf: "/methodology/prototypes-objects-classes.pdf",
    epub: "/methodology/prototypes-objects-classes.epub",
    hint: "LEARN IT FOR 7 DAYS",
    planSlug: "prototypes-objects-classes",
  },

  // TypeScript
  "basics / types": {
    pdf: "/methodology/ts-basics-types.pdf",
    epub: "/methodology/ts-basics-types.epub",
    hint: "LEARN IT FOR 7 DAYS",
    planSlug: "ts-basics-types",
  },
  "generics / advanced ts": {
    pdf: "/methodology/ts-generics-advanced.pdf",
    epub: "/methodology/ts-generics-advanced.epub",
    hint: "LEARN IT FOR 7 DAYS",
    planSlug: "ts-generics-advanced",
  },
  "ts architecture": {
    pdf: "/methodology/ts-architecture.pdf",
    epub: "/methodology/ts-architecture.epub",
    hint: "LEARN IT FOR 7 DAYS",
    planSlug: "ts-architecture",
  },

  // React core
  rendering: {
    pdf: "/methodology/react-rendering.pdf",
    epub: "/methodology/react-rendering.epub",
    hint: "LEARN IT FOR 7 DAYS",
    planSlug: "react-rendering",
  },
  hooks: {
    pdf: "/methodology/react-hooks.pdf",
    epub: "/methodology/react-hooks.epub",
    hint: "LEARN IT FOR 7 DAYS",
    planSlug: "react-hooks",
  },
  effects: {
    pdf: "/methodology/react-effects.pdf",
    epub: "/methodology/react-effects.epub",
    hint: "LEARN IT FOR 7 DAYS",
    planSlug: "react-effects",
  },
  "react 18+ / concurrency": {
    pdf: "/methodology/react-concurrency.pdf",
    epub: "/methodology/react-concurrency.epub",
    hint: "LEARN IT FOR 7 DAYS",
    planSlug: "react-concurrency",
  },

  // Section-level (subsection = null) — ключ совпадает со slug секции из БД.
  "state-management": {
    pdf: "/methodology/state-management.pdf",
    epub: "/methodology/state-management.epub",
    hint: "LEARN IT FOR 7 DAYS",
    planSlug: "state-management",
  },
  "react-architecture": {
    pdf: "/methodology/react-architecture.pdf",
    epub: "/methodology/react-architecture.epub",
    hint: "LEARN IT FOR 7 DAYS",
    planSlug: "react-architecture",
  },
  "browser-apis-dom": {
    pdf: "/methodology/browser-apis-dom.pdf",
    epub: "/methodology/browser-apis-dom.epub",
    hint: "LEARN IT FOR 7 DAYS",
    planSlug: "browser-apis-dom",
  },

  // Performance — две подкатегории
  "browser / runtime": {
    pdf: "/methodology/perf-runtime.pdf",
    epub: "/methodology/perf-runtime.epub",
    hint: "LEARN IT FOR 7 DAYS",
    planSlug: "perf-runtime",
  },
  "react performance": {
    pdf: "/methodology/perf-react.pdf",
    epub: "/methodology/perf-react.epub",
    hint: "LEARN IT FOR 7 DAYS",
    planSlug: "perf-react",
  },

  // Real-time / WebSocket
  "realtime-websocket": {
    pdf: "/methodology/realtime-websocket.pdf",
    epub: "/methodology/realtime-websocket.epub",
    hint: "LEARN IT FOR 7 DAYS",
    planSlug: "realtime-websocket",
  },

  // Accessibility
  accessibility: {
    pdf: "/methodology/accessibility.pdf",
    epub: "/methodology/accessibility.epub",
    hint: "LEARN IT FOR 7 DAYS",
    planSlug: "accessibility",
  },

  // Forms / Validation
  "forms-validation": {
    pdf: "/methodology/forms-validation.pdf",
    epub: "/methodology/forms-validation.epub",
    hint: "LEARN IT FOR 7 DAYS",
    planSlug: "forms-validation",
  },

  // Design System
  "design-system": {
    pdf: "/methodology/design-system.pdf",
    epub: "/methodology/design-system.epub",
    hint: "LEARN IT FOR 7 DAYS",
    planSlug: "design-system",
  },

  // Security
  security: {
    pdf: "/methodology/security.pdf",
    epub: "/methodology/security.epub",
    hint: "LEARN IT FOR 7 DAYS",
    planSlug: "security",
  },

  // API / GraphQL
  "api-graphql": {
    pdf: "/methodology/api-graphql.pdf",
    epub: "/methodology/api-graphql.epub",
    hint: "LEARN IT FOR 7 DAYS",
    planSlug: "api-graphql",
  },

  // Testing — две подкатегории
  "unit / integration": {
    pdf: "/methodology/testing-unit.pdf",
    epub: "/methodology/testing-unit.epub",
    hint: "LEARN IT FOR 7 DAYS",
    planSlug: "testing-unit",
  },
  "e2e / playwright": {
    pdf: "/methodology/testing-e2e.pdf",
    epub: "/methodology/testing-e2e.epub",
    hint: "LEARN IT FOR 7 DAYS",
    planSlug: "testing-e2e",
  },

  // Build tools
  "build-tools": {
    pdf: "/methodology/build-tools.pdf",
    epub: "/methodology/build-tools.epub",
    hint: "LEARN IT FOR 7 DAYS",
    planSlug: "build-tools",
  },

  // Micro-frontends / Monorepo
  "microfrontends-monorepo": {
    pdf: "/methodology/microfrontends-monorepo.pdf",
    epub: "/methodology/microfrontends-monorepo.epub",
    hint: "LEARN IT FOR 7 DAYS",
    planSlug: "microfrontends-monorepo",
  },

  // CI/CD / Delivery
  "cicd-delivery": {
    pdf: "/methodology/cicd-delivery.pdf",
    epub: "/methodology/cicd-delivery.epub",
    hint: "LEARN IT FOR 7 DAYS",
    planSlug: "cicd-delivery",
  },

  // Observability
  observability: {
    pdf: "/methodology/observability.pdf",
    epub: "/methodology/observability.epub",
    hint: "LEARN IT FOR 7 DAYS",
    planSlug: "observability",
  },

  // Code review (теория)
  "code-review": {
    pdf: "/methodology/code-review.pdf",
    epub: "/methodology/code-review.epub",
    hint: "LEARN IT FOR 7 DAYS",
    planSlug: "code-review",
  },

  // System design
  "system-design": {
    pdf: "/methodology/system-design.pdf",
    epub: "/methodology/system-design.epub",
    hint: "LEARN IT FOR 7 DAYS",
    planSlug: "system-design",
  },

  // Live-coding — три подкатегории
  "javascript / algorithms": {
    pdf: "/methodology/live-coding-js.pdf",
    epub: "/methodology/live-coding-js.epub",
    hint: "LEARN IT FOR 7 DAYS",
    planSlug: "live-coding-js",
  },
  typescript: {
    pdf: "/methodology/live-coding-ts.pdf",
    epub: "/methodology/live-coding-ts.epub",
    hint: "LEARN IT FOR 7 DAYS",
    planSlug: "live-coding-ts",
  },
  react: {
    pdf: "/methodology/live-coding-react.pdf",
    epub: "/methodology/live-coding-react.epub",
    hint: "LEARN IT FOR 7 DAYS",
    planSlug: "live-coding-react",
  },

  // Take-home
  "take-home": {
    pdf: "/methodology/take-home.pdf",
    epub: "/methodology/take-home.epub",
    hint: "LEARN IT FOR 7 DAYS",
    planSlug: "take-home",
  },

  // Debugging
  debugging: {
    pdf: "/methodology/debugging.pdf",
    epub: "/methodology/debugging.epub",
    hint: "LEARN IT FOR 7 DAYS",
    planSlug: "debugging",
  },

  // Code-review tasks (практика)
  "code-review-tasks": {
    pdf: "/methodology/code-review-tasks.pdf",
    epub: "/methodology/code-review-tasks.epub",
    hint: "LEARN IT FOR 7 DAYS",
    planSlug: "code-review-tasks",
  },

  // Fintech scenarios
  "fintech-scenarios": {
    pdf: "/methodology/fintech-scenarios.pdf",
    epub: "/methodology/fintech-scenarios.epub",
    hint: "LEARN IT FOR 7 DAYS",
    planSlug: "fintech-scenarios",
  },

  // Must-have blitz
  "must-have-blitz": {
    pdf: "/methodology/must-have-blitz.pdf",
    epub: "/methodology/must-have-blitz.epub",
    hint: "LEARN IT FOR 7 DAYS",
    planSlug: "must-have-blitz",
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
