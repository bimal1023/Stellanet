import { useState } from "react";

function FitBadge({ fit }) {
  const tone =
    fit >= 85
      ? "bg-cyan-50 border-cyan-200 text-cyan-700"
      : fit >= 70
      ? "bg-sky-50 border-sky-200 text-sky-700"
      : "bg-slate-50 border-slate-200 text-slate-700";

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${tone}`}>
      Fit {fit}
    </span>
  );
}

function IconButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl border border-sky-100 bg-white/80 px-3 py-2 text-sm text-slate-700 hover:border-sky-300 hover:bg-sky-50/60 transition"
    >
      {children}
    </button>
  );
}

export default function Results({ results, onViewDraft, onBack }) {
  const [openId, setOpenId] = useState(null);

  const toggleWhy = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="bg-white/75 backdrop-blur border border-sky-100 rounded-3xl shadow-[0_20px_45px_-30px_rgba(2,132,199,0.45)] p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Results</h2>
          <p className="text-slate-600 mt-1">
            Ranked faculty matches based on your interests. Click to view and edit drafts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <IconButton onClick={onBack}>← Back</IconButton>
        </div>
      </div>

      {/* Empty state */}
      {(!results || results.length === 0) && (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white/60 p-8 text-center">
            <div className="text-slate-900 font-medium">No results yet</div>
          <div className="text-slate-600 text-sm mt-1">
            Go back to Setup and run a discovery.
          </div>
        </div>
      )}

      {/* Cards */}
      <div className="mt-6 grid gap-4">
        {results?.map((r) => {
          const expanded = openId === r.id;

          return (
            <div
              key={r.id}
              className={[
                "group rounded-2xl border border-slate-200 bg-white/75",
                "shadow-sm transition-all duration-200",
                "hover:shadow-md hover:-translate-y-[1px] hover:border-sky-300",
              ].join(" ")}
            >
              <div className="p-5 md:p-6">
                {/* Top row */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      {/* Avatar circle */}
                      <div className="h-10 w-10 rounded-2xl bg-sky-600/10 text-sky-700 flex items-center justify-center font-semibold">
                        {r.name?.split(" ")[1]?.[0] || "P"}
                      </div>

                      <div>
                        <div className="text-base font-semibold text-slate-900">
                          {r.name}
                        </div>
                        <div className="text-sm text-slate-600">
                          {r.title}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs text-sky-700">
                        {r.university}
                      </span>
                      <FitBadge fit={r.fit} />
                      {r.contact_email ? (
                        <div className="inline-flex items-center gap-2">
                          <a
                            href={`mailto:${r.contact_email}`}
                            className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700 hover:bg-emerald-100/70 transition"
                          >
                            {r.contact_email}
                          </a>
                          <span
                            className={[
                              "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide",
                              r.contact_email_source === "openalex"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-amber-200 bg-amber-50 text-amber-700",
                            ].join(" ")}
                          >
                            {r.contact_email_source === "openalex" ? "verified" : "likely"}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-700">
                          Email unavailable
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => toggleWhy(r.id)}
                      className="rounded-xl border border-sky-100 bg-white/70 px-4 py-2 text-sm text-slate-700 hover:border-sky-300 hover:bg-sky-50/60 transition"
                    >
                      {expanded ? "Hide details" : "Why this match?"}
                    </button>

                    <button
                      type="button"
                      onClick={() => onViewDraft(r)}
                      className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 text-white px-4 py-2 text-sm font-medium shadow-sm hover:from-sky-500 hover:to-cyan-500 transition"
                    >
                      View Draft →
                    </button>
                  </div>
                </div>

                {/* One-line preview */}
                <div className="mt-4 text-sm text-slate-700">
                  <span className="font-medium text-slate-900">Summary:</span>{" "}
                  {r.why}
                </div>

                {/* Expandable details */}
                <div
                  className={[
                    "grid transition-[grid-template-rows] duration-200",
                    expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  ].join(" ")}
                >
                  <div className="overflow-hidden">
                    <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
                      <div className="text-xs uppercase tracking-wide text-slate-500">
                        Why this match
                      </div>
                      <div className="mt-2 text-sm text-slate-700 leading-relaxed">
                        {r.why}
                      </div>

                      <div className="mt-3 text-xs text-slate-500">
                        Tip: Use the draft as a starting point and customize 1–2 lines.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom hover bar */}
              <div className="px-5 md:px-6 pb-4">
                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-0 group-hover:opacity-100 transition" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}