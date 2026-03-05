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
}) {
  return (
    <div className="page-transition">
      <section className="max-w-xl mx-auto bg-white/85 border border-sky-100 rounded-3xl p-5 md:p-8 shadow-[0_20px_45px_-30px_rgba(2,132,199,0.45)]">
        <h2 className="text-2xl font-semibold text-slate-900">
          {authMode === "signup" && "Create Account"}
          {authMode === "signin" && "Sign In"}
          {authMode === "verify" && "Verify Email"}
          {authMode === "forgot" && "Forgot Password"}
          {authMode === "reset" && "Reset Password"}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          {authMode === "verify"
            ? "Confirm your email using verification token."
            : authMode === "forgot"
            ? "Request a reset token for your account."
            : authMode === "reset"
            ? "Set a new password using your reset token."
            : "Access your research outreach workspace."}
        </p>

        <div className="mt-6 space-y-4">
          {authMode === "signup" && (
            <div>
              <label className="text-sm font-medium text-slate-800">Full Name</label>
              <input
                type="text"
                value={authForm.full_name}
                onChange={(e) => onAuthInput("full_name", e.target.value)}
                placeholder="Your full name"
                className="mt-1.5 w-full rounded-xl border border-sky-100 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-500/30"
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
              className="mt-1.5 w-full rounded-xl border border-sky-100 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-500/30"
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
                className="mt-1.5 w-full rounded-xl border border-sky-100 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-500/30"
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
                className="mt-1.5 w-full rounded-xl border border-sky-100 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-500/30"
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
                  className="mt-1.5 w-full rounded-xl border border-sky-100 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-500/30"
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
                  className="mt-1.5 w-full rounded-xl border border-sky-100 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-500/30"
                />
              </div>
            </>
          )}
          {(authMode === "signin" || authMode === "signup") && (
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={!!authForm.remember_me}
                onChange={(e) => onAuthInput("remember_me", e.target.checked)}
                className="h-4 w-4 rounded border-sky-200 text-sky-600 focus:ring-sky-500/30"
              />
              Remember me for 30 days
            </label>
          )}
          <button
            type="button"
            disabled={authBusy}
            onClick={onSubmit}
            className="w-full rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 text-white py-2.5 text-sm font-medium shadow-sm hover:from-sky-500 hover:to-cyan-500 transition"
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
            {authMode === "signin" && (
              <button
                type="button"
                onClick={() => {
                  setAuthError("");
                  setAuthInfo("");
                  setAuthMode("forgot");
                }}
                className="text-sky-700 hover:text-sky-800 transition"
              >
                Forgot password?
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
