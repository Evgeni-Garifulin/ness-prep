"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Обзор", exact: true as const },
  { href: "/tech", label: "Техника" },
  { href: "/social", label: "Социалка" },
  { href: "/notes", label: "Заметки" },
];

export function SiteHeader({ username }: { username: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const onLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-3 sm:px-6 py-2.5">
        <Link href="/" className="text-sm sm:text-base font-bold tracking-tight">
          ness<span className="text-emerald-400">·</span>prep
        </Link>
        <nav className="hidden sm:flex items-center gap-1 ml-2">
          {NAV.map((item) => {
            const active =
              "exact" in item && item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm hover:bg-accent",
                  active && "bg-accent text-accent-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden md:inline text-xs text-muted-foreground">
            {username}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={onLogout}
            className="hidden sm:inline-flex"
          >
            Выйти
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setOpen((v) => !v)}
            aria-label="Меню"
            className="sm:hidden"
          >
            <span className="i-block">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </Button>
        </div>
      </div>
      {open && (
        <div className="sm:hidden border-t border-border bg-background">
          <div className="mx-auto max-w-5xl px-3 py-2 flex flex-col gap-1">
            {NAV.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm hover:bg-accent",
                    active && "bg-accent text-accent-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-1 flex items-center justify-between rounded-md px-3 py-2">
              <span className="text-xs text-muted-foreground">{username}</span>
              <Button size="sm" variant="outline" onClick={onLogout}>
                Выйти
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
