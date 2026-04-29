import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-10 w-full border border-foreground bg-transparent px-3 py-2",
        "text-sm text-foreground placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";
