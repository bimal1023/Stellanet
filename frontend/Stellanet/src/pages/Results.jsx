import { useMemo, useState } from "react";

/* ── sort/filter toggle ── */
function Toggle({ value, onChange, options, label }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span className="label-mono" style={{ fontSize: 10 }}>{label}</span>
      <div style={{
        display: "inline-flex", background: "var(--surface)",
        border: "1px solid var(--rule)", borderRadius: 4, padding: 2,
      }}>
        {options.map(({ v, label: optLabel }) => (
          <button key={v} onClick={() => onChange(v)} style={{
            background: value === v ? "var(--ink)" : "transparent",
            color: value === v ? "var(--bg)" : "var(--muted)",
            border: "none", padding: "5px 12px", borderRadius: 3,
            fontSize: 12, fontWeight: 500, cursor: "pointer",
            transition: "all 140ms", fontFamily: "'Instrument Sans', sans-serif",
          }}>
            {optLabel}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── match card ── */
function MatchCard({ r, rank, expanded, onToggle, onDraft, wide }) {
  // Backend sends fit as 0-100 integer; display as 0.XX
  const fitScore = r.fit > 1 ? r.fit / 100 : r.fit;

  return (
    <article
      style={{
        background: "var(--surface)", border: "1px solid var(--rule)",
        borderRadius: 8, padding: wide ? "32px 36px" : "26px 28px",
        boxShadow: expanded
          ? "0 24px 40px -28px rgba(26,24,22,0.20)"
          : "0 1px 0 rgba(255,255,255,0.6) inset, 0 8px 20px -16px rgba(26,24,22,0.10)",
        transition: "box-shadow 200ms, transform 200ms",
        display: "flex", flexDirection: "column", gap: 18, height: "100%",
      }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
      onMouseLeave={e => e.currentTarget.style.transform = ""}
    >
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, letterSpacing: "0.16em", color: "var(--dim)" }}>
              №{String(rank).padStart(2, "0")}
            </span>
            {r.accepting && (
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--green)" }}>
                · accepting
              </span>
            )}
          </div>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif", fontWeight: 500,
            fontSize: wide ? "clamp(28px, 3.2vw, 38px)" : "26px",
            lineHeight: 1.1, letterSpacing: "-0.008em", color: "var(--ink)",
          }}>
            Prof. {r.name}
          </h2>
          <div style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.45 }}>
            <em style={{ fontStyle: "italic", color: "var(--ink-2)" }}>{r.title}</em><br />
            {r.university}
          </div>
        </div>

        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: wide ? 56 : 44, lineHeight: 1, fontWeight: 500,
            color: "var(--accent)", letterSpacing: "-0.02em",
          }}>
            {fitScore.toFixed(2)}
          </div>
          <div className="label-mono" style={{ marginTop: 4, fontSize: 9.5 }}>
            Fit · {Math.round(fitScore * 100)}%
          </div>
        </div>
      </div>

      {/* Summary / why */}
      <p style={{ fontSize: 14.5, lineHeight: 1.62, color: "var(--ink-2)", maxWidth: wide ? "70ch" : "100%" }}>
        {r.why || r.why_summary || ""}
      </p>

      {/* Expanded why-bullets */}
      {expanded && (
        <div className="page-transition" style={{
          background: "var(--bg-2)", border: "1px solid var(--rule-soft)",
          borderRadius: 6, padding: "18px 20px",
          display: "flex", flexDirection: "column", gap: 14,
        }}>
          <span className="label-mono" style={{ color: "var(--accent)" }}>Why this match</span>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 9 }}>
            {(r.why_bullets || []).map((b, i) => (
              <li key={i} style={{ display: "grid", gridTemplateColumns: "16px 1fr", gap: 8, fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.55 }}>
                <span style={{ color: "var(--accent)", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, marginTop: 2 }}>{i + 1}</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>

          {(r.recent_papers || []).length > 0 && (
            <div style={{ borderTop: "1px dashed var(--rule)", paddingTop: 12, marginTop: 4 }}>
              <span className="label-mono" style={{ marginBottom: 8, display: "block" }}>Recent papers</span>
              {(r.recent_papers || []).map((p, i) => (
                <div key={i} style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5, marginTop: 4 }}>
                  <em style={{ fontStyle: "italic", color: "var(--ink-2)" }}>{p.title || p}</em>
                  {p.venue && <>{" · "}<span>{p.venue}</span></>}
                  {p.year && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "var(--dim)", marginLeft: 6 }}>{p.year}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{
        marginTop: "auto", paddingTop: 14, borderTop: "1px dashed var(--rule)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 12, flexWrap: "wrap",
      }}>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>
          {r.contact_email ? (
            <span>
              <span style={{ color: r.contact_email_source === "openalex" ? "var(--green)" : "var(--warn)", marginRight: 4 }}>●</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--ink-2)" }}>{r.contact_email}</span>
            </span>
          ) : (
            <span style={{ color: "var(--warn)" }}>● Email not listed publicly</span>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-ghost" onClick={onToggle} style={{ fontSize: 12, padding: "7px 14px" }}>
            {expanded ? "Hide details" : "Why this match?"}
          </button>
          <button className="btn-primary" onClick={onDraft} style={{ fontSize: 12, padding: "7px 14px" }}>
            Draft email →
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Results({ results, onViewDraft, onBack }) {
  const [sort, setSort]     = useState("fit");    // fit | name | university
  const [filter, setFilter] = useState("all");    // all | accepting
  const [openId, setOpenId] = useState(null);

  const sorted = useMemo(() => {
    let arr = [...(results || [])];
    if (filter === "accepting") arr = arr.filter(r => r.accepting);
    if (sort === "fit")        arr.sort((a, b) => b.fit - a.fit);
    else if (sort === "name")  arr.sort((a, b) => a.name.localeCompare(b.name));
    else                       arr.sort((a, b) => a.university.localeCompare(b.university));
    return arr;
  }, [results, sort, filter]);

  if (!results || results.length === 0) {
    return (
      <div className="page-transition" style={{ maxWidth: 600, margin: "80px auto", padding: "0 32px" }}>
        <div className="card" style={{ padding: "48px 40px", textAlign: "center" }}>
          <span className="label-mono">No results</span>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 400, marginTop: 12, color: "var(--ink)" }}>
            Nothing found yet
          </h2>
          <p style={{ marginTop: 12, color: "var(--muted)", fontSize: "0.9rem" }}>
            Go back to Setup and run a discovery.
          </p>
          <button className="btn-ghost" onClick={onBack} style={{ marginTop: 24 }}>← Back to setup</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition" style={{ maxWidth: 1180, margin: "0 auto", padding: "56px 32px 96px" }}>

      {/* Header */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr auto", gap: 20,
        alignItems: "end", marginBottom: 36, paddingBottom: 24,
        borderBottom: "1px solid var(--rule-soft)",
      }}>
        <div>
          <span className="label-mono">§ Workspace · Results</span>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif", fontWeight: 400,
            fontSize: "clamp(36px, 4.4vw, 52px)", lineHeight: 1.05,
            letterSpacing: "-0.012em", marginTop: 14, color: "var(--ink)",
          }}>
            <em style={{ fontStyle: "italic", color: "var(--accent)" }}>{sorted.length}</em> faculty, sorted by fit.
          </h1>
          <p style={{ marginTop: 14, color: "var(--muted)", fontSize: 15, maxWidth: 540, lineHeight: 1.6 }}>
            Open any card for the why-bullets behind a score. When one looks right, draft the email.
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <Toggle
            value={sort} onChange={setSort} label="Sort"
            options={[{ v: "fit", label: "Fit" }, { v: "name", label: "Name" }, { v: "university", label: "School" }]}
          />
          <Toggle
            value={filter} onChange={setFilter} label="Show"
            options={[{ v: "all", label: "All" }, { v: "accepting", label: "Accepting" }]}
          />
        </div>
      </div>

      {/* Magazine grid: 12-col asymmetric */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 24 }}>
        {sorted.map((r, i) => {
          let span;
          if (i === 0)      span = 12;
          else if (i % 4 === 1) span = 7;
          else if (i % 4 === 2) span = 5;
          else if (i % 4 === 3) span = 5;
          else               span = 7;

          return (
            <div key={r.id} style={{ gridColumn: `span ${span}` }}>
              <MatchCard
                r={r} rank={i + 1}
                wide={i === 0 || span >= 7}
                expanded={openId === r.id}
                onToggle={() => setOpenId(p => p === r.id ? null : r.id)}
                onDraft={() => onViewDraft(r)}
              />
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 48, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button className="btn-ghost" onClick={onBack}>← Back to setup</button>
        <span className="label-mono">End of results — {sorted.length} matches shown</span>
      </div>
    </div>
  );
}
