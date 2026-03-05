export default function AboutSection() {
  return (
    <div className="page-transition">
      <section className="bg-white/80 border border-sky-100 rounded-3xl p-6 md:p-10 shadow-[0_20px_45px_-30px_rgba(2,132,199,0.45)]">
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
  );
}
