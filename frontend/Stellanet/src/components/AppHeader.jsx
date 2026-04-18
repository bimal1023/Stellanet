/* Light-theme nav matching the workspace design */

const logoMark = (
  <span aria-hidden="true" style={{
    display: "inline-block", width: 9, height: 9,
    border: "1px solid var(--ink)", transform: "rotate(45deg)",
    marginRight: 8, position: "relative", top: 1, flexShrink: 0,
    background: `linear-gradient(to bottom right, transparent 50%, var(--accent) 50%)`,
  }} />
);

export default function AppHeader({
  logoSrc, sitePage, currentUser, onSignOut,
  onOpenWorkspace, onGoHowItWorks, onSetSitePage, payload, appStepActive,
}) {
  return (
    <header>
      {/* ── Primary nav ── */}
      <div
        id="top-nav"
        style={{
          position: "sticky", top: 0, zIndex: 40,
          background: "rgba(246, 243, 236, 0.88)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderBottom: "1px solid var(--rule-soft)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 32px", height: 64,
        }}
      >
        {/* Logo */}
        <button type="button" onClick={() => onSetSitePage("home")}
          style={{ background: "none", border: "none", cursor: "pointer",
            display: "inline-flex", alignItems: "baseline", gap: 4,
            fontFamily: "'Cormorant Garamond', serif", fontWeight: 500,
            fontSize: 22, letterSpacing: "-0.01em", color: "var(--ink)",
          }}
        >
          {logoMark}
          Stellanet
        </button>

        {/* Nav right */}
        <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {[
            { label: "Home",         action: () => onSetSitePage("home") },
            { label: "How it works", action: onGoHowItWorks },
            { label: "About",        action: () => onSetSitePage("about") },
          ].map(({ label, action }) => (
            <button key={label} type="button" onClick={action}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "8px 14px", fontSize: 13.5, fontWeight: 500,
                fontFamily: "'Instrument Sans', sans-serif",
                color: "var(--muted)", transition: "color 160ms", borderRadius: 4,
              }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--ink)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--muted)"}
            >
              {label}
            </button>
          ))}

          <span style={{ width: 1, height: 18, background: "var(--rule)", margin: "0 8px" }} />

          {!currentUser ? (
            <button type="button" onClick={() => onSetSitePage("signin")}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "8px 14px", fontSize: 13.5, fontWeight: 500,
                fontFamily: "'Instrument Sans', sans-serif",
                color: sitePage === "signin" ? "var(--accent)" : "var(--muted)",
                transition: "color 160ms", borderRadius: 4,
              }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--ink)"}
              onMouseLeave={e => e.currentTarget.style.color = sitePage === "signin" ? "var(--accent)" : "var(--muted)"}
            >
              Login
            </button>
          ) : (
            <>
              <span style={{ padding: "8px 14px", fontSize: 13.5, color: "var(--ink-2)", fontWeight: 500 }}>
                {currentUser.full_name?.split(" ")[0] || currentUser.email}
              </span>
              <button type="button" onClick={onSignOut}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  padding: "8px 14px", fontSize: 13.5, fontWeight: 500,
                  fontFamily: "'Instrument Sans', sans-serif",
                  color: "var(--muted)", transition: "color 160ms", borderRadius: 4,
                }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--ink)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--muted)"}
              >
                Sign out
              </button>
            </>
          )}

          <button type="button" onClick={onOpenWorkspace}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "9px 16px", borderRadius: 4,
              border: "1px solid var(--ink)", background: "var(--ink)",
              color: "var(--bg)", fontSize: 13, fontWeight: 500, cursor: "pointer",
              fontFamily: "'Instrument Sans', sans-serif",
              transition: "background 160ms", marginLeft: 4,
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--ink-2)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--ink)"}
          >
            Open Workspace →
          </button>
        </nav>
      </div>

      {/* ── Workspace sub-nav (breadcrumb) ── */}
      {sitePage === "app" && (
        <div style={{
          background: "var(--bg-2)", borderBottom: "1px solid var(--rule-soft)",
        }}>
          <div style={{
            maxWidth: 1280, margin: "0 auto", padding: "12px 32px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 12,
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase",
            }}>
              {[
                { id: "setup",   label: "Setup" },
                { id: "results", label: "Results" },
                { id: "draft",   label: "Draft" },
              ].map(({ id, label }, i) => (
                <span key={id} style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  {i > 0 && <span style={{ color: "var(--rule)", fontSize: 12 }}>›</span>}
                  <span style={{
                    color: appStepActive === id ? "var(--ink)" : "var(--dim)",
                    fontWeight: appStepActive === id ? 500 : 400,
                    transition: "color 200ms",
                  }}>
                    {label}
                  </span>
                </span>
              ))}
            </div>
            {payload && (
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5,
                color: "var(--dim)", letterSpacing: "0.06em",
              }}>
                <span style={{ color: "var(--accent)", fontWeight: 500 }}>RUN</span>
                {" "}{(payload.universities || []).slice(0, 3).join(", ")}
                {(payload.universities || []).length > 3 ? " +more" : ""}
                {" · "}"{(payload.interest || "").slice(0, 48)}{(payload.interest || "").length > 48 ? "…" : ""}"
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
