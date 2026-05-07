"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type PoolQuestion = {
  id: string;
  number: number;
  text: string;
  hintEasy: string;
  hintFull: string;
  answer: string;
  sectionSlug: string;
  sectionTitle: string;
  sectionOrder: number;
  subsection: string | null;
};

type Question = {
  id: string;
  number: number;
  text: string;
  hintEasy: string;
  hintFull: string;
  answer: string;
  section: string;
  sectionSlug: string;
};

type Stat = {
  questionId: string;
  text: string;
  section: string;
  sectionSlug: string;
  knownCount: number;
  unknownCount: number;
};

type Phase = "idle" | "running" | "done";

// Селектор: либо вся секция (subsection === null), либо конкретная подсекция.
// Храним как строковый ключ "<slug>" или "<slug>::<subsection>" — это удобно
// для Set'а в state и сравнений.
const ALL_KEY = "__all__";
const sectionKey = (slug: string) => slug;
const subKey = (slug: string, sub: string) => `${slug}::${sub}`;

export function TrainerSession({
  pool,
  initialStats,
  sessionSize,
}: {
  pool: PoolQuestion[];
  initialStats: Stat[];
  sessionSize: number;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [index, setIndex] = useState(0);
  const [round, setRound] = useState({ known: 0, unknown: 0 });
  const [stats, setStats] = useState<Map<string, Stat>>(() => {
    const m = new Map<string, Stat>();
    for (const s of initialStats) m.set(s.questionId, s);
    return m;
  });
  const [showEasy, setShowEasy] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [busy, setBusy] = useState(false);

  // Дерево тем: section -> [subsections]. Если у секции нет подсекций — она
  // выбирается одна целиком. Если есть — отображаем вложенный список и
  // считаем секцию выбранной только когда выбраны все её подсекции.
  const topicTree = useMemo(() => buildTopicTree(pool), [pool]);

  // По умолчанию — выбраны все темы (ALL).
  const [selected, setSelected] = useState<Set<string>>(() => allLeafKeys(topicTree));

  // Текущая сессия из 25 (или меньше) вопросов, выбранных по фильтру.
  const [questions, setQuestions] = useState<Question[]>([]);
  const total = questions.length;

  const onMark = async (result: "known" | "unknown") => {
    if (busy || phase !== "running") return;
    if (index >= total) return;
    setBusy(true);

    const q = questions[index];

    // Optimistic — обновляем глобальный счётчик и статистику раунда сразу.
    const prev = stats.get(q.id) ?? {
      questionId: q.id,
      text: q.text,
      section: q.section,
      sectionSlug: q.sectionSlug,
      knownCount: 0,
      unknownCount: 0,
    };
    const optimistic: Stat = {
      ...prev,
      knownCount: prev.knownCount + (result === "known" ? 1 : 0),
      unknownCount: prev.unknownCount + (result === "unknown" ? 1 : 0),
    };
    const nextStats = new Map(stats);
    nextStats.set(q.id, optimistic);
    setStats(nextStats);
    setRound((r) => ({
      known: r.known + (result === "known" ? 1 : 0),
      unknown: r.unknown + (result === "unknown" ? 1 : 0),
    }));

    try {
      await fetch("/api/trainer/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: q.id, result }),
      });
    } catch {
      /* при ошибке оставляем оптимистичное обновление; в логике это не критично */
    } finally {
      setBusy(false);
      // Переход дальше: либо следующая карта, либо done.
      if (index === total - 1) {
        setPhase("done");
      } else {
        setIndex(index + 1);
        setShowEasy(false);
        setShowFull(false);
        setShowAnswer(false);
      }
    }
  };

  const filteredPool = useMemo(
    () => filterPool(pool, selected),
    [pool, selected],
  );

  const onStart = () => {
    if (filteredPool.length === 0) return;
    const shuffled = [...filteredPool].sort(() => Math.random() - 0.5);
    const session = shuffled.slice(0, sessionSize).map((q) => ({
      id: q.id,
      number: q.number,
      text: q.text,
      hintEasy: q.hintEasy,
      hintFull: q.hintFull,
      answer: q.answer,
      section: q.sectionTitle,
      sectionSlug: q.sectionSlug,
    }));
    setQuestions(session);
    setIndex(0);
    setRound({ known: 0, unknown: 0 });
    setShowEasy(false);
    setShowFull(false);
    setShowAnswer(false);
    setPhase("running");
  };

  // RESET-кнопка из шапки шлёт кастомное событие — слушаем его и откатываем
  // тренажёр на стартовый экран. Прогресс раунда сбрасывается, accumulated
  // stats остаются (их можно снести только CLEAR ALL STATS внизу страницы).
  useEffect(() => {
    const handler = () => {
      setPhase("idle");
      setIndex(0);
      setRound({ known: 0, unknown: 0 });
      setShowEasy(false);
      setShowFull(false);
      setShowAnswer(false);
    };
    window.addEventListener("trainer:reset", handler);
    return () => window.removeEventListener("trainer:reset", handler);
  }, []);

  const onClearAll = async () => {
    if (!confirm("Снести всю статистику тренажёра? Это нельзя откатить.")) return;
    try {
      const res = await fetch("/api/trainer/clear", { method: "DELETE" });
      if (res.ok) {
        setStats(new Map());
        setRound({ known: 0, unknown: 0 });
        setPhase("idle");
        setIndex(0);
      }
    } catch {
      /* silent — пользователь увидит, что не очистилось */
    }
  };

  // Сводка для нижнего списка — группируем по теме (section), считаем сколько
  // уникальных вопросов из этой темы попало в +/− список. Если вопрос отмечен
  // и так и этак — он учитывается в обоих списках, но один раз в каждом.
  const knownBySection = useMemo(
    () => groupBySection(stats, "known"),
    [stats],
  );
  const unknownBySection = useMemo(
    () => groupBySection(stats, "unknown"),
    [stats],
  );

  if (pool.length === 0) {
    return (
      <p className="mt-6 yzy-meta text-muted-foreground">
        NO QUESTIONS WITH FILLED ANSWERS YET — TRAINER NEEDS REFERENCE ANSWERS
        TO RUN.
      </p>
    );
  }

  const plannedCount = Math.min(filteredPool.length, sessionSize);

  return (
    <div className="mt-6 max-w-3xl mx-auto">
      {/* Сама сессия и нижний список ужe чем page-шапка — карточка вопроса
          в drill-режиме читается комфортнее в более узкой колонке. */}
      {/* Прогресс — только во время прохождения. Считается по числу
          отвеченных карточек в текущем раунде (round.known + round.unknown),
          а не по позиции. На стартовом первом вопросе это 0 / 25 = 0%. */}
      {phase === "running" && (() => {
        const answered = round.known + round.unknown;
        const pct = total > 0 ? Math.round((answered / total) * 100) : 0;
        return (
          <>
            <div className="flex items-end justify-between gap-4">
              <span className="yzy-meta text-muted-foreground tabular-nums">
                {String(answered).padStart(2, "0")} /{" "}
                {String(total).padStart(2, "0")}
              </span>
              <span className="text-2xl sm:text-3xl font-medium tabular-nums leading-none">
                {pct}%
              </span>
            </div>
            <div className="mt-3 h-px w-full bg-foreground/20">
              <div className="h-px bg-foreground" style={{ width: `${pct}%` }} />
            </div>
          </>
        );
      })()}

      {/* Карточка / экран начала / экран финала */}
      <div className="mt-6">
        {phase === "idle" && (
          <div className="py-12 sm:py-16 flex flex-col items-center text-center">
            <TopicPicker
              tree={topicTree}
              selected={selected}
              onChange={setSelected}
            />
            <button
              type="button"
              onClick={onStart}
              disabled={plannedCount === 0}
              aria-label="Start trainer"
              className={cn(
                "mt-12 text-6xl sm:text-7xl font-bold uppercase tracking-tight leading-none transition-colors",
                plannedCount === 0
                  ? "text-muted-foreground/40 cursor-not-allowed"
                  : "text-foreground hover:text-muted-foreground",
              )}
            >
              START
            </button>
            <p className="mt-8 yzy-label text-muted-foreground whitespace-pre-wrap">
              {plannedCount} CARDS    SELF-ASSESS EACH ONE
            </p>
          </div>
        )}

        {phase === "running" && (
          <RunningCard
            q={questions[index]}
            stat={
              stats.get(questions[index].id) ?? {
                questionId: questions[index].id,
                text: questions[index].text,
                section: questions[index].section,
                sectionSlug: questions[index].sectionSlug,
                knownCount: 0,
                unknownCount: 0,
              }
            }
            showEasy={showEasy}
            showFull={showFull}
            showAnswer={showAnswer}
            onToggleEasy={() => setShowEasy((v) => !v)}
            onToggleFull={() => setShowFull((v) => !v)}
            onToggleAnswer={() => setShowAnswer((v) => !v)}
            busy={busy}
            onPlus={() => onMark("known")}
            onMinus={() => onMark("unknown")}
          />
        )}

        {phase === "done" && (
          <div className="py-16 sm:py-24 flex flex-col items-center text-center">
            <h2 className="text-5xl sm:text-6xl font-bold uppercase tracking-tight leading-none">
              TEST FINISHED
            </h2>
            <p className="mt-8 text-2xl sm:text-3xl font-medium tabular-nums">
              +{round.known} / −{round.unknown}
            </p>
            <button
              type="button"
              onClick={onStart}
              aria-label="Start again"
              className="mt-10 yzy-label text-muted-foreground hover:text-foreground transition-colors"
            >
              START AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Нижний список — простые две колонки без бордеров. Группируем по
          теме: слева тема, справа сколько вопросов из неё в списке. */}
      <section className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
        <StatList label="KNOWN" sign="+" entries={knownBySection} kind="known" />
        <StatList label="UNKNOWN" sign="−" entries={unknownBySection} kind="unknown" />
      </section>

      {/* Кнопка очистки базы — только на странице тренера, внизу */}
      <div className="mt-12 flex items-center justify-center">
        <button
          type="button"
          onClick={onClearAll}
          className="yzy-label text-muted-foreground hover:text-foreground transition-colors"
        >
          CLEAR ALL STATS
        </button>
      </div>
    </div>
  );
}

function RunningCard({
  q,
  stat,
  showEasy,
  showFull,
  showAnswer,
  onToggleEasy,
  onToggleFull,
  onToggleAnswer,
  busy,
  onPlus,
  onMinus,
}: {
  q: Question;
  stat: Stat;
  showEasy: boolean;
  showFull: boolean;
  showAnswer: boolean;
  onToggleEasy: () => void;
  onToggleFull: () => void;
  onToggleAnswer: () => void;
  busy: boolean;
  onPlus: () => void;
  onMinus: () => void;
}) {
  return (
    <article className="border border-foreground bg-card p-4 sm:p-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-4">
          <span className="yzy-label text-muted-foreground">{q.section}</span>
          {(stat.knownCount > 0 || stat.unknownCount > 0) && (
            <span className="yzy-label tabular-nums text-muted-foreground whitespace-nowrap">
              +{stat.knownCount} / −{stat.unknownCount}
            </span>
          )}
        </div>
        <h3 className="text-sm sm:text-base leading-snug font-medium tracking-tight">
          {q.text}
        </h3>
      </header>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
        <ToggleLink active={showEasy} disabled={!q.hintEasy} onClick={onToggleEasy}>
          {showEasy ? "HIDE HINT A" : "HINT A"}
        </ToggleLink>
        <ToggleLink active={showFull} disabled={!q.hintFull} onClick={onToggleFull}>
          {showFull ? "HIDE HINT B" : "HINT B"}
        </ToggleLink>
        <ToggleLink
          active={showAnswer}
          disabled={!q.answer}
          onClick={onToggleAnswer}
        >
          {showAnswer ? "HIDE ANSWER" : "REVEAL ANSWER"}
        </ToggleLink>
      </div>

      {showEasy && q.hintEasy && <Hint label="HINT A — LIGHT">{q.hintEasy}</Hint>}
      {showFull && q.hintFull && <Hint label="HINT B — FULL">{q.hintFull}</Hint>}

      {showAnswer && q.answer && (
        <div className="mt-4">
          <div className="yzy-label text-muted-foreground mb-2">REFERENCE ANSWER</div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{q.answer}</p>
        </div>
      )}

      {/* +/− без обводок. Равные интервалы: edge-to-+, +-to-−, −-to-edge. */}
      <div className="mt-6 flex items-center justify-evenly">
        <button
          type="button"
          onClick={onPlus}
          disabled={busy}
          aria-label="Знаю ответ"
          className={cn(
            "h-12 w-12 text-3xl font-medium leading-none transition-colors",
            "text-foreground hover:text-muted-foreground",
            "disabled:opacity-40 disabled:cursor-not-allowed",
          )}
        >
          +
        </button>
        <button
          type="button"
          onClick={onMinus}
          disabled={busy}
          aria-label="Не знаю ответ"
          className={cn(
            "h-12 w-12 text-3xl font-medium leading-none transition-colors",
            "text-foreground hover:text-muted-foreground",
            "disabled:opacity-40 disabled:cursor-not-allowed",
          )}
        >
          −
        </button>
      </div>
    </article>
  );
}

function ToggleLink({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "yzy-label transition-colors",
        disabled && "opacity-30 cursor-not-allowed",
        !disabled &&
          (active
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"),
      )}
    >
      {children}
    </button>
  );
}

function Hint({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <div className="yzy-label text-muted-foreground mb-2">{label}</div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{children}</p>
    </div>
  );
}

type SectionGroup = {
  section: string;
  sectionSlug: string;
  count: number;
  questions: { questionId: string; text: string; count: number }[];
};

function groupBySection(
  stats: Map<string, Stat>,
  kind: "known" | "unknown",
): SectionGroup[] {
  const m = new Map<string, SectionGroup>();
  for (const s of stats.values()) {
    const c = kind === "known" ? s.knownCount : s.unknownCount;
    if (c <= 0) continue;
    const key = s.section || "—";
    let g = m.get(key);
    if (!g) {
      g = { section: key, sectionSlug: s.sectionSlug, count: 0, questions: [] };
      m.set(key, g);
    }
    g.count += 1;
    g.questions.push({ questionId: s.questionId, text: s.text, count: c });
  }
  for (const g of m.values()) {
    g.questions.sort((a, b) => (b.count - a.count) || a.text.localeCompare(b.text));
  }
  return Array.from(m.values()).sort(
    (a, b) => (b.count - a.count) || a.section.localeCompare(b.section),
  );
}

function StatList({
  label,
  sign,
  entries,
  kind,
}: {
  label: string;
  sign: string;
  entries: SectionGroup[];
  kind: "known" | "unknown";
}) {
  return (
    <div>
      <div className="pb-2">
        <span className="yzy-label">
          {sign} {label}
        </span>
      </div>
      {entries.length === 0 ? (
        <p className="yzy-meta text-muted-foreground">
          {kind === "known" ? "Nothing marked yet" : "All clean so far"}
        </p>
      ) : (
        <ul className="space-y-4">
          {entries.map((g) => (
            <li key={g.section}>
              <div className="flex items-baseline gap-3">
                <a
                  href={`/sections/${g.sectionSlug}`}
                  className="flex-1 min-w-0 yzy-label text-muted-foreground hover:text-foreground transition-colors"
                >
                  {g.section}
                </a>
                <span className="yzy-label tabular-nums text-muted-foreground whitespace-nowrap">
                  {g.count}
                </span>
              </div>
              <ul className="mt-2 pl-6 space-y-1">
                {g.questions.map((q) => (
                  <li key={q.questionId} className="flex items-baseline gap-3">
                    <span className="flex-1 min-w-0 text-sm leading-snug text-foreground">
                      {q.text}
                    </span>
                    <span className="yzy-label tabular-nums text-foreground whitespace-nowrap">
                      {q.count}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── TopicPicker ──────────────────────────────────────────────────────────

type TopicNode = {
  slug: string;
  title: string;
  order: number;
  // Если у секции есть подсекции — листья это подсекции; иначе листом считается
  // сама секция (выбирается по slug одним ключом).
  subs: { name: string; key: string }[];
};

function buildTopicTree(pool: PoolQuestion[]): TopicNode[] {
  const m = new Map<string, TopicNode>();
  for (const q of pool) {
    let node = m.get(q.sectionSlug);
    if (!node) {
      node = {
        slug: q.sectionSlug,
        title: q.sectionTitle,
        order: q.sectionOrder,
        subs: [],
      };
      m.set(q.sectionSlug, node);
    }
    if (q.subsection) {
      const k = subKey(q.sectionSlug, q.subsection);
      if (!node.subs.some((s) => s.key === k)) {
        node.subs.push({ name: q.subsection, key: k });
      }
    }
  }
  for (const node of m.values()) {
    node.subs.sort((a, b) => a.name.localeCompare(b.name));
  }
  return Array.from(m.values()).sort((a, b) => a.order - b.order);
}

// Все «листовые» ключи в дереве — для дефолтного полностью выбранного состояния
// и для проверок ALL.
function allLeafKeys(tree: TopicNode[]): Set<string> {
  const s = new Set<string>();
  for (const n of tree) {
    if (n.subs.length === 0) s.add(sectionKey(n.slug));
    else for (const sub of n.subs) s.add(sub.key);
  }
  return s;
}

// Лист считается выбранным, если: (а) для секции без подсекций — её sectionKey
// в Set; (б) для подсекции — её subKey в Set.
function filterPool(pool: PoolQuestion[], selected: Set<string>): PoolQuestion[] {
  return pool.filter((q) => {
    if (q.subsection) return selected.has(subKey(q.sectionSlug, q.subsection));
    return selected.has(sectionKey(q.sectionSlug));
  });
}

function isSectionFullySelected(node: TopicNode, selected: Set<string>): boolean {
  if (node.subs.length === 0) return selected.has(sectionKey(node.slug));
  return node.subs.every((s) => selected.has(s.key));
}

function isSectionPartiallySelected(
  node: TopicNode,
  selected: Set<string>,
): boolean {
  if (node.subs.length === 0) return false;
  const some = node.subs.some((s) => selected.has(s.key));
  const all = node.subs.every((s) => selected.has(s.key));
  return some && !all;
}

function TopicPicker({
  tree,
  selected,
  onChange,
}: {
  tree: TopicNode[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Закрытие по клику вне.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const leaves = useMemo(() => allLeafKeys(tree), [tree]);
  const allChecked = leaves.size > 0 && leaves.size === selected.size
    && Array.from(leaves).every((k) => selected.has(k));

  const toggleAll = () => {
    if (allChecked) onChange(new Set());
    else onChange(new Set(leaves));
  };

  const toggleSection = (node: TopicNode) => {
    const next = new Set(selected);
    if (node.subs.length === 0) {
      const k = sectionKey(node.slug);
      if (next.has(k)) next.delete(k);
      else next.add(k);
    } else {
      const fully = isSectionFullySelected(node, selected);
      if (fully) for (const s of node.subs) next.delete(s.key);
      else for (const s of node.subs) next.add(s.key);
    }
    onChange(next);
  };

  const toggleSub = (key: string) => {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(next);
  };

  // Лейбл кнопки: ALL / N TOPICS / NONE.
  const label = allChecked
    ? "ALL TOPICS"
    : selected.size === 0
      ? "NO TOPICS"
      : `${countSelectedTopics(tree, selected)} TOPICS`;

  return (
    <div ref={ref} className="relative w-full max-w-md text-left">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="yzy-label text-muted-foreground hover:text-foreground transition-colors flex items-center justify-between w-full py-2"
        aria-expanded={open}
      >
        <span>{label}</span>
        <span className="ml-3">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="absolute left-0 right-0 mt-2 bg-background z-20 max-h-[60vh] overflow-y-auto py-3 px-1">
          <ul className="space-y-1">
            <li>
              <CheckboxRow
                checked={allChecked}
                indeterminate={!allChecked && selected.size > 0}
                onClick={toggleAll}
                label="ALL"
                bold
              />
            </li>
            {tree.map((node) => {
              const fully = isSectionFullySelected(node, selected);
              const partial = isSectionPartiallySelected(node, selected);
              return (
                <li key={node.slug}>
                  <CheckboxRow
                    checked={fully}
                    indeterminate={partial}
                    onClick={() => toggleSection(node)}
                    label={node.title}
                  />
                  {node.subs.length > 0 && (
                    <ul className="mt-1 mb-2 pl-6 space-y-1">
                      {node.subs.map((sub) => (
                        <li key={sub.key}>
                          <CheckboxRow
                            checked={selected.has(sub.key)}
                            onClick={() => toggleSub(sub.key)}
                            label={sub.name.toUpperCase()}
                            small
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

// Сколько «верхних» тем выбрано — для лейбла. Секция с подсекциями считается
// одной темой если выбрана хоть одна её подсекция.
function countSelectedTopics(tree: TopicNode[], selected: Set<string>): number {
  let n = 0;
  for (const node of tree) {
    if (node.subs.length === 0) {
      if (selected.has(sectionKey(node.slug))) n++;
    } else {
      if (node.subs.some((s) => selected.has(s.key))) n++;
    }
  }
  return n;
}

function CheckboxRow({
  checked,
  indeterminate,
  onClick,
  label,
  bold,
  small,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onClick: () => void;
  label: string;
  bold?: boolean;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 w-full py-1 text-left group"
    >
      <CheckBox checked={checked} indeterminate={indeterminate} />
      <span
        className={cn(
          small ? "text-xs" : "yzy-label",
          bold ? "text-foreground" : "text-foreground",
          "group-hover:text-muted-foreground transition-colors",
        )}
      >
        {label}
      </span>
    </button>
  );
}

function CheckBox({
  checked,
  indeterminate,
}: {
  checked: boolean;
  indeterminate?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center h-4 w-4 rounded-[5px] shrink-0 transition-colors",
        checked || indeterminate
          ? "bg-foreground text-background"
          : "border border-muted-foreground/60 bg-background",
      )}
      aria-hidden
    >
      {checked && (
        <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
          <path
            d="M2.5 6.5L5 9L9.5 3.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {!checked && indeterminate && (
        <span className="block h-[2px] w-2 bg-background" />
      )}
    </span>
  );
}
