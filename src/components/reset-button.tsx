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
        {label ?? (scope === "all" ? "Reset all" : "Reset section")}
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="yzy-label opacity-60">Are you sure?</span>
      <Button
        size="sm"
        variant="default"
        onClick={onReset}
        disabled={pending}
      >
        {pending ? "Wiping…" : "Yes, reset"}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setConfirming(false)}
        disabled={pending}
      >
        Cancel
      </Button>
    </div>
  );
}
