'use client';

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  Search,
  Download,
  Eye,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  X,
  RefreshCw,
} from "lucide-react";
import { useAdminTheme } from "../../AdminThemeContext";
import { useAdminAccess } from "../../AdminAccessContext";
import { AdminToast, DbErrorBanner, callApi, formatDate, useConfirm, useToast } from "../../_shared/admin-ui";

/** Must match calculateGradeAndStatus in src/model/evaluation-model.js. */
const STATUS_META = {
  hired: {
    label: "নিয়োগপ্রাপ্ত",
    en: "Hired",
    icon: Sparkles,
    cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  certified: {
    label: "সার্টিফাইড",
    en: "Certified",
    icon: CheckCircle2,
    cls: "bg-[#C59B27]/20 text-[#D4AF37] border-[#C59B27]/30",
  },
  "in-review": {
    label: "পর্যালোচনাধীন",
    en: "In review",
    icon: Clock,
    cls: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  "retake-needed": {
    label: "পুনরায় মূল্যায়ন প্রয়োজন",
    en: "Retake needed",
    icon: AlertCircle,
    cls: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
};

const GRADES = [
  { value: "A+", range: "৮৫+", cls: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  { value: "A", range: "৭৫–৮৪", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" },
  { value: "B+", range: "৬৫–৭৪", cls: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  { value: "B", range: "৫০–৬৪", cls: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
  { value: "C", range: "৪০–৪৯", cls: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  { value: "F", range: "৪০-এর নিচে", cls: "bg-rose-500/20 text-rose-300 border-rose-500/30" },
];
const GRADE_CLS = Object.fromEntries(GRADES.map((g) => [g.value, g.cls]));

function computeStats(list) {
  const count = (s) => list.filter((e) => e.qualificationStatus === s).length;
  const total = list.length;
  return {
    totalEvaluated: total,
    hired: count("hired"),
    certified: count("certified"),
    inReview: count("in-review"),
    retakeNeeded: count("retake-needed"),
    averageScore: total ? Math.round((list.reduce((a, e) => a + (Number(e.totalScore) || 0), 0) / total) * 10) / 10 : 0,
  };
}

const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

function StatusBadge({ status }) {
  const meta = STATUS_META[status];
  if (!meta) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/30">
        {status || "—"}
      </span>
    );
  }
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${meta.cls}`}>
      <Icon className="w-3 h-3" /> {meta.label}
    </span>
  );
}

export default function AdminEvaluationsClient({ initialEvaluations = [], loadError: initialLoadError }) {
  const { isLight } = useAdminTheme();
  const { isSuper } = useAdminAccess(); // deleting an evaluation is super-admin only
  const [evaluations, setEvaluations] = useState(initialEvaluations);
  const [loadError, setLoadError] = useState(initialLoadError);
  const [reloading, setReloading] = useState(false);
  const [search, setSearch] = useState("");
  const [trackFilter, setTrackFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { toast, showToast, hideToast } = useToast();
  const { confirm, confirmDialog } = useConfirm();

  // Derived from the real list, so deletes and reloads are always reflected exactly.
  const stats = computeStats(evaluations);

  const reload = async () => {
    setReloading(true);
    const { ok, data, message } = await callApi("/api/admin/evaluations");
    setReloading(false);
    if (!ok) {
      showToast(message, "error");
      return;
    }
    setEvaluations(data.evaluations || []);
    setLoadError(null);
    showToast(`${(data.evaluations || []).length} টি মূল্যায়নের সর্বশেষ তথ্য লোড হয়েছে।`);
  };

  const q = search.trim().toLowerCase();
  const filteredEvaluations = evaluations.filter((item) => {
    if (trackFilter !== "all" && item.track !== trackFilter) return false;
    if (gradeFilter !== "all" && item.grade !== gradeFilter) return false;
    if (statusFilter !== "all" && item.qualificationStatus !== statusFilter) return false;
    if (!q) return true;
    return [item.traineeName, item.traineeEmail, item.instructorName, item.remarks].some((v) => String(v || "").toLowerCase().includes(q));
  });

  const handleDelete = async (item) => {
    if (
      !(await confirm(
        `"${item.traineeName}"-এর মূল্যায়ন রেকর্ডটি স্থায়ীভাবে মুছে ফেলবেন?\n\nএটি ট্রেইনির রেজাল্টকে আন-ইভ্যালুয়েটেড অবস্থায় ফিরিয়ে দেবে।`,
        { tone: "danger", title: "মূল্যায়ন মুছে ফেলবেন?" }
      ))
    )
      return;

    setDeletingId(item._id);
    const { ok, message } = await callApi(`/api/admin/evaluations?id=${encodeURIComponent(item._id)}`, { method: "DELETE" });
    setDeletingId(null);
    if (!ok) {
      showToast(message, "error");
      return;
    }
    setEvaluations((prev) => prev.filter((e) => e._id !== item._id));
    setSelectedEvaluation((prev) => (prev?._id === item._id ? null : prev));
    showToast(message || "মূল্যায়ন রেকর্ড মুছে ফেলা হয়েছে।");
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
      csvCell(e.traineeName),
      csvCell(e.traineeEmail),
      csvCell(e.track),
      e.scores?.makhrajTajweed ?? 0,
      e.scores?.childPsychologyPedagogy ?? 0,
      e.scores?.digitalClassroomTools ?? 0,
      e.scores?.microTeachingDemo ?? 0,
      e.totalScore ?? 0,
      csvCell(e.grade),
      csvCell(STATUS_META[e.qualificationStatus]?.en || e.qualificationStatus),
      csvCell(e.instructorName),
      csvCell(e.evaluatedAt ? new Date(e.evaluatedAt).toISOString().slice(0, 10) : ""),
    ]);

    // BOM so Excel opens Bengali names correctly.
    const csv = "﻿" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `Fajr_TOT_Evaluations_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`${filteredEvaluations.length} টি মূল্যায়ন CSV ফাইলে ডাউনলোড হয়েছে!`);
  };

  const kpi = (extra) => `p-5 rounded-2xl border shadow-lg relative overflow-hidden ${extra}`;
  const selectCls = `px-3 py-2 rounded-xl border text-xs font-medium focus:outline-hidden ${
    isLight ? "bg-slate-50 border-slate-300 text-slate-800" : "bg-slate-900 border-slate-700 text-slate-200"
  }`;

  const emptyText = evaluations.length === 0 ? "এখনো কোনো মূল্যায়ন রেকর্ড নেই।" : "ফিল্টারের সাথে মেলে এমন কোনো মূল্যায়ন পাওয়া যায়নি।";

  // Cell renderers shared by the desktop table and the phone cards.
  const traineeBlock = (item) => (
    <>
      <div className={`font-bold text-sm wrap-break-word ${isLight ? "text-slate-900" : "text-white"}`}>{item.traineeName || "—"}</div>
      <div className="text-xs text-slate-400 break-all">{item.traineeEmail || "—"}</div>
    </>
  );

  const trackBadge = (item) => (
    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#B8901F] border border-[#D4AF37]/30 shrink-0">{item.track || "—"}</span>
  );

  const rubricBlock = (item) => (
    <div className={`grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] font-mono ${isLight ? "text-slate-700" : "text-slate-300"}`}>
      <span>
        তাজবীদ: <strong className="text-amber-500">{item.scores?.makhrajTajweed ?? 0}</strong>
      </span>
      <span>
        পেডাগজি: <strong className="text-emerald-500">{item.scores?.childPsychologyPedagogy ?? 0}</strong>
      </span>
      <span>
        টুলস: <strong className="text-blue-500">{item.scores?.digitalClassroomTools ?? 0}</strong>
      </span>
      <span>
        ডেমো: <strong className="text-purple-500">{item.scores?.microTeachingDemo ?? 0}</strong>
      </span>
    </div>
  );

  const scoreBlock = (item) => (
    <div className="flex items-center gap-2">
      <span className="text-base font-black text-[#C59B27]">{item.totalScore ?? 0}</span>
      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${GRADE_CLS[item.grade] || "bg-slate-500/20 text-slate-300 border-slate-500/30"}`}>
        {item.grade || "—"}
      </span>
    </div>
  );

  const evaluatorBlock = (item) => (
    <>
      <div>{item.instructorName || "—"}</div>
      <div className="text-[10px] text-slate-500">{formatDate(item.evaluatedAt || item.createdAt)}</div>
    </>
  );

  const rowActions = (item) => (
    <div className="flex items-center justify-end gap-1.5">
      <button
        onClick={() => setSelectedEvaluation(item)}
        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-[#D4AF37] transition-colors cursor-pointer"
        title="বিস্তারিত স্কোরকার্ড দেখুন"
      >
        <Eye className="w-4 h-4" />
      </button>
      {isSuper && (
        <button
          onClick={() => handleDelete(item)}
          disabled={deletingId === item._id}
          className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 transition-colors disabled:opacity-50 cursor-pointer"
          title="মূল্যায়ন রেকর্ড মুছুন"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {confirmDialog}
      <AdminToast toast={toast} onClose={hideToast} />
      <DbErrorBanner message={loadError} isLight={isLight} onRetry={reload} retrying={reloading} />

      {/* Header Banner */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 border shadow-2xl transition-all ${
          isLight ? "bg-gradient-to-br from-white via-amber-50/40 to-slate-50 border-slate-200" : "bg-gradient-to-br from-[#051329] via-[#081A3A] to-[#0B2545] border-[#C59B27]/35"
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                isLight ? "bg-amber-100/80 text-amber-800 border border-amber-300" : "bg-[#081A3A] text-[#D4AF37] border border-[#C59B27]/40"
              }`}
            >
              <Award className="w-3.5 h-3.5" /> ট্রেইনার্স কোয়ালিফিকেশন মাস্টার পোর্টাল
            </div>
            <h1 className={`text-xl sm:text-3xl font-black ${isLight ? "text-slate-900" : "text-white"}`}>ট্রেইনি মূল্যায়ন, স্কোরকার্ড ও সনদপত্র</h1>
            <p className={`text-xs sm:text-sm ${isLight ? "text-slate-600" : "text-slate-300"}`}>
              ইনস্ট্রাক্টর কর্তৃক মূল্যায়িত ৪-রুব্রিক নম্বর বিভাজন, ফাইনাল গ্রেড ও শিক্ষক নিয়োগ সুপারিশ
            </p>
          </div>

          <div className="panel-grid2 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={reload}
              disabled={reloading}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer disabled:opacity-60 ${
                isLight ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-50" : "bg-[#081A3A] border-slate-700 text-slate-200 hover:text-white"
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${reloading ? "animate-spin" : ""}`} /> রিফ্রেশ
            </button>

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

      {/* KPI Stats Grid — all four qualification statuses + average */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className={kpi(isLight ? "bg-white border-slate-200" : "bg-[#051329] border-slate-800")}>
          <div className="text-xs font-semibold text-slate-400">মোট মূল্যায়িত ট্রেইনি</div>
          <div className={`text-3xl sm:text-4xl font-black mt-2 ${isLight ? "text-slate-900" : "text-white"}`}>{stats.totalEvaluated}</div>
          <div className="text-[11px] text-slate-500 mt-1">৪টি রুব্রিকে নম্বর প্রদান সম্পন্ন</div>
        </div>

        <div className={kpi(isLight ? "bg-emerald-50/50 border-emerald-200" : "bg-[#051329] border-emerald-500/30")}>
          <div className="text-xs font-semibold text-emerald-500">নিয়োগপ্রাপ্ত (Hired)</div>
          <div className="text-3xl sm:text-4xl font-black text-emerald-500 mt-2">{stats.hired}</div>
          <div className="text-[11px] text-slate-500 mt-1">A+ গ্রেড (৮৫+) — ফ্যাকাল্টি সুপারিশ</div>
        </div>

        <div className={kpi(isLight ? "bg-amber-50/50 border-amber-200" : "bg-[#051329] border-[#C59B27]/30")}>
          <div className="text-xs font-semibold text-[#C59B27]">সার্টিফাইড (Certified)</div>
          <div className="text-3xl sm:text-4xl font-black text-[#C59B27] mt-2">{stats.certified}</div>
          <div className="text-[11px] text-slate-500 mt-1">A / B+ গ্রেড (৬৫–৮৪)</div>
        </div>

        <div className={kpi(isLight ? "bg-blue-50/50 border-blue-200" : "bg-[#051329] border-blue-500/30")}>
          <div className="text-xs font-semibold text-blue-500">পর্যালোচনাধীন (In review)</div>
          <div className="text-3xl sm:text-4xl font-black text-blue-500 mt-2">{stats.inReview}</div>
          <div className="text-[11px] text-slate-500 mt-1">B গ্রেড (৫০–৬৪)</div>
        </div>

        <div className={kpi(isLight ? "bg-orange-50/50 border-orange-200" : "bg-[#051329] border-amber-500/30")}>
          <div className="text-xs font-semibold text-amber-500">পুনরায় মূল্যায়ন প্রয়োজন</div>
          <div className="text-3xl sm:text-4xl font-black text-amber-500 mt-2">{stats.retakeNeeded}</div>
          <div className="text-[11px] text-slate-500 mt-1">C / F গ্রেড (৫০-এর নিচে)</div>
        </div>

        <div className={kpi(isLight ? "bg-white border-slate-200" : "bg-[#051329] border-slate-800")}>
          <div className="text-xs font-semibold text-slate-400">গড় স্কোর (Avg Score)</div>
          <div className="text-3xl sm:text-4xl font-black text-blue-400 mt-2">
            {stats.averageScore}
            <span className="text-lg text-slate-500 font-medium ml-1">/100</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">সকল ব্যাচের সামগ্রিক মান</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border shadow-md flex flex-wrap items-center justify-between gap-4 ${
          isLight ? "bg-white border-slate-200" : "bg-[#051329] border-slate-800"
        }`}
      >
        <div className="flex-1 w-full sm:w-auto sm:min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ট্রেইনির নাম, ইমেইল অথবা ইনস্ট্রাক্টর দিয়ে খুঁজুন..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm transition-all focus:outline-hidden ${
              isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500" : "bg-slate-900/80 border-slate-700 text-white focus:border-[#D4AF37]"
            }`}
          />
        </div>

        <div className="panel-grid2 flex flex-wrap items-center gap-2.5">
          <select value={trackFilter} onChange={(e) => setTrackFilter(e.target.value)} className={selectCls}>
            <option value="all">সব ব্যাচ ট্র্যাক</option>
            <option value="TOT-MEN">TOT-MEN (পুরুষ ব্যাচ)</option>
            <option value="TOT-WOMEN-014">TOT-WOMEN-014 (মহিলা ব্যাচ)</option>
            <option value="TOT-WOMEN">TOT-WOMEN</option>
            <option value="general">General</option>
          </select>

          <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} className={selectCls}>
            <option value="all">সব গ্রেড</option>
            {GRADES.map((g) => (
              <option key={g.value} value={g.value}>
                গ্রেড {g.value} ({g.range})
              </option>
            ))}
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectCls}>
            <option value="all">সব ফলাফল অবস্থা</option>
            {Object.entries(STATUS_META).map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.label} ({meta.en})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Evaluations table (≥ md) and cards (< md) */}
      <div className={`rounded-2xl border shadow-xl overflow-hidden ${isLight ? "bg-white border-slate-200" : "bg-[#051329] border-slate-800"}`}>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead
              className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                isLight ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-[#081A3A] text-slate-400 border-slate-800"
              }`}
            >
              <tr>
                <th className="py-3.5 px-4">ট্রেইনি বিবরণ</th>
                <th className="py-3.5 px-3">ব্যাচ ট্র্যাক</th>
                <th className="py-3.5 px-3">৪-রুব্রিক বিভাজন</th>
                <th className="py-3.5 px-3">মোট স্কোর ও গ্রেড</th>
                <th className="py-3.5 px-3">ফলাফল ও রিকমেন্ডেশন</th>
                <th className="py-3.5 px-3">মূল্যায়নকারী</th>
                <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredEvaluations.length > 0 ? (
                filteredEvaluations.map((item) => (
                  <tr key={item._id} className={`transition-colors ${isLight ? "hover:bg-slate-50/80" : "hover:bg-slate-800/40"}`}>
                    <td className="py-3.5 px-4">{traineeBlock(item)}</td>
                    <td className="py-3.5 px-3">{trackBadge(item)}</td>
                    <td className="py-3.5 px-3">{rubricBlock(item)}</td>
                    <td className="py-3.5 px-3">{scoreBlock(item)}</td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={item.qualificationStatus} />
                    </td>
                    <td className={`py-3.5 px-3 text-xs ${isLight ? "text-slate-700" : "text-slate-300"}`}>{evaluatorBlock(item)}</td>
                    <td className="py-3.5 px-4 text-right">{rowActions(item)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    {emptyText}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Phone layout: one scorecard per trainee */}
        <ul className={`md:hidden divide-y ${isLight ? "divide-slate-200" : "divide-slate-800/60"}`}>
          {filteredEvaluations.length === 0 ? (
            <li className="py-10 px-4 text-center text-slate-400 text-xs">{emptyText}</li>
          ) : (
            filteredEvaluations.map((item) => (
              <li key={item._id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">{traineeBlock(item)}</div>
                  {trackBadge(item)}
                </div>
                <div className="flex items-center justify-between gap-3">
                  {scoreBlock(item)}
                  <StatusBadge status={item.qualificationStatus} />
                </div>
                {rubricBlock(item)}
                <div className="flex items-center justify-between gap-3">
                  <div className={`text-xs ${isLight ? "text-slate-700" : "text-slate-300"}`}>{evaluatorBlock(item)}</div>
                  {rowActions(item)}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Inspect Modal */}
      {selectedEvaluation && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#051329] border border-[#C59B27]/40 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedEvaluation(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Evaluation Scorecard Details</span>
              <h3 className="text-xl sm:text-2xl font-black text-white">{selectedEvaluation.traineeName}</h3>
              <p className="text-xs text-slate-400">
                {selectedEvaluation.traineeEmail} • ব্যাচ: <span className="text-[#D4AF37] font-semibold">{selectedEvaluation.track || "—"}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-[#081A3A] p-4 rounded-2xl border border-slate-800 text-center">
                <div className="text-xs text-slate-400 mb-1">মোট নম্বর</div>
                <div className="text-4xl font-black text-[#D4AF37]">
                  {selectedEvaluation.totalScore ?? 0}
                  <span className="text-base text-slate-500">/100</span>
                </div>
              </div>

              <div className="bg-[#081A3A] p-4 rounded-2xl border border-slate-800 text-center">
                <div className="text-xs text-slate-400 mb-1">লেটার গ্রেড</div>
                <div className="text-4xl font-black text-emerald-400">{selectedEvaluation.grade || "—"}</div>
              </div>

              <div className="bg-[#081A3A] p-4 rounded-2xl border border-slate-800 text-center col-span-2 sm:col-span-1">
                <div className="text-xs text-slate-400 mb-1">ফলাফল স্ট্যাটাস</div>
                <div className="mt-2">
                  <StatusBadge status={selectedEvaluation.qualificationStatus} />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">৪-স্তরীয় মূল্যায়ন নম্বর বিভাজন:</h4>

              <div className="space-y-2.5">
                {[
                  { name: "মাখরাজ ও তাজবীদ বিশুদ্ধতা", score: selectedEvaluation.scores?.makhrajTajweed || 0, color: "bg-amber-400" },
                  { name: "শিশু মনোবিজ্ঞান ও আধুনিক শিক্ষাদান পদ্ধতি", score: selectedEvaluation.scores?.childPsychologyPedagogy || 0, color: "bg-emerald-400" },
                  { name: "ডিজিটাল ক্লাসরুম ও সফটওয়্যার পরিচালনা", score: selectedEvaluation.scores?.digitalClassroomTools || 0, color: "bg-blue-400" },
                  { name: "মাইক্রো-টিচিং লাইভ ডেমো ক্লাস", score: selectedEvaluation.scores?.microTeachingDemo || 0, color: "bg-purple-400" },
                ].map((r) => (
                  <div key={r.name} className="bg-[#081A3A] p-3.5 rounded-xl border border-slate-800/80">
                    <div className="flex justify-between text-xs font-bold text-white mb-1.5">
                      <span>{r.name}</span>
                      <span className="text-[#D4AF37]">
                        {r.score} <span className="text-slate-500 font-normal">/ 25</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                      <div className={`h-full ${r.color} rounded-full`} style={{ width: `${Math.min(100, (r.score / 25) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedEvaluation.remarks && (
              <div className="bg-[#081A3A] p-4 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="text-xs font-bold text-[#D4AF37]">ইনস্ট্রাক্টরের পর্যবেক্ষণ ও মন্তব্য:</div>
                <p className="text-xs text-slate-200 italic leading-relaxed">&ldquo;{selectedEvaluation.remarks}&rdquo;</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div className="text-xs text-slate-400">
                মূল্যায়নকারী: <span className="text-white font-semibold">{selectedEvaluation.instructorName || "—"}</span> •{" "}
                {formatDate(selectedEvaluation.evaluatedAt || selectedEvaluation.createdAt)}
              </div>

              <Link
                href={`/results?email=${encodeURIComponent(selectedEvaluation.traineeEmail || "")}`}
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
