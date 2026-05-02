"use client";

import { useState } from "react";
import {
  CVData,
  CVEntry,
  CVLanguage,
  CVSkill,
  EMPTY_ENTRY,
  LANGUAGE_LEVELS,
  LanguageLevel,
  SKILL_LEVELS,
  SkillLevel,
} from "./cv-data";

// ── primitives ──────────────────────────────────────────────────────────────

type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  max?: number;
  area?: boolean;
  rows?: number;
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  max,
  area,
  rows,
}: FieldProps) {
  const counter = max ? `${value.length} / ${max}` : null;
  return (
    <div className="cv-field">
      <label>
        <span>{label}</span>
        {counter && <span className="ct yzy-num">{counter}</span>}
      </label>
      {area ? (
        <textarea
          value={value}
          maxLength={max}
          rows={rows ?? 2}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          value={value}
          maxLength={max}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

type GroupProps = {
  name: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

function Group({ name, open, onToggle, children }: GroupProps) {
  return (
    <section className="cv-group">
      <header className="cv-group-h">
        <span>{name}</span>
        <button type="button" className="cv-toggle" onClick={onToggle}>
          {open ? "HIDE" : "SHOW"}
        </button>
      </header>
      {open && <div className="cv-group-body">{children}</div>}
    </section>
  );
}

type EntryProps = {
  idx: number;
  total: number;
  kind: "XP" | "EDU";
  entry: CVEntry;
  update: (e: CVEntry) => void;
  remove: () => void;
  move: (dir: -1 | 1) => void;
};

function EntryRow({
  idx,
  total,
  kind,
  entry,
  update,
  remove,
  move,
}: EntryProps) {
  return (
    <div className="cv-entry">
      <div className="cv-entry-head">
        <span>{kind}</span>
        <div className="controls">
          <button
            type="button"
            onClick={() => move(-1)}
            disabled={idx === 0}
          >
            ↑ UP
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            disabled={idx === total - 1}
          >
            ↓ DOWN
          </button>
          <button type="button" onClick={remove}>
            × REMOVE
          </button>
        </div>
      </div>
      <div className="cv-row-2">
        <Field
          label={kind === "EDU" ? "DEGREE" : "ROLE"}
          value={entry.role}
          onChange={(v) => update({ ...entry, role: v })}
          placeholder={
            kind === "EDU" ? "B.SC. COMPUTER SCIENCE" : "SENIOR FRONTEND"
          }
        />
        <Field
          label={kind === "EDU" ? "INSTITUTION" : "ORGANIZATION"}
          value={entry.org}
          onChange={(v) => update({ ...entry, org: v })}
          placeholder={kind === "EDU" ? "ITMO UNIVERSITY" : "AURORA LABS"}
        />
      </div>
      <div className="cv-row-2">
        <Field
          label="FROM"
          value={entry.from}
          onChange={(v) => update({ ...entry, from: v })}
          placeholder="2023"
        />
        <Field
          label="TO"
          value={entry.to}
          onChange={(v) => update({ ...entry, to: v })}
          placeholder="NOW"
        />
      </div>
      <Field
        area
        rows={2}
        label="WHAT YOU SHIPPED"
        value={entry.desc}
        onChange={(v) => update({ ...entry, desc: v })}
        placeholder="One line, two if you must. No fluff."
        max={220}
      />
    </div>
  );
}

type ChipsProps<L extends string> = {
  items: { name: string; lvl: L }[];
  lvls: readonly L[];
  upper?: boolean;
  placeholder?: string;
  onAdd: (name: string) => void;
  onRemove: (i: number) => void;
  onLevel: (i: number, lvl: L) => void;
};

function Chips<L extends string>({
  items,
  lvls,
  upper,
  placeholder,
  onAdd,
  onRemove,
  onLevel,
}: ChipsProps<L>) {
  const [draft, setDraft] = useState("");
  const submit = () => {
    const v = draft.trim();
    if (!v) return;
    onAdd(v);
    setDraft("");
  };
  return (
    <div className="cv-chips">
      {items.map((it, i) => (
        <span className="cv-chip" key={`${it.name}-${i}`}>
          <span style={{ textTransform: upper ? "uppercase" : "none" }}>
            {it.name}
          </span>
          <select
            className="cv-lvl-sel"
            value={it.lvl}
            onChange={(e) => onLevel(i, e.target.value as L)}
          >
            {lvls.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="cv-chip-x"
            onClick={() => onRemove(i)}
            aria-label="Remove"
          >
            ×
          </button>
        </span>
      ))}
      <input
        className="cv-chip-input"
        value={draft}
        placeholder={placeholder ?? "TYPE + ENTER"}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            submit();
          } else if (e.key === "Backspace" && !draft && items.length) {
            onRemove(items.length - 1);
          }
        }}
        onBlur={submit}
      />
    </div>
  );
}

// ── form ─────────────────────────────────────────────────────────────────────

type Props = {
  data: CVData;
  setData: (next: CVData) => void;
};

export function CVForm({ data, setData }: Props) {
  const [open, setOpen] = useState({
    head: true,
    summary: true,
    exp: true,
    edu: true,
    skills: true,
    lang: true,
  });
  const toggle = (k: keyof typeof open) =>
    setOpen((o) => ({ ...o, [k]: !o[k] }));

  const set = <K extends keyof CVData>(k: K, v: CVData[K]) =>
    setData({ ...data, [k]: v });

  const updateEntry = (
    key: "experience" | "education",
    i: number,
    v: CVEntry,
  ) => {
    const next = data[key].slice();
    next[i] = v;
    set(key, next);
  };

  const removeEntry = (key: "experience" | "education", i: number) =>
    set(
      key,
      data[key].filter((_, j) => j !== i),
    );

  const moveEntry = (
    key: "experience" | "education",
    i: number,
    dir: -1 | 1,
  ) => {
    const next = data[key].slice();
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    set(key, next);
  };

  return (
    <div className="cv-form">
      <Group name="HEADER" open={open.head} onToggle={() => toggle("head")}>
        <Field
          label="NAME"
          value={data.name}
          onChange={(v) => set("name", v)}
          placeholder="FULL NAME"
          max={40}
        />
        <Field
          label="ROLE / TITLE"
          value={data.role}
          onChange={(v) => set("role", v)}
          placeholder="SENIOR FRONTEND ENGINEER"
          max={48}
        />
        <Field
          label="LOCATION"
          value={data.location}
          onChange={(v) => set("location", v)}
          placeholder="CITY · REMOTE"
          max={48}
        />
        <div className="cv-row-3">
          <Field
            label="EMAIL"
            value={data.email}
            onChange={(v) => set("email", v)}
            placeholder="you@mail"
          />
          <Field
            label="PHONE"
            value={data.phone}
            onChange={(v) => set("phone", v)}
            placeholder="+00 0 000"
          />
          <Field
            label="LINK"
            value={data.link}
            onChange={(v) => set("link", v)}
            placeholder="domain.dev"
          />
        </div>
      </Group>

      <Group
        name="SUMMARY"
        open={open.summary}
        onToggle={() => toggle("summary")}
      >
        <Field
          area
          rows={3}
          label="WHO YOU ARE · IN ONE PARAGRAPH"
          value={data.summary}
          onChange={(v) => set("summary", v)}
          placeholder="Recall over memory. Three sentences. No hedging."
          max={320}
        />
      </Group>

      <Group
        name="EXPERIENCE"
        open={open.exp}
        onToggle={() => toggle("exp")}
      >
        {data.experience.map((e, i) => (
          <EntryRow
            key={i}
            idx={i}
            total={data.experience.length}
            kind="XP"
            entry={e}
            update={(v) => updateEntry("experience", i, v)}
            remove={() => removeEntry("experience", i)}
            move={(d) => moveEntry("experience", i, d)}
          />
        ))}
        <button
          type="button"
          className="cv-add-row"
          onClick={() => set("experience", [...data.experience, EMPTY_ENTRY])}
        >
          <span className="glyph">+</span>
          <span>ADD ROLE</span>
        </button>
      </Group>

      <Group
        name="EDUCATION"
        open={open.edu}
        onToggle={() => toggle("edu")}
      >
        {data.education.map((e, i) => (
          <EntryRow
            key={i}
            idx={i}
            total={data.education.length}
            kind="EDU"
            entry={e}
            update={(v) => updateEntry("education", i, v)}
            remove={() => removeEntry("education", i)}
            move={(d) => moveEntry("education", i, d)}
          />
        ))}
        <button
          type="button"
          className="cv-add-row"
          onClick={() => set("education", [...data.education, EMPTY_ENTRY])}
        >
          <span className="glyph">+</span>
          <span>ADD DEGREE</span>
        </button>
      </Group>

      <Group
        name="SKILLS"
        open={open.skills}
        onToggle={() => toggle("skills")}
      >
        <Chips<SkillLevel>
          upper
          items={data.skills}
          lvls={SKILL_LEVELS}
          onAdd={(name) =>
            set("skills", [
              ...data.skills,
              { name: name.toUpperCase(), lvl: "STRONG" },
            ])
          }
          onRemove={(i) =>
            set(
              "skills",
              data.skills.filter((_, j) => j !== i),
            )
          }
          onLevel={(i, lvl) => {
            const next = data.skills.slice();
            next[i] = { ...next[i], lvl } as CVSkill;
            set("skills", next);
          }}
        />
      </Group>

      <Group
        name="LANGUAGES"
        open={open.lang}
        onToggle={() => toggle("lang")}
      >
        <Chips<LanguageLevel>
          upper
          items={data.languages}
          lvls={LANGUAGE_LEVELS}
          onAdd={(name) =>
            set("languages", [...data.languages, { name, lvl: "B1" }])
          }
          onRemove={(i) =>
            set(
              "languages",
              data.languages.filter((_, j) => j !== i),
            )
          }
          onLevel={(i, lvl) => {
            const next = data.languages.slice();
            next[i] = { ...next[i], lvl } as CVLanguage;
            set("languages", next);
          }}
        />
      </Group>
    </div>
  );
}
