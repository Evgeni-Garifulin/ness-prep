import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[80px] w-full border border-foreground bg-transparent px-3 py-2",
      "text-sm text-foreground placeholder:text-muted-foreground",
      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground",
      "disabled:cursor-not-allowed disabled:opacity-40",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
