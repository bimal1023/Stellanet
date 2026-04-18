import { useEffect, useRef } from "react";

/* ─── CSS custom properties for the light landing theme ─── */
const THEME = {
  "--lp-bg":         "#F6F3EC",
  "--lp-bg2":        "#EFEAE0",
  "--lp-surface":    "#FBFAF6",
  "--lp-ink":        "#1A1816",
  "--lp-ink2":       "#3B3833",
  "--lp-muted":      "#6B655C",
  "--lp-dim":        "#9A938A",
  "--lp-rule":       "rgba(26, 24, 22, 0.10)",
  "--lp-rule-soft":  "rgba(26, 24, 22, 0.06)",
  "--lp-accent":     "oklch(0.45 0.06 235)",
  "--lp-accent-soft":"oklch(0.45 0.06 235 / 0.10)",
  "--lp-green":      "oklch(0.55 0.05 165)",
};

/* ─── Shared style helpers ─── */
const S = {
  labelMono: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "var(--lp-dim)",
    fontWeight: 400,
  },
  serif: { fontFamily: "'Cormorant Garamond', serif" },
};

/* ─── Reveal-on-scroll hook ─── */
function useReveal(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.style.opacity = "1"; el.style.transform = "none"; io.unobserve(el); } },
      { threshold: 0.10 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
}

function Reveal({ children, style, ...rest }) {
  const ref = useRef(null);
  useReveal(ref);
  return (
    <div
      ref={ref}
      style={{
        opacity: 0,
        transform: "translateY(12px)",
        transition: "opacity 700ms ease, transform 700ms cubic-bezier(.2,.8,.2,1)",
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   NAV
══════════════════════════════════════════════════════════════ */
function LandingNav({ onOpenWorkspace, onSetSitePage, onScrollTo }) {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 30,
      background: "rgba(246, 243, 236, 0.88)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      borderBottom: "1px solid var(--lp-rule-soft)",
    }}>
      <div style={{
        maxWidth: 1180, margin: "0 auto", padding: "0 32px",
        height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <button
          type="button"
          onClick={() => onSetSitePage("home")}
          style={{
            background: "none", border: "none", cursor: "pointer",
            display: "inline-flex", alignItems: "baseline", gap: 8,
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 500, fontSize: 22, letterSpacing: "-0.01em",
            color: "var(--lp-ink)",
          }}
        >
          <span style={{
            display: "inline-flex", alignItems: "center", marginRight: 6,
          }}>
            <span style={{
              display: "inline-block", width: 9, height: 9,
              border: "1px solid var(--lp-ink)",
              transform: "rotate(45deg)",
              position: "relative", top: -2,
              background: `linear-gradient(to bottom right, transparent 50%, var(--lp-accent) 50%)`,
            }} />
          </span>
          Stellanet
        </button>

        {/* Nav links */}
        <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {[
            { label: "Home",         action: () => onSetSitePage("home") },
            { label: "How it works", action: () => onScrollTo("how") },
            { label: "About",        action: () => onScrollTo("about") },
            { label: "Contact",      action: () => onScrollTo("contact") },
          ].map(({ label, action }) => (
            <button
              key={label}
              type="button"
              onClick={action}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "8px 14px", fontSize: 13.5, fontWeight: 500,
                fontFamily: "'Instrument Sans', sans-serif",
                color: "var(--lp-muted)", transition: "color 160ms",
                borderRadius: 4,
              }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--lp-ink)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--lp-muted)"}
            >
              {label}
            </button>
          ))}

          <span style={{ width: 1, height: 18, background: "var(--lp-rule)", margin: "0 8px" }} />

          <button
            type="button"
            onClick={() => onSetSitePage("signin")}
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "8px 14px", fontSize: 13.5, fontWeight: 500,
              fontFamily: "'Instrument Sans', sans-serif",
              color: "var(--lp-muted)", transition: "color 160ms", borderRadius: 4,
            }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--lp-ink)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--lp-muted)"}
          >
            Login
          </button>

          <button
            type="button"
            onClick={onOpenWorkspace}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "9px 16px", borderRadius: 4,
              border: "1px solid var(--lp-ink)",
              background: "var(--lp-ink)", color: "var(--lp-bg)",
              fontSize: 13, fontWeight: 500, cursor: "pointer",
              fontFamily: "'Instrument Sans', sans-serif",
              transition: "background 160ms",
              marginLeft: 4,
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--lp-ink2)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--lp-ink)"}
          >
            Open Workspace <span style={{ transition: "transform 200ms", display: "inline-block" }}>→</span>
          </button>
        </nav>
      </div>
    </header>
  );
}

/* ══════════════════════════════════════════════════════════════
   HERO — mock match card
══════════════════════════════════════════════════════════════ */
function MockCard({ ctaRef, onOpenWorkspace }) {
  const mockRef = useRef(null);
  useEffect(() => {
    const cta = ctaRef?.current;
    const mock = mockRef.current;
    if (!cta || !mock) return;
    const enter = () => { mock.style.transform = "rotate(0deg) translateY(-3px)"; };
    const leave = () => { mock.style.transform = ""; };
    cta.addEventListener("mouseenter", enter);
    cta.addEventListener("mouseleave", leave);
    return () => { cta.removeEventListener("mouseenter", enter); cta.removeEventListener("mouseleave", leave); };
  }, [ctaRef]);

  return (
    <div style={{ position: "relative", paddingTop: 8 }}>
      <div style={{ ...S.labelMono, position: "absolute", top: -4, left: -8 }}>
        A match, in detail
      </div>

      {/* peeking card behind */}
      <div style={{
        position: "absolute", inset: "28px -14px auto auto",
        width: "84%", height: "60%",
        background: "var(--lp-bg2)", border: "1px solid var(--lp-rule)",
        borderRadius: 8, transform: "rotate(2.2deg)", zIndex: 0, opacity: 0.6,
      }} />

      <article
        ref={mockRef}
        style={{
          marginTop: 22, position: "relative", zIndex: 1,
          background: "var(--lp-surface)",
          border: "1px solid var(--lp-rule)", borderRadius: 8,
          boxShadow: "0 1px 0 rgba(255,255,255,0.6) inset, 0 24px 40px -28px rgba(26,24,22,0.18), 0 2px 6px -2px rgba(26,24,22,0.05)",
          padding: "22px 22px 20px",
          transform: "rotate(-0.6deg)",
          transition: "transform 400ms cubic-bezier(.2,.7,.2,1)",
          cursor: "default",
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "rotate(0deg) translateY(-2px)"}
        onMouseLeave={e => e.currentTarget.style.transform = "rotate(-0.6deg)"}
      >
        {/* Head */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, borderBottom: "1px solid var(--lp-rule-soft)", paddingBottom: 16 }}>
          <div>
            <div style={{ ...S.serif, fontSize: 22, lineHeight: 1.15, fontWeight: 500, color: "var(--lp-ink)", letterSpacing: "-0.005em" }}>
              Prof. Lena Marchetti
            </div>
            <div style={{ fontSize: 12.5, color: "var(--lp-muted)", marginTop: 4 }}>
              <em>Computational Neuroscience</em> · Stanford
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ ...S.serif, fontSize: 30, fontWeight: 500, lineHeight: 1, color: "var(--lp-accent)" }}>0.91</div>
            <div style={{ ...S.labelMono, marginTop: 4 }}>Fit score</div>
          </div>
        </div>

        {/* Why bullets */}
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 9 }}>
          {[
            "Recent work on predictive coding in visual cortex overlaps with your stated interest.",
            "Active grant on neural population dynamics — accepting rotation students.",
            "Three co-authored papers with researchers at your home lab.",
          ].map((text, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "14px 1fr", gap: 10, fontSize: 13, lineHeight: 1.5, color: "var(--lp-ink2)" }}>
              <span style={{ marginTop: 7, width: 5, height: 5, borderRadius: "50%", background: "var(--lp-accent)", opacity: 0.55 }} />
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px dashed var(--lp-rule)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ fontSize: 12, color: "var(--lp-muted)", lineHeight: 1.5, maxWidth: "64%" }}>
            <em>Hierarchical inference shapes V1 responses to ambiguous motion</em>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "var(--lp-dim)", marginLeft: 6 }}>2025</span>
          </div>
          <button
            type="button"
            onClick={onOpenWorkspace}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--lp-accent)", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", fontFamily: "'Instrument Sans', sans-serif", padding: 0 }}
          >
            Draft email →
          </button>
        </div>
      </article>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   HERO SECTION
══════════════════════════════════════════════════════════════ */
function HeroSection({ onOpenWorkspace, onScrollTo }) {
  const ctaRef = useRef(null);

  return (
    <section style={{
      maxWidth: 1180, margin: "0 auto", padding: "96px 32px 72px",
      display: "grid", gridTemplateColumns: "7fr 5fr", gap: 72, alignItems: "start",
    }}>
      <div>
        {/* Eyebrow */}
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          padding: "5px 11px 5px 8px",
          border: "1px solid var(--lp-rule)", borderRadius: 999,
          background: "var(--lp-surface)",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase",
          color: "var(--lp-muted)",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--lp-accent)", boxShadow: "0 0 0 3px var(--lp-accent-soft)" }} />
          For students &amp; aspiring researchers
        </span>

        {/* Headline */}
        <h1 style={{
          ...S.serif, fontWeight: 400,
          fontSize: "clamp(48px, 6.4vw, 84px)",
          lineHeight: 1.02, letterSpacing: "-0.018em",
          color: "var(--lp-ink)", marginTop: 28,
        }}>
          Better research<br />
          starts with the{" "}
          <em style={{ fontStyle: "italic", fontWeight: 400, color: "var(--lp-accent)", position: "relative" }}>
            right
          </em>
          <br />conversation.
        </h1>

        {/* Lede */}
        <p style={{ marginTop: 28, maxWidth: 520, fontSize: 17, lineHeight: 1.6, color: "var(--lp-ink2)" }}>
          Stellanet helps undergraduates and early-career researchers find faculty whose work actually matches their interests — and write a first email that reads like it was meant for one person, because it was.
        </p>

        {/* CTAs */}
        <div style={{ marginTop: 36, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <button
            ref={ctaRef}
            type="button"
            onClick={onOpenWorkspace}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "9px 16px", borderRadius: 4,
              border: "1px solid var(--lp-ink)",
              background: "var(--lp-ink)", color: "var(--lp-bg)",
              fontSize: 13, fontWeight: 500, cursor: "pointer",
              fontFamily: "'Instrument Sans', sans-serif",
              transition: "background 160ms",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--lp-ink2)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--lp-ink)"}
          >
            Start exploring →
          </button>

          <button
            type="button"
            onClick={() => onScrollTo("how")}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "9px 16px", borderRadius: 4,
              border: "1px solid var(--lp-rule)",
              background: "transparent", color: "var(--lp-ink)",
              fontSize: 13, fontWeight: 500, cursor: "pointer",
              fontFamily: "'Instrument Sans', sans-serif",
              transition: "border-color 160ms",
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "var(--lp-ink)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--lp-rule)"}
          >
            See how it works →
          </button>
        </div>

        {/* Trust note */}
        <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--lp-dim)", letterSpacing: "0.04em" }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 6.5L4.6 9 10 3.5" stroke="var(--lp-green)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          No emails sent without your review.
        </div>
      </div>

      {/* Mock card */}
      <MockCard ctaRef={ctaRef} onOpenWorkspace={onOpenWorkspace} />
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   FEATURES SECTION
══════════════════════════════════════════════════════════════ */
const FEATURES = [
  {
    num: "01",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="14" cy="14" r="7" stroke="currentColor" strokeWidth="1.4" />
        <line x1="19.5" y1="19.5" x2="25" y2="25" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="11" cy="11" r="0.9" fill="currentColor" />
        <circle cx="14" cy="14" r="0.9" fill="currentColor" />
        <circle cx="17" cy="11" r="0.9" fill="currentColor" />
        <circle cx="11" cy="17" r="0.9" fill="currentColor" />
      </svg>
    ),
    title: "Discover relevant professors",
    body: "Pulls from real publication and affiliation data — not name lists. You see who is actually publishing in your space, today.",
  },
  {
    num: "02",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M6 8h6M6 12h10M6 16h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M19 8h7M19 12h4M19 16h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M16 6v20" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 3" />
        <circle cx="16" cy="22" r="1.5" fill="currentColor" />
      </svg>
    ),
    title: "Evaluate research alignment",
    body: "Every match comes with reasoning — the papers, themes, and signals behind the score. You decide if it's a real fit.",
  },
  {
    num: "03",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="5" y="9" width="18" height="13" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M5.5 10l8.5 6.5L22.5 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 21l5-5 1.5 1.5-5 5H21z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="var(--lp-bg)" />
      </svg>
    ),
    title: "Generate personalized emails",
    body: "Drafts cite specific work and your background. Three tone options. You always read it before anything is sent.",
  },
];

function FeaturesSection() {
  return (
    <Reveal>
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "88px 32px" }} id="features">
        {/* Section head */}
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 60, marginBottom: 56, alignItems: "end" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 12 }}>
            <span style={S.labelMono}>§ 01 / What it does</span>
            <p style={{ fontSize: 13.5, color: "var(--lp-muted)", maxWidth: 220, lineHeight: 1.55 }}>
              Three jobs, done well — instead of twelve done loosely.
            </p>
          </div>
          <h2 style={{ ...S.serif, fontWeight: 400, fontSize: "clamp(34px, 4.2vw, 52px)", lineHeight: 1.05, letterSpacing: "-0.012em", color: "var(--lp-ink)" }}>
            Read less. Reach out <em style={{ fontStyle: "italic", color: "var(--lp-accent)" }}>better.</em>
          </h2>
        </div>

        {/* Feature grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "var(--lp-rule-soft)", borderTop: "1px solid var(--lp-rule-soft)", borderBottom: "1px solid var(--lp-rule-soft)" }}>
          {FEATURES.map(({ num, icon, title, body }) => (
            <div
              key={num}
              style={{ background: "var(--lp-bg)", padding: "36px 32px 40px", display: "flex", flexDirection: "column", gap: 16, transition: "background 200ms" }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--lp-surface)"}
              onMouseLeave={e => e.currentTarget.style.background = "var(--lp-bg)"}
            >
              <div style={S.labelMono}>{num}</div>
              <div style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--lp-ink)" }}>
                {icon}
              </div>
              <h3 style={{ ...S.serif, fontWeight: 500, fontSize: 24, lineHeight: 1.15, color: "var(--lp-ink)", letterSpacing: "-0.005em" }}>
                {title}
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--lp-muted)", maxWidth: "36ch" }}>{body}</p>
            </div>
          ))}
        </div>
      </section>
    </Reveal>
  );
}

/* ══════════════════════════════════════════════════════════════
   HOW IT WORKS
══════════════════════════════════════════════════════════════ */
const STEPS = [
  {
    num: "1", tag: "Step 01", title: "Enter your research interests.",
    body: "A short paragraph is enough. Add target universities and a little about your background.",
    vis: <><span style={{ color: "var(--lp-dim)" }}>→</span><span>predictive coding, vision<BlinkCursor /></span></>,
  },
  {
    num: "2", tag: "Step 02", title: "Get matched professors, ranked.",
    body: "See fit scores with the reasoning behind them — recent papers, shared topics, lab activity.",
    vis: <><span style={{ color: "var(--lp-dim)" }}>12 matches</span><span style={{ color: "var(--lp-rule)" }}>·</span><span style={{ color: "var(--lp-accent)" }}>0.91 top fit</span></>,
  },
  {
    num: "3", tag: "Step 03", title: "Generate & refine your outreach.",
    body: "A first draft per match — citing their work, in your voice. Edit, retone, then send when you're ready.",
    vis: <><span style={{ color: "var(--lp-dim)" }}>tone:</span><span>professional · friendly · short</span></>,
  },
];

function BlinkCursor() {
  return (
    <span style={{
      display: "inline-block", width: 1, height: 12, background: "var(--lp-accent)",
      animation: "lp-blink 1.1s steps(2) infinite", marginLeft: 1,
    }} />
  );
}

function HowSection() {
  return (
    <Reveal>
      <section id="how" style={{ background: "var(--lp-bg2)", borderTop: "1px solid var(--lp-rule-soft)", borderBottom: "1px solid var(--lp-rule-soft)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "96px 32px 104px" }}>
          {/* Section head */}
          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 60, marginBottom: 64, alignItems: "end" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 12 }}>
              <span style={S.labelMono}>§ 02 / How it works</span>
              <p style={{ fontSize: 13.5, color: "var(--lp-muted)", maxWidth: 220, lineHeight: 1.55 }}>
                From a sentence about your interests to an email worth sending — usually in under ten minutes.
              </p>
            </div>
            <h2 style={{ ...S.serif, fontWeight: 400, fontSize: "clamp(34px, 4.2vw, 52px)", lineHeight: 1.05, letterSpacing: "-0.012em", color: "var(--lp-ink)" }}>
              Three steps. <em style={{ fontStyle: "italic", color: "var(--lp-accent)" }}>No</em> spray-and-pray.
            </h2>
          </div>

          {/* Steps */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
            {STEPS.map(({ num, tag, title, body, vis }, i) => (
              <div key={num} style={{ position: "relative", padding: i === 0 ? "28px 36px 32px 0" : "28px 36px 32px 36px", borderLeft: i > 0 ? "1px solid var(--lp-rule)" : "none" }}>
                <div style={{ ...S.serif, fontStyle: "italic", fontSize: 56, fontWeight: 400, lineHeight: 1, color: "var(--lp-accent)", opacity: 0.85 }}>
                  {num}
                </div>
                <div style={{ ...S.labelMono, marginTop: 18, marginBottom: 8 }}>{tag}</div>
                <h4 style={{ ...S.serif, fontWeight: 500, fontSize: 26, lineHeight: 1.18, color: "var(--lp-ink)", letterSpacing: "-0.005em" }}>
                  {title}
                </h4>
                <p style={{ marginTop: 12, fontSize: 14, lineHeight: 1.62, color: "var(--lp-muted)", maxWidth: "32ch" }}>{body}</p>
                <div style={{
                  marginTop: 22, fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
                  color: "var(--lp-ink2)", background: "var(--lp-surface)",
                  border: "1px solid var(--lp-rule)", padding: "10px 12px",
                  borderRadius: 4, display: "inline-flex", alignItems: "center", gap: 8,
                }}>
                  {vis}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Reveal>
  );
}

/* ══════════════════════════════════════════════════════════════
   QUOTE
══════════════════════════════════════════════════════════════ */
function QuoteSection() {
  return (
    <Reveal>
      <section style={{ maxWidth: 980, margin: "0 auto", padding: "96px 32px", display: "grid", gridTemplateColumns: "60px 1fr", gap: 28, alignItems: "start" }}>
        <div style={{ ...S.serif, fontSize: 96, lineHeight: 0.7, color: "var(--lp-accent)", fontStyle: "italic", opacity: 0.55, userSelect: "none" }}>
          "
        </div>
        <div>
          <blockquote style={{ ...S.serif, fontWeight: 300, fontStyle: "italic", fontSize: "clamp(24px, 2.8vw, 34px)", lineHeight: 1.32, color: "var(--lp-ink)", letterSpacing: "-0.005em" }}>
            Most cold emails fail not because the student is unqualified, but because the professor can tell, in two sentences, that nobody read their work. Stellanet is built around fixing exactly that.
          </blockquote>
          <div style={{ marginTop: 22, ...S.labelMono }}>
            — <strong style={{ color: "var(--lp-ink2)", fontWeight: 500 }}>Notes on the design</strong> · Stellanet, 2026
          </div>
        </div>
      </section>
    </Reveal>
  );
}

/* ══════════════════════════════════════════════════════════════
   GET IN TOUCH
══════════════════════════════════════════════════════════════ */
function ContactSection({ contactForm, onContactInput, onContactSubmit, contactBusy, contactSubmitted, contactError }) {
  return (
    <Reveal>
      <section id="contact" style={{ background: "var(--lp-bg2)", borderTop: "1px solid var(--lp-rule-soft)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "96px 32px 104px", display: "grid", gridTemplateColumns: "5fr 7fr", gap: 80, alignItems: "start" }}>

          {/* Left — context */}
          <div>
            <span style={S.labelMono}>§ 04 / Get in touch</span>
            <h2 style={{ ...S.serif, fontWeight: 400, fontSize: "clamp(34px, 4.0vw, 52px)", lineHeight: 1.05, letterSpacing: "-0.012em", color: "var(--lp-ink)", marginTop: 18 }}>
              Questions?<br /><em style={{ fontStyle: "italic", color: "var(--lp-accent)" }}>We read every one.</em>
            </h2>
            <p style={{ marginTop: 20, fontSize: 15, lineHeight: 1.65, color: "var(--lp-muted)", maxWidth: "38ch" }}>
              Whether you're a student with a use-case question, a researcher with feedback, or someone who just wants to say something — the inbox is open.
            </p>
            <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "General", value: "info@stellanetconnect.com" },
                { label: "Response time", value: "Usually within 48 h" },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 12, alignItems: "baseline" }}>
                  <span style={{ ...S.labelMono, fontSize: 10 }}>{label}</span>
                  <span style={{ fontSize: 13.5, color: "var(--lp-ink2)", fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div style={{ background: "var(--lp-surface)", border: "1px solid var(--lp-rule)", borderRadius: 8, padding: "36px 36px 32px", boxShadow: "0 1px 0 rgba(255,255,255,0.6) inset, 0 24px 40px -28px rgba(26,24,22,0.10)" }}>
            {contactSubmitted ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ width: 40, height: 40, border: "1px solid var(--lp-ink)", transform: "rotate(45deg)", margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 10, height: 10, background: "var(--lp-accent)", transform: "rotate(45deg)" }} />
                </div>
                <p style={{ ...S.serif, fontStyle: "italic", fontSize: 22, color: "var(--lp-ink)", lineHeight: 1.3 }}>Message received.</p>
                <p style={{ marginTop: 10, fontSize: 14, color: "var(--lp-muted)" }}>We'll be in touch within 48 hours.</p>
              </div>
            ) : (
              <form onSubmit={onContactSubmit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {[
                    { key: "first_name", label: "First name", placeholder: "Ada" },
                    { key: "last_name",  label: "Last name",  placeholder: "Lovelace" },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label style={{ ...S.labelMono, fontSize: 10, display: "block", marginBottom: 8 }}>{label}</label>
                      <input
                        className="input-base"
                        value={contactForm?.[key] || ""}
                        onChange={e => onContactInput(key, e.target.value)}
                        placeholder={placeholder}
                        style={{ fontSize: 13.5, width: "100%", boxSizing: "border-box" }}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label style={{ ...S.labelMono, fontSize: 10, display: "block", marginBottom: 8 }}>Email address</label>
                  <input
                    className="input-base"
                    type="email"
                    required
                    value={contactForm?.email || ""}
                    onChange={e => onContactInput("email", e.target.value)}
                    placeholder="ada@mit.edu"
                    style={{ fontSize: 13.5, width: "100%", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ ...S.labelMono, fontSize: 10, display: "block", marginBottom: 8 }}>Message</label>
                  <textarea
                    className="input-base"
                    required
                    rows={5}
                    value={contactForm?.message || ""}
                    onChange={e => onContactInput("message", e.target.value)}
                    placeholder="What's on your mind?"
                    style={{ fontSize: 13.5, width: "100%", boxSizing: "border-box", resize: "vertical" }}
                  />
                </div>

                {contactError && (
                  <p style={{ fontSize: 12.5, color: "var(--lp-accent)", fontFamily: "'JetBrains Mono', monospace" }}>
                    {contactError}
                  </p>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="submit"
                    disabled={contactBusy}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "10px 20px", borderRadius: 4,
                      border: "1px solid var(--lp-ink)",
                      background: contactBusy ? "var(--lp-bg2)" : "var(--lp-ink)",
                      color: contactBusy ? "var(--lp-muted)" : "var(--lp-bg)",
                      fontSize: 13, fontWeight: 500, cursor: contactBusy ? "default" : "pointer",
                      fontFamily: "'Instrument Sans', sans-serif",
                      transition: "background 160ms, color 160ms",
                    }}
                    onMouseEnter={e => { if (!contactBusy) e.currentTarget.style.background = "var(--lp-ink2)"; }}
                    onMouseLeave={e => { if (!contactBusy) e.currentTarget.style.background = "var(--lp-ink)"; }}
                  >
                    {contactBusy ? "Sending…" : "Send message →"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </Reveal>
  );
}

/* ══════════════════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════════════════ */
function LandingFooter({ onOpenWorkspace, onSetSitePage, onScrollTo }) {
  return (
    <footer id="about" style={{ borderTop: "1px solid var(--lp-rule-soft)", background: "var(--lp-bg)", padding: "56px 32px 40px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 2fr", gap: 48, alignItems: "start" }}>
        <div style={{ ...S.serif, fontSize: 18, color: "var(--lp-ink2)", maxWidth: 320, lineHeight: 1.45, fontStyle: "italic", fontWeight: 400 }}>
          A small tool for a slow, careful part of academic life — finding the people whose work makes yours possible.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 36 }}>
          {[
            {
              heading: "Product",
              links: [
                { label: "Features", action: () => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }) },
                { label: "How it works", action: () => onScrollTo("how") },
                { label: "Workspace", action: onOpenWorkspace },
              ],
            },
            {
              heading: "Company",
              links: [
                { label: "About", action: () => onScrollTo("about") },
                { label: "Contact", action: () => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }) },
                { label: "Privacy", action: null },
                { label: "Terms", action: null },
              ],
            },
            {
              heading: "Account",
              links: [
                { label: "Sign In", action: () => onSetSitePage("signin") },
                { label: "Sign Up", action: () => onSetSitePage("signin") },
                { label: "Status", action: null },
              ],
            },
          ].map(({ heading, links }) => (
            <div key={heading}>
              <h5 style={{ ...S.labelMono, marginBottom: 14 }}>{heading}</h5>
              {links.map(({ label, action }) => (
                <button
                  key={label}
                  type="button"
                  onClick={action || undefined}
                  disabled={!action}
                  style={{
                    display: "block", background: "none", border: "none", cursor: action ? "pointer" : "default",
                    fontSize: 14, color: "var(--lp-ink2)", padding: "4px 0",
                    fontFamily: "'Instrument Sans', sans-serif", textAlign: "left",
                    transition: "color 160ms", width: "100%",
                  }}
                  onMouseEnter={e => { if (action) e.currentTarget.style.color = "var(--lp-accent)"; }}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--lp-ink2)"}
                >
                  {label}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: "56px auto 0", paddingTop: 22, borderTop: "1px solid var(--lp-rule-soft)", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--lp-dim)", letterSpacing: "0.06em" }}>
        <span>© 2026 Stellanet — made for the long-form internet.</span>
        <span>v0.4 · New York &amp; Cambridge</span>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════════════
   ROOT EXPORT
══════════════════════════════════════════════════════════════ */
export default function HomeSections({ onOpenWorkspace, onSetSitePage, contactForm, onContactInput, onContactSubmit, contactBusy, contactSubmitted, contactError }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ ...THEME, background: "var(--lp-bg)", color: "var(--lp-ink)", fontFamily: "'Instrument Sans', ui-sans-serif, system-ui, sans-serif", minHeight: "100vh" }}>
      {/* blink keyframe injected once */}
      <style>{`@keyframes lp-blink { 50% { opacity: 0; } }`}</style>

      <LandingNav onOpenWorkspace={onOpenWorkspace} onSetSitePage={onSetSitePage} onScrollTo={scrollTo} />

      <HeroSection onOpenWorkspace={onOpenWorkspace} onScrollTo={scrollTo} />

      <div style={{ borderTop: "1px solid var(--lp-rule-soft)" }} />

      <FeaturesSection />

      <HowSection />

      <QuoteSection />

      <ContactSection
        contactForm={contactForm}
        onContactInput={onContactInput}
        onContactSubmit={onContactSubmit}
        contactBusy={contactBusy}
        contactSubmitted={contactSubmitted}
        contactError={contactError}
      />

      <LandingFooter onOpenWorkspace={onOpenWorkspace} onSetSitePage={onSetSitePage} onScrollTo={scrollTo} />
    </div>
  );
}
