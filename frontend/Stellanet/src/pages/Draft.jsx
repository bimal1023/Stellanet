import { useEffect, useMemo, useRef, useState } from "react";

function Toast({ show, message }) {
  return (
    <div style={{
      position: "fixed",
      top: 24,
      left: "50%",
      transform: `translateX(-50%) translateY(${show ? 0 : -8}px)`,
      opacity: show ? 1 : 0,
      pointerEvents: show ? "auto" : "none",
      zIndex: 50,
      transition: "opacity 180ms, transform 180ms",
      background: "var(--surface-2)",
      border: "1px solid var(--border)",
      borderLeft: "3px solid var(--gold)",
      borderRadius: 4,
      padding: "10px 18px",
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: "0.75rem",
      letterSpacing: "0.06em",
      color: "var(--text)",
      whiteSpace: "nowrap",
    }}>
      {message}
    </div>
  );
}

const TONES = ["Professional", "Friendly", "Short"];

export default function Draft({ draft, onBack, apiBase = "http://127.0.0.1:8000" }) {
  const [subject, setSubject] = useState(draft?.subject || "");
  const [body, setBody]       = useState(draft?.body || "");
  const [tone, setTone]       = useState("Professional");
  const [rewriting, setRewriting]             = useState(false);
  const [initialDraftLoading, setInitialDraftLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });
  const toneClickCount = useRef({ Professional: 0, Friendly: 0, Short: 0 });

  const preview = useMemo(() => `Subject: ${subject}\n\n${body}`, [subject, body]);

  const showToast = (message) => {
    setToast({ show: true, message });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast({ show: false, message: "" }), 1600);
  };

  const copyText = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} copied`);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showToast(`${label} copied`);
    }
  };

  const copyProfessorEmailOnly = async () => {
    const value = (draft?.contact_email || "").trim();
    if (!value) { showToast("Professor email unavailable"); return; }
    await copyText(value, "Professor email");
  };

  const rewriteWithTone = async (
    nextTone,
    { seedSubject = subject, seedBody = body, showSuccessToast = true, rewriteAttempt = null } = {}
  ) => {
    setTone(nextTone);
    const attempt = rewriteAttempt ?? toneClickCount.current[nextTone];
    setRewriting(true);
    try {
      const res = await fetch(`${apiBase}/rewrite-draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tone: nextTone,
          professor_name: draft?.name || "",
          university: draft?.university || "",
          title: draft?.title || "",
          why: draft?.why || "",
          subject: seedSubject,
          body: seedBody,
          rewrite_attempt: attempt,
        }),
      });
      if (!res.ok) throw new Error("Tone rewrite failed");
      const data = await res.json();
      const nextSubject = (data?.subject || seedSubject || "").trim();
      const nextBody    = (data?.body    || seedBody    || "").trim();
      if (!nextBody) throw new Error("Tone rewrite returned empty draft");
      setSubject(nextSubject);
      setBody(nextBody);
      if (showSuccessToast) showToast(`Rewritten — ${nextTone} tone`);
    } catch (err) {
      console.error(err);
      setSubject(prev => prev || seedSubject);
      setBody(prev => prev || seedBody);
      showToast("Rewrite failed — keeping current draft");
    } finally {
      setRewriting(false);
    }
  };

  useEffect(() => {
    const initialSubject = draft?.subject || "";
    const initialBody    = draft?.body    || "";
    setSubject("");
    setBody("");
    setTone("Professional");
    toneClickCount.current = { Professional: 1, Friendly: 0, Short: 0 };
    if (!draft) return;
    setInitialDraftLoading(true);
    Promise.resolve(
      rewriteWithTone("Professional", { seedSubject: initialSubject, seedBody: initialBody, showSuccessToast: false, rewriteAttempt: 1 })
    ).finally(() => setInitialDraftLoading(false));
  }, [draft]);

  const applyTone = async (nextTone) => {
    toneClickCount.current[nextTone] += 1;
    await rewriteWithTone(nextTone, { rewriteAttempt: toneClickCount.current[nextTone] });
  };

  if (!draft) {
    return (
      <div className="page-transition" style={{ maxWidth: 760, margin: "40px auto", padding: "0 24px" }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "36px 32px" }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", color: "var(--text-muted)" }}>No draft selected</div>
          <p style={{ marginTop: 8, fontSize: "0.8125rem", color: "var(--text-dim)" }}>Go back to Results and select a professor.</p>
          <button className="btn-ghost" onClick={onBack} style={{ marginTop: 20 }}>← Back to Results</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition" style={{ maxWidth: 980, margin: "0 auto", padding: "40px 24px" }}>
      <Toast show={toast.show} message={toast.message} />

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
        <div>
          <span className="label-mono">Workspace — Draft Email</span>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "2.25rem",
            fontWeight: 400,
            color: "var(--text)",
            marginTop: 8,
            lineHeight: 1.1,
          }}>
            {draft.name}
          </h2>

          {/* Context tags */}
          <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.6875rem", letterSpacing: "0.08em",
              color: "var(--text-dim)", background: "var(--surface-2)",
              border: "1px solid var(--border-sub)", padding: "3px 10px", borderRadius: 2,
            }}>
              {draft.university}
            </span>
            {draft.contact_email ? (
              <>
                <a
                  href={`mailto:${draft.contact_email}`}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6875rem",
                    letterSpacing: "0.04em", color: "var(--green)",
                    background: "var(--green-bg)", border: "1px solid rgba(82,224,124,0.2)",
                    padding: "3px 10px", borderRadius: 2, textDecoration: "none",
                  }}
                >
                  {draft.contact_email}
                </a>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55rem",
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  color: draft.contact_email_source === "openalex" ? "var(--green)" : "var(--amber)",
                  opacity: 0.8,
                }}>
                  {draft.contact_email_source === "openalex" ? "verified" : "likely"}
                </span>
              </>
            ) : (
              <span style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6875rem",
                color: "var(--amber)", background: "var(--amber-bg)",
                border: "1px solid rgba(245,166,35,0.2)", padding: "3px 10px", borderRadius: 2,
              }}>
                Email unavailable
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn-ghost"    onClick={onBack}>← Back</button>
          <button className="btn-ghost"    onClick={() => copyText(subject, "Subject")}>Copy subject</button>
          <button className="btn-primary"  onClick={copyProfessorEmailOnly}>Copy email</button>
        </div>
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16, alignItems: "start" }}>

        {/* Left sidebar — tone controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border-sub)",
            borderRadius: 4,
            padding: "20px 18px",
          }}>
            <div className="label-mono" style={{ marginBottom: 14 }}>Tone</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {TONES.map(t => {
                const active = tone === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => applyTone(t)}
                    disabled={rewriting}
                    style={{
                      background: active ? "var(--gold)" : "transparent",
                      color: active ? "var(--bg)" : "var(--text-muted)",
                      border: `1px solid ${active ? "var(--gold)" : "var(--border-sub)"}`,
                      borderRadius: 3,
                      padding: "8px 14px",
                      fontSize: "0.8125rem",
                      fontFamily: "'Instrument Sans', sans-serif",
                      fontWeight: active ? 600 : 400,
                      cursor: rewriting ? "wait" : "pointer",
                      opacity: rewriting && !active ? 0.5 : 1,
                      transition: "all 150ms",
                      textAlign: "left",
                    }}
                  >
                    {rewriting && active ? `${t}…` : t}
                  </button>
                );
              })}
            </div>
            <p style={{ marginTop: 12, fontSize: "0.7rem", color: "var(--text-dim)", lineHeight: 1.6 }}>
              Click any tone to rewrite the draft with Stellanet.
            </p>
          </div>

          {/* Tips */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border-sub)",
            borderRadius: 4,
            padding: "16px 18px",
          }}>
            <div className="label-mono" style={{ marginBottom: 10 }}>Tips</div>
            <ul style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "Reference one recent paper by name.",
                "Keep body under 200 words.",
                "Include your availability and a resume link.",
              ].map((tip, i) => (
                <li key={i} style={{ display: "flex", gap: 7, fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.55 }}>
                  <span style={{ color: "var(--gold)", flexShrink: 0, marginTop: 1 }}>›</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right — editor */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border-sub)",
          borderRadius: 4,
          padding: "24px",
        }}>
          {(initialDraftLoading && !subject && !body) ? (
            <div style={{
              minHeight: 380,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
            }}>
              <div style={{
                width: 32, height: 32,
                border: "2px solid var(--gold)",
                borderTopColor: "transparent",
                borderRadius: "50%",
              }} className="spin" />
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem", fontWeight: 400, color: "var(--text)", textAlign: "center" }}>
                  Generating your draft
                </div>
                <div style={{ marginTop: 6, fontSize: "0.8125rem", color: "var(--text-dim)", textAlign: "center" }}>
                  Crafting a high-quality {tone.toLowerCase()} version…
                </div>
              </div>
            </div>
          ) : (
            <>
              <label className="label-mono" style={{ display: "block", marginBottom: 8 }}>Subject</label>
              <input
                className="input-base"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Email subject"
              />

              <label className="label-mono" style={{ display: "block", marginTop: 20, marginBottom: 8 }}>Email Body</label>
              <textarea
                className="input-base"
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={16}
                placeholder="Draft email body…"
                style={{ resize: "vertical", lineHeight: 1.7 }}
              />

              <div style={{
                marginTop: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
              }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.625rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-dim)" }}>
                  {rewriting ? `Rewriting · ${tone}…` : `Tone: ${tone} · Draft only — human review required`}
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-ghost"   onClick={() => copyText(body, "Body")}        style={{ fontSize: "0.8rem" }}>Copy body</button>
                  <button className="btn-primary"  onClick={copyProfessorEmailOnly}              style={{ fontSize: "0.8rem" }}>Copy email</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
