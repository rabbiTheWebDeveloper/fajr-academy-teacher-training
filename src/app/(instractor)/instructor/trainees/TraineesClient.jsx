'use client';

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  CreditCard,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Download,
  Award,
  Laptop,
  BookOpen,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Eye,
  X,
  Sparkles,
  UserCheck
} from "lucide-react";

export default function TraineesClient({ initialTrainees = [] }) {
  const [trainees, setTrainees] = useState(initialTrainees);
  const [search, setSearch] = useState("");
  const [trackFilter, setTrackFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [evalFilter, setEvalFilter] = useState("all");
  const [selectedTrainee, setSelectedTrainee] = useState(null);

  // Evaluation modal
  const [evalModalTrainee, setEvalModalTrainee] = useState(null);
  const [scores, setScores] = useState({
    makhrajTajweed: 22,
    childPsychologyPedagogy: 21,
    digitalClassroomTools: 23,
    microTeachingDemo: 22,
  });
  const [evalRemarks, setEvalRemarks] = useState("");
  const [isSubmittingEval, setIsSubmittingEval] = useState(false);
  const [evalSuccessMsg, setEvalSuccessMsg] = useState(null);

  const filtered = trainees.filter((t) => {
    const matchesSearch =
      (t.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.phone || "").includes(search) ||
      (t.tranId || "").toLowerCase().includes(search.toLowerCase());

    const matchesTrack =
      trackFilter === "all"
        ? true
        : trackFilter === "men"
        ? t.track === "TOT-MEN" || t.gender === "male"
        : t.track?.includes("WOMEN") || t.gender === "female";

    const matchesPayment =
      paymentFilter === "all" ? true : t.paymentStatus === paymentFilter;

    const matchesEval =
      evalFilter === "all"
        ? true
        : evalFilter === "evaluated"
        ? Boolean(t.evaluation)
        : !t.evaluation;

    return matchesSearch && matchesTrack && matchesPayment && matchesEval;
  });

  // Export filtered trainees to CSV
  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Track", "PaymentStatus", "Amount", "QuranSkill", "HasLaptop", "Grade", "Score"];
    const rows = filtered.map((t) => [
      `"${t.fullName || ""}"`,
      `"${t.email || ""}"`,
      `"${t.phone || ""}"`,
      `"${t.track || ""}"`,
      `"${t.paymentStatus || ""}"`,
      t.paidAmount || 1000,
      `"${t.quranSkill || ""}"`,
      `"${t.hasLaptop || ""}"`,
      `"${t.evaluation?.grade || "N/A"}"`,
      `"${t.evaluation?.totalScore || "N/A"}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fajr_tot_trainees_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit Evaluation
  const handleQuickEvalSubmit = async (e) => {
    e.preventDefault();
    if (!evalModalTrainee) return;
    setIsSubmittingEval(true);

    try {
      const res = await fetch("/api/instructor/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          traineeId: evalModalTrainee._id,
          scores,
          remarks: evalRemarks,
        }),
      });
      const data = await res.json();
      if (data.success && data.evaluation) {
        setEvalSuccessMsg(data.message);
        // Update trainee in state
        setTrainees(
          trainees.map((t) =>
            t._id === evalModalTrainee._id
              ? {
                  ...t,
                  evaluation: {
                    totalScore: data.evaluation.totalScore,
                    grade: data.evaluation.grade,
                    qualificationStatus: data.evaluation.qualificationStatus,
                    scores: data.evaluation.scores,
                    remarks: data.evaluation.remarks,
                  },
                }
              : t
          )
        );
        setTimeout(() => {
          setEvalSuccessMsg(null);
          setEvalModalTrainee(null);
        }, 1500);
      } else {
        alert(data.message || "মূল্যায়ন সংরক্ষণ ব্যর্থ হয়েছে");
      }
    } catch (err) {
      console.error(err);
      alert("মূল্যায়ন সংরক্ষণ ব্যর্থ হয়েছে");
    } finally {
      setIsSubmittingEval(false);
    }
  };

  const totalScoreCalc =
    (Number(scores.makhrajTajweed) || 0) +
    (Number(scores.childPsychologyPedagogy) || 0) +
    (Number(scores.digitalClassroomTools) || 0) +
    (Number(scores.microTeachingDemo) || 0);

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/instructor"
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> ড্যাশবোর্ড ওভারভিউ
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
            টিচার ট্রেইনি ডিরেক্টরি ({filtered.length} জন)
          </h1>
          <p className="text-xs text-slate-400">
            TOT Men ও TOT Women ব্যাচে নিবন্ধিত প্রার্থীদের তথ্য, দক্ষতা ও মূল্যায়ন স্ট্যাটাস
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-2 border border-slate-700 shadow-sm transition-all"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" /> এক্সপোর্ট CSV
        </button>
      </div>

      {/* Filter Bar & Search */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-3xl shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="নাম, ইমেইল, মোবাইল অথবা TrxID দিয়ে সার্চ করুন..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-2.5 pl-10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Multi Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">সকল ব্যাচ</option>
              <option value="men">👨 TOT MEN</option>
              <option value="women">🧕 TOT WOMEN (014)</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">সকল পেমেন্ট</option>
              <option value="paid">✓ Paid (পরিশোধিত)</option>
              <option value="pending">⏳ Pending (বকেয়া)</option>
            </select>

            <select
              value={evalFilter}
              onChange={(e) => setEvalFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">সকল মূল্যায়ন</option>
              <option value="evaluated">✓ গ্রেডিং সম্পন্ন</option>
              <option value="pending">⏳ গ্রেডিং বাকি</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trainees Grid Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th className="p-4">ট্রেইনির নাম</th>
                <th className="p-4">ব্যাচ ও ট্র্যাক</th>
                <th className="p-4">যোগাযোগ</th>
                <th className="p-4">কুরআন দক্ষতা ও ল্যাপটপ</th>
                <th className="p-4">পেমেন্ট</th>
                <th className="p-4">মূল্যায়ন ও গ্রেড</th>
                <th className="p-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500 space-y-2">
                    <Users className="w-8 h-8 text-slate-600 mx-auto" />
                    <p>কোনো ট্রেইনি তথ্য পাওয়া যায়নি।</p>
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        {t.fullName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {t.tranId ? t.tranId.replace("TOT-PAID-", "TOT-TR-") : "TOT-TR-014"}
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          t.track === "TOT-MEN" || t.gender === "male"
                            ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        }`}
                      >
                        {t.track === "TOT-MEN" || t.gender === "male" ? "TOT MEN" : "TOT WOMEN (014)"}
                      </span>
                    </td>

                    <td className="p-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Phone className="w-3 h-3 text-slate-500" /> {t.phone}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                        <Mail className="w-3 h-3 text-slate-500" /> {t.email}
                      </div>
                    </td>

                    <td className="p-4 space-y-1">
                      <div className="text-[11px] flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-indigo-400" />
                        <span>কুরআন: <strong className="text-white">{t.quranSkill || "fluent"}</strong></span>
                      </div>
                      <div className="text-[11px] flex items-center gap-1">
                        <Laptop className="w-3 h-3 text-emerald-400" />
                        <span>ল্যাপটপ: <strong className="text-white">{t.hasLaptop === "yes" ? "আছে" : "প্রয়োজন"}</strong></span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          t.paymentStatus === "paid"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {t.paymentStatus === "paid" ? "✓ ৳১,০০০ Paid" : "Pending"}
                      </span>
                    </td>

                    <td className="p-4">
                      {t.evaluation ? (
                        <div className="space-y-0.5">
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              t.evaluation.qualificationStatus === "hired"
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                            }`}
                          >
                            {t.evaluation.grade} ({t.evaluation.totalScore}/১০০)
                          </span>
                          <p className="text-[10px] text-slate-400">
                            {t.evaluation.qualificationStatus === "hired" ? "✓ শিক্ষক নিয়োগ অনুমোদন" : "সার্টিফাইড"}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">মূল্যায়ন বাকি</span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedTrainee(t)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="প্রোফাইল দেখুন"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setEvalModalTrainee(t);
                            if (t.evaluation?.scores) {
                              setScores(t.evaluation.scores);
                              setEvalRemarks(t.evaluation.remarks || "");
                            } else {
                              setScores({
                                makhrajTajweed: 22,
                                childPsychologyPedagogy: 21,
                                digitalClassroomTools: 23,
                                microTeachingDemo: 22,
                              });
                              setEvalRemarks("");
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <Award className="w-3 h-3" /> গ্রেডিং
                        </button>

                        <Link
                          href={`/id-card?tran_id=${t.tranId}`}
                          className="text-slate-400 hover:text-indigo-300 p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
                          title="আইডি কার্ড"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trainee Profile Drawer / Modal */}
      {selectedTrainee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedTrainee(null)}
          />

          <div className="relative z-10 w-full max-w-lg bg-slate-900 border border-indigo-900/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                  {selectedTrainee.fullName ? selectedTrainee.fullName[0].toUpperCase() : "T"}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{selectedTrainee.fullName}</h3>
                  <span className="text-xs text-indigo-400 font-semibold">{selectedTrainee.designation || "TOT Trainee Teacher"}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTrainee(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">মোবাইল নম্বর</span>
                  <span className="text-white font-bold">{selectedTrainee.phone}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">ইমেইল অ্যাড্রেস</span>
                  <span className="text-white font-bold truncate block">{selectedTrainee.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">ব্যাচ ও ট্র্যাক</span>
                  <span className="text-white font-bold">{selectedTrainee.track || "TOT-MEN"}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">পেমেন্ট স্ট্যাটাস</span>
                  <span className="text-emerald-400 font-bold">
                    {selectedTrainee.paymentStatus === "paid" ? "✓ ৳১,০০০ পরিশোধিত" : "বকেয়া"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">কুরআন পাঠ দক্ষতা</span>
                  <span className="text-white font-bold">{selectedTrainee.quranSkill || "fluent"}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">ল্যাপটপ / কম্পিউটার</span>
                  <span className="text-white font-bold">
                    {selectedTrainee.hasLaptop === "yes" ? "নিজস্ব ল্যাপটপ আছে" : "ল্যাপটপ সহায়তা প্রয়োজন"}
                  </span>
                </div>
              </div>

              {selectedTrainee.education && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">শিক্ষাগত যোগ্যতা</span>
                  <span className="text-white font-medium">{selectedTrainee.education}</span>
                </div>
              )}
            </div>

            {/* Quick Contact & Action Buttons */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
              <a
                href={`https://wa.me/88${selectedTrainee.phone?.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp মেসেজ
              </a>

              <a
                href={`tel:${selectedTrainee.phone}`}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" /> কল করুন
              </a>

              <Link
                href={`/id-card?tran_id=${selectedTrainee.tranId}`}
                className="px-4 py-2.5 rounded-xl bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" /> আইডি কার্ড
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick Evaluation Modal Dialog */}
      {evalModalTrainee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
            onClick={() => setEvalModalTrainee(null)}
          />

          <div className="relative z-10 w-full max-w-xl bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-indigo-400">TOT MASTER EVALUATION</span>
                <h3 className="text-lg font-black text-white">{evalModalTrainee.fullName}</h3>
                <p className="text-xs text-slate-400">
                  {evalModalTrainee.phone} • {evalModalTrainee.track || "TOT Batch"}
                </p>
              </div>
              <button
                onClick={() => setEvalModalTrainee(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickEvalSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Makhraj */}
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">সহীহ মাখরাজ ও তাজবীদ</span>
                    <span className="font-bold text-indigo-400">{scores.makhrajTajweed} / ২৫</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={scores.makhrajTajweed}
                    onChange={(e) =>
                      setScores({ ...scores, makhrajTajweed: Number(e.target.value) })
                    }
                    className="w-full accent-indigo-500"
                  />
                </div>

                {/* Pedagogy */}
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">শিশু সাইকোলজি ও পেডাগজি</span>
                    <span className="font-bold text-indigo-400">{scores.childPsychologyPedagogy} / ২৫</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={scores.childPsychologyPedagogy}
                    onChange={(e) =>
                      setScores({
                        ...scores,
                        childPsychologyPedagogy: Number(e.target.value),
                      })
                    }
                    className="w-full accent-indigo-500"
                  />
                </div>

                {/* Digital Tools */}
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">ডিজিটাল ক্লাসরুম ও এডটেক</span>
                    <span className="font-bold text-indigo-400">{scores.digitalClassroomTools} / ২৫</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={scores.digitalClassroomTools}
                    onChange={(e) =>
                      setScores({
                        ...scores,
                        digitalClassroomTools: Number(e.target.value),
                      })
                    }
                    className="w-full accent-indigo-500"
                  />
                </div>

                {/* Micro-Teaching Demo */}
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">মাইক্রো-টিচিং ডেমো ক্লাস</span>
                    <span className="font-bold text-indigo-400">{scores.microTeachingDemo} / ২৫</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={scores.microTeachingDemo}
                    onChange={(e) =>
                      setScores({
                        ...scores,
                        microTeachingDemo: Number(e.target.value),
                      })
                    }
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>

              {/* Total Summary */}
              <div className="bg-indigo-950/40 p-4 rounded-2xl border border-indigo-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-300 block">মোট স্কোর ও ফলাফল:</span>
                  <div className="text-xl font-black text-white">
                    {totalScoreCalc} / ১০০
                    <span className="ml-2 text-xs font-bold text-indigo-400">
                      {totalScoreCalc >= 85
                        ? "Grade A+ (সরাসরি নিয়োগ প্রাপ্ত)"
                        : totalScoreCalc >= 75
                        ? "Grade A (সার্টিফাইড)"
                        : totalScoreCalc >= 50
                        ? "Grade B (পাস)"
                        : "পুনরায় পরীক্ষা প্রয়োজন"}
                    </span>
                  </div>
                </div>
                <Award className="w-8 h-8 text-amber-400" />
              </div>

              {/* Remarks */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  ইনস্ট্রাক্টরের মন্তব্য ও সুপারিশ:
                </label>
                <textarea
                  rows={2}
                  value={evalRemarks}
                  onChange={(e) => setEvalRemarks(e.target.value)}
                  placeholder="মাখরাজ উচ্চারণ নিখুঁত, সুন্দর ক্লাস ম্যানেজমেন্ট..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {evalSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {evalSuccessMsg}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEvalModalTrainee(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEval}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg shadow-indigo-600/30 transition-all"
                >
                  {isSubmittingEval ? "সংরক্ষণ হচ্ছে..." : "মূল্যায়ন সংরক্ষণ করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
