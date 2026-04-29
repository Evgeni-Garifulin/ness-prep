import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// POST — upsert заметки на вопрос. Body: { questionId, content }
//   Пустая content интерпретируется как «удалить» (как DELETE), чтобы клиент мог
//   просто вызвать POST с "" и не разбираться отдельно.
export async function POST(req: Request) {
  const username = getCurrentUser();
  if (!username) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  let body: { questionId?: string; content?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  const questionId = (body.questionId ?? "").trim();
  const content = body.content ?? "";
  if (!questionId) {
    return NextResponse.json({ error: "Missing questionId" }, { status: 400 });
  }
  if (typeof content !== "string" || content.length > 20_000) {
    return NextResponse.json({ error: "Bad content" }, { status: 400 });
  }

  const exists = await prisma.question.findUnique({
    where: { id: questionId },
    select: { id: true },
  });
  if (!exists) {
    return NextResponse.json({ error: "Unknown question" }, { status: 404 });
  }

  if (content.trim().length === 0) {
    // Пустая заметка — снимаем запись, чтобы UI мог быть единообразным.
    await prisma.questionNote.deleteMany({ where: { username, questionId } });
    return NextResponse.json({ ok: true, content: "" });
  }

  const note = await prisma.questionNote.upsert({
    where: { username_questionId: { username, questionId } },
    create: { username, questionId, content },
    update: { content },
  });
  return NextResponse.json({
    ok: true,
    content: note.content,
    updatedAt: note.updatedAt.toISOString(),
  });
}

// DELETE — удалить заметку по questionId. Body: { questionId }
export async function DELETE(req: Request) {
  const username = getCurrentUser();
  if (!username) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  let body: { questionId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }
  const questionId = (body.questionId ?? "").trim();
  if (!questionId) {
    return NextResponse.json({ error: "Missing questionId" }, { status: 400 });
  }
  await prisma.questionNote.deleteMany({ where: { username, questionId } });
  return NextResponse.json({ ok: true });
}
