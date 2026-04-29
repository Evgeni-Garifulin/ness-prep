"use client";

import { useRouter } from "next/navigation";

// Маленький клиентский шорткат — нужен только потому, что router.refresh()
// требует client component'а. Используется в шапке /trainer чтобы рендериться
// в ряд с серверным заголовком SEASON.
export function RefreshTestButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.refresh()}
      className="yzy-label text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
    >
      REFRESH TEST
    </button>
  );
}
