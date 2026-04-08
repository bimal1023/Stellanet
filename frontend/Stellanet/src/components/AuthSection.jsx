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

export default function AuthSection({
  authMode, authForm, onAuthInput,
  showPassword, setShowPassword,
  showNewPassword, setShowNewPassword,
  authBusy, onSubmit, authError, authInfo,
  setAuthMode, setAuthError, setAuthInfo, onOAuthSignIn,
}) {
  const googleButtonRef = useRef(null);
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
        window.google.accounts.id.renderButton(googleButtonRef.current, { theme: "outline", size: "large", shape: "pill", text: "continue_with", width: 340 });
      })
      .catch(() => { if (!cancelled) setOauthError("Could not load Google sign-in"); });
    return () => { cancelled = true; };
  }, [authMode, googleClientId, onOAuthSignIn]);

  const showOAuth  = authMode === "signin" || authMode === "signup";
  const isSignInLike = authMode === "signin" || authMode === "signup";

  const TITLES    = { signup: "Create account", signin: "Welcome back", verify: "Verify email", forgot: "Reset password", reset: "New password" };
  const SUBTITLES = { signup: "Join Stellanet to start discovering faculty.", signin: "Sign in to access your workspace.", verify: "Enter the token sent to your email.", forgot: "We'll send a reset link to your account.", reset: "Choose a new password for your account." };

  return (
    <div className="page-transition" style={{ background: "var(--bg)", minHeight: "calc(100vh - 60px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>

        {/* Heading above card */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <span className="label-mono" style={{ color: "var(--coral)" }}>Stellanet</span>
          <h2 className="section-title" style={{ fontSize: "2.25rem", marginTop: 8 }}>{TITLES[authMode]}</h2>
          <p style={{ marginTop: 8, fontSize: "0.9rem", color: "var(--text-muted)" }}>{SUBTITLES[authMode]}</p>
        </div>

        {/* Card */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "36px 32px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {authMode === "signup" && (
              <div>
                <label className="label-mono" style={{ display: "block", marginBottom: 8 }}>Full Name</label>
                <input className="input-base" type="text" value={authForm.full_name} onChange={e => onAuthInput("full_name", e.target.value)} placeholder="Your full name" />
              </div>
            )}

            <div>
              <label className="label-mono" style={{ display: "block", marginBottom: 8 }}>Email</label>
              <input className="input-base" type="email" value={authForm.email} onChange={e => onAuthInput("email", e.target.value)} placeholder="you@example.com" />
            </div>

            {(authMode === "signin" || authMode === "signup") && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label className="label-mono">Password</label>
                  <button type="button" onClick={() => setShowPassword(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", color: "var(--coral)", fontFamily: "'Figtree', sans-serif", fontWeight: 500, padding: 0 }}>
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <input className="input-base" type={showPassword ? "text" : "password"} value={authForm.password} onChange={e => onAuthInput("password", e.target.value)} placeholder="Enter your password" />
              </div>
            )}

            {authMode === "verify" && (
              <div>
                <label className="label-mono" style={{ display: "block", marginBottom: 8 }}>Verification Token</label>
                <input className="input-base" type="text" value={authForm.verification_token} onChange={e => onAuthInput("verification_token", e.target.value)} placeholder="Paste verification token" />
              </div>
            )}

            {authMode === "reset" && (
              <>
                <div>
                  <label className="label-mono" style={{ display: "block", marginBottom: 8 }}>Reset Token</label>
                  <input className="input-base" type="text" value={authForm.reset_token} onChange={e => onAuthInput("reset_token", e.target.value)} placeholder="Paste reset token" />
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <label className="label-mono">New Password</label>
                    <button type="button" onClick={() => setShowNewPassword(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", color: "var(--coral)", fontFamily: "'Figtree', sans-serif", fontWeight: 500, padding: 0 }}>
                      {showNewPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <input className="input-base" type={showNewPassword ? "text" : "password"} value={authForm.new_password} onChange={e => onAuthInput("new_password", e.target.value)} placeholder="New password (min 8 chars)" />
                </div>
              </>
            )}

            {isSignInLike && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.875rem", color: "var(--text-muted)" }}>
                  <input type="checkbox" checked={!!authForm.remember_me} onChange={e => onAuthInput("remember_me", e.target.checked)} style={{ width: 15, height: 15, accentColor: "var(--coral)", cursor: "pointer" }} />
                  Remember me
                </label>
                {authMode === "signin" && (
                  <button type="button" onClick={() => { setAuthError(""); setAuthInfo(""); setAuthMode("forgot"); }}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.875rem", color: "var(--text-dim)", fontFamily: "'Figtree', sans-serif", transition: "color 150ms" }}
                    onMouseEnter={e => e.currentTarget.style.color = "var(--coral)"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--text-dim)"}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
            )}

            <button type="button" disabled={authBusy} onClick={onSubmit} className="btn-primary" style={{ width: "100%", padding: "13px", fontSize: "0.9375rem" }}>
              {authBusy ? "Please wait…"
                : authMode === "signup" ? "Create account →"
                : authMode === "verify" ? "Verify email"
                : authMode === "forgot" ? "Send reset token"
                : authMode === "reset"  ? "Update password"
                : "Continue →"}
            </button>

            {showOAuth && googleClientId && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0 14px" }}>
                  <div style={{ flex: 1, height: 1, background: "var(--border-sub)" }} />
                  <span className="label-mono">or continue with</span>
                  <div style={{ flex: 1, height: 1, background: "var(--border-sub)" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "center" }} ref={googleButtonRef} />
                {oauthError && <div style={{ marginTop: 10, padding: "10px 14px", background: "var(--red-bg)", border: "1px solid var(--red-border)", borderRadius: 10, fontSize: "0.8125rem", color: "var(--red)" }}>{oauthError}</div>}
              </div>
            )}

            {authError && <div style={{ padding: "12px 16px", background: "var(--red-bg)", border: "1px solid var(--red-border)", borderRadius: 10, fontSize: "0.875rem", color: "var(--red)" }}>{authError}</div>}
            {authInfo  && <div style={{ padding: "12px 16px", background: "var(--teal-bg)", border: "1px solid var(--teal-border)", borderRadius: 10, fontSize: "0.875rem", color: "var(--teal)" }}>{authInfo}</div>}

            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 16px", paddingTop: 4 }}>
              {(authMode === "signin" || authMode === "signup") && (
                <button type="button" onClick={() => { setAuthError(""); setAuthInfo(""); setAuthMode(p => p === "signin" ? "signup" : "signin"); }}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.875rem", color: "var(--text-dim)", fontFamily: "'Figtree', sans-serif", transition: "color 150ms" }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--coral)"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--text-dim)"}
                >
                  {authMode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
                </button>
              )}
              {(authMode === "forgot" || authMode === "reset" || authMode === "verify") && (
                <button type="button" onClick={() => { setAuthError(""); setAuthInfo(""); setAuthMode("signin"); }}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.875rem", color: "var(--text-dim)", fontFamily: "'Figtree', sans-serif", transition: "color 150ms" }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--coral)"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--text-dim)"}
                >
                  ← Back to sign in
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
