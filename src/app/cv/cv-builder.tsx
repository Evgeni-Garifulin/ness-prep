"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { CVForm } from "@/components/cv/cv-form";
import { CVPreview } from "@/components/cv/cv-preview";
import {
  CVData,
  CVTemplate,
  DEFAULT_CV,
  STORAGE_KEY,
} from "@/components/cv/cv-data";

type SaveStatus = "IDLE" | "SAVING…" | "SAVED";

type Stats = {
  chars: number;
  filled: number;
  total: number;
  pct: number;
};

const TOTAL_BLOCKS = 7;

function computeStats(data: CVData): Stats {
  const totalChars =
    (data.name +
      data.role +
      data.location +
      data.email +
      data.phone +
      data.link +
      data.summary).length +
    [...data.experience, ...data.education].reduce(
      (a, e) => a + (e.role + e.org + e.desc + e.from + e.to).length,
      0,
    );
  const filled = [
    !!data.name,
    !!data.role,
    !!data.email,
    !!data.summary,
    data.experience.length > 0,
    data.education.length > 0,
    data.skills.length > 0,
  ].filter(Boolean).length;
  return {
    chars: totalChars,
    filled,
    total: TOTAL_BLOCKS,
    pct: Math.round((filled / TOTAL_BLOCKS) * 100),
  };
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10).replace(/-/g, ".");
}

// useLayoutEffect не работает в SSR — биндим к useEffect, чтобы Next.js
// не варнил при гидратации.
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function CVBuilder() {
  const [data, setData] = useState<CVData>(DEFAULT_CV);
  const [tab, setTab] = useState<CVTemplate>("manuscript");
  const [savedAt, setSavedAt] = useState<SaveStatus>("IDLE");
  const [hydrated, setHydrated] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const paperRef = useRef<HTMLDivElement>(null);

  // Поднимаем сохранённое состояние из localStorage один раз на клиенте.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<CVData>;
        // Аккуратно сливаем с дефолтом, чтобы не словить undefined-поля при
        // эволюции схемы.
        setData({ ...DEFAULT_CV, ...parsed } as CVData);
      }
    } catch {
      // Битые данные просто игнорим.
    }
    setHydrated(true);
  }, []);

  // Дебаунс-сохранение: SAVING… → SAVED → IDLE.
  const writeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!hydrated) return;
    setSavedAt("SAVING…");
    if (writeTimer.current) clearTimeout(writeTimer.current);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    writeTimer.current = setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        // localStorage может быть отключён в private-режиме — без шума.
      }
      setSavedAt("SAVED");
      idleTimer.current = setTimeout(() => setSavedAt("IDLE"), 1180);
    }, 320);
    return () => {
      if (writeTimer.current) clearTimeout(writeTimer.current);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [data, hydrated]);

  const stats = useMemo(() => computeStats(data), [data]);

  // Считаем количество A4-страниц превью: paper.scrollHeight ÷ (width × 1.414).
  // ResizeObserver на самом листе и его содержимом ловит как изменения
  // размера контейнера, так и наполнения формы (новые записи, длинный summary).
  useIsoLayoutEffect(() => {
    const paper = paperRef.current;
    if (!paper) return;
    const inner = paper.querySelector<HTMLDivElement>(".cv-paper-inner");
    const measure = () => {
      const w = paper.clientWidth;
      if (!w) return;
      const pageH = w * 1.414;
      const contentH = paper.scrollHeight;
      const next = Math.max(1, Math.ceil(contentH / pageH));
      setPageCount((prev) => (prev === next ? prev : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(paper);
    if (inner) ro.observe(inner);
    return () => ro.disconnect();
  }, [data, tab]);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cv.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Имя итогового PDF в Chrome берётся из document.title. Подменяем перед
  // печатью на "CV / ИМЯ ФАМИЛИЯ" (капс), после события afterprint
  // восстанавливаем оригинальный title.
  const printPDF = () => {
    const original = document.title;
    const safeName = (data.name || "").trim().toUpperCase();
    document.title = safeName ? `CV / ${safeName}` : "CV";
    const restore = () => {
      document.title = original;
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);
    window.print();
  };

  const reset = () => {
    if (window.confirm("Сбросить все поля? Это нельзя отменить.")) {
      setData(DEFAULT_CV);
    }
  };

  const today = todayStamp();
  const TABS: ReadonlyArray<[CVTemplate, string]> = [
    ["manuscript", "MANUSCRIPT"],
    ["twocol", "TWO-COL"],
    ["spec", "SPEC"],
  ];

  return (
    <div className="cv-shell">
      {/* TOP ROW */}
      <div className="cv-top-row">
        <span className="yzy-meta cv-eyebrow">
          SEASON — Q2 / 2026{" "}
          <span className="yzy-num">· REV {today}</span>
        </span>
        <span className="yzy-meta yzy-num cv-eyebrow">
          COMPLETION{" "}
          <b className="cv-eyebrow-strong">{stats.pct}%</b>
          {"   ·   "}
          CHARS{" "}
          <b className="cv-eyebrow-strong">
            {String(stats.chars).padStart(4, "0")}
          </b>
        </span>
      </div>

      {/* H1 */}
      <h1 className="cv-title">CV / BUILDER</h1>

      {/* META lines */}
      <div className="cv-meta-lines">
        <div className="row">
          <span>FILL THE FIELDS LEFT</span>
          <span>WATCH IT TYPESET LIVE</span>
          <span>EXPORT WHEN DONE</span>
        </div>
        <div className="row muted">
          <span>NO COVER LETTER</span>
          <span>NO COLOR</span>
          <span>NO PHOTO</span>
        </div>
      </div>

      {/* WORK SPLIT */}
      <div className="cv-work">
        {/* FORM */}
        <div className="cv-col-form">
          <div className="cv-col-label">
            <span>FILL</span>
          </div>
          <CVForm data={data} setData={setData} />
        </div>

        {/* PREVIEW */}
        <div className="cv-col-preview">
          <div className="cv-col-label">
            <span>PREVIEW</span>
            <span className="cv-preview-tabs">
              {TABS.map(([k, l]) => (
                <button
                  key={k}
                  type="button"
                  className={tab === k ? "active" : ""}
                  onClick={() => setTab(k)}
                >
                  {l}
                </button>
              ))}
            </span>
          </div>
          <CVPreview data={data} template={tab} paperRef={paperRef} />
          <div className="cv-paper-foot">
            <span className="yzy-meta">A4 · 210 × 297</span>
            <span className="yzy-meta yzy-num">
              PG 01 / {String(pageCount).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>

      {/* CENTER ACTIONS */}
      <div className="cv-center-action">
        <div className="cv-top-actions">
          <span
            className={
              "cv-save-status" + (savedAt === "SAVED" ? " saved" : "")
            }
          >
            {savedAt}
          </span>
          <button type="button" className="cv-link-btn" onClick={exportJSON}>
            EXPORT JSON
          </button>
          <button
            type="button"
            className="cv-link-btn solid"
            onClick={printPDF}
          >
            EXPORT PDF →
          </button>
        </div>
        <button type="button" className="cv-clear" onClick={reset}>
          RESET ALL
        </button>
      </div>
    </div>
  );
}
