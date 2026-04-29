"use client";

// Кнопка RESET в шапке /trainer. Чтобы не тянуть state-менеджер ради одного
// триггера, диспатчит на window кастомное событие. TrainerSession его слушает
// и сбрасывает свой phase в "idle".
export function ResetTestButton() {
  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(new CustomEvent("trainer:reset"));
      }}
      className="yzy-label text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
    >
      RESET
    </button>
  );
}
