// Генератор .ics календаря для методички.
//
// Семь событий «ITW PREP STDY / <LVL>» подряд, начиная с дня вызова,
// 19:00–21:00 локального времени. Два VALARM на каждое: за час до начала
// (18:00) и утренний (10:00) — чтобы не забыть про вечернее занятие.
//
// Описание события: тема дня + список вопросов из плана + LVL + ссылки
// на PDF и EPUB методички (абсолютные URL — берутся из urls.pdf / urls.epub
// в момент клика, чтобы работали на любом домене, где задеплоено).

export type PlanQuestion = { id: number; text: string };
export type PlanDay = {
  day: string; // "ДЕНЬ 1"
  title: string; // "MACROTASK ..."
  lvl: string; // "MID LVL" / "YZY LVL" / "HRD LVL"
  questions: PlanQuestion[];
};
export type Plan = {
  section: string;
  topic: string;
  subtitle: string;
  days: PlanDay[];
};

export type IcsUrls = {
  pdf: string;
  epub: string;
};

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

// YYYYMMDDTHHMMSS — формат «локального» времени iCalendar (без TZID).
function localStamp(d: Date): string {
  return (
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    "T" +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

// Текущее UTC-время для DTSTAMP.
function utcStamp(d: Date): string {
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

// Экранирование по RFC 5545: запятые / точки с запятой / переводы строк.
function escICS(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

// «Folding» по 75 октетов с пробелом-продолжением — как требует RFC 5545.
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  let i = 0;
  while (i < line.length) {
    const len = i === 0 ? 75 : 74;
    chunks.push((i === 0 ? "" : " ") + line.slice(i, i + len));
    i += len;
  }
  return chunks.join("\r\n");
}

// Описание события: тема + Q01 ... + LVL + ссылки на PDF и EPUB.
function buildDescription(d: PlanDay, urls?: IcsUrls): string {
  const lines: string[] = [];
  lines.push(`${d.day}    ${d.title}`);
  lines.push("");
  for (const q of d.questions) {
    lines.push(`Q${pad(q.id)}    ${q.text}`);
  }
  lines.push("");
  lines.push(d.lvl);
  if (urls) {
    lines.push("");
    lines.push(`PDF    ${urls.pdf}`);
    lines.push(`IBOOKS    ${urls.epub}`);
  }
  return lines.join("\n");
}

// «Сегодня в 19:00» с шагом дней.
function dayStart(base: Date, offsetDays: number): Date {
  const d = new Date(base);
  d.setHours(19, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d;
}

export function buildIcs(
  plan: Plan,
  base: Date = new Date(),
  urls?: IcsUrls,
): string {
  const dtstamp = utcStamp(new Date());
  const lines: string[] = [];
  lines.push("BEGIN:VCALENDAR");
  lines.push("VERSION:2.0");
  lines.push("PRODID:-//ness-prep//methodology-reminder//RU");
  lines.push("CALSCALE:GREGORIAN");
  lines.push("METHOD:PUBLISH");

  plan.days.forEach((d, idx) => {
    const start = dayStart(base, idx);
    const end = new Date(start);
    end.setHours(21, 0, 0, 0);
    const uid = `ness-prep-${plan.topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}-${idx + 1}-${start.getTime()}@ness-prep`;

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${dtstamp}`);
    lines.push(`DTSTART:${localStamp(start)}`);
    lines.push(`DTEND:${localStamp(end)}`);
    lines.push(
      foldLine(`SUMMARY:${escICS(`ITW PREP STDY / ${d.lvl}`)}`),
    );
    lines.push(foldLine(`DESCRIPTION:${escICS(buildDescription(d, urls))}`));

    // VALARM #1 — за час до начала (18:00).
    lines.push("BEGIN:VALARM");
    lines.push("ACTION:DISPLAY");
    lines.push(`DESCRIPTION:${escICS(`ITW PREP STDY    ${d.day}    ЧЕРЕЗ ЧАС`)}`);
    lines.push("TRIGGER:-PT1H");
    lines.push("END:VALARM");

    // VALARM #2 — утром в 10:00 того же дня (минус 9 часов от 19:00).
    lines.push("BEGIN:VALARM");
    lines.push("ACTION:DISPLAY");
    lines.push(
      `DESCRIPTION:${escICS(`ITW PREP STDY    ${d.day}    ВЕЧЕРОМ В 19:00`)}`,
    );
    lines.push("TRIGGER:-PT9H");
    lines.push("END:VALARM");

    lines.push("END:VEVENT");
  });

  lines.push("END:VCALENDAR");

  return lines.map(foldLine).join("\r\n") + "\r\n";
}

// Триггерит скачивание .ics файла в браузере.
export function downloadIcs(plan: Plan, filename: string, urls?: IcsUrls): void {
  const text = buildIcs(plan, new Date(), urls);
  const blob = new Blob([text], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
