// Категоризация секций: по набору, который Владислав прислал — социальные
// (HR, English prompts, Behavioral STAR, вопросы которые задаёшь сам) живут
// на отдельной странице; всё остальное считается техникой.

export type SectionCategory = "tech" | "social";

const SOCIAL_SLUGS: ReadonlySet<string> = new Set([
  "hr-recruiter",
  "english-prompts",
  "behavioral-star",
  "questions-to-ask-them",
]);

export function categoryFor(slug: string): SectionCategory {
  return SOCIAL_SLUGS.has(slug) ? "social" : "tech";
}

// Порядок отображения внутри каждого трека. Техника — по исходному
// порядку файлов 05..30 (как уже в БД); социалка — фиксированный
// человеко-читаемый порядок.
const SOCIAL_ORDER: Record<string, number> = {
  "hr-recruiter": 1,
  "english-prompts": 2,
  "behavioral-star": 3,
  "questions-to-ask-them": 4,
};

export function sortKey(category: SectionCategory, slug: string, fallbackOrder: number) {
  if (category === "social") return SOCIAL_ORDER[slug] ?? 999;
  return fallbackOrder;
}

export const TRACKS = [
  {
    key: "tech" as const,
    title: "Tech",
    subtitle: "JS · TS · React · Performance · Architecture · System design",
    href: "/tech",
  },
  {
    key: "social" as const,
    title: "Social",
    subtitle: "HR · English · Behavioral · Reverse Q&A",
    href: "/social",
  },
];
