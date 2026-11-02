'use client';

import React, { useRef, useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  CreditCard,
  Phone,
  Mail,
  ArrowLeft,
  Download,
  Award,
  Laptop,
  BookOpen,
  MessageCircle,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Save,
  RefreshCw,
} from "lucide-react";
import QuickEvalModal from "../../_shared/QuickEvalModal";
import ErrorBanner from "../../_shared/ErrorBanner";
import { FlashMessage, useFlash } from "../../_shared/Flash";
import { apiFetch, isAbort } from "../../_shared/api";
import {
  bn,
  formatDate,
  formatTaka,
  paymentMeta,
  statusMeta,
  trackBadge,
  trackLabel,
} from "../../_shared/utils";

const QURAN_SKILLS = {
  fluent: "শুদ্ধ ও সুন্দরভাবে তিলাওয়াত",
  tajweed: "তাজবীদ ও মাখরাজসহ",
  hafez: "হাফেজ / হিফজ সম্পন্ন",
  basic: "মাঝারি মান (ইমপ্রুভমেন্ট দরকার)",
};
const ENGLISH_SKILLS = {
  basic: "বেসিক",
  good: "সাবলীল",
  fluent: "ফ্লুয়েন্ট",
};
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const LAPTOP = { yes: "নিজস্ব ল্যাপটপ আছে", no: "ল্যাপটপ নেই / সহায়তা প্রয়োজন" };

const skillLabel = (map, v) => (v ? map[v] || v : "—");

/** wa.me needs the international number (880…) without "+" or a leading 0 duplicate. */
function whatsappNumber(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("880")) return digits;
  if (digits.startsWith("0")) return `88${digits}`;
  return digits;
}

/** RFC-4180 cell + spreadsheet-formula guard. */
function csvCell(value) {
  let s = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

/** Profile editor (PATCH /api/instructor/trainees). Sends only the fields that changed. */
function ProfileEditor({ trainee, onSaved, onCancel }) {
  const initial = {
    fullName: trainee.fullName || "",
    phone: trainee.phone || "",
    emergencyContactNumber: trainee.emergencyContactNumber || "",
    designation: trainee.designation || "",
    bloodGroup: trainee.bloodGroup || "",
    gender: trainee.gender || "",
    hasLaptop: trainee.hasLaptop || "",
    quranSkill: trainee.quranSkill || "",
    englishSkill: trainee.englishSkill || "",
    education: trainee.education || "",
    bio: trainee.bio || "",
  };
  const [values, setValues] = useState(initial);
  const [isSaving, setIsSaving] = useState(false);
  const { flash, show, clear } = useFlash();

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));
  const changedKeys = Object.keys(values).filter((k) => values[k].trim() !== initial[k].trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    clear();
    if (!values.fullName.trim()) {
      show("error", "ট্রেইনির নাম খালি রাখা যাবে না।");
      return;
    }
    if (changedKeys.length === 0) {
      show("error", "কোনো পরিবর্তন করা হয়নি।");
      return;
    }
    setIsSaving(true);
    try {
      const body = { traineeId: trainee._id };
      for (const k of changedKeys) body[k] = values[k].trim();
      const data = await apiFetch("/api/instructor/trainees", { method: "PATCH", body });
      onSaved({ ...(data.trainee || {}), ...(changedKeys.includes("emergencyContactNumber") ? { emergencyContactNumber: body.emergencyContactNumber } : {}) }, data.message);
    } catch (err) {
      show("error", err.message || "ট্রেইনি তথ্য আপডেট ব্যর্থ হয়েছে");
      setIsSaving(false);
    }
  };

  const input =
    "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-slate-400 block mb-1">পূর্ণ নাম *</span>
          <input className={input} value={values.fullName} onChange={set("fullName")} required maxLength={120} />
        </label>
        <label className="block">
          <span className="text-slate-400 block mb-1">মোবাইল নম্বর</span>
          <input className={input} value={values.phone} onChange={set("phone")} inputMode="tel" />
        </label>
        <label className="block">
          <span className="text-slate-400 block mb-1">জরুরি যোগাযোগ নম্বর</span>
          <input
            className={input}
            value={values.emergencyContactNumber}
            onChange={set("emergencyContactNumber")}
            inputMode="tel"
            placeholder="খালি রাখলে আগের তথ্য অপরিবর্তিত থাকবে"
          />
        </label>
        <label className="block">
          <span className="text-slate-400 block mb-1">পদবি</span>
          <input className={input} value={values.designation} onChange={set("designation")} />
        </label>
        <label className="block">
          <span className="text-slate-400 block mb-1">রক্তের গ্রুপ</span>
          <select className={input} value={values.bloodGroup} onChange={set("bloodGroup")}>
            <option value="">— নির্বাচন করুন —</option>
            {BLOOD_GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-slate-400 block mb-1">লিঙ্গ</span>
          <select className={input} value={values.gender} onChange={set("gender")}>
            <option value="">— নির্বাচন করুন —</option>
            <option value="male">পুরুষ</option>
            <option value="female">মহিলা</option>
            <option value="other">অন্যান্য</option>
          </select>
        </label>
        <label className="block">
          <span className="text-slate-400 block mb-1">ল্যাপটপ / কম্পিউটার</span>
          <select className={input} value={values.hasLaptop} onChange={set("hasLaptop")}>
            <option value="">— নির্বাচন করুন —</option>
            <option value="yes">{LAPTOP.yes}</option>
            <option value="no">{LAPTOP.no}</option>
          </select>
        </label>
        <label className="block">
          <span className="text-slate-400 block mb-1">কুরআন পাঠ দক্ষতা</span>
          <select className={input} value={values.quranSkill} onChange={set("quranSkill")}>
            <option value="">— নির্বাচন করুন —</option>
            {Object.entries(QURAN_SKILLS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
            {values.quranSkill && !QURAN_SKILLS[values.quranSkill] && (
              <option value={values.quranSkill}>{values.quranSkill}</option>
            )}
          </select>
        </label>
        <label className="block">
          <span className="text-slate-400 block mb-1">ইংরেজি দক্ষতা</span>
          <select className={input} value={values.englishSkill} onChange={set("englishSkill")}>
            <option value="">— নির্বাচন করুন —</option>
            {Object.entries(ENGLISH_SKILLS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
            {values.englishSkill && !ENGLISH_SKILLS[values.englishSkill] && (
              <option value={values.englishSkill}>{values.englishSkill}</option>
            )}
          </select>
        </label>
        <label className="block">
          <span className="text-slate-400 block mb-1">শিক্ষাগত যোগ্যতা</span>
          <input className={input} value={values.education} onChange={set("education")} />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-slate-400 block mb-1">সংক্ষিপ্ত পরিচিতি</span>
          <textarea className={input} rows={2} value={values.bio} onChange={set("bio")} maxLength={2000} />
        </label>
      </div>

      <FlashMessage flash={flash} onClose={clear} />

      <div className="flex items-center justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold">
          বাতিল
        </button>
        <button
          type="submit"
          disabled={isSaving || changedKeys.length === 0}
          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold flex items-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" /> {isSaving ? "সংরক্ষণ হচ্ছে..." : "পরিবর্তন সংরক্ষণ"}
        </button>
      </div>
    </form>
  );
}

export default function TraineesClient({ initialData = null, pageSize = 25, loadError = null }) {
  const [data, setData] = useState({
    trainees: initialData?.trainees || [],
    total: initialData?.total ?? 0,
    page: initialData?.page ?? 1,
    totalPages: initialData?.totalPages ?? 1,
  });
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [search, setSearch] = useState("");
  const [trackFilter, setTrackFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [evalFilter, setEvalFilter] = useState("all");
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [evalModalTrainee, setEvalModalTrainee] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const { flash, show, clear } = useFlash();
  const ctrlRef = useRef(null);
  const searchTimer = useRef(null);

  const buildQuery = ({ track, payment, q, page, limit }) => {
    const qs = new URLSearchParams({ track, paymentStatus: payment, page: String(page), limit: String(limit) });
    if (q.trim()) qs.set("search", q.trim());
    return qs.toString();
  };

  const fetchPage = async (next) => {
    // Any explicit fetch supersedes a pending debounced search (its value is already in `search`).
    if (searchTimer.current) clearTimeout(searchTimer.current);
    const params = { track: trackFilter, payment: paymentFilter, q: search, page: data.page, ...next };
    ctrlRef.current?.abort();
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;
    setLoading(true);
    setFetchError(null);
    try {
      const res = await apiFetch(`/api/instructor/trainees?${buildQuery({ ...params, limit: pageSize })}`, {
        signal: ctrl.signal,
      });
      setData({
        trainees: res.trainees || [],
        total: res.total ?? 0,
        page: res.page ?? params.page,
        totalPages: res.totalPages ?? 1,
      });
      setLoading(false);
    } catch (err) {
      if (isAbort(err)) return;
      setFetchError(err.message || "ট্রেইনি তালিকা লোড করা যায়নি।");
      setLoading(false);
    }
  };

  const changeTrack = (v) => {
    setTrackFilter(v);
    fetchPage({ track: v, page: 1 });
  };
  const changePayment = (v) => {
    setPaymentFilter(v);
    fetchPage({ payment: v, page: 1 });
  };
  const changeSearch = (v) => {
    setSearch(v);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchPage({ q: v, page: 1 }), 400);
  };
  const goToPage = (p) => {
    if (p < 1 || p > data.totalPages || loading) return;
    fetchPage({ page: p });
  };

  // "Evaluated / pending" works on the loaded page only (the API has no evaluation filter).
  const visible = data.trainees.filter((t) =>
    evalFilter === "all" ? true : evalFilter === "evaluated" ? Boolean(t.evaluation) : !t.evaluation
  );

  const updateTrainee = (id, patch) => {
    setData((d) => ({ ...d, trainees: d.trainees.map((t) => (t._id === id ? { ...t, ...patch } : t)) }));
    setSelectedTrainee((s) => (s && s._id === id ? { ...s, ...patch } : s));
  };

  const handleEvalSaved = (evaluation) => {
    if (!evaluation) return;
    updateTrainee(evaluation.traineeId, {
      evaluation: {
        totalScore: evaluation.totalScore,
        grade: evaluation.grade,
        qualificationStatus: evaluation.qualificationStatus,
        scores: evaluation.scores,
        evaluatedAt: evaluation.evaluatedAt,
      },
    });
  };

  // Export every trainee matching the current filters (all pages), as UTF-8 CSV with BOM.
  const handleExportCSV = async () => {
    setIsExporting(true);
    clear();
    try {
      const all = [];
      let page = 1;
      let totalPages = 1;
      do {
        const res = await apiFetch(
          `/api/instructor/trainees?${buildQuery({ track: trackFilter, payment: paymentFilter, q: search, page, limit: 100 })}`
        );
        all.push(...(res.trainees || []));
        totalPages = res.totalPages || 1;
        page += 1;
      } while (page <= totalPages && page <= 200);

      const rows = all.filter((t) =>
        evalFilter === "all" ? true : evalFilter === "evaluated" ? Boolean(t.evaluation) : !t.evaluation
      );
      if (rows.length === 0) {
        show("error", "এই ফিল্টারে এক্সপোর্ট করার মতো কোনো ট্রেইনি নেই।");
        return;
      }

      const headers = [
        "Name", "Email", "Phone", "Track", "Designation", "PaymentStatus", "PaidAmount", "TranId",
        "QuranSkill", "EnglishSkill", "HasLaptop", "Education", "BloodGroup",
        "Grade", "TotalScore", "QualificationStatus", "EvaluatedAt", "RegisteredAt",
      ];
      const lines = rows.map((t) =>
        [
          t.fullName,
          t.email,
          t.phone,
          t.track,
          t.designation,
          t.paymentStatus,
          t.paidAmount ?? 0,
          t.tranId,
          t.quranSkill,
          t.englishSkill,
          t.hasLaptop,
          t.education,
          t.bloodGroup,
          t.evaluation?.grade ?? "",
          t.evaluation?.totalScore ?? "",
          t.evaluation?.qualificationStatus ?? "",
          t.evaluation?.evaluatedAt ? new Date(t.evaluation.evaluatedAt).toISOString() : "",
          t.createdAt ? new Date(t.createdAt).toISOString() : "",
        ]
          .map(csvCell)
          .join(",")
      );
      const csv = "﻿" + [headers.map(csvCell).join(","), ...lines].join("\r\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `fajr_tot_trainees_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      show("success", `${bn(rows.length)} জন ট্রেইনির তথ্য CSV ফাইলে এক্সপোর্ট হয়েছে।`);
    } catch (err) {
      show("error", err.message || "CSV এক্সপোর্ট ব্যর্থ হয়েছে");
    } finally {
      setIsExporting(false);
    }
  };

  const openProfile = (t) => {
    setSelectedTrainee(t);
    setIsEditing(false);
  };

  const sel = selectedTrainee;
  const selPay = sel ? paymentMeta(sel.paymentStatus) : null;
  const selWa = sel ? whatsappNumber(sel.phone) : "";

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/instructor" className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> ড্যাশবোর্ড ওভারভিউ
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
            টিচার ট্রেইনি ডিরেক্টরি ({loadError && data.total === 0 ? "—" : `${bn(data.total)} জন`})
          </h1>
          <p className="text-xs text-slate-400">
            TOT Men ও TOT Women ব্যাচে নিবন্ধিত প্রার্থীদের তথ্য, দক্ষতা ও মূল্যায়ন স্ট্যাটাস
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          disabled={isExporting}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-2 border border-slate-700 shadow-sm transition-all"
        >
          {isExporting ? (
            <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5 text-indigo-400" />
          )}
          {isExporting ? "এক্সপোর্ট হচ্ছে..." : "এক্সপোর্ট CSV"}
        </button>
      </div>

      <ErrorBanner message={loadError} />
      <FlashMessage flash={flash} onClose={clear} />

      {/* Filter Bar & Search */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-3xl shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <input
              type="search"
              value={search}
              onChange={(e) => changeSearch(e.target.value)}
              placeholder="নাম, ইমেইল, মোবাইল অথবা TrxID দিয়ে সার্চ করুন..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-2.5 pl-10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
            />
            {loading ? (
              <Loader2 className="w-4 h-4 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2 animate-spin" />
            ) : (
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={trackFilter}
              onChange={(e) => changeTrack(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              aria-label="ব্যাচ ফিল্টার"
            >
              <option value="all">সকল ব্যাচ</option>
              <option value="men">👨 TOT MEN</option>
              <option value="women">🧕 TOT WOMEN</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => changePayment(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              aria-label="পেমেন্ট ফিল্টার"
            >
              <option value="all">সকল পেমেন্ট</option>
              <option value="paid">✓ Paid (পরিশোধিত)</option>
              <option value="pending">⏳ Pending (বকেয়া)</option>
              <option value="failed">✕ Failed (ব্যর্থ)</option>
              <option value="free">Free (ফ্রি)</option>
            </select>

            <select
              value={evalFilter}
              onChange={(e) => setEvalFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              aria-label="মূল্যায়ন ফিল্টার (এই পৃষ্ঠায়)"
              title="এই পৃষ্ঠার ট্রেইনিদের মধ্যে ফিল্টার করে (CSV এক্সপোর্টে সব পৃষ্ঠায় প্রযোজ্য)"
            >
              <option value="all">সকল মূল্যায়ন</option>
              <option value="evaluated">✓ গ্রেডিং সম্পন্ন (এই পৃষ্ঠায়)</option>
              <option value="pending">⏳ গ্রেডিং বাকি (এই পৃষ্ঠায়)</option>
            </select>
          </div>
        </div>
      </div>

      {fetchError && (
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          <span>{fetchError}</span>
          <button type="button" onClick={() => fetchPage({})} className="flex items-center gap-1 font-bold hover:text-white">
            <RefreshCw className="w-3.5 h-3.5" /> আবার চেষ্টা
          </button>
        </div>
      )}

      {/* Trainees Table */}
      <div className={`bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl ${loading ? "opacity-70" : ""}`}>
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
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500 space-y-2">
                    <Users className="w-8 h-8 text-slate-600 mx-auto" />
                    <p>{loading ? "লোড হচ্ছে..." : "কোনো ট্রেইনি তথ্য পাওয়া যায়নি।"}</p>
                  </td>
                </tr>
              ) : (
                visible.map((t) => {
                  const pay = paymentMeta(t.paymentStatus);
                  const st = t.evaluation ? statusMeta(t.evaluation.qualificationStatus) : null;
                  return (
                    <tr key={t._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white text-sm flex items-center gap-2">{t.fullName}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {t.tranId || "TrxID নেই"}
                          {t.createdAt ? ` • ${formatDate(t.createdAt)}` : ""}
                        </div>
                      </td>

                      <td className="p-4">
                        <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${trackBadge(t.track)}`}>
                          {trackLabel(t.track)}
                        </span>
                      </td>

                      <td className="p-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Phone className="w-3 h-3 text-slate-500" /> {t.phone || "—"}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                          <Mail className="w-3 h-3 text-slate-500" /> {t.email}
                        </div>
                      </td>

                      <td className="p-4 space-y-1">
                        <div className="text-[11px] flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-indigo-400" />
                          <span>
                            কুরআন: <strong className="text-white">{skillLabel(QURAN_SKILLS, t.quranSkill)}</strong>
                          </span>
                        </div>
                        <div className="text-[11px] flex items-center gap-1">
                          <Laptop className="w-3 h-3 text-emerald-400" />
                          <span>
                            ল্যাপটপ:{" "}
                            <strong className="text-white">
                              {t.hasLaptop === "yes" ? "আছে" : t.hasLaptop === "no" ? "নেই" : "—"}
                            </strong>
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${pay.badge}`}>
                          {t.paymentStatus === "paid" ? `✓ ${formatTaka(t.paidAmount ?? 0)} ${pay.label}` : pay.label}
                        </span>
                      </td>

                      <td className="p-4">
                        {t.evaluation ? (
                          <div className="space-y-0.5">
                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${st.badge}`}>
                              {t.evaluation.grade} ({bn(t.evaluation.totalScore)}/১০০)
                            </span>
                            <p className={`text-[10px] ${st.color}`}>{st.label}</p>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">মূল্যায়ন বাকি</span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openProfile(t)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="প্রোফাইল দেখুন / সম্পাদনা"
                            aria-label="প্রোফাইল দেখুন"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setEvalModalTrainee(t)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-bold transition-all flex items-center gap-1"
                          >
                            <Award className="w-3 h-3" /> গ্রেডিং
                          </button>

                          <Link
                            href={`/id-card?user=${encodeURIComponent(t._id)}`}
                            prefetch={false}
                            className="text-slate-400 hover:text-indigo-300 p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
                            title="আইডি কার্ড"
                            aria-label="আইডি কার্ড"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-800 text-xs text-slate-400">
          <span>
            মোট {bn(data.total)} জন • পৃষ্ঠা {bn(data.page)} / {bn(data.totalPages)}
            {evalFilter !== "all" && ` • এই পৃষ্ঠায় ফিল্টার করা ${bn(visible.length)} জন`}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(data.page - 1)}
              disabled={data.page <= 1 || loading}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> আগের
            </button>
            <button
              type="button"
              onClick={() => goToPage(data.page + 1)}
              disabled={data.page >= data.totalPages || loading}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 flex items-center gap-1"
            >
              পরের <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Trainee Profile Modal */}
      {sel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedTrainee(null)} />

          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-2xl bg-slate-900 border border-indigo-900/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0">
                  {sel.fullName ? sel.fullName[0].toUpperCase() : "T"}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black text-white truncate">{sel.fullName}</h3>
                  <span className="text-xs text-indigo-400 font-semibold">{sel.designation || "পদবি উল্লেখ নেই"}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 text-xs font-bold flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> সম্পাদনা
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedTrainee(null)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                  aria-label="বন্ধ করুন"
                >
                  ✕
                </button>
              </div>
            </div>

            {isEditing ? (
              <ProfileEditor
                key={sel._id}
                trainee={sel}
                onCancel={() => setIsEditing(false)}
                onSaved={(updated, message) => {
                  updateTrainee(sel._id, updated);
                  setIsEditing(false);
                  show("success", message || "ট্রেইনি তথ্য আপডেট হয়েছে।");
                }}
              />
            ) : (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block">মোবাইল নম্বর</span>
                    <span className="text-white font-bold">{sel.phone || "—"}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block">ইমেইল অ্যাড্রেস</span>
                    <span className="text-white font-bold truncate block">{sel.email}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block">ব্যাচ ও ট্র্যাক</span>
                    <span className="text-white font-bold">{trackLabel(sel.track)}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block">পেমেন্ট স্ট্যাটাস</span>
                    <span className={`font-bold ${sel.paymentStatus === "paid" ? "text-emerald-400" : "text-amber-300"}`}>
                      {sel.paymentStatus === "paid" ? `✓ ${formatTaka(sel.paidAmount ?? 0)} ${selPay.label}` : selPay.label}
                    </span>
                    {sel.tranId && <span className="text-[10px] text-slate-500 font-mono block">{sel.tranId}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block">কুরআন পাঠ দক্ষতা</span>
                    <span className="text-white font-bold">{skillLabel(QURAN_SKILLS, sel.quranSkill)}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block">ল্যাপটপ / কম্পিউটার</span>
                    <span className="text-white font-bold">{sel.hasLaptop ? LAPTOP[sel.hasLaptop] || sel.hasLaptop : "—"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block">ইংরেজি দক্ষতা</span>
                    <span className="text-white font-bold">{skillLabel(ENGLISH_SKILLS, sel.englishSkill)}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block">রক্তের গ্রুপ</span>
                    <span className="text-white font-bold">{sel.bloodGroup || "—"}</span>
                  </div>
                </div>

                {sel.education && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block">শিক্ষাগত যোগ্যতা</span>
                    <span className="text-white font-medium">{sel.education}</span>
                  </div>
                )}
                {sel.bio && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block">সংক্ষিপ্ত পরিচিতি</span>
                    <span className="text-white font-medium whitespace-pre-line">{sel.bio}</span>
                  </div>
                )}
                {sel.evaluation && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-slate-500">সর্বশেষ মূল্যায়ন</span>
                    <span className={`font-bold ${statusMeta(sel.evaluation.qualificationStatus).color}`}>
                      {sel.evaluation.grade} • {bn(sel.evaluation.totalScore)}/১০০ • {statusMeta(sel.evaluation.qualificationStatus).label}
                    </span>
                  </div>
                )}
              </div>
            )}

            {!isEditing && (
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800">
                {selWa ? (
                  <a
                    href={`https://wa.me/${selWa}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp মেসেজ
                  </a>
                ) : (
                  <span className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-500 text-xs font-bold text-center">ফোন নম্বর নেই</span>
                )}

                {sel.phone && (
                  <a
                    href={`tel:${sel.phone}`}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" /> কল করুন
                  </a>
                )}

                <Link
                  href={`/id-card?user=${encodeURIComponent(sel._id)}`}
                  prefetch={false}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" /> আইডি কার্ড
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Evaluation Modal */}
      {evalModalTrainee && (
        <QuickEvalModal
          key={evalModalTrainee._id}
          trainee={evalModalTrainee}
          onClose={() => setEvalModalTrainee(null)}
          onSaved={handleEvalSaved}
        />
      )}
    </div>
  );
}
