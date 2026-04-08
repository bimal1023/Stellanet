import { useState } from "react";

function FitBadge({ fit }) {
  const hi  = fit >= 85;
  const med = fit >= 70;
  return (
    <span style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.04em",
      color:      hi ? "var(--coral)"  : med ? "var(--teal)"  : "var(--text-muted)",
      background: hi ? "var(--coral-bg)" : med ? "var(--teal-bg)"  : "var(--surface-warm)",
      border: `1px solid ${hi ? "var(--coral-border)" : med ? "var(--teal-border)" : "var(--border-sub)"}`,
      padding: "3px 10px", borderRadius: 8,
    }}>
      {fit}% fit
    </span>
  );
}

export default function Results({ results, onViewDraft, onBack }) {
  const [openId, setOpenId] = useState(null);
  const toggleWhy = id => setOpenId(p => p === id ? null : id);

  return (
    <div className="page-transition" style={{ background: "var(--bg)", minHeight: "calc(100vh - 108px)", padding: "48px 32px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 36 }}>
          <div>
            <span className="label-mono" style={{ color: "var(--coral)" }}>Workspace — Results</span>
            <h2 className="section-title" style={{ fontSize: "2.5rem", marginTop: 10 }}>Faculty matches</h2>
            <p style={{ marginTop: 8, fontSize: "0.9375rem", color: "var(--text-muted)" }}>
              Sorted by research alignment. Select any match to draft an email.
            </p>
          </div>
          <button className="btn-ghost" onClick={onBack}>← Back to Setup</button>
        </div>

        {/* Empty */}
        {(!results || results.length === 0) && (
          <div style={{ background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: 16, padding: "56px 32px", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🔍</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1.125rem", color: "var(--text)" }}>No results yet</div>
            <div style={{ marginTop: 8, fontSize: "0.875rem", color: "var(--text-muted)" }}>Go back to Setup and run a discovery.</div>
          </div>
        )}

        {/* Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {results?.map((r, idx) => {
            const expanded = openId === r.id;
            return (
              <div
                key={r.id}
                style={{
                  background: "var(--surface)",
                  border: `1px solid ${expanded ? "var(--coral-border)" : "var(--border)"}`,
                  borderRadius: 16,
                  overflow: "hidden",
                  transition: "border-color 150ms, box-shadow 150ms",
                  boxShadow: expanded ? "0 4px 20px rgba(232,98,42,0.08)" : "0 1px 4px rgba(0,0,0,0.04)",
                }}
                onMouseEnter={e => { if (!expanded) { e.currentTarget.style.borderColor = "var(--coral-border)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(232,98,42,0.07)"; }}}
                onMouseLeave={e => { if (!expanded) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; }}}
              >
                <div style={{ padding: "24px 28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>

                    {/* Left */}
                    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                      {/* Avatar */}
                      <div style={{
                        width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                        background: `hsl(${(idx * 47 + 12) % 360}, 60%, 93%)`,
                        border: `1px solid hsl(${(idx * 47 + 12) % 360}, 40%, 82%)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.125rem",
                        color: `hsl(${(idx * 47 + 12) % 360}, 55%, 35%)`,
                      }}>
                        {r.name?.split(" ").slice(-1)[0]?.[0] || "P"}
                      </div>

                      <div>
                        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1.0625rem", color: "var(--text)" }}>{r.name}</div>
                        <div style={{ marginTop: 2, fontSize: "0.875rem", color: "var(--text-muted)" }}>{r.title}</div>
                        <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6875rem", color: "var(--text-muted)", background: "var(--surface-warm)", border: "1px solid var(--border-sub)", padding: "3px 10px", borderRadius: 8 }}>
                            {r.university}
                          </span>
                          <FitBadge fit={r.fit} />
                          {r.contact_email ? (
                            <a href={`mailto:${r.contact_email}`} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6875rem", color: "var(--teal)", background: "var(--teal-bg)", border: "1px solid var(--teal-border)", padding: "3px 10px", borderRadius: 8, textDecoration: "none" }}>
                              {r.contact_email}
                            </a>
                          ) : (
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6875rem", color: "var(--amber)", background: "var(--amber-bg)", border: "1px solid var(--amber-border)", padding: "3px 10px", borderRadius: 8 }}>
                              Email unavailable
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flexShrink: 0 }}>
                      <button className="btn-ghost" onClick={() => toggleWhy(r.id)} style={{ fontSize: "0.8125rem" }}>
                        {expanded ? "Hide details" : "Why match?"}
                      </button>
                      <button className="btn-primary" onClick={() => onViewDraft(r)} style={{ fontSize: "0.8125rem" }}>
                        Draft Email →
                      </button>
                    </div>
                  </div>

                  {/* Summary */}
                  <div style={{ marginTop: 14, marginLeft: 62, fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.65 }}>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.75rem", color: "var(--text-dim)", marginRight: 8 }}>Summary</span>
                    {r.why}
                  </div>

                  {/* Expanded details */}
                  {expanded && (
                    <div style={{
                      marginTop: 16, marginLeft: 62,
                      padding: "18px 20px", background: "var(--surface-warm)",
                      border: "1px solid var(--coral-border)", borderRadius: 12,
                    }}>
                      <div className="label-mono" style={{ color: "var(--coral)", marginBottom: 10 }}>Why this match</div>
                      <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.7 }}>{r.why}</p>
                      {r.why_bullets?.length > 0 && (
                        <ul style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 7 }}>
                          {r.why_bullets.map((b, i) => (
                            <li key={i} style={{ display: "flex", gap: 8, fontSize: "0.875rem", color: "var(--text-muted)" }}>
                              <span style={{ color: "var(--coral)", flexShrink: 0, fontWeight: 700 }}>→</span>{b}
                            </li>
                          ))}
                        </ul>
                      )}
                      <p style={{ marginTop: 12, fontSize: "0.75rem", color: "var(--text-dim)", fontStyle: "italic" }}>
                        Tip: Add 1–2 personal lines about their recent work before sending.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
