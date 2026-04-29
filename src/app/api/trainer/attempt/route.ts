import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// POST { questionId, result: "known" | "unknown" }
//   Инкрементирует соответствующий счётчик в TrainerStat. При первом ответе
//   создаёт запись с одним из счётчиков = 1.
export async function POST(req: Request) {
  const username = getCurrentUser();
  if (!username) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  let body: { questionId?: string; result?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  const questionId = (body.questionId ?? "").trim();
  const result = body.result;
  if (!questionId) {
    return NextResponse.json({ error: "Missing questionId" }, { status: 400 });
  }
  if (result !== "known" && result !== "unknown") {
    return NextResponse.json({ error: "Bad result" }, { status: 400 });
  }

  const exists = await prisma.question.findUnique({
    where: { id: questionId },
    select: { id: true },
  });
  if (!exists) {
    return NextResponse.json({ error: "Unknown question" }, { status: 404 });
  }

  const updated = await prisma.trainerStat.upsert({
    where: { username_questionId: { username, questionId } },
    create: {
      username,
      questionId,
      knownCount: result === "known" ? 1 : 0,
      unknownCount: result === "unknown" ? 1 : 0,
    },
    update:
      result === "known"
        ? { knownCount: { increment: 1 } }
        : { unknownCount: { increment: 1 } },
  });

  return NextResponse.json({
    ok: true,
    knownCount: updated.knownCount,
    unknownCount: updated.unknownCount,
  });
}
