'use client';

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  Search,
  Trash2,
  Edit3,
  Check,
  Loader2,
  RotateCcw,
} from "lucide-react";
import ErrorBanner from "../../_shared/ErrorBanner";
import { FlashMessage, useFlash } from "../../_shared/Flash";
import { apiFetch } from "../../_shared/api";
import {
  GRADES,
  SCORE_CRITERIA,
  STATUS_META,
  EMPTY_SCORES,
  bn,
  clampScore,
  formatDate,
  gradeFor,
  scoresFrom,
  statusMeta,
  totalOf,
  trackLabel,
} from "../../_shared/utils";

const GRADE_LABELS = {
  "A+": "সরাসরি শিক্ষক নিয়োগ অনুমোদন (১৫k–২২k৳ মাসিক)",
  A: "সার্টিফাইড শিক্ষক অনুমোদন",
  "B+": "প্রফেশনাল লেভেল পাস — সার্টিফাইড",
  B: "রিভিউ ও প্র্যাকটিস প্রয়োজন (পর্যালোচনাধীন)",
  C: "পুনরায় মূল্যায়ন প্রয়োজন",
  F: "পুনরায় ডেমো পরীক্ষা দিতে হবে",
};

/** Latest evaluation per trainee (list is kept newest-first). */
const latestFor = (evaluations, traineeId) =>
  traineeId ? evaluations.find((e) => e.traineeId === traineeId) || null : null;

export default function EvaluationsClient({
  initialEvaluations = [],
  trainees = [],
  currentUser = { id: "", email: "", isAdmin: false },
  initialTraineeId = "",
  loadError = null,
}) {
  const [evaluations, setEvaluations] = useState(initialEvaluations);
  const [selectedTraineeId, setSelectedTraineeId] = useState(initialTraineeId);
  const [traineeQuery, setTraineeQuery] = useState("");
  const [trackFilter, setTrackFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Scoring state: existing scores for a trainee, otherwise 0 (never a made-up default)
  const [scores, setScores] = useState(() => scoresFrom(latestFor(initialEvaluations, initialTraineeId)));
  const [remarks, setRemarks] = useState(() => latestFor(initialEvaluations, initialTraineeId)?.remarks || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const formFlash = useFlash(5000);
  const listFlash = useFlash();

  const existingEval = latestFor(evaluations, selectedTraineeId);
  const selectedTrainee =
    trainees.find((t) => t._id === selectedTraineeId) ||
    (existingEval
      ? {
          _id: existingEval.traineeId,
          fullName: existingEval.traineeName,
          phone: existingEval.traineePhone,
          email: existingEval.traineeEmail,
          track: existingEval.track,
        }
      : null);

  // Newest evaluation per trainee (the list is kept newest-first).
  const evaluatedIds = useMemo(() => {
    const map = new Map();
    for (const e of evaluations) if (!map.has(e.traineeId)) map.set(e.traineeId, e);
    return map;
  }, [evaluations]);

  const optionQuery = traineeQuery.trim().toLowerCase();
  const filteredOptions = optionQuery
    ? trainees.filter(
        (t) =>
          (t.fullName || "").toLowerCase().includes(optionQuery) ||
          (t.email || "").toLowerCase().includes(optionQuery) ||
          (t.phone || "").includes(optionQuery)
      )
    : trainees;
  // Keep the selected trainee visible in the <select> even when filtered out.
  const traineeOptions =
    selectedTrainee && !filteredOptions.some((t) => t._id === selectedTrainee._id)
      ? [selectedTrainee, ...filteredOptions]
      : filteredOptions;

  const totalScoreCalc = totalOf(scores);
  const preview = gradeFor(totalScoreCalc);

  const selectTrainee = (id) => {
    setSelectedTraineeId(id);
    const ev = latestFor(evaluations, id);
    setScores(scoresFrom(ev));
    setRemarks(ev?.remarks || "");
    formFlash.clear();
  };

  const resetForm = () => {
    setSelectedTraineeId("");
    setScores({ ...EMPTY_SCORES });
    setRemarks("");
    formFlash.clear();
  };

  // Submit or update evaluation (server derives evaluator + course from the session / trainee)
  const handleSaveEvaluation = async (e) => {
    e.preventDefault();
    if (!selectedTraineeId) {
      formFlash.show("error", "অনুগ্রহ করে মূল্যায়নের জন্য একজন ট্রেইনি শিক্ষক নির্বাচন করুন।");
      return;
    }

    setIsSubmitting(true);
    formFlash.clear();
    try {
      const data = await apiFetch("/api/instructor/evaluations", {
        method: "POST",
        body: { traineeId: selectedTraineeId, scores, remarks },
      });
      const saved = data.evaluation;
      if (saved) {
        setEvaluations((list) => [saved, ...list.filter((x) => x._id !== saved._id)]);
        setScores(scoresFrom(saved));
        setRemarks(saved.remarks || "");
      }
      formFlash.show("success", data.message || "মূল্যায়ন সংরক্ষিত হয়েছে।");
    } catch (err) {
      formFlash.show("error", err.message || "মূল্যায়ন সংরক্ষণ ব্যর্থ হয়েছে");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEval = async (ev) => {
    if (!confirm(`আপনি কি নিশ্চিত "${ev.traineeName}"-এর মূল্যায়ন রেকর্ডটি মুছে ফেলতে চান?`)) return;
    setDeletingId(ev._id);
    try {
      const data = await apiFetch(`/api/instructor/evaluations?id=${encodeURIComponent(ev._id)}`, { method: "DELETE" });
      setEvaluations((list) => list.filter((x) => x._id !== ev._id));
      if (selectedTraineeId === ev.traineeId) {
        setScores({ ...EMPTY_SCORES });
        setRemarks("");
      }
      listFlash.show("success", data.message || "মূল্যায়ন মুছে ফেলা হয়েছে।");
    } catch (err) {
      listFlash.show("error", err.message || "মূল্যায়ন মুছে ফেলা যায়নি।");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (ev) => {
    setSelectedTraineeId(ev.traineeId);
    setScores(scoresFrom(ev));
    setRemarks(ev.remarks || "");
    formFlash.clear();
    window.scrollTo({ top: 100, behavior: "smooth" });
  };

  const canDelete = (ev) =>
    currentUser.isAdmin ||
    (ev.instructorId && ev.instructorId === currentUser.id) ||
    (ev.instructorEmail && ev.instructorEmail === currentUser.email);

  const q = search.trim().toLowerCase();
  const filteredEvaluations = evaluations.filter((e) => {
    const matchesTrack =
      trackFilter === "all" ? true : trackFilter === "men" ? e.track === "TOT-MEN" : /WOMEN/i.test(e.track || "");
    const matchesGrade = gradeFilter === "all" ? true : e.grade === gradeFilter;
    const matchesStatus = statusFilter === "all" ? true : e.qualificationStatus === statusFilter;
    const matchesSearch =
      !q ||
      (e.traineeName || "").toLowerCase().includes(q) ||
      (e.traineeEmail || "").toLowerCase().includes(q) ||
      (e.traineePhone || "").includes(q);
    return matchesTrack && matchesGrade && matchesStatus && matchesSearch;
  });

  // Summary stats from the evaluations in the database
  const totalGraded = evaluations.length;
  const hiredCount = evaluations.filter((e) => e.qualificationStatus === "hired").length;
  const certifiedCount = evaluations.filter((e) => e.qualificationStatus === "certified").length;
  const retakeCount = evaluations.filter((e) => e.qualificationStatus === "retake-needed").length;
  const avgScore =
    totalGraded > 0
      ? Math.round((evaluations.reduce((sum, e) => sum + (e.totalScore || 0), 0) / totalGraded) * 10) / 10
      : 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/instructor"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> ড্যাশবোর্ডে ফিরে যান
          </Link>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
            টিচার মূল্যায়ন ও সার্টিফিকেশন ওয়ার্কস্পেস
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            ১০০ নম্বরের প্রমিত রুব্রিক দিয়ে লাইভ ডেমো মূল্যায়ন, নিয়োগ সুপারিশ ও সার্টিফিকেট অনুমোদন
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-indigo-400" /> MASTER RUBRIC EVALUATION
        </span>
      </div>

      <ErrorBanner message={loadError} />

      {/* Quick Performance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 block font-bold">মোট মূল্যায়নকৃত শিক্ষক</span>
          <div className="text-2xl font-black text-white mt-1">{loadError ? "—" : `${bn(totalGraded)} জন`}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            {bn(certifiedCount)} সার্টিফাইড • {bn(retakeCount)} পুনরায় মূল্যায়ন প্রয়োজন
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 block font-bold">সরাসরি নিয়োগপ্রাপ্ত (A+ গ্রেড)</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">{loadError ? "—" : `${bn(hiredCount)} জন`}</div>
          <p className="text-[11px] text-emerald-400/80 mt-1">৮৫+ স্কোর অর্জনকারী শিক্ষক</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 block font-bold">গড় পারফরম্যান্স স্কোর</span>
          <div className="text-2xl font-black text-indigo-400 mt-1">{loadError ? "—" : `${bn(avgScore)} / ১০০`}</div>
          <p className="text-[11px] text-indigo-300/80 mt-1">চারটি মূল মানদণ্ডের সমষ্টির গড়</p>
        </div>
      </div>

      {/* Evaluation Rubric Form Card */}
      <div className="bg-slate-900/95 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">ইন্টারঅ্যাক্টিভ গ্রেডিং ফরম</span>
            <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">ট্রেইনি শিক্ষক মূল্যায়ন ও স্কোর প্রদান</h2>
          </div>

          {/* Trainee Selector */}
          <div className="w-full sm:w-80 space-y-1.5">
            <label className="text-xs text-slate-400 block font-semibold" htmlFor="eval-trainee">
              ট্রেইনি শিক্ষক নির্বাচন করুন ({bn(trainees.length)} জন):
            </label>
            <input
              type="search"
              value={traineeQuery}
              onChange={(e) => setTraineeQuery(e.target.value)}
              placeholder="নাম / ফোন / ইমেইল দিয়ে তালিকা ছোট করুন..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <select
              id="eval-trainee"
              value={selectedTraineeId}
              onChange={(e) => selectTrainee(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- ট্রেইনি সিলেক্ট করুন --</option>
              {traineeOptions.map((t) => {
                const ev = evaluatedIds.get(t._id);
                return (
                  <option key={t._id} value={t._id}>
                    {t.fullName} ({trackLabel(t.track)}){ev ? ` — মূল্যায়িত: ${ev.grade}` : ""}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {selectedTrainee && (
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center">
                {selectedTrainee.fullName ? selectedTrainee.fullName[0].toUpperCase() : "T"}
              </div>
              <div>
                <span className="font-bold text-white text-sm">{selectedTrainee.fullName}</span>
                <p className="text-slate-400 text-[11px]">
                  {[selectedTrainee.phone, selectedTrainee.email].filter(Boolean).join(" • ")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {existingEval && (
                <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 font-bold text-[11px]">
                  পূর্বের মূল্যায়ন: {bn(existingEval.totalScore)}/১০০ ({existingEval.grade}) — সংরক্ষণ করলে হালনাগাদ হবে
                </span>
              )}
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-bold">
                {trackLabel(selectedTrainee.track)}
              </span>
              <button
                type="button"
                onClick={resetForm}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                title="ফরম রিসেট"
                aria-label="ফরম রিসেট"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSaveEvaluation} className="space-y-6">
          {/* 4 Rubric Criteria Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SCORE_CRITERIA.map((item) => (
              <div
                key={item.key}
                className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-indigo-500/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 leading-snug">{item.name}</span>
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {bn(scores[item.key])} / ২৫
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{item.desc}</p>

                <div className="pt-2 flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={scores[item.key]}
                    onChange={(e) => setScores((s) => ({ ...s, [item.key]: Number(e.target.value) }))}
                    className="w-full accent-indigo-500"
                    aria-label={item.name}
                  />
                  <input
                    type="number"
                    min="0"
                    max="25"
                    value={scores[item.key]}
                    onChange={(e) => setScores((s) => ({ ...s, [item.key]: clampScore(e.target.value) }))}
                    className="w-12 bg-slate-900 border border-slate-800 rounded-lg text-center text-xs text-white py-1 font-bold"
                    aria-label={`${item.name} (সংখ্যা)`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Computed Score & Qualification Verdict Banner */}
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 p-5 rounded-2xl border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs text-slate-400 block font-semibold">স্বয়ংক্রিয়ভাবে পরিগণিত ফলাফল:</span>
              <div className="flex items-center gap-3 justify-center sm:justify-start flex-wrap">
                <span className="text-2xl sm:text-3xl font-black text-white">
                  {bn(totalScoreCalc)} <span className="text-base font-normal text-slate-400">/ ১০০</span>
                </span>
                <span className={`text-xs font-black px-3 py-1 rounded-full border ${preview.badge}`}>
                  গ্রেড: {preview.grade}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${preview.badge}`}>
                  {preview.label}
                </span>
              </div>
              <p className={`text-xs font-bold ${preview.color}`}>✓ {GRADE_LABELS[preview.grade]}</p>
            </div>

            <div className="w-full sm:w-auto">
              <button
                type="submit"
                disabled={isSubmitting || !selectedTraineeId}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-black text-xs shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                {isSubmitting ? "সংরক্ষণ হচ্ছে..." : existingEval ? "মূল্যায়ন হালনাগাদ করুন" : "মূল্যায়ন সংরক্ষণ করুন"}
              </button>
            </div>
          </div>

          {/* Feedback textarea */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              ইনস্ট্রাক্টরের বিস্তারিত মূল্যায়ন ও পরামর্শ (Feedback):
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              maxLength={2000}
              placeholder="তাজবীদ ও উচ্চারণ চমৎকার। তবে শিশুদের আকর্ষণের জন্য আরও অঙ্গভঙ্গি ও ডিজিটাল হোয়াইটবোর্ড ড্রিল বাড়ানো প্রয়োজন..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <FlashMessage flash={formFlash.flash} onClose={formFlash.clear} />
        </form>
      </div>

      {/* Graded Evaluations Roster Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white">
              সম্পন্নকৃত শিক্ষক মূল্যায়নের তালিকা ({bn(filteredEvaluations.length)})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">পূর্বে মূল্যায়নকৃত সকল শিক্ষকের স্কোর ও নিয়োগ স্ট্যাটাস</p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-56">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="নাম বা মোবাইল দিয়ে খুঁজুন..."
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 pl-8 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            <select
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
              aria-label="ব্যাচ ফিল্টার"
            >
              <option value="all">সকল ব্যাচ</option>
              <option value="men">TOT MEN</option>
              <option value="women">TOT WOMEN</option>
            </select>

            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
              aria-label="গ্রেড ফিল্টার"
            >
              <option value="all">সকল গ্রেড</option>
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  Grade {g}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
              aria-label="স্ট্যাটাস ফিল্টার"
            >
              <option value="all">সকল স্ট্যাটাস</option>
              {Object.entries(STATUS_META).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <FlashMessage flash={listFlash.flash} onClose={listFlash.clear} />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th className="p-3.5">শিক্ষকের নাম</th>
                <th className="p-3.5">ব্যাচ</th>
                <th className="p-3.5">মাখরাজ (২৫)</th>
                <th className="p-3.5">পেডাগজি (২৫)</th>
                <th className="p-3.5">টুলস (২৫)</th>
                <th className="p-3.5">ডেমো (২৫)</th>
                <th className="p-3.5">মোট স্কোর</th>
                <th className="p-3.5">গ্রেড ও স্ট্যাটাস</th>
                <th className="p-3.5 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEvaluations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    {evaluations.length === 0
                      ? "কোনো মূল্যায়ন রেকর্ড পাওয়া যায়নি। উপরের ফরম থেকে মূল্যায়ন শুরু করুন।"
                      : "এই ফিল্টারে কোনো মূল্যায়ন পাওয়া যায়নি।"}
                  </td>
                </tr>
              ) : (
                filteredEvaluations.map((ev) => {
                  const st = statusMeta(ev.qualificationStatus);
                  return (
                    <tr
                      key={ev._id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        ev.traineeId === selectedTraineeId ? "bg-indigo-950/30" : ""
                      }`}
                    >
                      <td className="p-3.5">
                        <span className="font-bold text-white block">{ev.traineeName}</span>
                        <span className="text-[11px] text-slate-400 block">{ev.traineePhone}</span>
                        <span className="text-[10px] text-slate-500 block">
                          {ev.instructorName ? `মূল্যায়নকারী: ${ev.instructorName}` : ""}
                          {ev.evaluatedAt ? ` • ${formatDate(ev.evaluatedAt)}` : ""}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 whitespace-nowrap">
                          {trackLabel(ev.track)}
                        </span>
                      </td>

                      <td className="p-3.5 font-bold text-white">{bn(ev.scores?.makhrajTajweed ?? 0)}</td>
                      <td className="p-3.5 font-bold text-white">{bn(ev.scores?.childPsychologyPedagogy ?? 0)}</td>
                      <td className="p-3.5 font-bold text-white">{bn(ev.scores?.digitalClassroomTools ?? 0)}</td>
                      <td className="p-3.5 font-bold text-white">{bn(ev.scores?.microTeachingDemo ?? 0)}</td>

                      <td className="p-3.5">
                        <span className="font-black text-sm text-indigo-300 whitespace-nowrap">
                          {bn(ev.totalScore ?? 0)} / ১০০
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-block text-[10px] font-black px-2.5 py-0.5 rounded-full border whitespace-nowrap ${st.badge}`}
                        >
                          {ev.grade} • {st.label}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(ev)}
                            className="p-1.5 rounded-lg bg-slate-800 text-indigo-300 hover:text-white transition-colors"
                            title="সম্পাদনা করুন"
                            aria-label="সম্পাদনা করুন"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {canDelete(ev) && (
                            <button
                              type="button"
                              onClick={() => handleDeleteEval(ev)}
                              disabled={deletingId === ev._id}
                              className="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:text-rose-300 disabled:opacity-50 transition-colors"
                              title="মুছে ফেলুন"
                              aria-label="মুছে ফেলুন"
                            >
                              {deletingId === ev._id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
