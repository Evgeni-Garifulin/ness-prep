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
        setError(body.error ?? "Sign-in failed");
        return;
      }
      const next = search.get("from") || "/";
      router.replace(next);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-sm border border-foreground bg-background p-6 sm:p-8"
    >
      <p className="yzy-label text-muted-foreground">NESS / PREP</p>
      <h1 className="mt-3 text-2xl sm:text-3xl font-medium uppercase tracking-tight leading-[1.05]">
        Sign in
      </h1>
      <p className="mt-2 yzy-meta text-muted-foreground">
        Members only · Interview prep
      </p>

      <div className="mt-8 space-y-5">
        <div>
          <label className="yzy-label opacity-60 mb-2 block">Username</label>
          <Input
            value={username}
            onChange={(e) => setU(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div>
          <label className="yzy-label opacity-60 mb-2 block">Password</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setP(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 yzy-label text-foreground border border-foreground p-3">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading} className="mt-8 w-full" size="lg">
        {loading ? "Signing in…" : "Enter →"}
      </Button>
    </form>
  );
}
