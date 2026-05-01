"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Anchor = { id: string; label: string };

// Якорный навигатор по подсекциям. Светло-серые ссылки, активная (та, что
// сейчас в верхней половине viewport'а) — чёрная. Скролл-спай через
// IntersectionObserver: каждый h2 наблюдается, активным считается самый
// верхний из видимых в окне `rootMargin: -20% 0px -50% 0px`.
export function SubsectionNav({ anchors }: { anchors: Anchor[] }) {
  const [activeId, setActiveId] = useState<string | null>(anchors[0]?.id ?? null);

  useEffect(() => {
    if (anchors.length === 0) return;

    // Карта id → top-видимости. Активный — наиболее «продвинутый»
    // в верхней зоне viewport'а.
    const visible = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            visible.set(e.target.id, e.boundingClientRect.top);
          } else {
            visible.delete(e.target.id);
          }
        }
        if (visible.size === 0) return;
        // Берём ближайший к верху, но «выше» средины окна
        const sorted = [...visible.entries()].sort((a, b) => a[1] - b[1]);
        setActiveId(sorted[0][0]);
      },
      { rootMargin: "-20% 0px -50% 0px", threshold: 0 },
    );

    for (const a of anchors) {
      const el = document.getElementById(a.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [anchors]);

  if (anchors.length <= 1) return null;

  return (
    <nav className="flex flex-wrap gap-x-5 gap-y-2 mt-8 mb-2">
      {anchors.map((a) => (
        <a
          key={a.id}
          href={`#${a.id}`}
          className={cn(
            "yzy-label transition-colors whitespace-nowrap",
            activeId === a.id
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {a.label}
        </a>
      ))}
    </nav>
  );
}
