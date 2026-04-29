"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// Шапка в духе yeezy.com: лого слева, навигация в центре wrap'ится естественно
// (все пункты всегда видны, никакого бургера), user + logout справа.
// На узкой мобилке nav сам перенесётся на 2–3 строки.

const NAV = [
  { href: "/", label: "INDEX", exact: true as const },
  { href: "/tech", label: "TECH" },
  { href: "/social", label: "SOCIAL" },
  { href: "/notes", label: "NOTES" },
];

export function SiteHeader({ username }: { username: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  const onLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-foreground bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-8 py-3 sm:py-4 grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-6">
        <Link
          href="/"
          className="yzy-label text-foreground hover:text-muted-foreground transition-colors"
        >
          NESS / PREP
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5">
          {NAV.map((item) => {
            const active = isActive(
              item.href,
              "exact" in item && item.exact === true,
            );
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "yzy-label transition-colors whitespace-nowrap",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 sm:gap-5 justify-self-end">
          <span className="hidden md:inline yzy-meta text-muted-foreground">
            {username}
          </span>
          <button
            onClick={onLogout}
            className="yzy-label text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
          >
            LOGOUT
          </button>
        </div>
      </div>
    </header>
  );
}
