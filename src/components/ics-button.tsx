"use client";

import { useState } from "react";

// Маленькая клиентская кнопка скачивания .ics. Изолирована от
// SubsectionDownloads, чтобы серверная часть не тянула в клиентский бандл
// ни data/methodology-plans.json (~164KB), ни lib/ics.ts. Сам план + код
// генератора подгружаются динамически только по клику.

type Props = {
  planSlug: string;
  pdf: string;
  epub: string;
  className?: string;
};

export function IcsButton({ planSlug, pdf, epub, className }: Props) {
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      // Динамический импорт: бандл для этих модулей создаётся отдельно и
      // подгружается только в момент клика. На первой загрузке секционной
      // страницы их в JS-чанках нет вообще.
      const [{ downloadIcs }, plansModule] = await Promise.all([
        import("@/lib/ics"),
        import("@/../data/methodology-plans.json"),
      ]);
      const plansData = (plansModule as unknown as { default: Record<string, unknown> })
        .default ?? plansModule;
      const plans = plansData as Record<string, import("@/lib/ics").Plan>;
      const plan = plans[planSlug];
      if (!plan) return;
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      downloadIcs(plan, `itw-prep-${planSlug}.ics`, {
        pdf: `${origin}${pdf}`,
        epub: `${origin}${epub}`,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={className}
      aria-label="Скачать .ics — календарь на 7 дней с занятиями"
      title="Календарь на 7 дней — события с 19:00 до 21:00, напоминания утром в 10:00 и за час до начала. В описании — ссылки на PDF и EPUB методички."
    >
      ADD IT TO CALENDAR .ICS
    </button>
  );
}
