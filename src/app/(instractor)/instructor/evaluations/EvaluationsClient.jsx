'use client';

import React, { useState } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  Award,
  CheckCircle2,
  ArrowLeft,
  Star,
  ShieldCheck,
  Search,
  Filter,
  Trash2,
  Edit3,
  BookOpen,
  Sparkles,
  TrendingUp,
  UserCheck,
  Check,
  AlertCircle
} from "lucide-react";

export default function EvaluationsClient({ initialEvaluations = [], trainees = [] }) {
  const [evaluations, setEvaluations] = useState(initialEvaluations);
  const [selectedTraineeId, setSelectedTraineeId] = useState("");
  const [trackFilter, setTrackFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Scoring state
  const [scores, setScores] = useState({
    makhrajTajweed: 23,
    childPsychologyPedagogy: 22,
    digitalClassroomTools: 24,
    microTeachingDemo: 23,
  });
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const selectedTrainee = trainees.find((t) => t._id === selectedTraineeId);

  // Criteria metadata
  const criteria = [
    {
      key: "makhrajTajweed",
      name: "সহীহ মাখরাজ ও সিফাত নির্ভুল উচ্চারণ",
      maxScore: 25,
      desc: "১৭টি মাখরাজের যথার্থ প্রয়োগ ও তাজবীদ নিয়মাবলী নির্ভুল ডেলিভারি।",
    },
    {
      key: "childPsychologyPedagogy",
      name: "বাচ্চাদের সাইকোলজি ও পাঠদান পেডাগজি",
      maxScore: 25,
      desc: "মনোযোগ ধরে রাখা, ভীতিহীন পাঠদান ও আধুনিক নূরানী কৌশল।",
    },
    {
      key: "digitalClassroomTools",
      name: "ডিজিটাল ক্লাসরুম ও অনলাইন টুলস",
      maxScore: 25,
      desc: "Zoom, Google Meet, ডিজিটাল পেন, স্ক্রিন শেয়ার ও ক্লাস ইন্টারঅ্যাকশন।",
    },
    {
      key: "microTeachingDemo",
      name: "মাইক্রো-টিচিং ডেমো ও প্রেজেন্টেশন",
      maxScore: 25,
      desc: "লাইভ ডেমো ক্লাস ডেলিভারি, কণ্ঠের ওঠা-নামা ও প্রফেশনাল কনফিডেন্স।",
    },
  ];

  const totalScoreCalc =
    (Number(scores.makhrajTajweed) || 0) +
    (Number(scores.childPsychologyPedagogy) || 0) +
    (Number(scores.digitalClassroomTools) || 0) +
    (Number(scores.microTeachingDemo) || 0);

  const getGradeInfo = (total) => {
    if (total >= 85) return { grade: "A+", label: "সরাসরি শিক্ষক নিয়োগ অনুমোদন (১৫k–২২k৳ মাসিক)", color: "text-emerald-400", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" };
    if (total >= 75) return { grade: "A", label: "সার্টিফাইড শিক্ষক অনুমোদন", color: "text-blue-400", badge: "bg-blue-500/20 text-blue-300 border-blue-500/30" };
    if (total >= 65) return { grade: "B+", label: "প্রফেশনাল লেভেল পাস", color: "text-indigo-400", badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" };
    if (total >= 50) return { grade: "B", label: "রিভিউ ও প্র্যাকটিস প্রয়োজন", color: "text-amber-400", badge: "bg-amber-500/20 text-amber-300 border-amber-500/30" };
    return { grade: "F", label: "পুনরায় ডেমো পরীক্ষা দিতে হবে", color: "text-rose-400", badge: "bg-rose-500/20 text-rose-300 border-rose-500/30" };
  };

  const gradeInfo = getGradeInfo(totalScoreCalc);

  // Submit or Update evaluation
  const handleSaveEvaluation = async (e) => {
    e.preventDefault();
    if (!selectedTraineeId) {
      alert("অনুগ্রহ করে মূল্যায়নের জন্য একজন ট্রেইনি শিক্ষক নির্বাচন করুন।");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/instructor/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          traineeId: selectedTraineeId,
          scores,
          remarks,
        }),
      });

      const data = await res.json();
      if (data.success && data.evaluation) {
        setStatusMessage({ type: "success", text: data.message });

        // Update list
        const existingIdx = evaluations.findIndex((e) => e.traineeId === selectedTraineeId);
        if (existingIdx !== -1) {
          const updated = [...evaluations];
          updated[existingIdx] = data.evaluation;
          setEvaluations(updated);
        } else {
          setEvaluations([data.evaluation, ...evaluations]);
        }

        setTimeout(() => setStatusMessage(null), 4000);
      } else {
        setStatusMessage({ type: "error", text: data.message || "মূল্যায়ন সংরক্ষণ ব্যর্থ হয়েছে" });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: "error", text: "সার্ভারে সংযোগ করতে সমস্যা হয়েছে" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete evaluation
  const handleDeleteEval = async (id) => {
    if (!confirm("আপনি কি নিশ্চিত এই মূল্যায়ন রেকর্ডটি মুছে ফেলতে চান?")) return;

    try {
      const res = await fetch(`/api/instructor/evaluations?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setEvaluations(evaluations.filter((e) => e._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Populate form for editing
  const handleEdit = (ev) => {
    setSelectedTraineeId(ev.traineeId);
    if (ev.scores) {
      setScores({
        makhrajTajweed: ev.scores.makhrajTajweed || 20,
        childPsychologyPedagogy: ev.scores.childPsychologyPedagogy || 20,
        digitalClassroomTools: ev.scores.digitalClassroomTools || 20,
        microTeachingDemo: ev.scores.microTeachingDemo || 20,
      });
    }
    setRemarks(ev.remarks || "");
    window.scrollTo({ top: 100, behavior: "smooth" });
  };

  // Filtered evaluations list
  const filteredEvaluations = evaluations.filter((e) => {
    const matchesTrack =
      trackFilter === "all"
        ? true
        : trackFilter === "men"
        ? e.track === "TOT-MEN"
        : e.track?.includes("WOMEN");

    const matchesGrade =
      gradeFilter === "all" ? true : e.grade === gradeFilter;

    const matchesSearch =
      (e.traineeName || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.traineeEmail || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.traineePhone || "").includes(search);

    return matchesTrack && matchesGrade && matchesSearch;
  });

  // Calculate summary stats
  const totalGraded = evaluations.length;
  const hiredCount = evaluations.filter((e) => e.qualificationStatus === "hired").length;
  const avgScore =
    totalGraded > 0
      ? Math.round(
          (evaluations.reduce((sum, e) => sum + (e.totalScore || 0), 0) /
            totalGraded) *
            10
        ) / 10
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
            টিচার মূল্যায়ন ও সার্টিফিকেশন ওয়ার্কস্পেস
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            ১০০ নম্বরের প্রমিত রুব্রিক দিয়ে লাইভ ডেমো মূল্যায়ন, নিয়োগ সুপারিশ ও সার্টিফিকেট অনুমোদন
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-indigo-400" /> MASTER RUBRIC EVALUATION
        </span>
      </div>

      {/* 3 Quick Performance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 block font-bold">মোট মূল্যায়নকৃত শিক্ষক</span>
          <div className="text-2xl font-black text-white mt-1">{totalGraded} জন</div>
          <p className="text-[11px] text-slate-500 mt-1">সর্বশেষ আপডেটকৃত ডাটাবেস</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 block font-bold">সরাসরি নিয়োগপ্রাপ্ত (A+ গ্রেড)</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">{hiredCount} জন</div>
          <p className="text-[11px] text-emerald-400/80 mt-1">৮৫+ স্কোর অর্জনকারী শিক্ষক</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 block font-bold">গড় পারফরম্যান্স স্কোর</span>
          <div className="text-2xl font-black text-indigo-400 mt-1">{avgScore} / ১০০</div>
          <p className="text-[11px] text-indigo-300/80 mt-1">চারটি মূল মানদণ্ডের গড়</p>
        </div>
      </div>

      {/* Evaluation Rubric Form Card */}
      <div className="bg-slate-900/95 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              ইন্টারঅ্যাক্টিভ গ্রেডিং ফরম
            </span>
            <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
              ট্রেইনি শিক্ষক মূল্যায়ন ও স্কোর প্রদান
            </h2>
          </div>

          {/* Trainee Selector */}
          <div className="w-full sm:w-80">
            <label className="text-xs text-slate-400 block mb-1 font-semibold">
              ট্রেইনি শিক্ষক নির্বাচন করুন:
            </label>
            <select
              value={selectedTraineeId}
              onChange={(e) => setSelectedTraineeId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- ট্রেইনি সিলেক্ট করুন --</option>
              {trainees.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.fullName} ({t.track || "TOT Batch"})
                </option>
              ))}
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
                <p className="text-slate-400 text-[11px]">{selectedTrainee.phone} • {selectedTrainee.email}</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-bold">
              {selectedTrainee.track || "TOT Batch"}
            </span>
          </div>
        )}

        <form onSubmit={handleSaveEvaluation} className="space-y-6">
          {/* 4 Rubric Criteria Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {criteria.map((item) => (
              <div
                key={item.key}
                className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-indigo-500/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 leading-snug">
                    {item.name}
                  </span>
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {scores[item.key]} / ২৫
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{item.desc}</p>

                <div className="pt-2 flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={scores[item.key]}
                    onChange={(e) =>
                      setScores({ ...scores, [item.key]: Number(e.target.value) })
                    }
                    className="w-full accent-indigo-500"
                  />
                  <input
                    type="number"
                    min="0"
                    max="25"
                    value={scores[item.key]}
                    onChange={(e) =>
                      setScores({
                        ...scores,
                        [item.key]: Math.min(Math.max(Number(e.target.value) || 0, 0), 25),
                      })
                    }
                    className="w-12 bg-slate-900 border border-slate-800 rounded-lg text-center text-xs text-white py-1 font-bold"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Computed Score & Qualification Verdict Banner */}
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 p-5 rounded-2xl border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs text-slate-400 block font-semibold">
                স্বয়ংক্রিয়ভাবে পরিগণিত ফলাফল:
              </span>
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                <span className="text-2xl sm:text-3xl font-black text-white">
                  {totalScoreCalc} <span className="text-base font-normal text-slate-400">/ ১০০</span>
                </span>
                <span className={`text-xs font-black px-3 py-1 rounded-full border ${gradeInfo.badge}`}>
                  গ্রেড: {gradeInfo.grade}
                </span>
              </div>
              <p className={`text-xs font-bold ${gradeInfo.color}`}>
                ✓ {gradeInfo.label}
              </p>
            </div>

            <div className="w-full sm:w-auto">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                {isSubmitting ? "সংরক্ষণ হচ্ছে..." : "মূল্যায়ন সংরক্ষণ করুন"}
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
              placeholder="তাজবীদ ও উচ্চারণ চমৎকার। তবে শিশুদের আকর্ষণের জন্য আরও অঙ্গভঙ্গি ও ডিজিটাল হোয়াইটবোর্ড ড্রিল বাড়ানো প্রয়োজন..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                statusMessage.type === "success"
                  ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/20 border-rose-500/30 text-rose-300"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              )}
              {statusMessage.text}
            </div>
          )}
        </form>
      </div>

      {/* Graded Evaluations Roster Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white">
              সম্পন্নকৃত শিক্ষক মূল্যায়নের তালিকা ({filteredEvaluations.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              পূর্বে মূল্যায়নকৃত সকল শিক্ষকের স্কোর ও নিয়োগ স্ট্যাটাস
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="নাম বা মোবাইল দিয়ে খুঁজুন..."
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 pl-8 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            <select
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
            >
              <option value="all">সকল ব্যাচ</option>
              <option value="men">TOT MEN</option>
              <option value="women">TOT WOMEN</option>
            </select>

            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
            >
              <option value="all">সকল গ্রেড</option>
              <option value="A+">Grade A+</option>
              <option value="A">Grade A</option>
              <option value="B+">Grade B+</option>
              <option value="B">Grade B</option>
              <option value="F">Grade F</option>
            </select>
          </div>
        </div>

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
                <th className="p-3.5">গ্রেড ও নিয়োগ</th>
                <th className="p-3.5 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEvaluations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    কোনো মূল্যায়ন রেকর্ড পাওয়া যায়নি। উপরের ফরম থেকে মূল্যায়ন শুরু করুন।
                  </td>
                </tr>
              ) : (
                filteredEvaluations.map((ev) => (
                  <tr key={ev._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <span className="font-bold text-white block">{ev.traineeName}</span>
                      <span className="text-[11px] text-slate-400">{ev.traineePhone}</span>
                    </td>

                    <td className="p-3.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
                        {ev.track}
                      </span>
                    </td>

                    <td className="p-3.5 font-bold text-white">{ev.scores?.makhrajTajweed || 0}</td>
                    <td className="p-3.5 font-bold text-white">{ev.scores?.childPsychologyPedagogy || 0}</td>
                    <td className="p-3.5 font-bold text-white">{ev.scores?.digitalClassroomTools || 0}</td>
                    <td className="p-3.5 font-bold text-white">{ev.scores?.microTeachingDemo || 0}</td>

                    <td className="p-3.5">
                      <span className="font-black text-sm text-indigo-300">
                        {ev.totalScore} / ১০০
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`inline-block text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                          ev.qualificationStatus === "hired"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                        }`}
                      >
                        {ev.grade} {ev.qualificationStatus === "hired" ? "✓ নিয়োগপ্রাপ্ত" : "সার্টিফাইড"}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(ev)}
                          className="p-1.5 rounded-lg bg-slate-800 text-indigo-300 hover:text-white transition-colors"
                          title="সম্পাদনা করুন"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEval(ev._id)}
                          className="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:text-rose-300 transition-colors"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
