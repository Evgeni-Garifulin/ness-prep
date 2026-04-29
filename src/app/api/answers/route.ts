import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// POST { questionId, text?, confirmed? }
//   text       — auto-save текста из textarea, если передан
//   confirmed  — явный флаг «ответ дан / забран», если передан
//   Любая комбинация валидна: можно слать только text, только confirmed
//   или сразу оба.
export async function POST(req: Request) {
  const username = getCurrentUser();
  if (!username) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  let body: { questionId?: string; text?: string; confirmed?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }
  const questionId = (body.questionId ?? "").trim();
  if (!questionId) {
    return NextResponse.json({ error: "Missing questionId" }, { status: 400 });
  }

  const exists = await prisma.question.findUnique({
    where: { id: questionId },
    select: { id: true },
  });
  if (!exists) return NextResponse.json({ error: "Unknown question" }, { status: 404 });

  const data: { text?: string; confirmed?: boolean } = {};
  if (typeof body.text === "string") {
    if (body.text.length > 20_000) {
      return NextResponse.json({ error: "Bad text" }, { status: 400 });
    }
    data.text = body.text;
  }
  if (typeof body.confirmed === "boolean") {
    data.confirmed = body.confirmed;
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  await prisma.answer.upsert({
    where: { username_questionId: { username, questionId } },
    create: {
      username,
      questionId,
      text: data.text ?? "",
      confirmed: data.confirmed ?? false,
    },
    update: data,
  });

  return NextResponse.json({ ok: true });
}
