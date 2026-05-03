"use client";

import {
  CSSProperties,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { CVData, CVTemplate } from "./cv-data";

// useLayoutEffect не работает на сервере — в SSR деградируем до useEffect,
// чтобы Next.js не варнил при гидратации.
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10).replace(/-/g, ".");
}

// ── manuscript ───────────────────────────────────────────────────────────────

function Manuscript({ data }: { data: CVData }) {
  return (
    <div className="tpl-manuscript">
      <h2 className="name">{data.name || "—"}</h2>
      <div className="role">{data.role || "—"}</div>
      <div className="top-meta">
        <span>{data.location || "—"}</span>
        <span>{data.email || "—"}</span>
        <span>{data.phone || "—"}</span>
        <span>{data.link || "—"}</span>
      </div>
      {data.summary ? <p className="summary">{data.summary}</p> : null}

      {data.experience.length > 0 && (
        <>
          <div className="sec-h">
            <span>EXPERIENCE</span>
            <span className="ct yzy-num">
              {pad(data.experience.length)} / {pad(data.experience.length)}
            </span>
          </div>
          {data.experience.map((e, i) => (
            <div className="item" key={i}>
              <div className="when yzy-num">
                {e.from || "—"}
                <br />— {e.to || "NOW"}
              </div>
              <div className="what">
                <div className="role-line">
                  <span className="role-text">{e.role || "—"}</span>
                  <span className="org">{e.org || "—"}</span>
                </div>
                {e.desc ? <div className="desc">{e.desc}</div> : null}
              </div>
            </div>
          ))}
        </>
      )}

      {data.education.length > 0 && (
        <>
          <div className="sec-h">
            <span>EDUCATION</span>
            <span className="ct yzy-num">
              {pad(data.education.length)} / {pad(data.education.length)}
            </span>
          </div>
          {data.education.map((e, i) => (
            <div className="item" key={i}>
              <div className="when yzy-num">
                {e.from || "—"}
                <br />— {e.to || "—"}
              </div>
              <div className="what">
                <div className="role-line">
                  <span className="role-text">{e.role || "—"}</span>
                  <span className="org">{e.org || "—"}</span>
                </div>
                {e.desc ? <div className="desc">{e.desc}</div> : null}
              </div>
            </div>
          ))}
        </>
      )}

      {data.skills.length > 0 && (
        <>
          <div className="sec-h">
            <span>SKILLS</span>
            <span className="ct yzy-num">{pad(data.skills.length)}</span>
          </div>
          <div className="skills-grid">
            {data.skills.map((s, i) => (
              <div className="sk" key={i}>
                <span>{s.name}</span>
                <span className="lvl">{s.lvl}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {data.languages.length > 0 && (
        <>
          <div className="sec-h">
            <span>LANGUAGES</span>
            <span className="ct yzy-num">{pad(data.languages.length)}</span>
          </div>
          <div className="skills-grid">
            {data.languages.map((s, i) => (
              <div className="sk" key={i}>
                <span style={{ textTransform: "uppercase" }}>{s.name}</span>
                <span className="lvl">{s.lvl}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── two-column ───────────────────────────────────────────────────────────────

function TwoCol({ data }: { data: CVData }) {
  return (
    <div className="tpl-twocol">
      <aside className="left">
        <div className="name-block">
          <h2 className="name">{data.name || "—"}</h2>
          <div className="role">{data.role || "—"}</div>
        </div>
        <div className="left-sec">
          <h4>CONTACT</h4>
          <p className="simple">{data.email || "—"}</p>
          <p className="simple">{data.phone || "—"}</p>
          <p className="simple">{data.link || "—"}</p>
          <p className="simple">{data.location || "—"}</p>
        </div>
        {data.skills.length > 0 && (
          <div className="left-sec">
            <h4>SKILLS · {pad(data.skills.length)}</h4>
            {data.skills.map((s, i) => (
              <div className="row" key={i}>
                <span>{s.name}</span>
                <span className="lvl">{s.lvl}</span>
              </div>
            ))}
          </div>
        )}
        {data.languages.length > 0 && (
          <div className="left-sec">
            <h4>LANGUAGES</h4>
            {data.languages.map((s, i) => (
              <div className="row" key={i}>
                <span style={{ textTransform: "uppercase" }}>{s.name}</span>
                <span className="lvl">{s.lvl}</span>
              </div>
            ))}
          </div>
        )}
      </aside>
      <main className="right">
        {data.summary ? <p className="summary">{data.summary}</p> : null}
        {data.experience.length > 0 && (
          <>
            <div className="sec-h">
              <span>EXPERIENCE</span>
              <span className="ct yzy-num">{pad(data.experience.length)}</span>
            </div>
            {data.experience.map((e, i) => (
              <div className="xp" key={i}>
                <div className="top">
                  <div>
                    <div className="role">{e.role || "—"}</div>
                    <div className="org">{e.org || "—"}</div>
                  </div>
                  <div className="when yzy-num">
                    {e.from || "—"} — {e.to || "NOW"}
                  </div>
                </div>
                {e.desc ? <div className="desc">{e.desc}</div> : null}
              </div>
            ))}
          </>
        )}
        {data.education.length > 0 && (
          <>
            <div className="sec-h">
              <span>EDUCATION</span>
              <span className="ct yzy-num">{pad(data.education.length)}</span>
            </div>
            {data.education.map((e, i) => (
              <div className="xp" key={i}>
                <div className="top">
                  <div>
                    <div className="role">{e.role || "—"}</div>
                    <div className="org">{e.org || "—"}</div>
                  </div>
                  <div className="when yzy-num">
                    {e.from || "—"} — {e.to || "—"}
                  </div>
                </div>
                {e.desc ? <div className="desc">{e.desc}</div> : null}
              </div>
            ))}
          </>
        )}
      </main>
    </div>
  );
}

// ── spec sheet ───────────────────────────────────────────────────────────────

function SpecSheet({ data }: { data: CVData }) {
  const today = todayStamp();
  return (
    <div className="tpl-spec">
      <div className="head-row">
        <span>CV.001 · CANDIDATE SPEC SHEET</span>
        <span className="yzy-num">REV {today}</span>
      </div>
      <h2 className="name">{data.name || "—"}</h2>
      <div className="role">{data.role || "—"}</div>

      <div className="kv">
        <div className="k">EMAIL</div>
        <div className="v">{data.email || "—"}</div>
        <div className="k">PHONE</div>
        <div className="v yzy-num">{data.phone || "—"}</div>
        <div className="k">LINK</div>
        <div className="v">{data.link || "—"}</div>
        <div className="k">LOCATION</div>
        <div className="v">{data.location || "—"}</div>
        {data.summary ? (
          <>
            <div className="k">SUMMARY</div>
            <div className="v" style={{ lineHeight: 1.6 }}>
              {data.summary}
            </div>
          </>
        ) : null}
      </div>

      {data.experience.length > 0 && (
        <>
          <div className="sec-h">
            <span>EXPERIENCE LOG</span>
            <span className="ct yzy-num">
              {pad(data.experience.length)} ROWS
            </span>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 90 }}>WHEN</th>
                <th>ROLE</th>
                <th>ORG</th>
                <th>SHIPPED</th>
              </tr>
            </thead>
            <tbody>
              {data.experience.map((e, i) => (
                <tr key={i}>
                  <td className="when yzy-num">
                    {(e.from || "—") + " — " + (e.to || "NOW")}
                  </td>
                  <td className="role-cell">{e.role || "—"}</td>
                  <td className="org">{e.org || "—"}</td>
                  <td className="desc">{e.desc || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {data.education.length > 0 && (
        <>
          <div className="sec-h">
            <span>EDUCATION LOG</span>
            <span className="ct yzy-num">
              {pad(data.education.length)} ROWS
            </span>
          </div>
          <table className="table">
            <tbody>
              {data.education.map((e, i) => (
                <tr key={i}>
                  <td className="when yzy-num" style={{ width: 90 }}>
                    {(e.from || "—") + " — " + (e.to || "—")}
                  </td>
                  <td className="role-cell">{e.role || "—"}</td>
                  <td className="org">{e.org || "—"}</td>
                  <td className="desc">{e.desc || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {(data.skills.length > 0 || data.languages.length > 0) && (
        <div className="spec-pair">
          {data.skills.length > 0 && (
            <div>
              <div className="sec-h">
                <span>SKILLS</span>
                <span className="ct yzy-num">{pad(data.skills.length)}</span>
              </div>
              <table className="table skills-table">
                <tbody>
                  {data.skills.map((s, i) => (
                    <tr key={i}>
                      <td className="role-cell" style={{ fontSize: 10 }}>
                        {s.name}
                      </td>
                      <td className="lvl" style={{ textAlign: "right" }}>
                        {s.lvl}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {data.languages.length > 0 && (
            <div>
              <div className="sec-h">
                <span>LANGUAGES</span>
                <span className="ct yzy-num">{pad(data.languages.length)}</span>
              </div>
              <table className="table skills-table">
                <tbody>
                  {data.languages.map((s, i) => (
                    <tr key={i}>
                      <td
                        className="role-cell"
                        style={{ fontSize: 10, textTransform: "uppercase" }}
                      >
                        {s.name}
                      </td>
                      <td className="lvl" style={{ textAlign: "right" }}>
                        {s.lvl}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="footer-stamp">
        <span>END OF SHEET · ITW / PREP</span>
        <span className="yzy-num">PG 01 / 01</span>
      </div>
    </div>
  );
}

// ── shell ────────────────────────────────────────────────────────────────────

type Props = {
  data: CVData;
  template: CVTemplate;
  /** Колбэк для родителя — сообщает актуальное число страниц A4. */
  onPageCountChange?: (n: number) => void;
};

export function CVPreview({ data, template, onPageCountChange }: Props) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(1);

  // Считаем сколько A4 нужно: невидимый «измерительный» узел рендерит
  // весь контент на той же ширине, что и видимые листы. Делим scrollHeight
  // на высоту страницы (width × 1.414).
  useIsoLayoutEffect(() => {
    const node = measureRef.current;
    if (!node) return;
    const measure = () => {
      const w = node.clientWidth;
      if (!w) return;
      const pageH = w * 1.414;
      const contentH = node.scrollHeight;
      setPageCount(Math.max(1, Math.ceil(contentH / pageH)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    return () => ro.disconnect();
  }, [data, template]);

  useEffect(() => {
    onPageCountChange?.(pageCount);
  }, [pageCount, onPageCountChange]);

  const renderTemplate = () => {
    if (template === "twocol") return <TwoCol data={data} />;
    if (template === "spec") return <SpecSheet data={data} />;
    return <Manuscript data={data} />;
  };

  return (
    <div className="cv-pages">
      {/* Измерительный узел: тот же контент и ширина, скрыт visibility.
          На печать раскрывается именно он — текст течёт по @page A4. */}
      <div className="cv-measure" ref={measureRef} aria-hidden>
        <div className="cv-paper-inner">{renderTemplate()}</div>
      </div>

      {/* Видимая стопка отдельных A4-«квадратиков». Каждая страница —
          фиксированный лист с overflow:hidden, внутри один и тот же
          непрерывный контент сдвинут вверх на (--page-i × 141.4cqi). */}
      {Array.from({ length: pageCount }, (_, i) => (
        <div className="cv-paper" key={i}>
          <div
            className="cv-paper-content"
            style={{ "--page-i": i } as CSSProperties}
          >
            <div className="cv-paper-inner">{renderTemplate()}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
