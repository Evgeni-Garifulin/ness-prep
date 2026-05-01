import * as React from "react";

// Унифицированная шапка страниц.
//
// Базовая структура (mirror /trainer):
//   1) ряд topLeft (SEASON / back-link) + topRight (reset)
//   2) большой H1 в caps
//   3) описание в caps yzy-label, мульти-строкой через пробельные разделители
//
// Опциональный слот `progress` рисует справа от H1 минималистичный блок:
// лейбл `PROGRESS` + крупный процент. Без счётчиков и доп.инфы — пользователь
// явно попросил оставить только процент.
type Progress = {
  percent: number;
};

type Props = {
  topLeft?: React.ReactNode;
  topRight?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  progress?: Progress;
};

export function PageHeader({
  topLeft,
  topRight,
  title,
  description,
  progress,
}: Props) {
  return (
    <header>
      <div className="flex items-baseline justify-between gap-4">
        <div className="min-w-0">{topLeft}</div>
        <div className="shrink-0">{topRight}</div>
      </div>

      {progress ? (
        <div className="mt-3 grid grid-cols-12 gap-4 sm:gap-6 items-end">
          <h1 className="col-span-12 md:col-span-8 text-3xl sm:text-5xl font-medium leading-[1.05] tracking-tight uppercase">
            {title}
          </h1>
          <div className="col-span-12 md:col-span-4">
            <div className="flex items-baseline md:justify-end">
              <span className="text-3xl sm:text-4xl font-medium tabular-nums leading-none">
                {progress.percent}%
              </span>
            </div>
          </div>
        </div>
      ) : (
        <h1 className="mt-3 text-3xl sm:text-5xl font-medium leading-[1.05] tracking-tight uppercase">
          {title}
        </h1>
      )}

      {description ? (
        <div className="mt-4 yzy-label text-foreground space-y-1 leading-relaxed whitespace-pre-wrap">
          {description}
        </div>
      ) : null}
    </header>
  );
}
