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

async function main() {
  const file = path.resolve(process.cwd(), "data/questions.json");
  const raw = JSON.parse(fs.readFileSync(file, "utf8")) as { sections: RawSection[] };

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
      await prisma.question.upsert({
        where: { id: q.id },
        create: {
          id: q.id,
          sectionSlug: section.slug,
          order: q.order,
          number: q.number,
          subsection: q.subsection,
          text: q.text,
          hintEasy: q.hintEasy ?? "",
          hintFull: q.hintFull ?? "",
          answer: q.answer ?? "",
        },
        update: {
          sectionSlug: section.slug,
          order: q.order,
          number: q.number,
          subsection: q.subsection,
          text: q.text,
          // Don't blow away hint/answer content if it was hand-edited later;
          // only overwrite when seed JSON has non-empty values.
          ...(q.hintEasy ? { hintEasy: q.hintEasy } : {}),
          ...(q.hintFull ? { hintFull: q.hintFull } : {}),
          ...(q.answer ? { answer: q.answer } : {}),
        },
      });
      questionCount++;
    }
  }

  console.log(`Seeded ${sectionCount} sections / ${questionCount} questions`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
