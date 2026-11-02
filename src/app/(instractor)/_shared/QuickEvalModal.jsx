'use client';

import { useEffect, useState } from "react";
import { Award, Loader2 } from "lucide-react";
import { apiFetch, isAbort } from "./api";
import { FlashMessage, useFlash } from "./Flash";
import { SCORE_CRITERIA, bn, gradeFor, scoresFrom, totalOf, trackLabel } from "./utils";

/**
 * Quick rubric grading for one trainee. Mount with key={trainee._id} so the form
 * re-initialises per trainee. Prefills the trainee's saved scores (else 0) and loads
 * the saved remarks, so re-grading never wipes them.
 *
 * onSaved(evaluation, message) receives the evaluation returned by POST /api/instructor/evaluations.
 */
export default function QuickEvalModal({ trainee, onClose, onSaved }) {
  const hasExisting = Boolean(trainee?.evaluation);
  const [scores, setScores] = useState(() => scoresFrom(trainee?.evaluation));
  const [remarks, setRemarks] = useState("");
  const [prevState, setPrevState] = useState(hasExisting ? "loading" : "none"); // loading | loaded | failed | none
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { flash, show } = useFlash(2500);

  // Previously saved remarks are not part of the trainee list payload — fetch them.
  useEffect(() => {
    if (!hasExisting || !trainee?._id) return undefined;
    const ctrl = new AbortController();
    apiFetch(`/api/instructor/evaluations?traineeId=${encodeURIComponent(trainee._id)}`, { signal: ctrl.signal })
      .then((data) => {
        const latest = data.evaluations?.[0];
        if (latest) {
          setRemarks((current) => current || latest.remarks || "");
        }
        setPrevState("loaded");
      })
      .catch((err) => {
        if (!isAbort(err)) setPrevState("failed");
      });
    return () => ctrl.abort();
  }, [hasExisting, trainee?._id]);

  if (!trainee) return null;

  const total = totalOf(scores);
  const preview = gradeFor(total);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = await apiFetch("/api/instructor/evaluations", {
        method: "POST",
        body: { traineeId: trainee._id, scores, remarks },
      });
      show("success", data.message || "মূল্যায়ন সংরক্ষিত হয়েছে।");
      onSaved?.(data.evaluation, data.message);
      setTimeout(() => onClose?.(), 1200);
    } catch (err) {
      show("error", err.message || "মূল্যায়ন সংরক্ষণ ব্যর্থ হয়েছে");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-xl bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold text-indigo-400">TOT MASTER EVALUATION</span>
            <h3 className="text-lg font-black text-white">{trainee.fullName}</h3>
            <p className="text-xs text-slate-400">
              {[trainee.phone, trackLabel(trainee.track)].filter(Boolean).join(" • ")}
            </p>
            {hasExisting && (
              <p className="text-[11px] text-amber-300 mt-1">
                পূর্বের মূল্যায়ন: {bn(trainee.evaluation.totalScore)}/১০০ ({trainee.evaluation.grade}) — সংরক্ষণ করলে এটি হালনাগাদ হবে।
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            aria-label="বন্ধ করুন"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SCORE_CRITERIA.map((c) => (
              <div key={c.key} className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">{c.short}</span>
                  <span className="font-bold text-indigo-400">
                    {bn(scores[c.key])} / ২৫
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={scores[c.key]}
                  onChange={(e) => setScores((s) => ({ ...s, [c.key]: Number(e.target.value) }))}
                  className="w-full accent-indigo-500"
                  aria-label={c.name}
                />
              </div>
            ))}
          </div>

          <div className="bg-indigo-950/40 p-4 rounded-2xl border border-indigo-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-300 block">মোট স্কোর ও ফলাফল:</span>
              <div className="text-xl font-black text-white">
                {bn(total)} / ১০০
                <span className={`ml-2 text-xs font-bold ${preview.color}`}>
                  Grade {preview.grade} ({preview.label})
                </span>
              </div>
            </div>
            <Award className="w-8 h-8 text-amber-400" />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              ইনস্ট্রাক্টরের মন্তব্য ও সুপারিশ:
              {prevState === "loading" && (
                <span className="ml-2 inline-flex items-center gap-1 text-slate-500">
                  <Loader2 className="w-3 h-3 animate-spin" /> পূর্বের মন্তব্য লোড হচ্ছে...
                </span>
              )}
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="উচ্চারণ চমৎকার, ক্লাসরুম প্রেজেন্টেশনে আরও কনফিডেন্স প্রয়োজন..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            {prevState === "failed" && (
              <p className="text-[11px] text-amber-300 mt-1">
                পূর্বের মন্তব্য লোড করা যায়নি — সংরক্ষণ করলে এই ঘরের লেখাই নতুন মন্তব্য হিসেবে থাকবে।
              </p>
            )}
          </div>

          <FlashMessage flash={flash} />

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting || prevState === "loading"}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-black shadow-lg shadow-indigo-600/30 transition-all"
            >
              {isSubmitting ? "সংরক্ষণ হচ্ছে..." : "মূল্যায়ন সংরক্ষণ করুন"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
