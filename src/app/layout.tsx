import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const plexMono = IBM_Plex_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plex-mono",
  display: "swap",
});

// Title template применяется ко всем страницам: индивидуальный title в page.tsx
// автоматически оборачивается в " / NESS PREP".
export const metadata: Metadata = {
  title: {
    default: "NESS PREP",
    template: "%s / NESS PREP",
  },
  description:
    "FRONTEND INTERVIEW DRILL    RECALL OVER MEMORY    KNOW IT OR FACE IT",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={plexMono.variable}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
