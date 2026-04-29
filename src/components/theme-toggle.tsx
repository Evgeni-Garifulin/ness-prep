"use client";

import { useEffect, useState } from "react";
import "./theme-toggle.css";

// Sun/moon switcher Daniel April (CodePen mdzRdLy), HTML+CSS портированы один к
// одному. Мы только обернули его в .theme-toggle-wrap и масштабируем через
// CSS-переменную --scale, чтобы свитчер влезал в шапку и адаптировался под
// мобилку. Логика темы: класс `dark` на <html>, persist в localStorage,
// initial state выставляется inline-скриптом в <head> чтобы не было flash.

export function ThemeToggle() {
  const [dark, setDark] = useState(true);

  // На клиенте после mount синхронизируем состояние свитча с тем, что
  // фактически стоит на <html> (туда уже прописал класс наш inline-скрипт).
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // Safari в private mode иногда кидает QuotaExceeded — без сохранения,
      // но переключение в текущей вкладке всё равно отработает.
    }
  };

  return (
    <div className="theme-toggle-wrap" suppressHydrationWarning>
      <input
        type="checkbox"
        id="theme-switcher"
        checked={dark}
        onChange={toggle}
        aria-label={dark ? "Переключить на светлую тему" : "Переключить на тёмную тему"}
        suppressHydrationWarning
      />
      <label htmlFor="theme-switcher">
        <div className="celestial">
          <div className="celestial-inner">
            <div className="sun" />
            <div className="moon" />
          </div>
        </div>
        <div className="clouds">
          <svg
            viewBox="0 0 350 200"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMax meet"
          >
            <ellipse cx="111" cy="144" rx="32" ry="29" />
            <ellipse cx="152" cy="157" rx="32" ry="28" />
            <ellipse cx="204" cy="148" rx="38" ry="34" />
            <ellipse cx="262" cy="134" rx="35" ry="35" />
            <ellipse cx="230" cy="131" rx="30" ry="29" />
            <ellipse cx="90" cy="163" rx="58" ry="28" />
            <ellipse cx="316" cy="120" rx="44" ry="41" />
          </svg>
        </div>
        <div className="stars" />
      </label>
    </div>
  );
}
