import { useMemo, useState } from "react";

const DEFAULT_UNIS = ["Columbia University", "NYU", "Princeton University", "Stanford University"];

export default function Setup({ onRun, loading = false }) {
  const [interest, setInterest]         = useState("");
  const [profile, setProfile]           = useState("");
  const [selectedUnis, setSelectedUnis] = useState([]);
  const [customUni, setCustomUni]       = useState("");

  const canRun = useMemo(
    () => interest.trim().length >= 10 && profile.trim().length >= 10 && selectedUnis.length > 0,
    [interest, profile, selectedUnis]
  );

  const toggleUni = uni => setSelectedUnis(p => p.includes(uni) ? p.filter(u => u !== uni) : [...p, uni]);
  const addCustomUni = () => {
    const v = customUni.trim();
    if (!v) return;
    if (!selectedUnis.includes(v)) setSelectedUnis(p => [...p, v]);
    setCustomUni("");
  };

  return (
    <div className="page-transition" style={{ background: "var(--bg)", minHeight: "calc(100vh - 108px)", padding: "48px 32px" }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>

        {/* Page header */}
        <div style={{ marginBottom: 36 }}>
          <span className="label-mono" style={{ color: "var(--coral)" }}>Workspace</span>
          <h2 className="section-title" style={{ fontSize: "2.5rem", marginTop: 10 }}>Define your search</h2>
          <p style={{ marginTop: 10, fontSize: "0.9375rem", color: "var(--text-muted)" }}>
            Tell Stellanet what you're working on. We'll find aligned faculty and draft personalized emails.
          </p>
        </div>

        {/* Form card */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: "40px 36px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
          display: "flex", flexDirection: "column", gap: 28,
        }}>

          {/* Research interest */}
          <div>
            <label className="label-mono" style={{ display: "block", marginBottom: 8 }}>Research Interest</label>
            <textarea
              className="input-base"
              rows={4}
              value={interest}
              onChange={e => setInterest(e.target.value)}
              placeholder="e.g., Robust CNNs for satellite imagery; domain shift; data efficiency…"
              style={{ resize: "vertical" }}
            />
            <p style={{ marginTop: 6, fontSize: "0.75rem", color: "var(--text-dim)" }}>
              Include the topic, domain, and what you want to achieve. Minimum 10 characters.
            </p>
          </div>

          {/* Short profile */}
          <div>
            <label className="label-mono" style={{ display: "block", marginBottom: 8 }}>Your Short Profile</label>
            <textarea
              className="input-base"
              rows={3}
              value={profile}
              onChange={e => setProfile(e.target.value)}
              placeholder="Year, major, skills, projects, and what you're seeking (research / RA)."
              style={{ resize: "vertical" }}
            />
            <p style={{ marginTop: 6, fontSize: "0.75rem", color: "var(--text-dim)" }}>
              Keep it 1–3 sentences. Used to personalize your emails.
            </p>
          </div>

          {/* Target universities */}
          <div>
            <label className="label-mono" style={{ display: "block", marginBottom: 12 }}>Target Universities</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {DEFAULT_UNIS.map(uni => {
                const active = selectedUnis.includes(uni);
                return (
                  <button
                    key={uni}
                    type="button"
                    onClick={() => toggleUni(uni)}
                    style={{
                      background: active ? "var(--coral)" : "var(--bg)",
                      color: active ? "#fff" : "var(--text-muted)",
                      border: `1.5px solid ${active ? "var(--coral)" : "var(--border)"}`,
                      borderRadius: 10, padding: "8px 16px",
                      fontSize: "0.875rem", fontFamily: "'Figtree', sans-serif",
                      fontWeight: active ? 600 : 400, cursor: "pointer",
                      transition: "all 150ms",
                      boxShadow: active ? "0 2px 8px rgba(232,98,42,0.2)" : "none",
                    }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = "var(--coral)"; e.currentTarget.style.color = "var(--coral)"; }}}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}}
                  >
                    {uni}
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
              <input
                className="input-base"
                value={customUni}
                onChange={e => setCustomUni(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addCustomUni()}
                placeholder="Add another university…"
                style={{ flex: 1 }}
              />
              <button type="button" onClick={addCustomUni} className="btn-ghost" style={{ flexShrink: 0 }}>Add</button>
            </div>

            {selectedUnis.length > 0 && (
              <div style={{ marginTop: 10, fontSize: "0.8125rem", color: "var(--text-dim)" }}>
                <span style={{ color: "var(--coral)", fontWeight: 600 }}>Selected: </span>
                {selectedUnis.join(" · ")}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ borderTop: "1px solid var(--border-sub)", paddingTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <p className="label-mono">Draft-only · Human review before sending</p>
            <button
              type="button"
              onClick={async () => { if (canRun && !loading) await onRun?.({ interest: interest.trim(), profile: profile.trim(), universities: selectedUnis }); }}
              disabled={!canRun || loading}
              className="btn-primary"
              style={{ fontSize: "0.9375rem", padding: "11px 26px" }}
            >
              {loading ? "Searching…" : "Run Discovery →"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
