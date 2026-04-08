function Step({ id, label, activeStep }) {
  const active = activeStep === id;
  return (
    <span style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: "0.6875rem",
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: active ? "var(--gold)" : "var(--text-dim)",
      fontWeight: active ? 500 : 400,
      transition: "color 200ms",
    }}>
      {label}
    </span>
  );
}

export default function AppHeader({
  logoSrc, sitePage, currentUser, onSignOut,
  onOpenWorkspace, onGoHowItWorks, onSetSitePage, payload, appStepActive,
}) {
  return (
    <header>
      <div
        id="top-nav"
        style={{
          position: "sticky", top: 0, zIndex: 40,
          background: "rgba(12, 11, 9, 0.94)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border-sub)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 24px", height: "56px",
        }}
      >
        <button type="button" onClick={() => onSetSitePage("home")}
          style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer" }}>
          <img src={logoSrc} alt="Stellanet" style={{ height: 32, width: "auto", objectFit: "contain" }} />
        </button>

        <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {[{ id: "home", label: "Home" }, { id: "about", label: "About" }].map(({ id, label }) => (
            <button key={id} type="button" onClick={() => onSetSitePage(id)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "'Instrument Sans', sans-serif", fontSize: "0.8125rem", fontWeight: 500,
                padding: "6px 12px", borderRadius: "3px",
                color: sitePage === id ? "var(--text)" : "var(--text-muted)", transition: "color 150ms",
              }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
              onMouseLeave={e => e.currentTarget.style.color = sitePage === id ? "var(--text)" : "var(--text-muted)"}
            >{label}</button>
          ))}

          <button type="button" onClick={onGoHowItWorks}
            style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Instrument Sans', sans-serif", fontSize: "0.8125rem", fontWeight: 500, padding: "6px 12px", borderRadius: "3px", color: "var(--text-muted)", transition: "color 150ms" }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
          >How It Works</button>

          <div style={{ width: "1px", height: 18, background: "var(--border-sub)", margin: "0 8px" }} />

          {!currentUser ? (
            <button type="button" onClick={() => onSetSitePage("signin")}
              style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Instrument Sans', sans-serif", fontSize: "0.8125rem", fontWeight: 500, padding: "6px 12px", borderRadius: "3px", color: sitePage === "signin" ? "var(--gold)" : "var(--text-muted)", transition: "color 150ms" }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
              onMouseLeave={e => e.currentTarget.style.color = sitePage === "signin" ? "var(--gold)" : "var(--text-muted)"}
            >Sign In</button>
          ) : (
            <button type="button" onClick={onSignOut}
              style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Instrument Sans', sans-serif", fontSize: "0.8125rem", fontWeight: 500, padding: "6px 12px", borderRadius: "3px", color: "var(--text-muted)", transition: "color 150ms" }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
            >Sign Out</button>
          )}

          <button type="button" onClick={onOpenWorkspace} className="btn-primary" style={{ marginLeft: 4 }}>
            Workspace
          </button>
        </nav>
      </div>

      {sitePage === "app" && (
        <div style={{
          background: "var(--surface)", borderBottom: "1px solid var(--border)",
          padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Step id="setup"   label="Setup"   activeStep={appStepActive} />
            <span style={{ color: "var(--border)", fontFamily: "monospace", fontSize: "0.7rem" }}>›</span>
            <Step id="results" label="Results" activeStep={appStepActive} />
            <span style={{ color: "var(--border)", fontFamily: "monospace", fontSize: "0.7rem" }}>›</span>
            <Step id="draft"   label="Draft"   activeStep={appStepActive} />
          </div>
          {payload && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6875rem", color: "var(--text-dim)" }}>
              <span style={{ color: "var(--gold)", letterSpacing: "0.08em" }}>RUN</span>
              <span>{payload.universities.join(", ")}</span>
              <span style={{ color: "var(--border)" }}>·</span>
              <span>"{payload.interest.slice(0, 40)}{payload.interest.length > 40 ? "…" : ""}"</span>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
