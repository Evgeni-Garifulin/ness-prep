"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "secondary" | "ghost" | "destructive" | "outline";
type Size = "default" | "sm" | "lg" | "icon";

// Yeezy-кнопка: квадратные углы, тонкая 1px граница, uppercase tracking,
// hover = инверсия (фон и текст меняются местами), без теней.

const base =
  "inline-flex items-center justify-center gap-2 border font-medium uppercase " +
  "tracking-[0.18em] transition-colors duration-150 " +
  "disabled:opacity-40 disabled:pointer-events-none " +
  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0";

const variants: Record<Variant, string> = {
  default:
    "bg-foreground text-background border-foreground hover:bg-background hover:text-foreground",
  secondary:
    "bg-transparent text-foreground border-foreground hover:bg-foreground hover:text-background",
  outline:
    "bg-transparent text-foreground border-foreground hover:bg-foreground hover:text-background",
  ghost:
    "border-transparent bg-transparent text-foreground hover:bg-foreground hover:text-background",
  destructive:
    "bg-foreground text-background border-foreground hover:bg-background hover:text-foreground",
};

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
