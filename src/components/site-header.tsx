"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Index", exact: true as const },
  { href: "/tech", label: "Tech" },
  { href: "/social", label: "Social" },
  { href: "/notes", label: "Notes" },
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
    <header className="sticky top-0 z-30 border-b border-foreground bg-background">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 sm:px-8 h-12 sm:h-14">
        <Link
          href="/"
          className="yzy-label text-foreground hover:opacity-60 transition-opacity"
        >
          NESS / PREP
        </Link>
        <nav className="hidden sm:flex items-center gap-6 ml-6">
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
                  "yzy-label transition-opacity hover:opacity-60",
                  active
                    ? "text-foreground underline underline-offset-[6px] decoration-1"
                    : "text-foreground/70",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-3 sm:gap-5">
          <ThemeToggle />
          <span className="hidden md:inline yzy-meta text-muted-foreground">
            {username}
          </span>
          <button
            onClick={onLogout}
            className="hidden sm:inline yzy-label text-foreground hover:opacity-60 transition-opacity"
          >
            Logout
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Меню"
            className="sm:hidden h-10 w-10 inline-flex items-center justify-center border border-foreground hover:bg-foreground hover:text-background transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d={open ? "M6 6l12 12M6 18L18 6" : "M4 7h16M4 12h16M4 17h16"}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="square"
              />
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <div className="sm:hidden border-t border-foreground bg-background">
          <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col">
            {NAV.map((item) => {
              const active =
                "exact" in item && item.exact
                  ? pathname === item.href
                  : pathname === item.href ||
                    pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "yzy-label py-3 border-b border-foreground/20 hover:opacity-60 transition-opacity",
                    active ? "text-foreground" : "text-foreground/70",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-4 flex items-center justify-between">
              <span className="yzy-meta text-muted-foreground">{username}</span>
              <button
                onClick={onLogout}
                className="yzy-label text-foreground hover:opacity-60 transition-opacity"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
