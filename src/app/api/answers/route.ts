import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const username = getCurrentUser();
  if (!username) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  let body: { questionId?: string; text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }
  const questionId = (body.questionId ?? "").trim();
  const text = body.text ?? "";
  if (!questionId) {
    return NextResponse.json({ error: "Missing questionId" }, { status: 400 });
  }
  if (typeof text !== "string" || text.length > 20_000) {
    return NextResponse.json({ error: "Bad text" }, { status: 400 });
  }

  const exists = await prisma.question.findUnique({
    where: { id: questionId },
    select: { id: true },
  });
  if (!exists) return NextResponse.json({ error: "Unknown question" }, { status: 404 });

  await prisma.answer.upsert({
    where: { username_questionId: { username, questionId } },
    create: { username, questionId, text },
    update: { text },
  });

  return NextResponse.json({ ok: true });
}
