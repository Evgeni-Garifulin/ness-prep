import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type Params = { id: string };

export async function PATCH(req: Request, { params }: { params: Params }) {
  const username = getCurrentUser();
  if (!username) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  let body: { title?: string; content?: string; pinned?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  const note = await prisma.note.findUnique({ where: { id: params.id } });
  if (!note || note.username !== username) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (typeof body.title === "string") data.title = body.title.slice(0, 200);
  if (typeof body.content === "string") {
    if (body.content.length > 200_000) {
      return NextResponse.json({ error: "Слишком длинный текст" }, { status: 400 });
    }
    data.content = body.content;
  }
  if (typeof body.pinned === "boolean") data.pinned = body.pinned;

  const updated = await prisma.note.update({ where: { id: params.id }, data });
  return NextResponse.json({
    id: updated.id,
    title: updated.title,
    content: updated.content,
    pinned: updated.pinned,
    updatedAt: updated.updatedAt.toISOString(),
  });
}

export async function DELETE(_req: Request, { params }: { params: Params }) {
  const username = getCurrentUser();
  if (!username) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const note = await prisma.note.findUnique({ where: { id: params.id } });
  if (!note || note.username !== username) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.note.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
