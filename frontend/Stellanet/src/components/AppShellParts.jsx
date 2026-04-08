export function Badge({ children, tone = "neutral" }) {
  const styles = {
    neutral: { background: "var(--gold-bg)", color: "var(--gold)", border: "1px solid var(--border)" },
    info:    { background: "var(--green-bg)", color: "var(--green)", border: "1px solid rgba(82,224,124,0.2)" },
  };
  return (
    <span style={{ ...styles[tone], fontFamily: "'JetBrains Mono', monospace", fontSize: "0.625rem", letterSpacing: "0.12em", textTransform: "uppercase", padding: "3px 10px", borderRadius: "2px", display: "inline-flex", alignItems: "center" }}>
      {children}
    </span>
  );
}

export function DiscoveryLoadingOverlay({ show, message, step }) {
  if (!show) return null;
  const pct = Math.min(100, 18 + step * 27);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(12, 11, 9, 0.82)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: 420, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "6px", padding: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: "4px", background: "var(--gold-bg)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <div style={{ width: 16, height: 16, border: "2px solid var(--gold)", borderTopColor: "transparent", borderRadius: "50%" }} className="spin" />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text)" }}>Discovering your matches</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.625rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-dim)", marginTop: 2 }}>Step {step} of 3</div>
          </div>
        </div>
        <div style={{ marginTop: 20, height: "2px", background: "var(--border-sub)", borderRadius: "1px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "var(--gold)", borderRadius: "1px", transition: "width 500ms cubic-bezier(0.16,1,0.3,1)" }} />
        </div>
        <div style={{ marginTop: 16, padding: "12px 14px", background: "var(--surface-2)", border: "1px solid var(--border-sub)", borderRadius: "4px", fontFamily: "'Instrument Sans', sans-serif", fontSize: "0.8125rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8, minHeight: 44 }}>
          <span style={{ color: "var(--gold)", flexShrink: 0 }}>›</span>
          {message}
          <span style={{ display: "inline-flex", gap: 3, marginLeft: 4 }}>
            {[0, 150, 300].map(delay => (
              <span key={delay} style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--gold)", display: "inline-block", animation: `fadeIn 0.6s ${delay}ms ease-in-out infinite alternate` }} />
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}

export function StartupFooter({ onNav, logoSrc }) {
  return (
    <footer style={{ background: "var(--surface)", borderTop: "1px solid var(--border-sub)", padding: "48px 24px 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 40 }}>
          <div style={{ gridColumn: "span 2" }}>
            <img src={logoSrc} alt="Stellanet" style={{ height: 36, width: "auto", objectFit: "contain" }} />
            <p style={{ marginTop: 16, fontSize: "0.8125rem", color: "var(--text-muted)", lineHeight: 1.7, maxWidth: 340 }}>
              Built to help students and aspiring researchers connect with the right labs, with AI-assisted matching and polished outreach workflows.
            </p>
          </div>
          <div>
            <div className="label-mono" style={{ marginBottom: 14 }}>Product</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[["Home","home"],["About","about"],["Workspace","app"]].map(([label, target]) => (
                <button key={target} type="button" onClick={() => onNav(target)}
                  style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", fontSize: "0.8125rem", color: "var(--text-muted)", fontFamily: "'Instrument Sans', sans-serif", padding: 0, transition: "color 150ms" }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
                >{label}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="label-mono" style={{ marginBottom: 14 }}>Platform</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "0.8125rem", color: "var(--text-dim)" }}>
              <span>Human-in-the-loop drafts</span>
              <span>Evidence-based discovery</span>
              <span>Security-first workflow</span>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid var(--border-sub)", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.625rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-dim)" }}>© {new Date().getFullYear()} Stellanet. All rights reserved.</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.625rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-dim)" }}>Modern research outreach</span>
        </div>
      </div>
    </footer>
  );
}
