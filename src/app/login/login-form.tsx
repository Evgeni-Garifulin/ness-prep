"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Не получилось войти");
        return;
      }
      const next = search.get("from") || "/";
      router.replace(next);
    } catch {
      setError("Сетевая ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-sm rounded-lg border border-border bg-card p-5 sm:p-6 shadow-sm"
    >
      <h1 className="text-lg sm:text-xl font-bold tracking-tight">ness·prep</h1>
      <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
        Вход для подготовки к собесу.
      </p>

      <label className="mt-5 block text-xs font-medium text-muted-foreground">
        Логин
      </label>
      <Input
        value={username}
        onChange={(e) => setU(e.target.value)}
        autoComplete="username"
        required
        className="mt-1"
      />

      <label className="mt-3 block text-xs font-medium text-muted-foreground">
        Пароль
      </label>
      <Input
        type="password"
        value={password}
        onChange={(e) => setP(e.target.value)}
        autoComplete="current-password"
        required
        className="mt-1"
      />

      {error && <p className="mt-3 text-xs text-destructive">{error}</p>}

      <Button type="submit" disabled={loading} className="mt-5 w-full">
        {loading ? "Вхожу…" : "Войти"}
      </Button>
    </form>
  );
}
