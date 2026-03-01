import { useEffect, useMemo, useRef, useState } from "react";

function Toast({ show, message }) {
  return (
    <div
      className={[
        "fixed top-6 left-1/2 -translate-x-1/2 z-50",
        "transition-all duration-200",
        show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none",
      ].join(" ")}
    >
      <div className="bg-sky-700 text-white text-sm px-4 py-2 rounded-xl shadow-lg border border-sky-500/40">
        {message}
      </div>
    </div>
  );
}

function IconButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl border border-sky-100 bg-white/80 px-3 py-2 text-sm text-slate-700 hover:border-sky-300 hover:bg-sky-50/70 transition hover:-translate-y-[1px] active:translate-y-0"
    >
      {children}
    </button>
  );
}

function PrimaryButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 text-white px-4 py-2 text-sm font-medium shadow-sm hover:from-sky-500 hover:to-cyan-500 transition hover:-translate-y-[1px] active:translate-y-0"
    >
      {children}
    </button>
  );
}

export default function Draft({ draft, onBack, apiBase = "http://127.0.0.1:8000" }) {
  const [subject, setSubject] = useState(draft?.subject || "");
  const [body, setBody] = useState(draft?.body || "");
  const [tone, setTone] = useState("Professional");
  const [rewriting, setRewriting] = useState(false);
  const [initialDraftLoading, setInitialDraftLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });
  const toneClickCount = useRef({ Professional: 0, Friendly: 0, Short: 0 });

  const preview = useMemo(() => {
    return `Subject: ${subject}\n\n${body}`;
  }, [subject, body]);

  const showToast = (message) => {
    setToast({ show: true, message });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast({ show: false, message: "" }), 1400);
  };

  const copyText = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} copied ✅`);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showToast(`${label} copied ✅`);
    }
  };

  const copyProfessorEmailOnly = async () => {
    const value = (draft?.contact_email || "").trim();
    if (!value) {
      showToast("Professor email unavailable");
      return;
    }
    await copyText(value, "Professor email");
  };

  const rewriteWithTone = async (
    nextTone,
    { seedSubject = subject, seedBody = body, showSuccessToast = true, rewriteAttempt = null } = {}
  ) => {
    setTone(nextTone);
    const currentSubject = seedSubject;
    const currentBody = seedBody;
    const attempt = rewriteAttempt ?? toneClickCount.current[nextTone];

    setRewriting(true);
    try {
      const res = await fetch(`${apiBase}/rewrite-draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tone: nextTone,
          professor_name: draft?.name || "",
          university: draft?.university || "",
          title: draft?.title || "",
          why: draft?.why || "",
          subject: currentSubject,
          body: currentBody,
          rewrite_attempt: attempt,
        }),
      });

      if (!res.ok) {
        throw new Error("Tone rewrite failed");
      }

      const data = await res.json();
      const nextSubject = (data?.subject || currentSubject || "").trim();
      const nextBody = (data?.body || currentBody || "").trim();

      if (!nextBody) {
        throw new Error("Tone rewrite returned empty draft");
      }

      setSubject(nextSubject);
      setBody(nextBody);
      if (showSuccessToast) {
        showToast(`Rewritten in ${nextTone} tone ✨`);
      }
    } catch (err) {
      console.error(err);
      // If initial load fails, restore seed content instead of leaving blank editor.
      setSubject((prev) => prev || currentSubject);
      setBody((prev) => prev || currentBody);
      showToast("Could not rewrite now. Keeping current draft.");
    } finally {
      setRewriting(false);
    }
  };

  useEffect(() => {
    const initialSubject = draft?.subject || "";
    const initialBody = draft?.body || "";

    // Prevent template flash: show loading first, then render only model output.
    setSubject("");
    setBody("");
    setTone("Professional");
    toneClickCount.current = { Professional: 1, Friendly: 0, Short: 0 };

    if (!draft) return;
    setInitialDraftLoading(true);
    // On first open, immediately upgrade to a Stellanet-generated professional draft.
    Promise.resolve(
      rewriteWithTone("Professional", {
      seedSubject: initialSubject,
      seedBody: initialBody,
      showSuccessToast: false,
      rewriteAttempt: 1,
      })
    ).finally(() => setInitialDraftLoading(false));
  }, [draft]);

  const applyTone = async (nextTone) => {
    toneClickCount.current[nextTone] += 1;
    await rewriteWithTone(nextTone, {
      rewriteAttempt: toneClickCount.current[nextTone],
    });
  };

  if (!draft) {
    return (
      <div className="bg-white/75 backdrop-blur border border-sky-100 rounded-3xl shadow-[0_20px_45px_-30px_rgba(2,132,199,0.45)] p-6 md:p-8">
        <div className="text-slate-900 font-medium">No draft selected</div>
        <p className="text-slate-600 text-sm mt-1">
          Go back to Results and select a professor.
        </p>
        <div className="mt-4">
          <IconButton onClick={onBack}>← Back</IconButton>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Toast show={toast.show} message={toast.message} />

      <div className="bg-white/70 backdrop-blur border border-slate-200 rounded-3xl shadow-sm p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Draft Email</h2>
            <p className="text-slate-600 mt-1">
              Review and edit. This tool creates drafts only — you decide what to send.
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs text-sky-700">
                {draft.university}
              </span>
              <span className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs text-cyan-700">
                {draft.name}
              </span>
              {draft.contact_email ? (
                <div className="inline-flex items-center gap-2">
                  <a
                    href={`mailto:${draft.contact_email}`}
                    className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700 hover:bg-emerald-100/70 transition"
                  >
                    {draft.contact_email}
                  </a>
                  <span
                    className={[
                      "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide",
                      draft.contact_email_source === "openalex"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-amber-200 bg-amber-50 text-amber-700",
                    ].join(" ")}
                  >
                    {draft.contact_email_source === "openalex" ? "verified" : "likely"}
                  </span>
                </div>
              ) : (
                <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-700">
                  Email unavailable
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <IconButton onClick={onBack}>← Back</IconButton>
            <IconButton onClick={() => copyText(subject, "Subject")}>Copy subject</IconButton>
            <PrimaryButton onClick={copyProfessorEmailOnly}>Copy email</PrimaryButton>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="text-sm font-medium text-slate-800">Tone</label>
            <p className="text-xs text-slate-500 mt-1">
              Click any option to rewrite with Stellanet.
            </p>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {["Professional", "Friendly", "Short"].map((t) => {
                const active = tone === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => applyTone(t)}
                    disabled={rewriting}
                    className={[
                      "rounded-xl border px-3 py-2 text-xs font-medium transition",
                      rewriting ? "opacity-70 cursor-wait" : "",
                      active
                        ? "bg-gradient-to-r from-sky-600 to-cyan-600 text-white border-sky-600 shadow-sm"
                        : "bg-white/70 text-slate-700 border-sky-100 hover:border-sky-300 hover:bg-sky-50/70",
                    ].join(" ")}
                  >
                    {rewriting && active ? `${t}...` : t}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-2xl border border-dashed border-sky-200 bg-sky-50/60 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Tips
              </div>
              <ul className="mt-2 text-sm text-slate-600 space-y-2">
                <li>• Add 1 personal line about their recent work.</li>
                <li>• Keep it short — professors scan quickly.</li>
                <li>• Include your availability + resume link.</li>
              </ul>
            </div>
          </div>

          {/* Editor */}
          <div className="md:col-span-2">
            <div className="rounded-2xl border border-sky-100 bg-white/80 p-4 md:p-5 shadow-sm">
              {initialDraftLoading && !subject && !body ? (
                <div className="min-h-[360px] flex flex-col items-center justify-center rounded-xl border border-sky-100 bg-sky-50/60 text-center px-6">
                  <div className="h-8 w-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                  <div className="mt-4 text-slate-900 font-medium">Generating your draft with Stellanet</div>
                  <div className="mt-1 text-sm text-slate-600">
                    Crafting a high-quality {tone.toLowerCase()} version for this professor...
                  </div>
                </div>
              ) : (
                <>
              <label className="text-sm font-medium text-slate-800">Subject</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-2 w-full rounded-xl border border-sky-100 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-500/30"
                placeholder="Email subject"
              />

              <label className="text-sm font-medium text-slate-800 mt-4 block">
                Email body
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={14}
                className="mt-2 w-full rounded-xl border border-sky-100 bg-white px-3 py-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-sky-500/30"
                placeholder="Draft email body..."
              />

              <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="text-xs text-slate-500">
                  Tone: <span className="font-medium text-slate-700">{tone}</span> •
                  {rewriting ? "Rewriting with Stellanet..." : "Draft-only, human review required."}
                </div>

                <div className="flex gap-2">
                  <IconButton onClick={() => copyText(body, "Body")}>Copy body</IconButton>
                  <PrimaryButton onClick={copyProfessorEmailOnly}>Copy email</PrimaryButton>
                </div>
              </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}