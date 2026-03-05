function Step({ id, label, activeStep }) {
  const active = activeStep === id;
  return (
    <span className={active ? "text-white font-semibold" : "text-emerald-100/80"}>
      {label}
    </span>
  );
}

export default function AppHeader({
  logoSrc,
  sitePage,
  currentUser,
  onSignOut,
  onOpenWorkspace,
  onGoHowItWorks,
  onSetSitePage,
  payload,
  appStepActive,
}) {
  return (
    <header className="mb-8">
      <div
        id="top-nav"
        className="sticky top-0 z-40 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6 bg-[#064E3B] px-4 py-3"
      >
        <div className="flex items-center">
          <img
            src={logoSrc}
            alt="Stellanet logo"
            className="h-12 md:h-14 w-auto object-contain select-none"
          />
        </div>

        <nav className="w-full md:w-auto flex flex-wrap items-center gap-2 md:justify-end">
          <button
            type="button"
            onClick={() => onSetSitePage("home")}
            className={[
              "text-sm px-3 py-1.5 rounded-full transition",
              sitePage === "home"
                ? "bg-[#064E3B] text-white font-semibold border border-white/30"
                : "text-white/90 hover:text-white hover:bg-black/10",
            ].join(" ")}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => onSetSitePage("about")}
            className={[
              "text-sm px-3 py-1.5 rounded-full transition",
              sitePage === "about"
                ? "bg-[#064E3B] text-white font-semibold border border-white/30"
                : "text-white/90 hover:text-white hover:bg-black/10",
            ].join(" ")}
          >
            About
          </button>
          <button
            type="button"
            onClick={onGoHowItWorks}
            className="text-sm px-3 py-1.5 rounded-full transition text-white/90 hover:text-white hover:bg-black/10"
          >
            How It Works
          </button>
          {!currentUser ? (
            <button
              type="button"
              onClick={() => onSetSitePage("signin")}
              className={[
                "text-sm px-3 py-1.5 rounded-full transition",
                sitePage === "signin"
                  ? "bg-[#064E3B] text-white font-semibold border border-white/30"
                  : "text-white/90 hover:text-white hover:bg-black/10",
              ].join(" ")}
            >
              Sign In
            </button>
          ) : (
            <button
              type="button"
              onClick={onSignOut}
              className="text-sm px-3 py-1.5 rounded-full text-white/90 hover:text-white hover:bg-black/10 transition"
            >
              Sign Out
            </button>
          )}
          <button
            type="button"
            onClick={onOpenWorkspace}
            className="rounded-full bg-[#064E3B] border border-white/40 px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#064E3B]/90 transition"
          >
            Open Workspace
          </button>
        </nav>
      </div>

      <div className="mt-0 bg-[#064E3B] p-6 md:p-8">
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-white leading-tight">
          Stellanet
        </h1>
        <p className="text-emerald-50/90 mt-4 max-w-3xl text-base md:text-lg leading-relaxed">
          Discover faculty aligned with your research interests and generate
          personalized outreach email drafts — with human approval.
        </p>

        {sitePage === "app" && (
          <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm mt-6 bg-emerald-900/40 border border-emerald-300/20 rounded-2xl md:rounded-full px-4 py-2 w-fit shadow-sm">
            <Step id="setup" label="Setup" activeStep={appStepActive} />
            <span className="text-emerald-200/70">→</span>
            <Step id="results" label="Results" activeStep={appStepActive} />
            <span className="text-emerald-200/70">→</span>
            <Step id="draft" label="Draft" activeStep={appStepActive} />
          </div>
        )}

        {sitePage === "app" && payload && (
          <div className="mt-4 inline-flex flex-wrap items-center gap-2 text-sm bg-emerald-900/35 border border-emerald-200/25 px-4 py-2 rounded-xl shadow-[0_12px_30px_-12px_rgba(6,95,70,0.6)]">
            <span className="text-emerald-100 font-semibold">Current run</span>
            <span className="text-emerald-50/85">
              {payload.universities.join(", ")} • “{payload.interest}”
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
