"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Props = {
  scope?: "all" | "section";
  sectionSlug?: string;
  label?: string;
  className?: string;
};

export function ResetButton({ scope = "all", sectionSlug, label, className }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  const onReset = () => {
    start(async () => {
      const res = await fetch("/api/answers/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope, sectionSlug }),
      });
      if (res.ok) {
        setConfirming(false);
        router.refresh();
      }
    });
  };

  if (!confirming) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => setConfirming(true)}
        className={className}
      >
        {label ?? (scope === "all" ? "Сбросить все ответы" : "Сбросить раздел")}
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground">Точно сбросить?</span>
      <Button
        size="sm"
        variant="destructive"
        onClick={onReset}
        disabled={pending}
      >
        {pending ? "Сбрасываю…" : "Да, сбросить"}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setConfirming(false)}
        disabled={pending}
      >
        Отмена
      </Button>
    </div>
  );
}
