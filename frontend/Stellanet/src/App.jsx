import { useEffect, useState } from "react";
import Setup from "./pages/Setup";
import Results from "./pages/Results";
import Draft from "./pages/Draft";
import stellanetLogo from "./assets/stellanet-logo.png";
import { DiscoveryLoadingOverlay, StartupFooter } from "./components/AppShellParts";
import AppHeader from "./components/AppHeader";
import HomeSections from "./components/HomeSections";
import AboutSection from "./components/AboutSection";
import AuthSection from "./components/AuthSection";
import {
  authOAuthSignIn,
  authSignout,
  authSubmit,
  fetchCurrentUser,
} from "./services/authApi";
import { discoverProfessors } from "./services/discoveryApi";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");
const AUTH_TOKEN_KEY = "stellanet_auth_token";
const LEGACY_AUTH_TOKEN_KEY = "nm_auth_token";

function resolveRouteFromPath(pathname) {
  const cleanPath = (pathname || "/").replace(/\/+$/, "") || "/";
  if (cleanPath === "/" || cleanPath === "/home") {
    return { sitePage: "home", view: "setup", notFoundPath: "" };
  }
  if (cleanPath === "/about") {
    return { sitePage: "about", view: "setup", notFoundPath: "" };
  }
  if (cleanPath === "/signin") {
    return { sitePage: "signin", view: "setup", notFoundPath: "" };
  }
  if (cleanPath === "/app" || cleanPath === "/workspace") {
    return { sitePage: "app", view: "setup", notFoundPath: "" };
  }
  if (cleanPath === "/app/results") {
    return { sitePage: "app", view: "results", notFoundPath: "" };
  }
  if (cleanPath === "/app/draft") {
    return { sitePage: "app", view: "draft", notFoundPath: "" };
  }
  return { sitePage: "notfound", view: "setup", notFoundPath: cleanPath };
}

function buildPathForState(sitePage, view) {
  if (sitePage === "about") return "/about";
  if (sitePage === "signin") return "/signin";
  if (sitePage === "app") {
    if (view === "results") return "/app/results";
    if (view === "draft") return "/app/draft";
    return "/app";
  }
  return "/";
}

export default function App() {
  const initialRoute = resolveRouteFromPath(window.location.pathname);
  const [sitePage, setSitePage] = useState(initialRoute.sitePage); // home | about | signin | app | notfound
  const [view, setView] = useState(initialRoute.view); // setup | results | draft
  const [notFoundPath, setNotFoundPath] = useState(initialRoute.notFoundPath || "");
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
    remember_me: false,
  });
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authInfo, setAuthInfo] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [contactForm, setContactForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    message: "",
  });
  const [contactBusy, setContactBusy] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactError, setContactError] = useState("");

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
    fetchCurrentUser(API_BASE, authToken)
      .then((user) => {
        if (!cancelled) {
          setCurrentUser(user);
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
  }, []);

  useEffect(() => {
    const onPopState = () => {
      const nextRoute = resolveRouteFromPath(window.location.pathname);
      setSitePage(nextRoute.sitePage);
      setView(nextRoute.view);
      setNotFoundPath(nextRoute.notFoundPath || "");
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (sitePage !== "app") return;
    if (view === "draft" && !draft) {
      setView((results || []).length > 0 ? "results" : "setup");
      return;
    }
    if (view === "results" && (results || []).length === 0) {
      setView("setup");
    }
  }, [sitePage, view, draft, results]);

  useEffect(() => {
    if (sitePage === "notfound") return;
    const targetPath = buildPathForState(sitePage, view);
    const currentPath = (window.location.pathname || "/").replace(/\/+$/, "") || "/";
    if (currentPath !== targetPath) {
      window.history.pushState({}, "", targetPath);
    }
  }, [sitePage, view]);

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
      const discovered = await discoverProfessors(API_BASE, p);
      setResults(discovered);
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

  const goToHowItWorks = () => {
    const scroll = () => {
      const section = document.getElementById("how-it-works");
      if (section) {
        const nav = document.getElementById("top-nav");
        const navHeight = nav?.offsetHeight || 0;
        const targetTop = section.getBoundingClientRect().top + window.scrollY - navHeight - 14;
        window.scrollTo({ top: targetTop, behavior: "smooth" });
      }
    };
    if (sitePage !== "home") {
      setSitePage("home");
      window.setTimeout(scroll, 60);
      return;
    }
    scroll();
  };

  const onAuthInput = (key, value) => {
    setAuthForm((prev) => ({ ...prev, [key]: value }));
  };

  const onContactInput = (key, value) => {
    setContactForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactError("");
    setContactSubmitted(false);
    setContactBusy(true);
    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.detail || "Could not send message");
      }
      setContactSubmitted(true);
      setContactForm({
        first_name: "",
        last_name: "",
        email: "",
        message: "",
      });
    } catch (err) {
      setContactError(err?.message || "Could not send message");
    } finally {
      setContactBusy(false);
    }
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
      const data = await authSubmit(API_BASE, authMode, authForm);

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
          remember_me: false,
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
      await authSignout(API_BASE, authToken);
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

  const handleOAuthSignIn = async (provider, idToken) => {
    setAuthError("");
    setAuthInfo("");
    setAuthBusy(true);
    try {
      const data = await authOAuthSignIn(
        API_BASE,
        provider,
        idToken,
        !!authForm.remember_me
      );
      const token = data?.token || "";
      const user = data?.user || null;
      if (!token || !user) throw new Error("Invalid OAuth response");

      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
      setAuthToken(token);
      setCurrentUser(user);
      setSitePage("app");
      setView("setup");
      setAuthInfo(`Signed in with ${provider === "apple" ? "Apple" : "Google"} successfully.`);
    } catch (err) {
      setAuthError(err?.message || "OAuth sign-in failed");
    } finally {
      setAuthBusy(false);
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

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Premium soft glow blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-44 -left-40 h-[34rem] w-[34rem] rounded-full bg-emerald-300/20 blur-3xl animate-blob" />
        <div className="absolute top-10 -right-36 h-[30rem] w-[30rem] rounded-full bg-green-300/20 blur-3xl animate-blob" />
        <div className="absolute bottom-[-10rem] left-1/3 h-[26rem] w-[26rem] rounded-full bg-teal-300/15 blur-3xl animate-blob" />
      </div>

      <div className="relative w-full py-0">
        <DiscoveryLoadingOverlay show={discovering} message={loadingMessage} step={loadingStep} />

        <AppHeader
          logoSrc={stellanetLogo}
          sitePage={sitePage}
          currentUser={currentUser}
          onSignOut={handleSignOut}
          onOpenWorkspace={openWorkspace}
          onGoHowItWorks={goToHowItWorks}
          onSetSitePage={setSitePage}
          payload={payload}
          appStepActive={appStepActive}
        />

        {sitePage === "home" && (
          <HomeSections
            onOpenWorkspace={openWorkspace}
            onSetSitePage={setSitePage}
            contactForm={contactForm}
            onContactInput={onContactInput}
            onContactSubmit={handleContactSubmit}
            contactBusy={contactBusy}
            contactSubmitted={contactSubmitted}
            contactError={contactError}
          />
        )}

        {sitePage === "about" && <AboutSection />}

        {sitePage === "signin" && (
          <AuthSection
            authMode={authMode}
            authForm={authForm}
            onAuthInput={onAuthInput}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showNewPassword={showNewPassword}
            setShowNewPassword={setShowNewPassword}
            authBusy={authBusy}
            onSubmit={handleAuthSubmit}
            authError={authError}
            authInfo={authInfo}
            setAuthMode={setAuthMode}
            setAuthError={setAuthError}
            setAuthInfo={setAuthInfo}
            onOAuthSignIn={handleOAuthSignIn}
          />
        )}

        {sitePage === "notfound" && (
          <div className="page-transition">
            <section className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 md:p-10 shadow-[0_24px_50px_-35px_rgba(15,23,42,0.3)]">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400 font-semibold">404</div>
              <h2 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
                Page not found
              </h2>
              <p className="mt-3 text-slate-600">
                We could not find <span className="font-medium text-slate-800">{notFoundPath || window.location.pathname}</span>.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setSitePage("home")}
                  className="rounded-xl bg-[#10B981] text-white px-5 py-2.5 text-sm font-semibold shadow-sm hover:bg-[#059669] transition"
                >
                  Go Home
                </button>
                <button
                  type="button"
                  onClick={() => setSitePage("signin")}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Go to Sign In
                </button>
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

        <div className="h-px bg-slate-200/90" />
        <StartupFooter
          onNav={(target) => (target === "app" ? openWorkspace() : setSitePage(target))}
          logoSrc={stellanetLogo}
        />
      </div>
    </div>
  );
}