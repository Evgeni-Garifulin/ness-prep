import * as React from "react";

// Унифицированная шапка страниц.
//
// Базовая структура (mirror /trainer):
//   1) ряд topLeft (SEASON / back-link) + topRight (reset)
//   2) большой H1 в caps
//   3) описание в caps yzy-label, мульти-строкой через пробельные разделители
//
// Опциональный слот `progress` рисует справа от H1 блок с большим %, лейблом
// "PROGRESS" и счётчиком (как было на старой главной). На мобиле прогресс
// уезжает под title, на md+ становится правой колонкой 12-сетки.
type Progress = {
  percent: number;
  current: number;
  total: number;
  /** дополнительная подпись после счётчика, например "26 SECTIONS" */
  meta?: React.ReactNode;
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
            <div className="flex items-baseline gap-3 md:justify-end flex-wrap">
              <span className="yzy-label text-muted-foreground">PROGRESS</span>
              <span className="yzy-meta text-muted-foreground tabular-nums">
                {progress.current} / {progress.total}
                {progress.meta ? <> · {progress.meta}</> : null}
              </span>
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
