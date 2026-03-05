import { Badge } from "./AppShellParts";

export default function HomeSections({
  onOpenWorkspace,
  onSetSitePage,
  contactForm,
  onContactInput,
  onContactSubmit,
  contactBusy,
  contactSubmitted,
  contactError,
}) {
  return (
    <div className="page-transition">
      <section className="bg-white border border-slate-200 p-6 md:p-10 shadow-[0_24px_50px_-35px_rgba(15,23,42,0.3)]">
        <Badge tone="info">For students, interns, and researchers</Badge>
        <h2 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
          Find the right faculty faster, then send better outreach.
        </h2>
        <p className="mt-4 text-slate-600 leading-relaxed max-w-3xl">
          Stellanet helps you discover relevant professors from target universities,
          rank fit with your interests, and generate polished, tone-controlled email drafts.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onOpenWorkspace}
            className="rounded-xl bg-[#10B981] text-white px-5 py-2.5 text-sm font-semibold shadow-sm hover:bg-[#059669] transition"
          >
            Start Discovery
          </button>
          <button
            type="button"
            onClick={() => onSetSitePage("about")}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Learn more
          </button>
        </div>
      </section>

      <div className="h-6 bg-gradient-to-b from-white via-emerald-50/70 to-emerald-100/60" />

      <section
        id="how-it-works"
        className="mt-0 scroll-mt-28 bg-gradient-to-br from-[#064E3B] via-[#065F46] to-[#064E3B] border border-emerald-700/35 p-6 md:p-10 shadow-[0_28px_60px_-34px_rgba(6,78,59,0.85)]"
      >
        <div className="inline-flex items-center rounded-full border border-emerald-300/30 bg-emerald-900/30 px-3 py-1 text-xs uppercase tracking-[0.18em] text-emerald-100 font-semibold">
          How it works
        </div>
        <h3 className="mt-3 text-2xl md:text-3xl font-semibold text-white">
          A clear 4-step outreach workflow
        </h3>
        <p className="mt-3 text-emerald-50/85 max-w-3xl">
          Built for focused, evidence-based outreach with human review before sending.
        </p>

        <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-emerald-200/20 bg-white/95 p-4 shadow-sm">
            <div className="text-xs font-semibold text-[#059669]">Step 1</div>
            <div className="mt-2 text-sm font-semibold text-[#0F172A]">Set your target</div>
            <p className="mt-1 text-sm text-[#475569]">Add interest, profile, and target universities.</p>
          </div>
          <div className="rounded-2xl border border-emerald-200/20 bg-white/95 p-4 shadow-sm">
            <div className="text-xs font-semibold text-[#059669]">Step 2</div>
            <div className="mt-2 text-sm font-semibold text-[#0F172A]">Review ranked matches</div>
            <p className="mt-1 text-sm text-[#475569]">See fit score, why bullets, and recent paper signals.</p>
          </div>
          <div className="rounded-2xl border border-emerald-200/20 bg-white/95 p-4 shadow-sm">
            <div className="text-xs font-semibold text-[#059669]">Step 3</div>
            <div className="mt-2 text-sm font-semibold text-[#0F172A]">Generate and refine draft</div>
            <p className="mt-1 text-sm text-[#475569]">Create email drafts and rewrite by tone/goal.</p>
          </div>
          <div className="rounded-2xl border border-emerald-200/20 bg-white/95 p-4 shadow-sm">
            <div className="text-xs font-semibold text-[#059669]">Step 4</div>
            <div className="mt-2 text-sm font-semibold text-[#0F172A]">Send with confidence</div>
            <p className="mt-1 text-sm text-[#475569]">Human-in-the-loop review before final outreach.</p>
          </div>
        </div>
      </section>

      <div className="py-4 bg-slate-50">
        <div className="mx-auto w-[92%] max-w-6xl h-px bg-gradient-to-r from-transparent via-emerald-300/80 to-transparent" />
      </div>

      <section className="mt-1 border border-slate-200 shadow-[0_24px_50px_-35px_rgba(15,23,42,0.3)] overflow-hidden">
        <div className="grid md:grid-cols-12">
          <div className="md:col-span-4 bg-[#EFEADE] p-8 md:p-12">
            <h3 className="text-3xl font-semibold text-[#0F172A]">Get in Touch</h3>
            <div className="mt-8 space-y-4 text-sm text-[#475569] leading-relaxed">
              <p> Roosevelt Avenue, 89th Street.</p>
              <p>New York, NY 11372</p>
              <p className="pt-3">917-XXX-6444</p>
              <p>info@stellanetconnect.com</p>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <span className="h-7 w-7 rounded-full border border-slate-400/50 text-slate-700 inline-flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
                  <path d="M13.5 8H15V5.5a18.7 18.7 0 0 0-2.2-.1c-2.2 0-3.8 1.4-3.8 4V12H6.5v3h2.5v6h3v-6h2.7l.4-3H12V9.7c0-.9.2-1.7 1.5-1.7Z" />
                </svg>
              </span>
              <span className="h-7 w-7 rounded-full border border-slate-400/50 text-slate-700 inline-flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
                  <path d="M18.9 3H22l-6.8 7.8L23 21h-6.1l-4.8-6.3L6.6 21H3.5l7.3-8.4L3 3h6.2l4.3 5.8L18.9 3Zm-1.1 16h1.7L8.3 4.9H6.5L17.8 19Z" />
                </svg>
              </span>
              <span className="h-7 w-7 rounded-full border border-slate-400/50 text-slate-700 inline-flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
                  <path d="M6.9 8.7a1.8 1.8 0 1 1 0-3.7 1.8 1.8 0 0 1 0 3.7ZM5.3 9.9h3.2V20H5.3V9.9Zm5 0h3.1v1.4h.1c.4-.8 1.5-1.7 3.2-1.7 3.4 0 4 2.2 4 5.2V20h-3.2v-4.6c0-1.1 0-2.5-1.6-2.5s-1.8 1.2-1.8 2.4V20h-3.2V9.9Z" />
                </svg>
              </span>
              <span className="h-7 w-7 rounded-full border border-slate-400/50 text-slate-700 inline-flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
                  <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 1.8a3.7 3.7 0 0 0-3.7 3.7v9a3.7 3.7 0 0 0 3.7 3.7h9a3.7 3.7 0 0 0 3.7-3.7v-9a3.7 3.7 0 0 0-3.7-3.7h-9Zm9.3 1.4a1.1 1.1 0 1 1 0 2.1 1.1 1.1 0 0 1 0-2.1ZM12 7.2A4.8 4.8 0 1 1 7.2 12 4.8 4.8 0 0 1 12 7.2Zm0 1.8a3 3 0 1 0 3 3 3 3 0 0 0-3-3Z" />
                </svg>
              </span>
            </div>
          </div>

          <div className="md:col-span-8 bg-[#064E3B] p-8 md:p-12">
            <form onSubmit={onContactSubmit} className="max-w-2xl">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-emerald-100/80 mb-1">First Name</label>
                  <input
                    type="text"
                    value={contactForm.first_name}
                    onChange={(e) => onContactInput("first_name", e.target.value)}
                    className="w-full rounded-none border border-emerald-200/40 bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-emerald-200/80"
                  />
                </div>
                <div>
                  <label className="block text-xs text-emerald-100/80 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={contactForm.last_name}
                    onChange={(e) => onContactInput("last_name", e.target.value)}
                    className="w-full rounded-none border border-emerald-200/40 bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-emerald-200/80"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs text-emerald-100/80 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) => onContactInput("email", e.target.value)}
                  className="w-full rounded-none border border-emerald-200/40 bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-emerald-200/80"
                />
              </div>

              <div className="mt-4">
                <label className="block text-xs text-emerald-100/80 mb-1">Message</label>
                <textarea
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => onContactInput("message", e.target.value)}
                  className="w-full rounded-none border border-emerald-200/40 bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-emerald-200/80"
                />
              </div>

              <button
                type="submit"
                disabled={contactBusy}
                className={[
                  "mt-4 w-full text-[#0F172A] text-sm font-medium py-2 transition",
                  contactBusy
                    ? "bg-amber-300 cursor-not-allowed"
                    : "bg-[#F59E0B] hover:bg-[#D97706]",
                ].join(" ")}
              >
                {contactBusy ? "Sending..." : "Send"}
              </button>

              {contactSubmitted && (
                <p className="mt-3 text-sm text-emerald-100">Thanks for submitting!</p>
              )}
              {contactError && (
                <p className="mt-3 text-sm text-rose-200">{contactError}</p>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
