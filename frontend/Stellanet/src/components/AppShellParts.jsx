export function Badge({ children, tone = "neutral" }) {
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

export function DiscoveryLoadingOverlay({ show, message, step }) {
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

export function StartupFooter({ onNav, logoSrc }) {
  return (
    <footer className="mt-14 border-t border-sky-100/90 pt-8">
      <div className="rounded-2xl border border-sky-100 bg-white/65 backdrop-blur p-6 md:p-8 shadow-[0_20px_40px_-30px_rgba(14,116,144,0.25)]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <img
                src={logoSrc}
                alt="Stellanet logo"
                className="h-9 w-9 rounded-xl object-cover shadow-sm"
              />
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

        <div className="mt-8 pt-4 border-t border-sky-100 text-xs text-slate-500 flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-0 justify-between">
          <span>© {new Date().getFullYear()} Stellanet. All rights reserved.</span>
          <span>Made for modern research outreach.</span>
        </div>
      </div>
    </footer>
  );
}
