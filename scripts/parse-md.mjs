// Parses /data/source/*.md (the interview-prep markdown files) into a structured
// data/questions.json that the seed and runtime can rely on.
//
// Each markdown file follows this shape:
//   # <number>. <Section title>
//
//   ## <Subsection>
//
//   1. <Question text>
//   2. <Question text>
//   ...
//
// Some files (notably 30_must_have_blitz.md) have no `## subsections` — every
// question lives at the top level.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC_DIR = path.join(ROOT, "data", "source");
const OUT_FILE = path.join(ROOT, "data", "questions.json");

function slugify(name) {
  // 05_javascript_fundamentals.md -> javascript-fundamentals
  return name
    .replace(/\.md$/i, "")
    .replace(/^\d+[_-]?/, "")
    .replace(/_/g, "-")
    .toLowerCase();
}

function parseFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw.split(/\r?\n/);

  let sectionTitle = "";
  let currentSubsection = null;
  const questions = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const h1 = line.match(/^#\s+(.+)$/);
    if (h1) {
      sectionTitle = h1[1].trim();
      continue;
    }
    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) {
      currentSubsection = h2[1].trim();
      continue;
    }

    const numbered = line.match(/^(\d+)\.\s+(.+)$/);
    if (numbered) {
      const number = Number(numbered[1]);
      const text = numbered[2].trim();
      questions.push({
        number,
        subsection: currentSubsection,
        text,
      });
    }
  }

  return { sectionTitle, questions };
}

function main() {
  const files = fs
    .readdirSync(SRC_DIR)
    .filter((f) => /\.md$/i.test(f))
    .filter((f) => !/^00[_-]?readme/i.test(f))
    .sort();

  const sections = [];
  let totalQuestions = 0;

  for (const file of files) {
    const filePath = path.join(SRC_DIR, file);
    const slug = slugify(file);
    const { sectionTitle, questions } = parseFile(filePath);

    const orderMatch = file.match(/^(\d+)/);
    const order = orderMatch ? Number(orderMatch[1]) : 999;

    sections.push({
      slug,
      order,
      title: sectionTitle || slug,
      sourceFile: file,
      questions: questions.map((q, idx) => ({
        // Stable id so user-saved answers survive re-seeds.
        id: `${slug}__${q.subsection ? slugifyText(q.subsection) + "__" : ""}${q.number}`,
        order: idx,
        number: q.number,
        subsection: q.subsection,
        text: q.text,
        // Hint/answer fields are intentionally empty here — they get filled in
        // either via the UI or by an LLM-driven enrichment pass.
        hintEasy: "",
        hintFull: "",
        answer: "",
      })),
    });

    totalQuestions += questions.length;
  }

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify({ sections }, null, 2), "utf8");

  console.log(`Parsed ${sections.length} sections, ${totalQuestions} questions`);
  console.log(`Wrote ${OUT_FILE}`);
}

function slugifyText(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9а-я]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

main();
