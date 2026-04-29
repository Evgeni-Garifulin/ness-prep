import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// IBM Plex Mono подгружаем через next/font: zero-CLS, self-hosted, добавляет
// CSS-переменную --font-plex-mono, которую глобальный CSS использует в font-family.
const plexMono = IBM_Plex_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ness-prep — interview prep",
  description: "Личный тренажёр для подготовки к собеседованию",
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

// Inline-скрипт стартует ДО hydration и сразу выставляет нужный класс на
// <html>. Иначе пользователь видит вспышку противоположной темы.
//   localStorage > prefers-color-scheme > дефолт `dark`.
const noFlashScript = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var dark = stored ? stored === 'dark' : (stored === null ? true : prefersDark);
    document.documentElement.classList[dark ? 'add' : 'remove']('dark');
  } catch (e) {}
})();
`.trim();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={plexMono.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
      </head>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
