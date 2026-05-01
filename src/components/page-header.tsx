import * as React from "react";

// Унифицированная шапка страниц. Структура (mirror /trainer):
//   1) ряд с topLeft (SEASON / back-link / track-label) и topRight (reset/null)
//   2) большой H1 в caps
//   3) описание в caps yzy-label мульти-строкой (whitespace-pre-wrap для пробельных
//      разделителей вместо точек)
type Props = {
  topLeft?: React.ReactNode;
  topRight?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
};

export function PageHeader({ topLeft, topRight, title, description }: Props) {
  return (
    <header>
      <div className="flex items-baseline justify-between gap-4">
        <div className="min-w-0">{topLeft}</div>
        <div className="shrink-0">{topRight}</div>
      </div>
      <h1 className="mt-3 text-3xl sm:text-5xl font-medium leading-[1.05] tracking-tight uppercase">
        {title}
      </h1>
      {description ? (
        <div className="mt-4 yzy-label text-foreground space-y-1 leading-relaxed whitespace-pre-wrap">
          {description}
        </div>
      ) : null}
    </header>
  );
}
