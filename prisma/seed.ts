/* eslint-disable no-console */
// Seeds Section + Question rows from data/questions.json. Idempotent — safe to run
// repeatedly. Existing user answers are preserved because they reference the
// stable Question.id we generated in scripts/parse-md.mjs.

import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type RawQuestion = {
  id: string;
  order: number;
  number: number;
  subsection: string | null;
  text: string;
  hintEasy: string;
  hintFull: string;
  answer: string;
};

type RawSection = {
  slug: string;
  order: number;
  title: string;
  sourceFile: string;
  questions: RawQuestion[];
};

type Content = {
  hintEasy?: string;
  hintFull?: string;
  answer?: string;
};

function loadAnswers(): Record<string, Content> {
  const p = path.resolve(process.cwd(), "data/answers.json");
  if (!fs.existsSync(p)) return {};
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")) as Record<string, Content>;
  } catch (err) {
    console.warn("[seed] answers.json present but invalid JSON, ignoring:", err);
    return {};
  }
}

async function main() {
  const file = path.resolve(process.cwd(), "data/questions.json");
  const raw = JSON.parse(fs.readFileSync(file, "utf8")) as { sections: RawSection[] };
  // answers.json — отдельный файл с подсказками и эталонными ответами,
  // мержится поверх structure из questions.json. Можно дозаливать порциями
  // (по секциям) и пересеивать — старые поля не затираются.
  const answers = loadAnswers();
  let withContent = 0;

  let sectionCount = 0;
  let questionCount = 0;

  for (const section of raw.sections) {
    await prisma.section.upsert({
      where: { slug: section.slug },
      create: {
        slug: section.slug,
        order: section.order,
        title: section.title,
      },
      update: {
        order: section.order,
        title: section.title,
      },
    });
    sectionCount++;

    for (const q of section.questions) {
      const extra = answers[q.id] ?? {};
      const hintEasy = extra.hintEasy ?? q.hintEasy ?? "";
      const hintFull = extra.hintFull ?? q.hintFull ?? "";
      const answer = extra.answer ?? q.answer ?? "";
      if (hintEasy || hintFull || answer) withContent++;

      await prisma.question.upsert({
        where: { id: q.id },
        create: {
          id: q.id,
          sectionSlug: section.slug,
          order: q.order,
          number: q.number,
          subsection: q.subsection,
          text: q.text,
          hintEasy,
          hintFull,
          answer,
        },
        update: {
          sectionSlug: section.slug,
          order: q.order,
          number: q.number,
          subsection: q.subsection,
          text: q.text,
          // Не затираем поля пустотой — обновляем только когда есть контент.
          ...(hintEasy ? { hintEasy } : {}),
          ...(hintFull ? { hintFull } : {}),
          ...(answer ? { answer } : {}),
        },
      });
      questionCount++;
    }
  }

  console.log(
    `Seeded ${sectionCount} sections / ${questionCount} questions (${withContent} with hints/answer)`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
