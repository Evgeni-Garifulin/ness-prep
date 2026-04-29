import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// DELETE — снести всю статистику тренажёра текущего пользователя.
// Используется кнопкой CLEAR ALL STATS на /trainer.
export async function DELETE() {
  const username = getCurrentUser();
  if (!username) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  await prisma.trainerStat.deleteMany({ where: { username } });
  return NextResponse.json({ ok: true });
}
