import { Badge } from "./AppShellParts";

const STEPS = [
  { n: "01", label: "Set your target",      body: "Describe your research interest, your background, and the universities you're targeting." },
  { n: "02", label: "Review ranked matches", body: "AI ranks faculty by research alignment. See fit scores, why-bullets, and recent paper signals." },
  { n: "03", label: "Generate & refine",     body: "Draft emails in three tones — Professional, Friendly, Short — and iterate with one click." },
  { n: "04", label: "Send with confidence",  body: "You always review the draft before any message is sent. Human approval, always." },
];

export default function HomeSections({ onOpenWorkspace, onSetSitePage, contactForm, onContactInput, onContactSubmit, contactBusy, contactSubmitted, contactError }) {
  return (
    <div className="page-transition">

      {/* ── Hero ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "88px 24px 80px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
        <div className="stagger-1">
          <Badge tone="info">For students &amp; aspiring researchers</Badge>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(3rem, 6vw, 5rem)", fontWeight: 300, lineHeight: 1.05, letterSpacing: "-0.01em", color: "var(--text)", marginTop: 20 }}>
            Find the faculty<br />
            <em style={{ fontStyle: "italic", color: "var(--gold)" }}>aligned</em>{" "}
            with your research.
          </h1>
          <p style={{ marginTop: 24, fontSize: "1rem", color: "var(--text-muted)", lineHeight: 1.75, maxWidth: 440 }}>
            Stellanet discovers relevant professors from target universities, ranks research fit, and drafts personalized outreach emails — with you in control before anything is sent.
          </p>
          <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={onOpenWorkspace} style={{ fontSize: "0.875rem", padding: "10px 22px" }}>Start Discovery →</button>
            <button className="btn-ghost"   onClick={() => onSetSitePage("about")} style={{ fontSize: "0.875rem", padding: "10px 22px" }}>Learn more</button>
          </div>
        </div>

        <div className="stagger-2" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "36px 32px", display: "flex", flexDirection: "column", gap: 28 }}>
          {[
            { val: "AI-ranked", label: "Faculty discovery" },
            { val: "3 tones",   label: "Email draft variants" },
            { val: "100%",      label: "Human review before send" },
          ].map(({ val, label }) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.25rem", fontWeight: 400, color: "var(--gold)", lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{label}</div>
              <div style={{ height: "1px", background: "var(--border-sub)", marginTop: 4 }} />
            </div>
          ))}
        </div>
      </section>

      <div style={{ borderTop: "1px solid var(--border-sub)" }} />

      {/* ── How It Works ── */}
      <section id="how-it-works" style={{ maxWidth: 1100, margin: "0 auto", padding: "72px 24px", scrollMarginTop: 72 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 48 }}>
          <span className="label-mono">How it works</span>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 400, color: "var(--text)", marginTop: 8 }}>
            A focused 4-step outreach workflow
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 2 }}>
          {STEPS.map(({ n, label, body }, i) => (
            <div key={n} className={`stagger-${i + 1}`}
              style={{ background: "var(--surface)", border: "1px solid var(--border-sub)", padding: "28px 24px", transition: "border-color 150ms" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border-sub)"}
            >
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.625rem", letterSpacing: "0.15em", color: "var(--gold)", marginBottom: 14 }}>{n}</div>
              <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--text)", marginBottom: 10 }}>{label}</div>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", lineHeight: 1.65 }}>{body}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ borderTop: "1px solid var(--border-sub)" }} />

      {/* ── Contact ── */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 2fr", minHeight: 420 }}>
        <div style={{ background: "var(--surface-2)", borderRight: "1px solid var(--border-sub)", padding: "52px 36px" }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.25rem", fontWeight: 400, color: "var(--text)", lineHeight: 1.2, marginBottom: 32 }}>Get in Touch</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            <div>
              <div className="label-mono" style={{ marginBottom: 6 }}>Address</div>
              <div>Roosevelt Ave, 89th St.</div>
              <div>New York, NY 11372</div>
            </div>
            <div>
              <div className="label-mono" style={{ marginBottom: 6 }}>Contact</div>
              <div>917-XXX-6444</div>
              <div style={{ color: "var(--gold)", wordBreak: "break-all" }}>info@stellanetconnect.com</div>
            </div>
          </div>
          <div style={{ marginTop: 32, display: "flex", gap: 8 }}>
            {[
              <path key="fb" d="M13.5 8H15V5.5a18.7 18.7 0 0 0-2.2-.1c-2.2 0-3.8 1.4-3.8 4V12H6.5v3h2.5v6h3v-6h2.7l.4-3H12V9.7c0-.9.2-1.7 1.5-1.7Z" />,
              <path key="tw" d="M18.9 3H22l-6.8 7.8L23 21h-6.1l-4.8-6.3L6.6 21H3.5l7.3-8.4L3 3h6.2l4.3 5.8L18.9 3Zm-1.1 16h1.7L8.3 4.9H6.5L17.8 19Z" />,
              <path key="li" d="M6.9 8.7a1.8 1.8 0 1 1 0-3.7 1.8 1.8 0 0 1 0 3.7ZM5.3 9.9h3.2V20H5.3V9.9Zm5 0h3.1v1.4h.1c.4-.8 1.5-1.7 3.2-1.7 3.4 0 4 2.2 4 5.2V20h-3.2v-4.6c0-1.1 0-2.5-1.6-2.5s-1.8 1.2-1.8 2.4V20h-3.2V9.9Z" />,
              <path key="ig" d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 1.8a3.7 3.7 0 0 0-3.7 3.7v9a3.7 3.7 0 0 0 3.7 3.7h9a3.7 3.7 0 0 0 3.7-3.7v-9a3.7 3.7 0 0 0-3.7-3.7h-9Zm9.3 1.4a1.1 1.1 0 1 1 0 2.1 1.1 1.1 0 0 1 0-2.1ZM12 7.2A4.8 4.8 0 1 1 7.2 12 4.8 4.8 0 0 1 12 7.2Zm0 1.8a3 3 0 1 0 3 3 3 3 0 0 0-3-3Z" />,
            ].map((p, i) => (
              <span key={i} style={{ width: 30, height: 30, border: "1px solid var(--border-sub)", borderRadius: "3px", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--text-dim)", cursor: "pointer", transition: "border-color 150ms, color 150ms" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-sub)"; e.currentTarget.style.color = "var(--text-dim)"; }}
              >
                <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, fill: "currentColor" }}>{p}</svg>
              </span>
            ))}
          </div>
        </div>

        <div style={{ background: "var(--surface)", padding: "52px 48px" }}>
          <form onSubmit={onContactSubmit} style={{ maxWidth: 520 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label className="label-mono" style={{ display: "block", marginBottom: 8 }}>First Name</label>
                <input className="input-base" type="text" value={contactForm.first_name} onChange={e => onContactInput("first_name", e.target.value)} />
              </div>
              <div>
                <label className="label-mono" style={{ display: "block", marginBottom: 8 }}>Last Name</label>
                <input className="input-base" type="text" value={contactForm.last_name} onChange={e => onContactInput("last_name", e.target.value)} />
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <label className="label-mono" style={{ display: "block", marginBottom: 8 }}>Email *</label>
              <input className="input-base" type="email" required value={contactForm.email} onChange={e => onContactInput("email", e.target.value)} />
            </div>
            <div style={{ marginTop: 16 }}>
              <label className="label-mono" style={{ display: "block", marginBottom: 8 }}>Message</label>
              <textarea className="input-base" rows={5} value={contactForm.message} onChange={e => onContactInput("message", e.target.value)} style={{ resize: "vertical" }} />
            </div>
            <button type="submit" disabled={contactBusy} className="btn-primary" style={{ marginTop: 20, width: "100%", padding: "12px", fontSize: "0.875rem" }}>
              {contactBusy ? "Sending…" : "Send Message"}
            </button>
            {contactSubmitted && <div style={{ marginTop: 14, padding: "10px 14px", background: "var(--green-bg)", border: "1px solid rgba(82,224,124,0.2)", borderRadius: 3, fontSize: "0.8125rem", color: "var(--green)" }}>Message sent — we'll be in touch.</div>}
            {contactError    && <div style={{ marginTop: 14, padding: "10px 14px", background: "var(--red-bg)",   border: "1px solid rgba(255,107,107,0.2)", borderRadius: 3, fontSize: "0.8125rem", color: "var(--red)"   }}>{contactError}</div>}
          </form>
        </div>
      </section>
    </div>
  );
}
