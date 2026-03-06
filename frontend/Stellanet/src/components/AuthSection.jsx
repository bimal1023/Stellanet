import { useEffect, useMemo, useRef, useState } from "react";

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), {
        once: true,
      });
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    });
    script.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)));
    document.head.appendChild(script);
  });
}

export default function AuthSection({
  authMode,
  authForm,
  onAuthInput,
  showPassword,
  setShowPassword,
  showNewPassword,
  setShowNewPassword,
  authBusy,
  onSubmit,
  authError,
  authInfo,
  setAuthMode,
  setAuthError,
  setAuthInfo,
  onOAuthSignIn,
}) {
  const googleButtonRef = useRef(null);
  const [oauthError, setOauthError] = useState("");

  const googleClientId = useMemo(
    () => (import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim(),
    []
  );

  useEffect(() => {
    if (!googleClientId) return;
    if (!(authMode === "signin" || authMode === "signup")) return;
    let cancelled = false;

    loadScript("https://accounts.google.com/gsi/client")
      .then(() => {
        if (cancelled || !window.google?.accounts?.id || !googleButtonRef.current) return;
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => {
            if (!response?.credential) {
              setOauthError("Google sign-in did not return a token");
              return;
            }
            setOauthError("");
            onOAuthSignIn("google", response.credential);
          },
        });
        googleButtonRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          width: 340,
        });
      })
      .catch(() => {
        if (!cancelled) setOauthError("Could not load Google sign-in");
      });

    return () => {
      cancelled = true;
    };
  }, [authMode, googleClientId, onOAuthSignIn]);

  const showOAuth = authMode === "signin" || authMode === "signup";
  const isSignInLike = authMode === "signin" || authMode === "signup";

  return (
    <div className="page-transition">
      <section className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-[0_24px_50px_-35px_rgba(15,23,42,0.35)]">
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 text-center">
          {authMode === "signup" && "Create Account"}
          {authMode === "signin" && "Sign In"}
          {authMode === "verify" && "Verify Email"}
          {authMode === "forgot" && "Forgot Password"}
          {authMode === "reset" && "Reset Password"}
        </h2>
        <p className="mt-3 text-base text-slate-500 text-center">
          {authMode === "verify"
            ? "Confirm your email using verification token."
            : authMode === "forgot"
            ? "Request a reset token for your account."
            : authMode === "reset"
            ? "Set a new password using your reset token."
            : "Enter your email and password to access your account."}
        </p>

        <div className="mt-10 space-y-5">
          {authMode === "signup" && (
            <div>
              <label className="text-sm font-medium text-slate-800">Full Name</label>
              <input
                type="text"
                value={authForm.full_name}
                onChange={(e) => onAuthInput("full_name", e.target.value)}
                placeholder="Your full name"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-sky-500/25"
              />
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-slate-800">Email</label>
            <input
              type="email"
              value={authForm.email}
              onChange={(e) => onAuthInput("email", e.target.value)}
              placeholder="you@gmail.com"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-sky-500/25"
            />
          </div>
          {(authMode === "signin" || authMode === "signup") && (
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-800">Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-xs text-sky-700 hover:text-sky-800"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={authForm.password}
                onChange={(e) => onAuthInput("password", e.target.value)}
                placeholder="Enter your password"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-sky-500/25"
              />
            </div>
          )}
          {authMode === "verify" && (
            <div>
              <label className="text-sm font-medium text-slate-800">Verification Token</label>
              <input
                type="text"
                value={authForm.verification_token}
                onChange={(e) => onAuthInput("verification_token", e.target.value)}
                placeholder="Paste verification token"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-sky-500/25"
              />
            </div>
          )}
          {authMode === "reset" && (
            <>
              <div>
                <label className="text-sm font-medium text-slate-800">Reset Token</label>
                <input
                  type="text"
                  value={authForm.reset_token}
                  onChange={(e) => onAuthInput("reset_token", e.target.value)}
                  placeholder="Paste reset token"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-sky-500/25"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-800">New Password</label>
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((v) => !v)}
                    className="text-xs text-sky-700 hover:text-sky-800"
                  >
                    {showNewPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={authForm.new_password}
                  onChange={(e) => onAuthInput("new_password", e.target.value)}
                  placeholder="Enter your new password"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-sky-500/25"
                />
              </div>
            </>
          )}
          {isSignInLike && (
            <div className="flex items-center justify-between gap-3 pt-1">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={!!authForm.remember_me}
                  onChange={(e) => onAuthInput("remember_me", e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500/30"
                />
                Remember me
              </label>
              {authMode === "signin" && (
                <button
                  type="button"
                  onClick={() => {
                    setAuthError("");
                    setAuthInfo("");
                    setAuthMode("forgot");
                  }}
                  className="text-sm text-indigo-700 hover:text-indigo-800 transition"
                >
                  Forgot your password?
                </button>
              )}
            </div>
          )}
          <button
            type="button"
            disabled={authBusy}
            onClick={onSubmit}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 text-base font-medium shadow-sm hover:from-indigo-500 hover:to-blue-500 transition"
          >
            {authBusy
              ? "Please wait..."
              : authMode === "signup"
              ? "Create account"
              : authMode === "verify"
              ? "Verify email"
              : authMode === "forgot"
              ? "Send reset token"
              : authMode === "reset"
              ? "Update password"
              : "Continue"}
          </button>
          {showOAuth && googleClientId && (
            <div className="space-y-3 pt-2">
              <div className="relative py-2">
                <div className="h-px bg-slate-200" />
                <span className="absolute left-1/2 -translate-x-1/2 -top-1.5 bg-white px-3 text-sm text-slate-400">
                  Or login with
                </span>
              </div>
              <div className="mx-auto w-full max-w-[360px]" ref={googleButtonRef} />
              {oauthError && (
                <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                  {oauthError}
                </div>
              )}
            </div>
          )}
          {authError && (
            <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
              {authError}
            </div>
          )}
          {authInfo && (
            <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
              {authInfo}
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
            {(authMode === "signin" || authMode === "signup") && (
              <button
                type="button"
                onClick={() => {
                  setAuthError("");
                  setAuthInfo("");
                  setAuthMode((prev) => (prev === "signin" ? "signup" : "signin"));
                }}
                className="text-sky-700 hover:text-sky-800 transition"
              >
                {authMode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
              </button>
            )}
            {(authMode === "forgot" || authMode === "reset" || authMode === "verify") && (
              <button
                type="button"
                onClick={() => {
                  setAuthError("");
                  setAuthInfo("");
                  setAuthMode("signin");
                }}
                className="text-sky-700 hover:text-sky-800 transition"
              >
                Back to sign in
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
