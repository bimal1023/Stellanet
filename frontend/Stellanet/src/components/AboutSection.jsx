const PILLARS = [
  { emoji: "🔬", label: "Grounded Discovery",    body: "Uses real publication data, citation signals, and OpenAlex affiliation records — no hallucinated faculty." },
  { emoji: "✍️", label: "Tone Rewriting",         body: "Generate Professional, Friendly, and Short email variants via Nova AI. One click to refresh each." },
  { emoji: "👤", label: "Human-in-the-loop",      body: "Every draft is reviewed by you before it leaves your screen. Stellanet is a drafting tool, not a sender." },
];

export default function AboutSection() {
  return (
    <div className="page-transition">

      {/* Hero */}
      <section style={{ background: "var(--bg)", padding: "80px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
            <div className="stagger-1">
              <span className="label-mono" style={{ color: "var(--coral)" }}>About Stellanet</span>
              <h2 className="section-title" style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)", marginTop: 14 }}>
                Academic outreach,<br />
                <span style={{ color: "var(--coral)" }}>reimagined.</span>
              </h2>
              <p style={{ marginTop: 20, fontSize: "1rem", color: "var(--text-muted)", lineHeight: 1.75, maxWidth: 480 }}>
                Stellanet is an AI-assisted academic outreach platform designed to help students
                connect with the right faculty members. We combine data-driven discovery with
                high-quality email drafting and clear human review before any message is sent.
              </p>
            </div>

            {/* Quote callout */}
            <div className="stagger-2" style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 20,
              padding: "36px 32px",
              borderLeft: "4px solid var(--coral)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
            }}>
              <div style={{ fontSize: "2.5rem", color: "var(--coral)", fontFamily: "'Syne', sans-serif", fontWeight: 800, lineHeight: 1, marginBottom: 16 }}>"</div>
              <p style={{ fontSize: "1.0625rem", color: "var(--text)", lineHeight: 1.7, fontStyle: "italic" }}>
                The best outreach emails are specific. Stellanet gives you the research signal
                to make them specific — and the drafting tools to make them polished.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section style={{ background: "var(--surface)", borderTop: "1px solid var(--border-sub)", padding: "72px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <span className="label-mono">What we offer</span>
            <h3 className="section-title" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", marginTop: 12 }}>
              Built different, on purpose.
            </h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {PILLARS.map(({ emoji, label, body }, i) => (
              <div
                key={label}
                className={`stagger-${i + 1}`}
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border-sub)",
                  borderRadius: 16,
                  padding: "32px 28px",
                  transition: "border-color 150ms, box-shadow 150ms, transform 150ms",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--coral-border)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(232,98,42,0.09)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-sub)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ fontSize: "2rem", marginBottom: 16 }}>{emoji}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1rem", color: "var(--text)", marginBottom: 10 }}>{label}</div>
                <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.7 }}>{body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
