/* Light-theme shell parts */

export function Badge({ children, tone = "neutral" }) {
  const styles = {
    neutral: { background: "var(--accent-soft)", color: "var(--accent)", border: "1px solid var(--accent-soft)" },
    info:    { background: "var(--green-bg)",    color: "var(--green)",  border: "1px solid var(--green-bg)" },
  };
  return (
    <span style={{
      ...styles[tone],
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase",
      padding: "4px 10px", borderRadius: 999,
      display: "inline-flex", alignItems: "center", gap: 6,
    }}>
      {children}
    </span>
  );
}

export function DiscoveryLoadingOverlay({ show, message, step }) {
  if (!show) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 80,
      background: "rgba(246, 243, 236, 0.94)",
      backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 28,
      animation: "fadeIn 200ms",
    }}>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes pulse{50%{opacity:.4;transform:scale(.8)}}`}</style>

      {/* Rotating diamond mark */}
      <div style={{
        width: 40, height: 40,
        border: "1px solid var(--ink)",
        transform: "rotate(45deg)",
        position: "relative",
      }}>
        <div style={{
          position: "absolute", inset: 6,
          background: "var(--accent)",
          animation: "pulse 1.6s ease-in-out infinite",
        }} />
      </div>

      {/* Status text */}
      <div style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontStyle: "italic", fontSize: 26,
        color: "var(--ink-2)", textAlign: "center",
        maxWidth: 480, lineHeight: 1.3,
        transition: "opacity 240ms",
        key: message,
      }}>
        {message}
      </div>

      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10.5, letterSpacing: "0.18em",
        textTransform: "uppercase", color: "var(--dim)",
      }}>
        Step {step} of 3
      </div>
    </div>
  );
}

export function StartupFooter({ onNav, logoSrc }) {
  return (
    <footer style={{
      borderTop: "1px solid var(--rule-soft)",
      background: "var(--bg)",
      padding: "56px 32px 40px",
    }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 2fr", gap: 48, alignItems: "start" }}>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 18, color: "var(--ink-2)",
          maxWidth: 320, lineHeight: 1.45,
          fontStyle: "italic", fontWeight: 400,
        }}>
          A small tool for a slow, careful part of academic life — finding the people whose work makes yours possible.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 36 }}>
          {[
            {
              heading: "Product",
              links: [["Features", "home"], ["How it works", "home"], ["Workspace", "app"]],
            },
            {
              heading: "Company",
              links: [["About", "about"], ["Contact", "about"], ["Privacy", null], ["Terms", null]],
            },
            {
              heading: "Account",
              links: [["Sign In", "signin"], ["Sign Up", "signin"]],
            },
          ].map(({ heading, links }) => (
            <div key={heading}>
              <div className="label-mono" style={{ marginBottom: 14 }}>{heading}</div>
              {links.map(([label, target]) => (
                <button
                  key={label}
                  type="button"
                  onClick={target ? () => onNav(target) : undefined}
                  disabled={!target}
                  style={{
                    display: "block", background: "none", border: "none",
                    cursor: target ? "pointer" : "default",
                    fontSize: 14, color: "var(--ink-2)", padding: "4px 0",
                    fontFamily: "'Instrument Sans', sans-serif", textAlign: "left",
                    transition: "color 160ms", width: "100%",
                  }}
                  onMouseEnter={e => { if (target) e.currentTarget.style.color = "var(--accent)"; }}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--ink-2)"}
                >
                  {label}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={{
        maxWidth: 1180, margin: "56px auto 0", paddingTop: 22,
        borderTop: "1px solid var(--rule-soft)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
        color: "var(--dim)", letterSpacing: "0.06em",
      }}>
        <span>© {new Date().getFullYear()} Stellanet — made for the long-form internet.</span>
        <span>v0.4 · New York &amp; Cambridge</span>
      </div>
    </footer>
  );
}
