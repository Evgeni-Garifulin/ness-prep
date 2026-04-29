import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST() {
  const username = getCurrentUser();
  if (!username) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const note = await prisma.note.create({
    data: { username, title: "Без названия", content: "" },
  });
  return NextResponse.json({
    id: note.id,
    title: note.title,
    content: note.content,
    pinned: note.pinned,
    updatedAt: note.updatedAt.toISOString(),
  });
}

export async function GET() {
  const username = getCurrentUser();
  if (!username) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const notes = await prisma.note.findMany({
    where: { username },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
  });
  return NextResponse.json(
    notes.map((n) => ({
      id: n.id,
      title: n.title,
      content: n.content,
      pinned: n.pinned,
      updatedAt: n.updatedAt.toISOString(),
    })),
  );
}
