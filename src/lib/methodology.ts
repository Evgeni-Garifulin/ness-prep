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
  "react-architecture": {
    pdf: "/methodology/react-architecture.pdf",
    epub: "/methodology/react-architecture.epub",
    hint: "LEARN IT FOR 7 DAYS",
  },
  "browser-apis-dom": {
    pdf: "/methodology/browser-apis-dom.pdf",
    epub: "/methodology/browser-apis-dom.epub",
    hint: "LEARN IT FOR 7 DAYS",
  },

  // Performance — две подкатегории
  "browser / runtime": {
    pdf: "/methodology/perf-runtime.pdf",
    epub: "/methodology/perf-runtime.epub",
    hint: "LEARN IT FOR 7 DAYS",
  },
  "react performance": {
    pdf: "/methodology/perf-react.pdf",
    epub: "/methodology/perf-react.epub",
    hint: "LEARN IT FOR 7 DAYS",
  },

  // Real-time / WebSocket
  "realtime-websocket": {
    pdf: "/methodology/realtime-websocket.pdf",
    epub: "/methodology/realtime-websocket.epub",
    hint: "LEARN IT FOR 7 DAYS",
  },

  // Accessibility
  accessibility: {
    pdf: "/methodology/accessibility.pdf",
    epub: "/methodology/accessibility.epub",
    hint: "LEARN IT FOR 7 DAYS",
  },

  // Forms / Validation
  "forms-validation": {
    pdf: "/methodology/forms-validation.pdf",
    epub: "/methodology/forms-validation.epub",
    hint: "LEARN IT FOR 7 DAYS",
  },

  // Design System
  "design-system": {
    pdf: "/methodology/design-system.pdf",
    epub: "/methodology/design-system.epub",
    hint: "LEARN IT FOR 7 DAYS",
  },

  // Security
  security: {
    pdf: "/methodology/security.pdf",
    epub: "/methodology/security.epub",
    hint: "LEARN IT FOR 7 DAYS",
  },

  // API / GraphQL
  "api-graphql": {
    pdf: "/methodology/api-graphql.pdf",
    epub: "/methodology/api-graphql.epub",
    hint: "LEARN IT FOR 7 DAYS",
  },

  // Testing — две подкатегории
  "unit / integration": {
    pdf: "/methodology/testing-unit.pdf",
    epub: "/methodology/testing-unit.epub",
    hint: "LEARN IT FOR 7 DAYS",
  },
  "e2e / playwright": {
    pdf: "/methodology/testing-e2e.pdf",
    epub: "/methodology/testing-e2e.epub",
    hint: "LEARN IT FOR 7 DAYS",
  },

  // Build tools
  "build-tools": {
    pdf: "/methodology/build-tools.pdf",
    epub: "/methodology/build-tools.epub",
    hint: "LEARN IT FOR 7 DAYS",
  },

  // Micro-frontends / Monorepo
  "microfrontends-monorepo": {
    pdf: "/methodology/microfrontends-monorepo.pdf",
    epub: "/methodology/microfrontends-monorepo.epub",
    hint: "LEARN IT FOR 7 DAYS",
  },

  // CI/CD / Delivery
  "cicd-delivery": {
    pdf: "/methodology/cicd-delivery.pdf",
    epub: "/methodology/cicd-delivery.epub",
    hint: "LEARN IT FOR 7 DAYS",
  },

  // Observability
  observability: {
    pdf: "/methodology/observability.pdf",
    epub: "/methodology/observability.epub",
    hint: "LEARN IT FOR 7 DAYS",
  },

  // Code review (теория)
  "code-review": {
    pdf: "/methodology/code-review.pdf",
    epub: "/methodology/code-review.epub",
    hint: "LEARN IT FOR 7 DAYS",
  },

  // System design
  "system-design": {
    pdf: "/methodology/system-design.pdf",
    epub: "/methodology/system-design.epub",
    hint: "LEARN IT FOR 7 DAYS",
  },

  // Live-coding — три подкатегории
  "javascript / algorithms": {
    pdf: "/methodology/live-coding-js.pdf",
    epub: "/methodology/live-coding-js.epub",
    hint: "LEARN IT FOR 7 DAYS",
  },
  typescript: {
    pdf: "/methodology/live-coding-ts.pdf",
    epub: "/methodology/live-coding-ts.epub",
    hint: "LEARN IT FOR 7 DAYS",
  },
  react: {
    pdf: "/methodology/live-coding-react.pdf",
    epub: "/methodology/live-coding-react.epub",
    hint: "LEARN IT FOR 7 DAYS",
  },

  // Take-home
  "take-home": {
    pdf: "/methodology/take-home.pdf",
    epub: "/methodology/take-home.epub",
    hint: "LEARN IT FOR 7 DAYS",
  },

  // Debugging
  debugging: {
    pdf: "/methodology/debugging.pdf",
    epub: "/methodology/debugging.epub",
    hint: "LEARN IT FOR 7 DAYS",
  },

  // Code-review tasks (практика)
  "code-review-tasks": {
    pdf: "/methodology/code-review-tasks.pdf",
    epub: "/methodology/code-review-tasks.epub",
    hint: "LEARN IT FOR 7 DAYS",
  },

  // Fintech scenarios
  "fintech-scenarios": {
    pdf: "/methodology/fintech-scenarios.pdf",
    epub: "/methodology/fintech-scenarios.epub",
    hint: "LEARN IT FOR 7 DAYS",
  },

  // Must-have blitz
  "must-have-blitz": {
    pdf: "/methodology/must-have-blitz.pdf",
    epub: "/methodology/must-have-blitz.epub",
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
