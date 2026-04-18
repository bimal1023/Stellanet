import { useEffect, useMemo, useRef, useState } from "react";
import useIsMobile from "../hooks/useIsMobile";

const TONE_NAMES = ["Professional", "Friendly", "Short"];

export default function Draft({ draft, onBack, apiBase = "http://127.0.0.1:8000" }) {
  const [subject, setSubject]           = useState(draft?.subject || "");
  const [body, setBody]                 = useState(draft?.body || "");
  const [tone, setTone]                 = useState(0);    // 0=pro, 1=friendly, 2=short
  const [rewriting, setRewriting]       = useState(false);
  const [editingSubject, setEditingSubject] = useState(false);
  const [editingBody, setEditingBody]   = useState(false);
  const [copied, setCopied]             = useState("");
  const [markedSent, setMarkedSent]     = useState(false);
  const isMobile = useIsMobile();
  const toneClickCount = useRef({ Professional: 1, Friendly: 0, Short: 0 });

  const dateStr = useMemo(() => {
    return new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }, []);

  const wordCount = useMemo(
    () => body.trim().split(/\s+/).filter(Boolean).length,
    [body]
  );

  /* ── Tone rewrite via backend ── */
  const rewriteWithTone = async (toneName, opts = {}) => {
    const { seedSubject = subject, seedBody = body, showToast = true } = opts;
    setRewriting(true);
    try {
      const res = await fetch(`${apiBase}/rewrite-draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tone: toneName,
          professor_name: draft?.name || "",
          university: draft?.university || "",
          title: draft?.title || "",
          why: draft?.why || "",
          subject: seedSubject,
          body: seedBody,
          rewrite_attempt: toneClickCount.current[toneName] || 1,
        }),
      });
      if (!res.ok) throw new Error("Rewrite failed");
      const data = await res.json();
      const nextSubject = (data?.subject || seedSubject).trim();
      const nextBody    = (data?.body    || seedBody).trim();
      if (nextBody) { setSubject(nextSubject); setBody(nextBody); }
    } catch (err) {
      console.error(err);
    } finally {
      setRewriting(false);
    }
  };

  /* Load initial draft via backend on mount */
  useEffect(() => {
    if (!draft) return;
    setSubject(draft.subject || "");
    setBody(draft.body || "");
    setTone(0);
    toneClickCount.current = { Professional: 1, Friendly: 0, Short: 0 };
    // Polish with Professional tone right away
    rewriteWithTone("Professional", {
      seedSubject: draft.subject || "",
      seedBody: draft.body || "",
      showToast: false,
    });
  }, [draft]);

  const applyTone = async (idx) => {
    const toneName = TONE_NAMES[idx];
    toneClickCount.current[toneName] = (toneClickCount.current[toneName] || 0) + 1;
    setTone(idx);
    await rewriteWithTone(toneName);
  };

  const copyText = async (text, label) => {
    try { await navigator.clipboard.writeText(text); } catch {
      const ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta); ta.select();
      document.execCommand("copy"); document.body.removeChild(ta);
    }
    setCopied(label);
    setTimeout(() => setCopied(""), 1400);
  };

  if (!draft) {
    return (
      <div className="page-transition" style={{ maxWidth: 600, margin: "80px auto", padding: "0 32px" }}>
        <div className="card" style={{ padding: "48px 40px" }}>
          <span className="label-mono">No draft selected</span>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.75rem", fontWeight: 400, marginTop: 12, color: "var(--ink)" }}>
            No draft selected
          </h2>
          <button className="btn-ghost" onClick={onBack} style={{ marginTop: 24 }}>← Back to Results</button>
        </div>
      </div>
    );
  }

  const lastName = (draft.name || "").split(" ").slice(-1)[0];

  return (
    <div className="page-transition" style={{ maxWidth: 1180, margin: "0 auto", padding: isMobile ? "24px 16px 64px" : "40px 32px 96px" }}>

      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, marginBottom: 28, flexWrap: "wrap" }}>
        <div>
          <span className="label-mono">§ Workspace · Draft email to Prof. {lastName}</span>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif", fontWeight: 400,
            fontSize: "clamp(32px, 3.6vw, 44px)", lineHeight: 1.05,
            letterSpacing: "-0.012em", marginTop: 12, color: "var(--ink)",
          }}>
            A first <em style={{ fontStyle: "italic", color: "var(--accent)" }}>letter.</em>
          </h1>
        </div>
        <button className="btn-ghost" onClick={onBack}>← Back to results</button>
      </div>

      {/* Main grid: letter + sidebar (stacks on mobile) */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "minmax(0,1fr) 280px", gap: 32, alignItems: "start" }}>

        {/* ── Letter ── */}
        <div>
          <div style={{
            position: "relative",
            background: "var(--paper)", border: "1px solid var(--rule)",
            borderRadius: 2,
            boxShadow: "0 1px 0 rgba(255,255,255,0.7) inset, 0 30px 60px -40px rgba(26,24,22,0.30), 0 8px 20px -16px rgba(26,24,22,0.10)",
            padding: isMobile ? "36px 24px 40px" : "56px 72px 64px", minHeight: isMobile ? "auto" : 820,
          }}>
            {/* Perforation strip */}
            <div aria-hidden="true" style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 6,
              background: "repeating-linear-gradient(90deg, var(--rule) 0 4px, transparent 4px 10px)",
              opacity: 0.45,
            }} />

            {/* Letterhead */}
            <header style={{
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              paddingBottom: 24, borderBottom: "1px solid var(--rule-soft)", marginBottom: 36,
              fontFamily: "'Instrument Sans', sans-serif",
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span aria-hidden="true" style={{
                    display: "inline-block", width: 8, height: 8,
                    border: "1px solid var(--ink)", transform: "rotate(45deg)",
                    position: "relative", top: 1,
                  }} />
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 500, letterSpacing: "-0.005em" }}>
                    Stellanet
                  </span>
                </div>
                <div className="label-mono" style={{ marginTop: 6, fontSize: 9.5 }}>
                  Draft · For Prof. {draft.name}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="label-mono" style={{ fontSize: 9.5 }}>{dateStr}</div>
                {draft.contact_email && (
                  <div style={{ marginTop: 4, fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "var(--dim)" }}>
                    {draft.contact_email}
                  </div>
                )}
              </div>
            </header>

            {/* Subject */}
            <div style={{ marginBottom: 32, fontFamily: "'Instrument Sans', sans-serif" }}>
              <div className="label-mono" style={{ fontSize: 9.5, marginBottom: 6 }}>Subject</div>
              {editingSubject ? (
                <input
                  className="input-base"
                  value={subject}
                  autoFocus
                  onChange={e => setSubject(e.target.value)}
                  onBlur={() => setEditingSubject(false)}
                  onKeyDown={e => e.key === "Enter" && setEditingSubject(false)}
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, background: "transparent", border: "1px dashed var(--accent)", padding: "6px 8px" }}
                />
              ) : (
                <button
                  onClick={() => setEditingSubject(true)}
                  title="Click to edit"
                  style={{
                    background: "transparent", border: "none", padding: 0,
                    color: "var(--ink)", fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 22, fontStyle: "italic", fontWeight: 500, textAlign: "left",
                    width: "100%", borderBottom: "1px dashed transparent", paddingBottom: 4,
                    transition: "border-color 160ms", cursor: "text",
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderBottomColor = "var(--rule)"}
                  onMouseLeave={e => e.currentTarget.style.borderBottomColor = "transparent"}
                >
                  {subject || "Click to set subject…"}
                </button>
              )}
            </div>

            {/* Body */}
            {rewriting ? (
              <div style={{ minHeight: 380, display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start", justifyContent: "center" }}>
                <div style={{ width: 22, height: 22, border: "1.5px solid var(--accent)", borderTopColor: "transparent", borderRadius: "50%" }} className="spin" />
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 22, color: "var(--ink-2)" }}>
                  Rewriting in {TONE_NAMES[tone].toLowerCase()} tone…
                </span>
              </div>
            ) : editingBody ? (
              <textarea
                className="input-base"
                value={body}
                autoFocus
                onChange={e => setBody(e.target.value)}
                onBlur={() => setEditingBody(false)}
                rows={20}
                style={{
                  fontFamily: "'Cormorant Garamond', serif", fontSize: 18, lineHeight: 1.65,
                  background: "transparent", border: "1px dashed var(--accent)", padding: 12,
                  resize: "vertical", minHeight: 400,
                }}
              />
            ) : (
              <div
                onDoubleClick={() => setEditingBody(true)}
                title="Double-click to edit"
                style={{ whiteSpace: "pre-wrap", fontFamily: "'Cormorant Garamond', serif", fontSize: 18, lineHeight: 1.7, color: "var(--ink)", cursor: "text", letterSpacing: "0.005em" }}
              >
                <p style={{ marginBottom: 18 }}>Dear Professor {lastName},</p>
                {body.split(/\n\n+/).filter(Boolean).map((para, i) => (
                  <p key={i} style={{ marginBottom: 16 }}>{para}</p>
                ))}
              </div>
            )}

            {/* Signature block */}
            <div style={{
              marginTop: 40, paddingTop: 20, borderTop: "1px solid var(--rule-soft)",
              display: "flex", justifyContent: "space-between", alignItems: "flex-end",
              fontFamily: "'Instrument Sans', sans-serif",
            }}>
              <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 22, color: "var(--ink-2)" }}>
                  Kind regards
                </div>
              </div>
              <div className="label-mono" style={{ fontSize: 9.5, textAlign: "right" }}>
                Word count
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: "var(--ink)", marginTop: 2, letterSpacing: "-0.01em" }}>
                  {wordCount}
                </div>
              </div>
            </div>
          </div>

          {/* Below-letter actions */}
          <div style={{
            marginTop: 16, display: "flex", justifyContent: "space-between",
            alignItems: "center", flexWrap: "wrap", gap: 12,
          }}>
            <span className="label-mono" style={{ fontSize: 10.5 }}>
              {markedSent
                ? "✓ Marked as sent"
                : `Click subject or double-click body to edit. Tone: ${TONE_NAMES[tone]}.`}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-ghost" onClick={() => copyText(subject, "subject")} style={{ fontSize: 12 }}>
                {copied === "subject" ? "Copied ✓" : "Copy subject"}
              </button>
              <button className="btn-ghost" onClick={() => copyText(body, "body")} style={{ fontSize: 12 }}>
                {copied === "body" ? "Copied ✓" : "Copy body"}
              </button>
              <button className="btn-primary" onClick={() => setMarkedSent(true)} disabled={markedSent} style={{ fontSize: 12 }}>
                {markedSent ? "Sent ✓" : "Mark as sent"} →
              </button>
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 16, position: isMobile ? "static" : "sticky", top: 96 }}>

          {/* Tone slider */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--rule)", borderRadius: 8, padding: "20px 20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
              <span className="label-mono">Tone</span>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 18, color: "var(--accent)" }}>
                {TONE_NAMES[tone]}
              </span>
            </div>

            {/* 3-stop dot slider */}
            <div style={{ position: "relative", margin: "10px 6px 16px" }}>
              <div style={{
                position: "absolute", left: 6, right: 6, top: "50%", height: 1,
                background: "var(--rule)", transform: "translateY(-50%)",
              }} />
              <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
                {[0, 1, 2].map(i => (
                  <button
                    key={i}
                    onClick={() => !rewriting && applyTone(i)}
                    aria-label={TONE_NAMES[i]}
                    disabled={rewriting}
                    style={{
                      width: 14, height: 14, borderRadius: "50%", padding: 0,
                      border: `1.5px solid ${tone === i ? "var(--accent)" : "var(--rule)"}`,
                      background: tone === i ? "var(--accent)" : "var(--surface)",
                      position: "relative", zIndex: 1, cursor: rewriting ? "wait" : "pointer",
                      transition: "all 160ms",
                    }}
                  />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 10.5, color: "var(--muted)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em" }}>
                <span>Pro</span><span>Friendly</span><span>Short</span>
              </div>
            </div>

            <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.55 }}>
              Select a tone to rewrite the draft. Your edits to subject &amp; body are kept.
            </p>
          </div>

          {/* Match context */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--rule)", borderRadius: 8, padding: 20 }}>
            <span className="label-mono">About this match</span>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, fontSize: 22, marginTop: 8, lineHeight: 1.15 }}>
              Prof. {draft.name}
            </h3>
            <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 4, lineHeight: 1.5 }}>
              <em style={{ fontStyle: "italic", color: "var(--ink-2)" }}>{draft.title}</em><br />
              {draft.university}
            </div>

            {draft.fit != null && (
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 14, paddingTop: 14, borderTop: "1px dashed var(--rule)" }}>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: "var(--accent)", lineHeight: 1, fontWeight: 500 }}>
                  {draft.fit > 1 ? (draft.fit / 100).toFixed(2) : draft.fit.toFixed(2)}
                </span>
                <span className="label-mono" style={{ fontSize: 9.5 }}>fit score</span>
              </div>
            )}

            {(draft.why_bullets || []).length > 0 && (
              <ul style={{ listStyle: "none", padding: 0, margin: "16px 0 0", display: "flex", flexDirection: "column", gap: 9 }}>
                {draft.why_bullets.slice(0, 3).map((b, i) => (
                  <li key={i} style={{ display: "grid", gridTemplateColumns: "12px 1fr", gap: 6, fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.5 }}>
                    <span style={{ color: "var(--accent)", opacity: 0.55, marginTop: 7 }}>·</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Tips */}
          <div style={{ background: "var(--bg-2)", border: "1px solid var(--rule-soft)", borderRadius: 8, padding: "16px 18px" }}>
            <span className="label-mono">Tips</span>
            <ul style={{ listStyle: "none", padding: 0, margin: "10px 0 0", display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "Reference one specific paper by name.",
                "Keep body under 200 words.",
                "Always read it again before sending.",
              ].map((t, i) => (
                <li key={i} style={{ display: "grid", gridTemplateColumns: "10px 1fr", gap: 8, fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
                  <span style={{ color: "var(--accent)" }}>›</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
