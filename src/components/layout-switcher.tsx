"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Переключатель компоновки списков карточек: одна колонка / две.
//
// Используется в паре:
//   <LayoutSwitcher storageKey="..." header={...}>
//     <LayoutGrid>{cards}</LayoutGrid>
//     <LayoutGrid>{moreCards}</LayoutGrid>
//   </LayoutSwitcher>
//
// Через React-контекст одна и та же колоночность применяется ко всем
// LayoutGrid внутри. Состояние читается из localStorage по storageKey.
// На мобиле всегда одна колонка (md: брейкпойнт включает 2-колоночный
// режим только когда выбран). Toggle на мобилке скрыт.

type Cols = 1 | 2;

const Ctx = React.createContext<Cols>(1);

export function LayoutSwitcher({
  children,
  storageKey,
  header,
  className,
}: {
  children: React.ReactNode;
  storageKey: string;
  /** контент слева от тогглов в верхней строке — обычно subsection-h2 или yzy-label */
  header?: React.ReactNode;
  className?: string;
}) {
  const [cols, setCols] = React.useState<Cols>(1);

  React.useEffect(() => {
    try {
      const v = localStorage.getItem(storageKey);
      if (v === "2") setCols(2);
    } catch {
      /* noop */
    }
  }, [storageKey]);

  const apply = (next: Cols) => {
    setCols(next);
    try {
      localStorage.setItem(storageKey, String(next));
    } catch {
      /* noop */
    }
  };

  return (
    <Ctx.Provider value={cols}>
      <div className={cn("flex items-end justify-between gap-3", className)}>
        <div className="min-w-0">{header}</div>
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => apply(1)}
            aria-label="Одна колонка"
            aria-pressed={cols === 1}
            className={cn(
              "h-5 w-5 border border-foreground transition-colors",
              cols === 1 ? "bg-foreground" : "bg-transparent hover:bg-muted",
            )}
          />
          <button
            type="button"
            onClick={() => apply(2)}
            aria-label="Две колонки"
            aria-pressed={cols === 2}
            className="flex items-center gap-1 group"
          >
            <span
              className={cn(
                "h-5 w-5 border border-foreground transition-colors",
                cols === 2
                  ? "bg-foreground"
                  : "bg-transparent group-hover:bg-muted",
              )}
            />
            <span
              className={cn(
                "h-5 w-5 border border-foreground transition-colors",
                cols === 2
                  ? "bg-foreground"
                  : "bg-transparent group-hover:bg-muted",
              )}
            />
          </button>
        </div>
      </div>
      {children}
    </Ctx.Provider>
  );
}

export function LayoutGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const cols = React.useContext(Ctx);
  return (
    <div
      className={cn(
        "grid gap-3",
        cols === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1",
        className,
      )}
    >
      {children}
    </div>
  );
}
