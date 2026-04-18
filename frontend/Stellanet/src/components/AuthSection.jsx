import { useEffect, useMemo, useRef, useState } from "react";

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") { resolve(); return; }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = src; script.async = true; script.defer = true;
    script.addEventListener("load", () => { script.dataset.loaded = "true"; resolve(); });
    script.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)));
    document.head.appendChild(script);
  });
}

/* ── Shared field ── */
function Field({ label, children, hint, action }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
        <label style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5,
          letterSpacing: "0.14em", textTransform: "uppercase",
          color: "var(--ink-2)", fontWeight: 500,
        }}>
          {label}
        </label>
        {action}
      </div>
      {children}
      {hint && <p style={{ marginTop: 6, fontSize: 11.5, color: "var(--dim)", lineHeight: 1.45 }}>{hint}</p>}
    </div>
  );
}

export default function AuthSection({
  authMode, authForm, onAuthInput,
  showPassword, setShowPassword,
  showNewPassword, setShowNewPassword,
  authBusy, onSubmit, authError, authInfo,
  setAuthMode, setAuthError, setAuthInfo, onOAuthSignIn,
}) {
  const googleButtonRef  = useRef(null);
  const [oauthError, setOauthError] = useState("");
  const googleClientId = useMemo(() => (import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim(), []);

  useEffect(() => {
    if (!googleClientId || !(authMode === "signin" || authMode === "signup")) return;
    let cancelled = false;
    loadScript("https://accounts.google.com/gsi/client")
      .then(() => {
        if (cancelled || !window.google?.accounts?.id || !googleButtonRef.current) return;
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => {
            if (!response?.credential) { setOauthError("Google sign-in did not return a token"); return; }
            setOauthError(""); onOAuthSignIn("google", response.credential);
          },
        });
        googleButtonRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline", size: "large", shape: "rectangular",
          text: "continue_with", width: 340,
        });
      })
      .catch(() => { if (!cancelled) setOauthError("Could not load Google sign-in"); });
    return () => { cancelled = true; };
  }, [authMode, googleClientId, onOAuthSignIn]);

  const showOAuth   = authMode === "signin" || authMode === "signup";
  const showTabs    = authMode === "signin" || authMode === "signup";

  const COPY = {
    signin:  { title: "Welcome back.",        subtitle: "Sign in to pick up where you left off — your matches and drafts are saved." },
    signup:  { title: "Start your workspace.", subtitle: "Free for students. No credit card. Your drafts stay yours." },
    forgot:  { title: "Reset your password.", subtitle: "We'll send a reset link to the email you signed up with." },
    verify:  { title: "Verify your email.",   subtitle: "Enter the token sent to your inbox to complete sign-up." },
    reset:   { title: "Choose new password.", subtitle: "Enter your reset token and a new password." },
  };

  const { title, subtitle } = COPY[authMode] || COPY.signin;

  const ctaLabel = authBusy
    ? "Please wait…"
    : authMode === "signup" ? "Create account →"
    : authMode === "verify" ? "Verify email →"
    : authMode === "forgot" ? "Send reset link →"
    : authMode === "reset"  ? "Update password →"
    : "Sign in →";

  return (
    <div className="page-transition" style={{
      minHeight: "calc(100vh - 64px)",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      background: "var(--bg)",
    }}>
      {/* ── Left aside ── */}
      <aside style={{
        background: "var(--bg-2)",
        borderRight: "1px solid var(--rule-soft)",
        padding: "80px 64px",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: 80, right: -120, width: 380, height: 380, border: "1px solid var(--rule)", borderRadius: "50%", opacity: 0.5 }} />
        <div style={{ position: "absolute", bottom: 60, right: -60, width: 220, height: 220, border: "1px solid var(--rule)", borderRadius: "50%", opacity: 0.4 }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Eyebrow */}
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "5px 11px 5px 8px", border: "1px solid var(--rule)",
            borderRadius: 999, background: "var(--surface)", width: "fit-content",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase",
            color: "var(--muted)",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 0 3px var(--accent-soft)" }} />
            For students &amp; aspiring researchers
          </span>

          {/* Headline */}
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif", fontWeight: 400,
            fontSize: "clamp(36px, 4.2vw, 56px)", lineHeight: 1.05,
            letterSpacing: "-0.012em", color: "var(--ink)", marginTop: 24,
          }}>
            A small tool for a{" "}
            <em style={{ fontStyle: "italic", color: "var(--accent)" }}>slow</em>
            , careful part of academic life.
          </h1>

          {/* Quote */}
          <div style={{ marginTop: 36, maxWidth: 440 }}>
            <blockquote style={{
              fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
              fontWeight: 300, fontSize: 22, lineHeight: 1.42, color: "var(--ink-2)",
            }}>
              Most cold emails fail not because the student is unqualified, but because the professor can tell, in two sentences, that nobody read their work.
            </blockquote>
            <div style={{ marginTop: 16, fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--dim)" }}>
              — <strong style={{ color: "var(--ink-2)", fontWeight: 500 }}>Notes on the design</strong> · Stellanet
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: "flex", gap: 18, alignItems: "center",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10.5, letterSpacing: "0.06em", color: "var(--dim)",
          position: "relative", zIndex: 1,
        }}>
          {[
            { num: "2,400+", label: "Faculty indexed" },
            { num: "68",     label: "Universities" },
            { num: "100%",   label: "Human review" },
          ].map(({ num, label }, i) => (
            <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 18 }}>
              {i > 0 && <span style={{ width: 1, height: 32, background: "var(--rule)" }} />}
              <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 500, color: "var(--accent)", lineHeight: 1, letterSpacing: "-0.01em" }}>
                  {num}
                </span>
                <span>{label}</span>
              </span>
            </span>
          ))}
        </div>
      </aside>

      {/* ── Right form ── */}
      <section style={{
        padding: "80px 64px",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--bg)",
      }}>
        <div style={{ width: "100%", maxWidth: 380 }}>

          {/* Tabs (sign in / sign up) */}
          {showTabs && (
            <div style={{
              display: "inline-flex",
              background: "var(--surface)", border: "1px solid var(--rule)",
              borderRadius: 4, padding: 2, marginBottom: 28,
            }}>
              {[
                { mode: "signin", label: "Sign in" },
                { mode: "signup", label: "Create account" },
              ].map(({ mode, label }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => { setAuthError(""); setAuthInfo(""); setAuthMode(mode); }}
                  style={{
                    background: authMode === mode ? "var(--ink)" : "transparent",
                    color: authMode === mode ? "var(--bg)" : "var(--muted)",
                    border: "none", padding: "6px 16px", borderRadius: 3,
                    fontFamily: "'Instrument Sans', sans-serif",
                    fontSize: 12.5, fontWeight: 500,
                    transition: "all 140ms", letterSpacing: "0.02em",
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Title */}
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif", fontWeight: 400,
            fontSize: "clamp(32px, 3.6vw, 44px)", lineHeight: 1.05,
            letterSpacing: "-0.012em", color: "var(--ink)",
          }}>
            {title.includes("back") ? <>Welcome <em style={{ fontStyle: "italic", color: "var(--accent)" }}>back.</em></> :
             title.includes("workspace") ? <>Start your <em style={{ fontStyle: "italic", color: "var(--accent)" }}>workspace.</em></> :
             title.includes("Reset") ? <>Reset your <em style={{ fontStyle: "italic", color: "var(--accent)" }}>password.</em></> :
             title}
          </h2>
          <p style={{ marginTop: 12, color: "var(--muted)", fontSize: 14.5, lineHeight: 1.55 }}>
            {subtitle}
          </p>

          {/* Fields */}
          <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 16 }}>

            {authMode === "signup" && (
              <Field label="Full name" hint="Used to personalize your outreach emails.">
                <input
                  className="input-base"
                  type="text" value={authForm.full_name}
                  onChange={e => onAuthInput("full_name", e.target.value)}
                  placeholder="Maya Chen" autoComplete="name"
                />
              </Field>
            )}

            {(authMode !== "reset") && (
              <Field
                label="Email"
                hint={authMode === "signup" ? "Use your university email when possible." : undefined}
              >
                <input
                  className="input-base"
                  type="email" value={authForm.email}
                  onChange={e => onAuthInput("email", e.target.value)}
                  placeholder="you@university.edu" autoComplete="email"
                />
              </Field>
            )}

            {(authMode === "signin" || authMode === "signup") && (
              <Field
                label="Password"
                hint={authMode === "signup" ? "8+ characters, mixed case recommended." : undefined}
                action={
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase",
                      color: "var(--dim)", transition: "color 140ms",
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = "var(--ink)"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--dim)"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                }
              >
                <input
                  className="input-base"
                  type={showPassword ? "text" : "password"}
                  value={authForm.password}
                  onChange={e => onAuthInput("password", e.target.value)}
                  placeholder="••••••••"
                  autoComplete={authMode === "signup" ? "new-password" : "current-password"}
                  style={{ paddingRight: 64 }}
                />
              </Field>
            )}

            {authMode === "verify" && (
              <Field label="Verification token">
                <input
                  className="input-base"
                  type="text" value={authForm.verification_token}
                  onChange={e => onAuthInput("verification_token", e.target.value)}
                  placeholder="Paste verification token"
                />
              </Field>
            )}

            {authMode === "reset" && (
              <>
                <Field label="Reset token">
                  <input
                    className="input-base"
                    type="text" value={authForm.reset_token}
                    onChange={e => onAuthInput("reset_token", e.target.value)}
                    placeholder="Paste reset token"
                  />
                </Field>
                <Field
                  label="New password"
                  action={
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(v => !v)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--dim)", transition: "color 140ms" }}
                      onMouseEnter={e => e.currentTarget.style.color = "var(--ink)"}
                      onMouseLeave={e => e.currentTarget.style.color = "var(--dim)"}
                    >
                      {showNewPassword ? "Hide" : "Show"}
                    </button>
                  }
                >
                  <input
                    className="input-base"
                    type={showNewPassword ? "text" : "password"}
                    value={authForm.new_password}
                    onChange={e => onAuthInput("new_password", e.target.value)}
                    placeholder="New password (min 8 chars)"
                    autoComplete="new-password"
                  />
                </Field>
              </>
            )}

            {/* Remember me + forgot */}
            {authMode === "signin" && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4, fontSize: 12.5 }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--muted)", cursor: "pointer" }}>
                  <input
                    type="checkbox" style={{ display: "none" }}
                    checked={!!authForm.remember_me}
                    onChange={e => onAuthInput("remember_me", e.target.checked)}
                  />
                  <span style={{
                    width: 14, height: 14, border: "1px solid var(--rule)",
                    borderRadius: 2, background: authForm.remember_me ? "var(--ink)" : "var(--surface)",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    transition: "all 140ms", flexShrink: 0,
                  }}>
                    {authForm.remember_me && (
                      <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
                        <path d="M1 2.5L3 4.5L7 1" stroke="var(--bg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                  Keep me signed in
                </label>
                <button type="button"
                  onClick={() => { setAuthError(""); setAuthInfo(""); setAuthMode("forgot"); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontSize: 12.5, fontFamily: "'Instrument Sans', sans-serif" }}
                >
                  Forgot?
                </button>
              </div>
            )}

            {/* Error / info banners */}
            {authError && (
              <div style={{ padding: "10px 14px", background: "var(--red-bg)", border: "1px solid var(--accent)", borderRadius: 4, fontSize: 12.5, color: "var(--accent-strong)", lineHeight: 1.5 }}>
                {authError}
              </div>
            )}
            {authInfo && (
              <div style={{ padding: "10px 14px", background: "var(--accent-soft)", border: "1px solid var(--accent)", borderRadius: 4, fontSize: 12.5, color: "var(--accent-strong)", lineHeight: 1.5 }}>
                {authInfo}
              </div>
            )}

            {/* CTA */}
            <button
              type="button"
              onClick={onSubmit}
              disabled={authBusy}
              style={{
                width: "100%", marginTop: 8, justifyContent: "center",
                padding: "13px 16px", fontSize: 13.5,
              }}
              className="btn-primary"
            >
              {ctaLabel}
            </button>

            {/* OAuth */}
            {showOAuth && (
              <>
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase",
                  color: "var(--dim)",
                }}>
                  <span style={{ flex: 1, height: 1, background: "var(--rule)" }} />
                  or continue with
                  <span style={{ flex: 1, height: 1, background: "var(--rule)" }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {googleClientId ? (
                    <>
                      <div ref={googleButtonRef} style={{ display: "flex", justifyContent: "center" }} />
                      {oauthError && <p style={{ fontSize: 12, color: "var(--accent-strong)" }}>{oauthError}</p>}
                    </>
                  ) : (
                    <button
                      type="button"
                      style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
                        width: "100%", padding: "11px 16px",
                        background: "var(--surface)", border: "1px solid var(--rule)",
                        borderRadius: 4, color: "var(--ink)", fontSize: 13, fontWeight: 500,
                        cursor: "not-allowed", opacity: 0.5,
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
                        <path d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.79 2.72v2.26h2.9c1.7-1.56 2.69-3.87 2.69-6.62z" fill="#4285F4"/>
                        <path d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z" fill="#34A853"/>
                        <path d="M3.95 10.7A5.41 5.41 0 0 1 3.66 9c0-.59.1-1.16.29-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33z" fill="#FBBC05"/>
                        <path d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58A8.99 8.99 0 0 0 9 0 9 9 0 0 0 .96 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58z" fill="#EA4335"/>
                      </svg>
                      Continue with Google
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Switch mode link */}
            <p style={{ fontSize: 12.5, color: "var(--muted)", textAlign: "center" }}>
              {authMode === "signin" && (
                <>New here?{" "}
                  <button type="button" onClick={() => { setAuthError(""); setAuthInfo(""); setAuthMode("signup"); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontWeight: 500, fontSize: 12.5, fontFamily: "'Instrument Sans', sans-serif" }}>
                    Create an account →
                  </button>
                </>
              )}
              {authMode === "signup" && (
                <>Already have one?{" "}
                  <button type="button" onClick={() => { setAuthError(""); setAuthInfo(""); setAuthMode("signin"); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontWeight: 500, fontSize: 12.5, fontFamily: "'Instrument Sans', sans-serif" }}>
                    Sign in →
                  </button>
                </>
              )}
              {(authMode === "forgot" || authMode === "reset" || authMode === "verify") && (
                <button type="button" onClick={() => { setAuthError(""); setAuthInfo(""); setAuthMode("signin"); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontWeight: 500, fontSize: 12.5, fontFamily: "'Instrument Sans', sans-serif" }}>
                  ← Back to sign in
                </button>
              )}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
