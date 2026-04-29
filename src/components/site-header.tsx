"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "INDEX", exact: true as const },
  { href: "/tech", label: "TECH" },
  { href: "/social", label: "SOCIAL" },
  { href: "/trainer", label: "TRAINER" },
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
    <header className="sticky top-0 z-30 bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-8 py-3 sm:py-4 grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-6">
        <span className="yzy-meta text-foreground whitespace-nowrap">
          {username}
        </span>

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

        <button
          onClick={onLogout}
          className="yzy-label text-foreground hover:text-muted-foreground transition-colors whitespace-nowrap justify-self-end"
        >
          LOGOUT
        </button>
      </div>
    </header>
  );
}
