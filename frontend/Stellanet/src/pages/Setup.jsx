import { useMemo, useState } from "react";

const DEFAULT_UNIS = [
  "Columbia University",
  "NYU",
  "Princeton University",
  "Stanford University",
];

export default function Setup({ onRun, loading = false }) {
  const [interest, setInterest] = useState(
    "CNN robustness and data efficiency for remote sensing classification"
  );
  const [profile, setProfile] = useState(
    "Undergraduate CS student with Python/PyTorch experience; seeking summer research opportunities."
  );
  const [selectedUnis, setSelectedUnis] = useState(["Columbia University", "NYU"]);
  const [customUni, setCustomUni] = useState("");

  const canRun = useMemo(() => {
    return interest.trim().length >= 10 && profile.trim().length >= 10 && selectedUnis.length > 0;
  }, [interest, profile, selectedUnis]);

  const toggleUni = (uni) => {
    setSelectedUnis((prev) =>
      prev.includes(uni) ? prev.filter((u) => u !== uni) : [...prev, uni]
    );
  };

  const addCustomUni = () => {
    const v = customUni.trim();
    if (!v) return;
    if (!selectedUnis.includes(v)) setSelectedUnis((prev) => [...prev, v]);
    setCustomUni("");
  };

  const handleRun = async () => {
    if (!canRun || loading) return;
    await onRun?.({
      interest: interest.trim(),
      profile: profile.trim(),
      universities: selectedUnis,
    });
  };

  return (
    <div className="bg-white/75 backdrop-blur border border-sky-100/90 shadow-[0_20px_45px_-30px_rgba(2,132,199,0.45)] rounded-3xl p-6 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Research Setup</h2>
          <p className="text-slate-600 mt-1">
            Tell Stellanet what you’re interested in. We’ll discover relevant faculty and draft
            personalized outreach emails.
          </p>
        </div>
        <span className="text-xs bg-sky-50 border border-sky-200 rounded-full px-3 py-1 text-sky-700">
          Draft-only • Human-in-the-loop
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5">
        <div>
          <label className="text-sm font-medium text-slate-800">Research interest</label>
          <textarea
            className="mt-2 w-full rounded-xl border border-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-500/25 p-3 min-h-[110px] bg-white/90"
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
            placeholder="e.g., Robust CNNs for satellite imagery; domain shift; data efficiency..."
          />
          <p className="text-xs text-slate-500 mt-2">
            Tip: include the topic, domain (e.g., remote sensing), and what you want to do.
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-800">Your short profile</label>
          <textarea
            className="mt-2 w-full rounded-xl border border-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-500/25 p-3 min-h-[90px] bg-white/90"
            value={profile}
            onChange={(e) => setProfile(e.target.value)}
            placeholder="Year, major, skills, projects, and what you’re seeking (research/RA)."
          />
          <p className="text-xs text-slate-500 mt-2">
            Keep it 1–3 sentences. We’ll use this to personalize emails.
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-800">Target universities</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {DEFAULT_UNIS.map((uni) => {
              const active = selectedUnis.includes(uni);
              return (
                <button
                  key={uni}
                  type="button"
                  onClick={() => toggleUni(uni)}
                  className={[
                    "px-3 py-2 rounded-xl text-sm border transition",
                    active
                      ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                      : "bg-white text-slate-700 border-sky-100 hover:border-sky-300",
                  ].join(" ")}
                >
                  {uni}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              className="flex-1 rounded-xl border border-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-500/25 px-3 py-2 bg-white/90"
              value={customUni}
              onChange={(e) => setCustomUni(e.target.value)}
              placeholder="Add another university (optional)"
            />
            <button
              type="button"
              onClick={addCustomUni}
              className="px-4 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-500 transition"
            >
              Add
            </button>
          </div>

          {selectedUnis.length > 0 && (
            <div className="mt-3 text-sm text-slate-700">
              Selected:{" "}
              <span className="font-medium">
                {selectedUnis.join(", ")}
              </span>
            </div>
          )}
        </div>

        <div className="pt-2 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            We’ll create drafts only. You review before sending.
          </p>
          <button
            type="button"
            onClick={handleRun}
            disabled={!canRun || loading}
            className={[
              "px-5 py-2.5 rounded-xl font-medium transition",
              canRun && !loading
                ? "bg-gradient-to-r from-sky-600 to-cyan-600 text-white hover:from-sky-500 hover:to-cyan-500 shadow-sm"
                : "bg-slate-200 text-slate-500 cursor-not-allowed",
            ].join(" ")}
          >
            {loading ? "Finding mentors..." : "Run Discovery"}
          </button>
        </div>
      </div>
    </div>
  );
}