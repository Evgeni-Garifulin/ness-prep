import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

// Login renders client-side (нужно из-за useSearchParams внутри LoginForm),
// но Next.js 14 на статическом prerender требует Suspense-обёртку — иначе
// билд валится с "useSearchParams() should be wrapped in a suspense boundary".
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SIGN IN",
  description: "MEMBERS ONLY    NO PUBLIC ACCESS",
};

export default function LoginPage() {
  return (
    <main className="min-h-dvh grid place-items-center px-4">
      <Suspense fallback={<div className="text-sm text-muted-foreground">Загрузка…</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
