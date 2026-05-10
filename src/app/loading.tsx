// Корневой Loading UI — рендерится мгновенно при переходах между
// страницами, пока серверный компонент ещё отрабатывает Postgres-запросы.
// Без этого файла Next.js на force-dynamic роутах ждёт полного ответа
// сервера прежде чем переключить экран — отсюда заметная пауза при кликах
// в навигации.
//
// Скелет повторяет общую структуру страницы: «шапка» сайта, отступы,
// большой H1-плейсхолдер. Анимация — animate-pulse на муту-цвета.

export default function RootLoading() {
  return (
    <div className="min-h-dvh">
      <div className="sticky top-0 z-30 bg-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-8 py-3 sm:py-4 grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-6">
          <div className="h-3 w-20 bg-muted animate-pulse" />
          <div className="flex items-center justify-center gap-x-5">
            <div className="h-3 w-10 bg-muted animate-pulse" />
            <div className="h-3 w-10 bg-muted animate-pulse" />
            <div className="h-3 w-10 bg-muted animate-pulse" />
            <div className="h-3 w-10 bg-muted animate-pulse" />
            <div className="h-3 w-10 bg-muted animate-pulse" />
          </div>
          <div className="h-3 w-12 bg-muted animate-pulse justify-self-end" />
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 sm:px-8 py-8 sm:py-12">
        <div className="flex items-baseline justify-between gap-4">
          <div className="h-3 w-24 bg-muted animate-pulse" />
          <div className="h-3 w-24 bg-muted animate-pulse" />
        </div>
        <div className="mt-3 grid grid-cols-12 gap-4 sm:gap-6 items-end">
          <div className="col-span-12 md:col-span-8">
            <div className="h-10 sm:h-14 w-2/3 bg-muted animate-pulse" />
            <div className="mt-3 h-10 sm:h-14 w-1/2 bg-muted animate-pulse" />
          </div>
          <div className="col-span-12 md:col-span-4">
            <div className="h-9 w-20 bg-muted animate-pulse md:ml-auto" />
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-0 border border-foreground/20">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-6 sm:p-8 border-b border-foreground/20 sm:[&:nth-child(odd)]:border-r"
            >
              <div className="h-7 w-32 bg-muted animate-pulse" />
              <div className="mt-3 h-3 w-2/3 bg-muted animate-pulse" />
              <div className="mt-10 h-3 w-full bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
