"use client";

import { useEffect, useState } from "react";

// Корневой Loading UI — рендерится мгновенно при переходах между
// страницами, пока серверный компонент ещё отрабатывает Postgres-запросы.
// Без этого файла Next.js на force-dynamic роутах ждёт полного ответа
// сервера прежде чем переключить экран — отсюда заметная пауза при кликах
// в навигации.
//
// Анимация — TICKER NUMS: тиркающий счётчик «XX / 100» в типографике H1.
// Цифры выдаёт setInterval с шагом 140мс — быстрый «слот-машинный» флик,
// в момент клика сразу видно, что сайт реагирует.
//
// Шапка-плейсхолдер дублирует структуру SiteHeader (статичные бары вместо
// букв), чтобы при подмене loading на реальную страницу шапка не «прыгала».
export default function RootLoading() {
  const [n, setN] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setN((prev) => {
        const next = prev + Math.random() * 7 + 1;
        return next >= 99 ? 0 : next;
      });
    }, 140);
    return () => clearInterval(id);
  }, []);

  // padStart до 2-х знаков — табулярные нумералы стоят на месте, цифра
  // прыгает в фиксированном «окне» 2ch, без сдвига соседнего «/».
  const display = String(Math.floor(n)).padStart(2, "0");

  return (
    <div className="min-h-dvh">
      <div className="sticky top-0 z-30 bg-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-8 py-3 sm:py-4 grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-6">
          <div className="h-3 w-20 bg-muted" />
          <div className="hidden sm:flex items-center justify-center gap-x-5">
            <div className="h-3 w-10 bg-muted" />
            <div className="h-3 w-10 bg-muted" />
            <div className="h-3 w-12 bg-muted" />
            <div className="h-3 w-14 bg-muted" />
            <div className="h-3 w-10 bg-muted" />
            <div className="h-3 w-8 bg-muted" />
          </div>
          <div className="sm:hidden h-3 w-20 bg-muted justify-self-center" />
          <div className="h-3 w-12 bg-muted justify-self-end" />
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 sm:px-8 py-8 sm:py-12">
        <p className="yzy-label text-muted-foreground">LOADING</p>
        <div
          className="mt-3 flex items-baseline gap-3 sm:gap-4 text-3xl sm:text-5xl font-medium tabular-nums leading-none uppercase tracking-tight"
          aria-live="polite"
          aria-label="Загрузка"
        >
          <span className="min-w-[2ch] text-right">{display}</span>
          <span className="text-muted-foreground">/</span>
          <span>100</span>
        </div>
      </main>
    </div>
  );
}
