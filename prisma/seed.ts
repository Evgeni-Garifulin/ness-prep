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
  // Контент лежит в data/answers/<slug>.json — по файлу на секцию.
  // Для обратной совместимости поддерживается и старый монолит data/answers.json,
  // если он остался локально.
  const merged: Record<string, Content> = {};

  const dir = path.resolve(process.cwd(), "data/answers");
  if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .sort();
    for (const f of files) {
      const full = path.join(dir, f);
      try {
        const obj = JSON.parse(fs.readFileSync(full, "utf8")) as Record<
          string,
          Content
        >;
        for (const [k, v] of Object.entries(obj)) {
          if (k.startsWith("_")) continue; // skip _meta-like keys
          merged[k] = v;
        }
      } catch (err) {
        console.warn(`[seed] ${f} present but invalid JSON, ignoring:`, err);
      }
    }
  }

  const legacy = path.resolve(process.cwd(), "data/answers.json");
  if (fs.existsSync(legacy)) {
    try {
      const obj = JSON.parse(fs.readFileSync(legacy, "utf8")) as Record<
        string,
        Content
      >;
      for (const [k, v] of Object.entries(obj)) {
        if (k.startsWith("_")) continue;
        // Per-section files выигрывают, поэтому legacy идёт только как fallback.
        if (!(k in merged)) merged[k] = v;
      }
    } catch (err) {
      console.warn("[seed] answers.json present but invalid JSON, ignoring:", err);
    }
  }

  return merged;
}

async function main() {
  const file = path.resolve(process.cwd(), "data/questions.json");
  const raw = JSON.parse(fs.readFileSync(file, "utf8")) as { sections: RawSection[] };
  // data/answers/*.json — по файлу на секцию с подсказками и эталонными ответами.
  // Мержится поверх structure из questions.json. Можно дозаливать порциями
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
