"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// В дизайне всего два визуальных стиля кнопок:
//   accent  — сплошная чёрная, белый текст; hover не меняет цвета (только cursor)
//   regular — белая с тонкой 1px рамкой, чёрный текст; hover = светло-серый фон
// Все доступные variant-имена мапятся в один из этих двух стилей, чтобы
// существующий код не пришлось переписывать.

type Variant = "default" | "secondary" | "ghost" | "destructive" | "outline";
type Size = "default" | "sm" | "lg" | "icon";

const accent =
  "bg-foreground text-background border border-foreground cursor-pointer";

const regular =
  "bg-background text-foreground border border-foreground cursor-pointer hover:bg-muted";

const variants: Record<Variant, string> = {
  default: accent,
  destructive: accent,
  outline: regular,
  secondary: regular,
  // ghost — без рамки, для мест где вид «как ссылка»
  ghost:
    "bg-transparent text-foreground border border-transparent cursor-pointer hover:bg-muted",
};

const base =
  "inline-flex items-center justify-center gap-2 font-medium uppercase " +
  "tracking-[0.18em] transition-colors duration-150 " +
  "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none " +
  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0";

const sizes: Record<Size, string> = {
  default: "h-10 px-5 text-[10px]",
  sm: "h-8 px-4 text-[10px]",
  lg: "h-12 px-7 text-[11px]",
  icon: "h-10 w-10 px-0",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
