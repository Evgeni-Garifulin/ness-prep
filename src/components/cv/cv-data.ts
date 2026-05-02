// CV builder — data types and seed.
// Соответствует контракту из дизайн-хэндофа eb0c0c.

export type SkillLevel = "EXPERT" | "STRONG" | "WORKING" | "LEARNING";
export type LanguageLevel =
  | "Native"
  | "C2"
  | "C1"
  | "B2"
  | "B1"
  | "A2"
  | "A1";

export type CVEntry = {
  role: string;
  org: string;
  from: string;
  to: string;
  desc: string;
};

export type CVSkill = { name: string; lvl: SkillLevel };
export type CVLanguage = { name: string; lvl: LanguageLevel };

export type CVData = {
  name: string;
  role: string;
  location: string;
  email: string;
  phone: string;
  link: string;
  summary: string;
  experience: CVEntry[];
  education: CVEntry[];
  skills: CVSkill[];
  languages: CVLanguage[];
};

export type CVTemplate = "manuscript" | "twocol" | "spec";

export const SKILL_LEVELS: SkillLevel[] = [
  "EXPERT",
  "STRONG",
  "WORKING",
  "LEARNING",
];

export const LANGUAGE_LEVELS: LanguageLevel[] = [
  "Native",
  "C2",
  "C1",
  "B2",
  "B1",
  "A2",
  "A1",
];

export const EMPTY_ENTRY: CVEntry = {
  role: "",
  org: "",
  from: "",
  to: "",
  desc: "",
};

// Seed-данные. Голос русско-английский, как в остальных экранах.
export const DEFAULT_CV: CVData = {
  name: "Иван Петров",
  role: "Senior Frontend Engineer",
  location: "Берлин · Open to remote",
  email: "ivan.petrov@mail.ru",
  phone: "+49 30 0000 0000",
  link: "ivanpetrov.dev",
  summary:
    "Frontend инженер, 8 лет в продукте. Веду проекты от вайрфрейма до прод-релиза, больше всего люблю работу с производительностью и проектирование систем компонентов. Командный игрок, ментор для двоих джунов.",
  experience: [
    {
      role: "Senior Frontend Engineer",
      org: "Aurora Labs",
      from: "2023",
      to: "Now",
      desc:
        "Refactored core checkout to React Server Components — TTFB cut by 38%. Led design-system migration for 14 product teams.",
    },
    {
      role: "Frontend Engineer",
      org: "Pravda Studio",
      from: "2020",
      to: "2023",
      desc:
        "Owned editor canvas — collaborative cursors, undo stack, plugin API. Shipped to 60k MAU with 99.95 SLO.",
    },
    {
      role: "JS Developer",
      org: "Stellar Mobile",
      from: "2018",
      to: "2020",
      desc:
        "Built React Native shared layer across iOS / Android. Wrote internal cli for theme tokens, still in use.",
    },
  ],
  education: [
    {
      role: "B.Sc. Computer Science",
      org: "ITMO University",
      from: "2014",
      to: "2018",
      desc: "Thesis on incremental DOM diffing. GPA 4.7 / 5.",
    },
  ],
  skills: [
    { name: "TypeScript", lvl: "EXPERT" },
    { name: "React", lvl: "EXPERT" },
    { name: "Next.js", lvl: "STRONG" },
    { name: "Node.js", lvl: "STRONG" },
    { name: "GraphQL", lvl: "STRONG" },
    { name: "Performance", lvl: "STRONG" },
    { name: "WebGL", lvl: "WORKING" },
    { name: "Figma", lvl: "WORKING" },
  ],
  languages: [
    { name: "Russian", lvl: "Native" },
    { name: "English", lvl: "C1" },
    { name: "German", lvl: "B1" },
  ],
};

export const STORAGE_KEY = "eb0c0c.cv";
