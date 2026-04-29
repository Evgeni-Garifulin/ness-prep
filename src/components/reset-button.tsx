"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Props = {
  scope?: "all" | "section";
  sectionSlug?: string;
  label?: string;
  className?: string;
};

// Текстовая ссылка-сброс в стиле RESET TEST в тренажёре. Сидит в шапке
// страницы (по правому краю напротив SEASON-лейбла). Подтверждение — нативный
// confirm(), чтобы не разводить inline-«Are you sure?» в шапке.
export function ResetButton({ scope = "all", sectionSlug, label, className }: Props) {
  const [pending, start] = useTransition();
  const router = useRouter();

  const onClick = () => {
    const msg =
      scope === "section"
        ? "Сбросить ответы по этой секции?"
        : "Снести весь прогресс по ответам?";
    if (!confirm(msg)) return;
    start(async () => {
      const res = await fetch("/api/answers/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope, sectionSlug }),
      });
      if (res.ok) router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={cn(
        "yzy-label transition-colors whitespace-nowrap",
        pending
          ? "text-muted-foreground/40 cursor-not-allowed"
          : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {pending ? "RESETTING…" : (label ?? (scope === "all" ? "RESET ALL" : "RESET SECTION"))}
    </button>
  );
}
