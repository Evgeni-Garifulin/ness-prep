import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { CVBuilder } from "./cv-builder";
import "./cv.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CV",
  description:
    "FILL THE FIELDS LEFT    WATCH IT TYPESET LIVE    EXPORT WHEN DONE",
};

export default function CVPage() {
  const username = getCurrentUser();
  if (!username) redirect("/login");

  return (
    <>
      <SiteHeader username={username} />
      <main className="cv-canvas">
        <CVBuilder />
      </main>
    </>
  );
}
