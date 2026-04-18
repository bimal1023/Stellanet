import { useMemo, useState } from "react";

const DEFAULT_UNIS = [
  "Stanford University", "MIT", "UC Berkeley", "Princeton University",
  "Columbia University", "Yale University", "Harvard University", "Caltech",
];

function Field({ label, hint, counter, children }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <label style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
          letterSpacing: "0.14em", textTransform: "uppercase",
          color: "var(--ink-2)", fontWeight: 500,
        }}>
          {label}
        </label>
        {counter}
      </div>
      {children}
      {hint && <p style={{ marginTop: 8, fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5 }}>{hint}</p>}
    </div>
  );
}

export default function Setup({ onRun, loading = false }) {
  const [interest, setInterest]     = useState("");
  const [profile, setProfile]       = useState("");
  const [unis, setUnis]             = useState([]);
  const [customUni, setCustomUni]   = useState("");

  const canRun = useMemo(
    () => interest.trim().length >= 10 && profile.trim().length >= 10 && unis.length > 0,
    [interest, profile, unis]
  );

  const toggleUni = (u) => setUnis(p => p.includes(u) ? p.filter(x => x !== u) : [...p, u]);
  const addCustom = () => {
    const v = customUni.trim();
    if (!v) return;
    if (!unis.includes(v)) setUnis(p => [...p, v]);
    setCustomUni("");
  };

  const charCounter = (val, min) => {
    const len = val.trim().length;
    const ok = len >= min;
    return (
      <span style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5,
        letterSpacing: "0.08em",
        color: ok ? "var(--green)" : "var(--dim)",
      }}>
        {len}/{min}+ {ok ? "✓" : ""}
      </span>
    );
  };

  return (
    <div className="page-transition" style={{ maxWidth: 760, margin: "0 auto", padding: "64px 32px 96px" }}>

      {/* Header */}
      <div style={{ marginBottom: 48 }}>
        <span className="label-mono">§ Workspace · Setup</span>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif", fontWeight: 400,
          fontSize: "clamp(38px, 4.6vw, 56px)", lineHeight: 1.05,
          letterSpacing: "-0.012em", marginTop: 14, color: "var(--ink)",
        }}>
          Define your <em style={{ fontStyle: "italic", color: "var(--accent)" }}>search.</em>
        </h1>
        <p style={{ marginTop: 16, color: "var(--muted)", fontSize: 15.5, maxWidth: 560, lineHeight: 1.6 }}>
          A short paragraph about what you're working on, a short paragraph about you,
          and a list of places to look. Stellanet does the rest.
        </p>
      </div>

      {/* Form card */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--rule)",
        borderRadius: 8, padding: "40px 40px 32px",
        boxShadow: "0 1px 0 rgba(255,255,255,0.6) inset, 0 24px 40px -28px rgba(26,24,22,0.10)",
        display: "flex", flexDirection: "column", gap: 36,
      }}>

        {/* 01 — Research interest */}
        <Field
          label="01 — Research Interest"
          hint="Topic, methods, what you're trying to figure out. A paragraph is plenty."
          counter={charCounter(interest, 10)}
        >
          <textarea
            className="input-base"
            rows={4}
            value={interest}
            onChange={e => setInterest(e.target.value)}
            placeholder="e.g., Predictive coding and hierarchical inference in early visual cortex…"
            style={{ resize: "vertical" }}
          />
        </Field>

        {/* 02 — Short profile */}
        <Field
          label="02 — Your Short Profile"
          hint="Year, school, current work, what you're seeking. Used to personalize emails."
          counter={charCounter(profile, 10)}
        >
          <textarea
            className="input-base"
            rows={3}
            value={profile}
            onChange={e => setProfile(e.target.value)}
            placeholder="e.g., Junior at Michigan, working with Prof. Zhao on…"
            style={{ resize: "vertical" }}
          />
        </Field>

        {/* 03 — Universities */}
        <Field
          label="03 — Target Universities"
          hint="Pick from the list, or add your own. Six is a comfortable upper bound."
          counter={
            <span style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5,
              color: unis.length > 0 ? "var(--green)" : "var(--dim)", letterSpacing: "0.08em",
            }}>
              {unis.length} selected
            </span>
          }
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {DEFAULT_UNIS.map(u => (
              <button
                key={u}
                className={`chip${unis.includes(u) ? " active" : ""}`}
                onClick={() => toggleUni(u)}
              >
                {u}
                {unis.includes(u) && <span className="x">×</span>}
              </button>
            ))}
            {unis.filter(u => !DEFAULT_UNIS.includes(u)).map(u => (
              <button key={u} className="chip active" onClick={() => toggleUni(u)}>
                {u}<span className="x">×</span>
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <input
              className="input-base"
              value={customUni}
              onChange={e => setCustomUni(e.target.value)}
              onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCustom())}
              placeholder="Add another university…"
              style={{ flex: 1, fontSize: 13 }}
            />
            <button className="btn-ghost" onClick={addCustom} disabled={!customUni.trim()}>
              Add
            </button>
          </div>
        </Field>

        {/* Footer */}
        <div style={{
          borderTop: "1px solid var(--rule-soft)", paddingTop: 24,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 14,
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="label-mono">Draft only</span>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>No email is ever sent without your review.</span>
          </div>
          <button
            className="btn-primary"
            onClick={() => canRun && !loading && onRun({ interest: interest.trim(), profile: profile.trim(), universities: unis })}
            disabled={!canRun || loading}
          >
            {loading ? "Searching…" : "Run discovery"} <span style={{ display: "inline-block", transition: "transform 200ms" }}>→</span>
          </button>
        </div>
      </div>

      <p style={{ marginTop: 24, fontSize: 12.5, color: "var(--dim)", fontStyle: "italic", textAlign: "center" }}>
        Tip — the more specific your interest paragraph, the better the matches.
      </p>
    </div>
  );
}
