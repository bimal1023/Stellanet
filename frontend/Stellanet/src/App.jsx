import { useEffect, useState } from "react";
import Setup from "./pages/Setup";
import Results from "./pages/Results";
import Draft from "./pages/Draft";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const AUTH_TOKEN_KEY = "stellanet_auth_token";
const LEGACY_AUTH_TOKEN_KEY = "nm_auth_token";

function Badge({ children, tone = "neutral" }) {
  const styles = {
    neutral: "bg-sky-50/90 text-sky-700 border-sky-200/70",
    info: "bg-cyan-50/90 text-cyan-700 border-cyan-200/70",
  };
  return (
    <span className={`text-xs border px-3 py-1 rounded-full ${styles[tone]}`}>
      {children}
    </span>
  );
}

function NavItem({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full text-left text-sm px-1 py-2 transition border-l-2",
        active
          ? "border-sky-600 text-slate-900 font-medium"
          : "border-transparent text-slate-600 hover:text-slate-900 hover:border-sky-300",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function DiscoveryLoadingOverlay({ show, message, step }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-sky-950/25 backdrop-blur-[2px] flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-sky-200/60 bg-white/90 shadow-[0_20px_70px_-25px_rgba(14,116,144,0.45)] p-6 md:p-7">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-sky-100 flex items-center justify-center">
            <div className="h-5 w-5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <div>
            <div className="text-slate-900 font-semibold">Discovering your matches</div>
            <div className="text-xs text-slate-500">Step {step}/3</div>
          </div>
        </div>

        <div className="mt-5 h-2 rounded-full bg-sky-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-500 transition-all duration-500"
            style={{ width: `${Math.min(100, 20 + step * 26)}%` }}
          />
        </div>

        <div className="mt-4 min-h-[44px] rounded-2xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-sm text-sky-700 transition-all duration-300">
          {message}
          <span className="inline-flex ml-1 gap-1 align-middle">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-bounce [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-bounce [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-bounce [animation-delay:300ms]" />
          </span>
        </div>
      </div>
    </div>
  );
}

function StartupFooter({ onNav }) {
  return (
    <footer className="mt-14 border-t border-sky-100/90 pt-8">
      <div className="rounded-2xl border border-sky-100 bg-white/65 backdrop-blur p-6 md:p-8 shadow-[0_20px_40px_-30px_rgba(14,116,144,0.25)]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white flex items-center justify-center font-semibold">
                S
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Stellanet</div>
                <div className="text-xs text-slate-500">AI-powered research outreach platform</div>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-600 max-w-md leading-relaxed">
              Built to help students and aspiring researchers connect with the right labs faster,
              with strong matching and polished outreach workflows.
            </p>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Product</div>
            <div className="mt-3 space-y-2 text-sm">
              <button type="button" onClick={() => onNav("home")} className="block text-slate-700 hover:text-slate-900">
                Home
              </button>
              <button type="button" onClick={() => onNav("about")} className="block text-slate-700 hover:text-slate-900">
                About
              </button>
              <button type="button" onClick={() => onNav("app")} className="block text-slate-700 hover:text-slate-900">
                Workspace
              </button>
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Company</div>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <div>Security-first workflow</div>
              <div>Human-in-the-loop drafts</div>
              <div>Startup MVP build</div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-sky-100 text-xs text-slate-500 flex items-center justify-between">
          <span>© {new Date().getFullYear()} Stellanet. All rights reserved.</span>
          <span>Made for modern research outreach.</span>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [sitePage, setSitePage] = useState("home"); // home | about | signin | app
  const [view, setView] = useState("setup"); // setup | results | draft
  const [payload, setPayload] = useState(null);
  const [results, setResults] = useState([]);
  const [draft, setDraft] = useState(null);
  const [discovering, setDiscovering] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Finding professors aligned with your interests");
  const [loadingStep, setLoadingStep] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(
    localStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(LEGACY_AUTH_TOKEN_KEY) || ""
  );
  const [authMode, setAuthMode] = useState("signin"); // signin | signup | verify | forgot | reset
  const [authForm, setAuthForm] = useState({
    full_name: "",
    email: "",
    password: "",
    verification_token: "",
    reset_token: "",
    new_password: "",
    remember_me: true,
  });
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authInfo, setAuthInfo] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    if (!discovering) return;

    const sequence = [
      "Finding professors aligned with your interests",
      "Analyzing research fit and relevance",
      "Generating your ranked mentor list",
    ];

    let idx = 0;
    const t = window.setInterval(() => {
      idx = (idx + 1) % sequence.length;
      setLoadingMessage(sequence[idx]);
      setLoadingStep(idx + 1);
    }, 1200);

    return () => window.clearInterval(t);
  }, [discovering]);

  useEffect(() => {
    if (!authToken) {
      setCurrentUser(null);
      return;
    }

    let cancelled = false;
    fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Session expired");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setCurrentUser(data?.user || null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
          setAuthToken("");
          setCurrentUser(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authToken]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const auth = params.get("auth");
    const email = params.get("email");
    const token = params.get("token");
    if (!auth) return;

    setSitePage("signin");
    if (email) onAuthInput("email", email);

    if (auth === "verify") {
      setAuthMode("verify");
      if (token) onAuthInput("verification_token", token);
    } else if (auth === "reset") {
      setAuthMode("reset");
      if (token) onAuthInput("reset_token", token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRun = async (p) => {
    if (!currentUser) {
      setSitePage("signin");
      return;
    }
    setDiscovering(true);
    setLoadingMessage("Finding professors aligned with your interests");
    setLoadingStep(1);
    try {
      setPayload(p);
  
      const res = await fetch(`${API_BASE}/discover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });
  
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Request failed");
      }
  
      const data = await res.json();
  
      // backend returns { results: [...] }
      setResults(data.results || []);
      setDraft(null);
      setView("results");
    } catch (err) {
      console.error(err);
      alert("Backend error: " + (err?.message || "unknown"));
    } finally {
      setDiscovering(false);
    }
  };

  const openWorkspace = () => {
    if (!currentUser) {
      setSitePage("signin");
      setAuthError("Sign in to access your workspace.");
      return;
    }
    setSitePage("app");
    setView("setup");
  };

  const onAuthInput = (key, value) => {
    setAuthForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAuthSubmit = async () => {
    setAuthError("");
    setAuthInfo("");
    const email = authForm.email.trim();
    const password = authForm.password;
    const fullName = authForm.full_name.trim();
    const verificationToken = authForm.verification_token.trim();
    const resetToken = authForm.reset_token.trim();
    const newPassword = authForm.new_password;
    const rememberMe = !!authForm.remember_me;

    if (authMode === "signup" && (!email || !password || !fullName)) {
      setAuthError("Please fill all required fields.");
      return;
    }
    if (authMode === "signin" && (!email || !password)) {
      setAuthError("Please enter email and password.");
      return;
    }
    if (authMode === "verify" && (!email || !verificationToken)) {
      setAuthError("Enter your email and verification token.");
      return;
    }
    if (authMode === "forgot" && !email) {
      setAuthError("Enter your account email.");
      return;
    }
    if (authMode === "reset" && (!resetToken || !newPassword)) {
      setAuthError("Enter reset token and new password.");
      return;
    }

    setAuthBusy(true);
    try {
      let endpoint = "";
      let payload = {};
      if (authMode === "signup") {
        endpoint = "/auth/signup";
        payload = { full_name: fullName, email, password, remember_me: rememberMe };
      } else if (authMode === "signin") {
        endpoint = "/auth/signin";
        payload = { email, password, remember_me: rememberMe };
      } else if (authMode === "verify") {
        endpoint = "/auth/verify-email";
        payload = { email, verification_token: verificationToken };
      } else if (authMode === "forgot") {
        endpoint = "/auth/forgot-password";
        payload = { email };
      } else if (authMode === "reset") {
        endpoint = "/auth/reset-password";
        payload = { reset_token: resetToken, new_password: newPassword };
      }

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.detail || "Authentication failed");
      }

      if (authMode === "signup") {
        const verifyToken = data?.verification_token || "";
        setAuthInfo(data?.message || "Account created. Verify your email to continue.");
        setAuthMode("verify");
        setAuthForm((prev) => ({ ...prev, verification_token: verifyToken }));
      } else if (authMode === "verify") {
        setAuthInfo("Email verified. You can now sign in.");
        setAuthMode("signin");
      } else if (authMode === "forgot") {
        const token = data?.reset_token || "";
        setAuthInfo(data?.message || "If that account exists, reset instructions were sent.");
        setAuthMode("reset");
        setAuthForm((prev) => ({ ...prev, reset_token: token }));
      } else if (authMode === "reset") {
        setAuthInfo("Password reset successful. Please sign in.");
        setAuthMode("signin");
        setAuthForm((prev) => ({ ...prev, password: "", new_password: "", reset_token: "" }));
      } else {
        const token = data?.token || "";
        const user = data?.user || null;
        if (!token || !user) throw new Error("Invalid auth response");

        localStorage.setItem(AUTH_TOKEN_KEY, token);
        localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
        setAuthToken(token);
        setCurrentUser(user);
        setAuthForm({
          full_name: "",
          email: "",
          password: "",
          verification_token: "",
          reset_token: "",
          new_password: "",
          remember_me: true,
        });
        setSitePage("app");
        setView("setup");
      }
    } catch (err) {
      setAuthError(err?.message || "Authentication failed");
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    try {
      if (authToken) {
        await fetch(`${API_BASE}/auth/signout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${authToken}` },
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
      setAuthToken("");
      setCurrentUser(null);
      setSitePage("home");
      setView("setup");
    }
  };

  const appStepActive = view;
  const handleViewDraft = (r) => {
    setDraft({
      id: r.id,
      name: r.name,
      university: r.university,
      location: r.location || "",
      contact_email: r.contact_email || "",
      contact_email_source: r.contact_email_source || "unavailable",
      contact_email_confidence: r.contact_email_confidence || "none",
      title: r.title,
      why: r.why,
      why_bullets: r.why_bullets || [],
      match_breakdown: r.match_breakdown || {},
      recent_papers: r.recent_papers || [],
      subject: r.subject,
      body: r.body,
    });
    setView("draft");
  };

  const Step = ({ id, label }) => {
    const active = appStepActive === id;
    return (
      <span className={active ? "text-sky-700 font-semibold" : "text-slate-500"}>
        {label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-sky-50 to-blue-100/70 relative overflow-hidden">
      {/* Premium soft glow blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-44 -left-40 h-[34rem] w-[34rem] rounded-full bg-cyan-300/25 blur-3xl animate-blob" />
        <div className="absolute top-10 -right-36 h-[30rem] w-[30rem] rounded-full bg-sky-300/30 blur-3xl animate-blob" />
        <div className="absolute bottom-[-10rem] left-1/3 h-[26rem] w-[26rem] rounded-full bg-blue-300/20 blur-3xl animate-blob" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-8">
        <DiscoveryLoadingOverlay show={discovering} message={loadingMessage} step={loadingStep} />

        <header className="mb-8">
          <div className="flex items-center justify-between gap-6 bg-white/72 backdrop-blur-xl border border-sky-100/90 rounded-2xl px-4 py-3 shadow-[0_15px_35px_-20px_rgba(14,116,144,0.25)]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white flex items-center justify-center font-semibold">
                S
              </div>
              <div>
                  <div className="text-sm font-semibold text-slate-900">Stellanet</div>
                <div className="text-[11px] text-slate-500">Research outreach assistant</div>
              </div>
            </div>

            <nav className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSitePage("home")}
                className={[
                  "text-sm px-3 py-1.5 rounded-full transition",
                  sitePage === "home"
                    ? "bg-sky-100 text-slate-900 font-medium"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/70",
                ].join(" ")}
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => setSitePage("about")}
                className={[
                  "text-sm px-3 py-1.5 rounded-full transition",
                  sitePage === "about"
                    ? "bg-sky-100 text-slate-900 font-medium"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/70",
                ].join(" ")}
              >
                About
              </button>
              {!currentUser ? (
                <button
                  type="button"
                  onClick={() => setSitePage("signin")}
                  className={[
                    "text-sm px-3 py-1.5 rounded-full transition",
                    sitePage === "signin"
                      ? "bg-sky-100 text-slate-900 font-medium"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/70",
                  ].join(" ")}
                >
                  Sign In
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-sm px-3 py-1.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-white/70 transition"
                >
                  Sign Out
                </button>
              )}
              <button
                type="button"
                onClick={openWorkspace}
                className="rounded-full bg-gradient-to-r from-sky-600 to-cyan-600 px-4 py-1.5 text-sm font-medium text-white hover:from-sky-500 hover:to-cyan-500 transition"
              >
                Open Workspace
              </button>
            </nav>
          </div>

          <div className="mt-6">
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 leading-tight">
                Stellanet
              </h1>
              <p className="text-slate-600 mt-4 max-w-3xl text-lg leading-relaxed">
                Discover faculty aligned with your research interests and generate
                personalized outreach email drafts — with human approval.
              </p>

              {sitePage === "app" && (
                <div className="flex items-center gap-3 text-sm mt-6 bg-white/55 border border-sky-100 rounded-full px-4 py-2 w-fit shadow-sm">
                  <Step id="setup" label="Setup" />
                  <span className="text-slate-300">→</span>
                  <Step id="results" label="Results" />
                  <span className="text-slate-300">→</span>
                  <Step id="draft" label="Draft" />
                </div>
              )}

              {sitePage === "app" && payload && (
                <div className="mt-4 inline-flex items-center gap-2 text-sm bg-white/70 backdrop-blur-xl border border-sky-100 px-4 py-2 rounded-xl shadow-[0_12px_30px_-12px_rgba(14,116,144,0.28)]">
                  <span className="text-sky-700 font-semibold">Current run</span>
                  <span className="text-slate-600">
                    {payload.universities.join(", ")} • “{payload.interest}”
                  </span>
                </div>
              )}
          </div>
        </header>

        {sitePage === "home" && (
          <div className="page-transition">
            <section className="bg-white/80 border border-sky-100 rounded-3xl p-8 md:p-10 shadow-[0_20px_45px_-30px_rgba(2,132,199,0.45)]">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <Badge tone="info">For students, interns, and researchers</Badge>
                  <h2 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
                    Find the right faculty faster, then send better outreach.
                  </h2>
                  <p className="mt-4 text-slate-600 leading-relaxed">
                    Stellanet helps you discover relevant professors from target universities,
                    rank fit with your interests, and generate polished, tone-controlled email drafts.
                  </p>
                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={openWorkspace}
                      className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 text-white px-5 py-2.5 text-sm font-medium shadow-sm hover:from-sky-500 hover:to-cyan-500 transition"
                    >
                      Start Discovery
                    </button>
                    <button
                      type="button"
                      onClick={() => setSitePage("about")}
                      className="rounded-xl border border-sky-100 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-sky-50/70 transition"
                    >
                      Learn more
                    </button>
                  </div>
                </div>
                <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-white to-sky-50 p-5">
                  <div className="text-xs uppercase tracking-wide text-slate-500">How it works</div>
                  <ul className="mt-3 space-y-3 text-sm text-slate-700">
                    <li>1. Add your interest, profile, and universities</li>
                    <li>2. Discover ranked mentor matches from real data</li>
                    <li>3. Open draft and rewrite by tone using Stellanet</li>
                    <li>4. Review everything before sending</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        )}

        {sitePage === "about" && (
          <div className="page-transition">
            <section className="bg-white/80 border border-sky-100 rounded-3xl p-8 md:p-10 shadow-[0_20px_45px_-30px_rgba(2,132,199,0.45)]">
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">About Stellanet</h2>
              <p className="mt-4 text-slate-600 leading-relaxed max-w-3xl">
                Stellanet is an AI-assisted academic outreach platform designed to help students
                connect with the right faculty members. We combine data-driven discovery with
                high-quality email drafting and clear human review before any message is sent.
              </p>
              <div className="mt-7 grid md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
                  <div className="text-sm font-semibold text-slate-900">Grounded Discovery</div>
                  <div className="mt-1 text-sm text-slate-600">Uses real publication and affiliation signals.</div>
                </div>
                <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
                  <div className="text-sm font-semibold text-slate-900">Tone Rewriting</div>
                  <div className="mt-1 text-sm text-slate-600">Professional, Friendly, and Short drafts via Stellanet.</div>
                </div>
                <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
                  <div className="text-sm font-semibold text-slate-900">Human-in-the-loop</div>
                  <div className="mt-1 text-sm text-slate-600">You always review and edit before final outreach.</div>
                </div>
              </div>
            </section>
          </div>
        )}

        {sitePage === "signin" && (
          <div className="page-transition">
            <section className="max-w-xl mx-auto bg-white/85 border border-sky-100 rounded-3xl p-8 shadow-[0_20px_45px_-30px_rgba(2,132,199,0.45)]">
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
                  onClick={handleAuthSubmit}
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
                <div className="text-xs text-slate-500 text-center">
                  Passwords are hashed securely. Configure SMTP env vars to deliver real emails.
                </div>
              </div>
            </section>
          </div>
        )}

        {sitePage === "app" && (
          <div key={view} className="page-transition">
            {view === "setup" && <Setup onRun={handleRun} loading={discovering} />}

            {view === "results" && (
              <Results
                results={results}
                onViewDraft={handleViewDraft}
                onBack={() => setView("setup")}
              />
            )}

            {view === "draft" && (
              <Draft
                draft={draft}
                apiBase={API_BASE}
                onBack={() => setView("results")}
              />
            )}
          </div>
        )}

        <StartupFooter onNav={(target) => (target === "app" ? openWorkspace() : setSitePage(target))} />
      </div>
    </div>
  );
}