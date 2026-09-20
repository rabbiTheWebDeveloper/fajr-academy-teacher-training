'use client';

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  X,
  GraduationCap,
  Star,
  RefreshCw,
} from "lucide-react";
import { useAdminTheme } from "../../AdminThemeContext";

export default function AdminEvaluationsClient({
  initialEvaluations = [],
  initialStats = {},
}) {
  const { isLight } = useAdminTheme();
  const [evaluations, setEvaluations] = useState(initialEvaluations);
  const [stats, setStats] = useState(initialStats);
  const [search, setSearch] = useState("");
  const [trackFilter, setTrackFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (text, type = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const filteredEvaluations = evaluations.filter((item) => {
    if (trackFilter !== "all" && item.track !== trackFilter) return false;
    if (gradeFilter !== "all" && item.grade !== gradeFilter) return false;
    if (statusFilter !== "all" && item.qualificationStatus !== statusFilter)
      return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = item.traineeName?.toLowerCase().includes(q);
      const matchEmail = item.traineeEmail?.toLowerCase().includes(q);
      const matchInst = item.instructorName?.toLowerCase().includes(q);
      const matchRemarks = item.remarks?.toLowerCase().includes(q);
      return matchName || matchEmail || matchInst || matchRemarks;
    }

    return true;
  });

  const handleDelete = async (id) => {
    if (
      !confirm(
        "আপনি কি নিশ্চিতভাবে এই মূল্যায়ন রেকর্ডটি মুছে ফেলতে চান? এটি ট্রেইনি রেজাল্টকে আন-ইভ্যালুয়েটেড অবস্থায় ফিরিয়ে দেবে।"
      )
    ) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/evaluations?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setEvaluations((prev) => prev.filter((e) => e._id !== id));
        setStats((prev) => ({
          ...prev,
          totalEvaluated: Math.max(0, prev.totalEvaluated - 1),
        }));
        showToast("মূল্যায়ন রেকর্ড সফলভাবে মুছে ফেলা হয়েছে!");
        if (selectedEvaluation?._id === id) {
          setSelectedEvaluation(null);
        }
      } else {
        showToast(data.message || "মুছে ফেলা ব্যর্থ হয়েছে", "error");
      }
    } catch (err) {
      showToast("নেটওয়ার্ক ত্রুটি", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportCSV = () => {
    if (filteredEvaluations.length === 0) {
      showToast("এক্সপোর্ট করার মতো কোনো ডাটা নেই", "error");
      return;
    }

    const headers = [
      "Trainee Name",
      "Email",
      "Track",
      "Makhraj Score (25)",
      "Pedagogy Score (25)",
      "Tools Score (25)",
      "Demo Score (25)",
      "Total Score (100)",
      "Grade",
      "Qualification Status",
      "Instructor",
      "Evaluated Date",
    ];

    const rows = filteredEvaluations.map((e) => [
      `"${e.traineeName || ""}"`,
      `"${e.traineeEmail || ""}"`,
      `"${e.track || ""}"`,
      e.scores?.makhrajTajweed ?? 0,
      e.scores?.childPsychologyPedagogy ?? 0,
      e.scores?.digitalClassroomTools ?? 0,
      e.scores?.microTeachingDemo ?? 0,
      e.totalScore ?? 0,
      `"${e.grade || ""}"`,
      `"${e.qualificationStatus || ""}"`,
      `"${e.instructorName || ""}"`,
      `"${e.evaluatedAt ? new Date(e.evaluatedAt).toLocaleDateString() : ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Fajr_TOT_Evaluations_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("CSV ফাইল সফলভাবে ডাউনলোড হয়েছে!");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "certified_and_hired":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="w-3 h-3 text-emerald-400" /> শিক্ষক হিসেবে নির্বাচিত
          </span>
        );
      case "certified":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#C59B27]/20 text-[#D4AF37] border border-[#C59B27]/30">
            <CheckCircle2 className="w-3 h-3 text-[#D4AF37]" /> উত্তীর্ণ ও সার্টিফাইড
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <AlertCircle className="w-3 h-3 text-amber-400" /> উন্নতি প্রয়োজন
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 transition-all ${
            toastMsg.type === "error"
              ? "bg-rose-600 text-white"
              : "bg-emerald-600 text-white"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          {toastMsg.text}
        </div>
      )}

      {/* Header Banner */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 border shadow-2xl transition-all ${
          isLight
            ? "bg-gradient-to-br from-white via-amber-50/40 to-slate-50 border-slate-200"
            : "bg-gradient-to-br from-[#051329] via-[#081A3A] to-[#0B2545] border-[#C59B27]/35"
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                isLight
                  ? "bg-amber-100/80 text-amber-800 border border-amber-300"
                  : "bg-[#081A3A] text-[#D4AF37] border border-[#C59B27]/40"
              }`}
            >
              <Award className="w-3.5 h-3.5" /> ট্রেইনার্স কোয়ালিফিকেশন মাস্টার পোর্টাল
            </div>
            <h1
              className={`text-2xl sm:text-3xl font-black ${
                isLight ? "text-slate-900" : "text-white"
              }`}
            >
              ট্রেইনি মূল্যায়ন, স্কোরকার্ড ও সনদপত্র
            </h1>
            <p
              className={`text-xs sm:text-sm ${
                isLight ? "text-slate-600" : "text-slate-300"
              }`}
            >
              ইনস্ট্রাক্টর কর্তৃক মূল্যায়িত ৪-রুব্রিক নম্বর বিভাজন, ফাইনাল গ্রেড ও শিক্ষক নিয়োগ সুপারিশ
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#051329] font-bold text-xs shadow-lg hover:shadow-[#D4AF37]/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" /> CSV এক্সপোর্ট
            </button>

            <Link
              href="/instructor/evaluations"
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                isLight
                  ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                  : "bg-[#081A3A] border-slate-700 text-slate-200 hover:text-white hover:border-[#D4AF37]/40"
              }`}
            >
              ইনস্ট্রাক্টর মার্কিং প্যানেল →
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Evaluated */}
        <div
          className={`p-5 rounded-2xl border shadow-lg relative overflow-hidden ${
            isLight
              ? "bg-white border-slate-200"
              : "bg-[#051329] border-slate-800"
          }`}
        >
          <div className="text-xs font-semibold text-slate-400">
            মোট মূল্যায়িত ট্রেইনি
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white mt-2">
            {stats.totalEvaluated || evaluations.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            ৪টি মডিউল ও ডেমো সম্পন্ন
          </div>
        </div>

        {/* Selected for Hired */}
        <div
          className={`p-5 rounded-2xl border shadow-lg relative overflow-hidden ${
            isLight
              ? "bg-emerald-50/50 border-emerald-200"
              : "bg-[#051329] border-emerald-500/30"
          }`}
        >
          <div className="text-xs font-semibold text-emerald-400">
            শিক্ষক হিসেবে নির্বাচিত (Hired)
          </div>
          <div className="text-3xl sm:text-4xl font-black text-emerald-400 mt-2">
            {stats.certifiedAndHired || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            ফজর একাডেমি ফ্যাকাল্টি সুপারিশ
          </div>
        </div>

        {/* Certified */}
        <div
          className={`p-5 rounded-2xl border shadow-lg relative overflow-hidden ${
            isLight
              ? "bg-amber-50/50 border-amber-200"
              : "bg-[#051329] border-[#C59B27]/30"
          }`}
        >
          <div className="text-xs font-semibold text-[#D4AF37]">
            সার্টিফাইড উত্তীর্ণ (Passed)
          </div>
          <div className="text-3xl sm:text-4xl font-black text-[#D4AF37] mt-2">
            {stats.certifiedOnly || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            সনদপত্র ইস্যু সম্পন্ন
          </div>
        </div>

        {/* Average Score */}
        <div
          className={`p-5 rounded-2xl border shadow-lg relative overflow-hidden ${
            isLight
              ? "bg-white border-slate-200"
              : "bg-[#051329] border-slate-800"
          }`}
        >
          <div className="text-xs font-semibold text-slate-400">
            গড় স্কোর (Avg Score)
          </div>
          <div className="text-3xl sm:text-4xl font-black text-blue-400 mt-2">
            {stats.averageScore || 0}
            <span className="text-lg text-slate-500 font-medium ml-1">/100</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            সকল ব্যাচের সামগ্রিক মান
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border shadow-md flex flex-wrap items-center justify-between gap-4 ${
          isLight
            ? "bg-white border-slate-200"
            : "bg-[#051329] border-slate-800"
        }`}
      >
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ট্রেইনির নাম, ইমেইল অথবা ইনস্ট্রাক্টর দিয়ে খুঁজুন..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm transition-all focus:outline-hidden ${
              isLight
                ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500"
                : "bg-slate-900/80 border-slate-700 text-white focus:border-[#D4AF37]"
            }`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Track Filter */}
          <select
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value)}
            className={`px-3 py-2 rounded-xl border text-xs font-medium focus:outline-hidden ${
              isLight
                ? "bg-slate-50 border-slate-300 text-slate-800"
                : "bg-slate-900 border-slate-700 text-slate-200"
            }`}
          >
            <option value="all">সব ব্যাচ ট্র্যাক</option>
            <option value="TOT-MEN">TOT-MEN (পুরুষ ব্যাচ)</option>
            <option value="TOT-WOMEN-014">TOT-WOMEN-014 (মহিলা ব্যাচ)</option>
            <option value="TOT-WOMEN">TOT-WOMEN</option>
          </select>

          {/* Grade Filter */}
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className={`px-3 py-2 rounded-xl border text-xs font-medium focus:outline-hidden ${
              isLight
                ? "bg-slate-50 border-slate-300 text-slate-800"
                : "bg-slate-900 border-slate-700 text-slate-200"
            }`}
          >
            <option value="all">সব গ্রেড</option>
            <option value="A+">গ্রেড A+ (৯০+)</option>
            <option value="A">গ্রেড A (৮০-৮৯)</option>
            <option value="B">গ্রেড B (৭০-৭৯)</option>
            <option value="C">গ্রেড C (৬০-৬৯)</option>
            <option value="F">গ্রেড F (&lt; ৬০)</option>
          </select>

          {/* Qualification Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-3 py-2 rounded-xl border text-xs font-medium focus:outline-hidden ${
              isLight
                ? "bg-slate-50 border-slate-300 text-slate-800"
                : "bg-slate-900 border-slate-700 text-slate-200"
            }`}
          >
            <option value="all">সব ফলাফল অবস্থা</option>
            <option value="certified_and_hired">শিক্ষক নির্বাচিত (Hired)</option>
            <option value="certified">সার্টিফাইড (Certified)</option>
            <option value="needs_improvement">উন্নতি প্রয়োজন</option>
          </select>
        </div>
      </div>

      {/* Evaluations Table */}
      <div
        className={`rounded-2xl border shadow-xl overflow-hidden ${
          isLight
            ? "bg-white border-slate-200"
            : "bg-[#051329] border-slate-800"
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead
              className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                isLight
                  ? "bg-slate-100 text-slate-700 border-slate-200"
                  : "bg-[#081A3A] text-slate-400 border-slate-800"
              }`}
            >
              <tr>
                <th className="py-3.5 px-4">ট্রেইনি বিবরণ</th>
                <th className="py-3.5 px-3">ব্যাচ ট্র্যাক</th>
                <th className="py-3.5 px-3">৪-রুব্রিক বিভাজন</th>
                <th className="py-3.5 px-3">মোট স্কোর ও গ্রেড</th>
                <th className="py-3.5 px-3">ফলাফল ও রিকমেন্ডেশন</th>
                <th className="py-3.5 px-3">মূল্যায়নকারী</th>
                <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredEvaluations.length > 0 ? (
                filteredEvaluations.map((item) => (
                  <tr
                    key={item._id}
                    className={`transition-colors ${
                      isLight
                        ? "hover:bg-slate-50/80 divide-slate-100"
                        : "hover:bg-slate-800/40"
                    }`}
                  >
                    {/* Trainee Info */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-sm">
                        {item.traineeName || "Trainee Teacher"}
                      </div>
                      <div className="text-xs text-slate-400">
                        {item.traineeEmail || "email@fajracademy.io"}
                      </div>
                    </td>

                    {/* Track */}
                    <td className="py-3.5 px-3">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                        {item.track || "TOT-MEN"}
                      </span>
                    </td>

                    {/* 4 Rubrics Breakdown */}
                    <td className="py-3.5 px-3">
                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-slate-300 font-mono">
                        <span>
                          তাজবীদ:{" "}
                          <strong className="text-amber-400">
                            {item.scores?.makhrajTajweed ?? 0}
                          </strong>
                        </span>
                        <span>
                          পেডাগজি:{" "}
                          <strong className="text-emerald-400">
                            {item.scores?.childPsychologyPedagogy ?? 0}
                          </strong>
                        </span>
                        <span>
                          টুলস:{" "}
                          <strong className="text-blue-400">
                            {item.scores?.digitalClassroomTools ?? 0}
                          </strong>
                        </span>
                        <span>
                          ডেমো:{" "}
                          <strong className="text-purple-400">
                            {item.scores?.microTeachingDemo ?? 0}
                          </strong>
                        </span>
                      </div>
                    </td>

                    {/* Total & Grade */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-[#D4AF37]">
                          {item.totalScore ?? 0}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {item.grade || "A"}
                        </span>
                      </div>
                    </td>

                    {/* Qualification */}
                    <td className="py-3.5 px-3">
                      {getStatusBadge(item.qualificationStatus)}
                    </td>

                    {/* Evaluator */}
                    <td className="py-3.5 px-3 text-xs text-slate-300">
                      <div>{item.instructorName || "ফ্যাকাল্টি"}</div>
                      <div className="text-[10px] text-slate-500">
                        {item.evaluatedAt
                          ? new Date(item.evaluatedAt).toLocaleDateString("bn-BD")
                          : ""}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedEvaluation(item)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-[#D4AF37] transition-colors"
                          title="বিস্তারিত স্কোরকার্ড দেখুন"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(item._id)}
                          disabled={deletingId === item._id}
                          className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 transition-colors disabled:opacity-50"
                          title="মূল্যায়ন রেকর্ড মুছুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-slate-400 text-sm"
                  >
                    কোনো মূল্যায়ন রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Modal */}
      {selectedEvaluation && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#051329] border border-[#C59B27]/40 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedEvaluation(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                Evaluation Scorecard Details
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {selectedEvaluation.traineeName}
              </h3>
              <p className="text-xs text-slate-400">
                {selectedEvaluation.traineeEmail} • ব্যাচ:{" "}
                <span className="text-[#D4AF37] font-semibold">
                  {selectedEvaluation.track}
                </span>
              </p>
            </div>

            {/* Total Score & Grade Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-[#081A3A] p-4 rounded-2xl border border-slate-800 text-center">
                <div className="text-xs text-slate-400 mb-1">মোট নম্বর</div>
                <div className="text-4xl font-black text-[#D4AF37]">
                  {selectedEvaluation.totalScore}
                  <span className="text-base text-slate-500">/100</span>
                </div>
              </div>

              <div className="bg-[#081A3A] p-4 rounded-2xl border border-slate-800 text-center">
                <div className="text-xs text-slate-400 mb-1">লেটার গ্রেড</div>
                <div className="text-4xl font-black text-emerald-400">
                  {selectedEvaluation.grade}
                </div>
              </div>

              <div className="bg-[#081A3A] p-4 rounded-2xl border border-slate-800 text-center col-span-2 sm:col-span-1">
                <div className="text-xs text-slate-400 mb-1">ফলাফল স্ট্যাটাস</div>
                <div className="mt-2">
                  {getStatusBadge(selectedEvaluation.qualificationStatus)}
                </div>
              </div>
            </div>

            {/* 4 Rubrics Detailed Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                ৪-স্তরীয় মূল্যায়ন নম্বর বিভাজন:
              </h4>

              <div className="space-y-2.5">
                {[
                  {
                    name: "মাখরাজ ও তাজবীদ বিশুদ্ধতা",
                    score: selectedEvaluation.scores?.makhrajTajweed || 0,
                    color: "bg-amber-400",
                  },
                  {
                    name: "শিশু মনোবিজ্ঞান ও আধুনিক শিক্ষাদান পদ্ধতি",
                    score: selectedEvaluation.scores?.childPsychologyPedagogy || 0,
                    color: "bg-emerald-400",
                  },
                  {
                    name: "ডিজিটাল ক্লাসরুম ও সফটওয়্যার পরিচালনা",
                    score: selectedEvaluation.scores?.digitalClassroomTools || 0,
                    color: "bg-blue-400",
                  },
                  {
                    name: "মাইক্রো-টিচিং লাইভ ডেমো ক্লাস",
                    score: selectedEvaluation.scores?.microTeachingDemo || 0,
                    color: "bg-purple-400",
                  },
                ].map((r, i) => (
                  <div
                    key={i}
                    className="bg-[#081A3A] p-3.5 rounded-xl border border-slate-800/80"
                  >
                    <div className="flex justify-between text-xs font-bold text-white mb-1.5">
                      <span>{r.name}</span>
                      <span className="text-[#D4AF37]">
                        {r.score}{" "}
                        <span className="text-slate-500 font-normal">/ 25</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full ${r.color} rounded-full`}
                        style={{ width: `${(r.score / 25) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Remarks */}
            {selectedEvaluation.remarks && (
              <div className="bg-[#081A3A] p-4 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="text-xs font-bold text-[#D4AF37]">
                  ইনস্ট্রাক্টরের পর্যবেক্ষণ ও মন্তব্য:
                </div>
                <p className="text-xs text-slate-200 italic leading-relaxed">
                  &ldquo;{selectedEvaluation.remarks}&rdquo;
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div className="text-xs text-slate-400">
                মূল্যায়নকারী:{" "}
                <span className="text-white font-semibold">
                  {selectedEvaluation.instructorName}
                </span>
              </div>

              <Link
                href={`/results?email=${encodeURIComponent(
                  selectedEvaluation.traineeEmail
                )}`}
                target="_blank"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#D4AF37] hover:underline"
              >
                ট্রেইনি সার্টিফিকেট প্রিভিউ <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
