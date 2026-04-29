import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const username = getCurrentUser();
  if (!username) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  let body: { scope?: "all" | "section"; sectionSlug?: string };
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const scope = body.scope ?? "all";

  if (scope === "section") {
    const slug = (body.sectionSlug ?? "").trim();
    if (!slug) return NextResponse.json({ error: "Missing sectionSlug" }, { status: 400 });
    const ids = await prisma.question.findMany({
      where: { sectionSlug: slug },
      select: { id: true },
    });
    await prisma.answer.deleteMany({
      where: { username, questionId: { in: ids.map((q) => q.id) } },
    });
  } else {
    await prisma.answer.deleteMany({ where: { username } });
  }

  return NextResponse.json({ ok: true });
}
