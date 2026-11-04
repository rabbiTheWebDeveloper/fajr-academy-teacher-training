'use client';

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle2,
  Award,
  ShieldCheck,
  RefreshCw,
  ChevronRight,
  Sparkles,
  GraduationCap,
  Star,
  Eye,
  Edit,
  X,
  Save,
  Phone,
  Mail,
  MessageCircle,
  Megaphone,
  Pin,
  PinOff,
  Trash2,
} from "lucide-react";
import { useAdminTheme } from "../AdminThemeContext";
import {
  AdminToast,
  DbErrorBanner,
  callApi,
  formatDate,
  formatMoney,
  isWomenTrack,
  trackLabel,
  useConfirm,
  useToast,
} from "../_shared/admin-ui";

const PRIORITY_LABEL = { normal: "সাধারণ", important: "জরুরি", urgent: "অতি জরুরি" };
const NOTICE_TRACK_LABEL = { all: "সকল ব্যাচ", "TOT-MEN": "পুরুষ ব্যাচ", "TOT-WOMEN-014": "মহিলা ব্যাচ (014)", "TOT-WOMEN": "মহিলা ব্যাচ" };
const PAYMENT_BADGE = {
  paid: "Paid",
  pending: "Pending",
  failed: "Failed",
  free: "Free",
};

function whatsappHref(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits.startsWith("880") ? digits : `88${digits}`}`;
}

export default function AdminDashboardClient({ stats, loadError }) {
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();
  const [verifyingId, setVerifyingId] = useState(null);
  const { isLight } = useAdminTheme();
  const { toast, showToast, hideToast } = useToast();
  const { confirm, confirmDialog } = useConfirm();

  // Announcement modal & state
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeForm, setNoticeForm] = useState({
    title: "",
    content: "",
    track: "all",
    priority: "normal",
    isPinned: false,
  });
  const [savingNotice, setSavingNotice] = useState(false);
  const [busyNoticeId, setBusyNoticeId] = useState(null);

  // Instructor modals
  const [selectedInstructorForProfile, setSelectedInstructorForProfile] = useState(null);
  const [editingInstructor, setEditingInstructor] = useState(null);
  const [savingInstructor, setSavingInstructor] = useState(false);

  const refresh = () => startRefresh(() => router.refresh());

  const handleVerifyPayment = async (payment) => {
    if (
      !(await confirm(
        `"${payment.userName || payment.userEmail}"-এর ${formatMoney(payment.amount, payment.currency)} পেমেন্টটি VALID হিসেবে যাচাই করবেন?\n\nএতে ট্রেইনির অ্যাকাউন্ট ও কোর্স এনরোলমেন্ট সক্রিয় হবে।`,
        { title: "পেমেন্ট যাচাই করবেন?", confirmLabel: "হ্যাঁ, যাচাই করুন" }
      ))
    )
      return;
    setVerifyingId(payment._id);
    const { ok, message } = await callApi("/api/admin/payments", {
      method: "PATCH",
      body: { paymentId: payment._id, status: "VALID" },
    });
    setVerifyingId(null);
    if (!ok) {
      showToast(message, "error");
      return;
    }
    showToast(message || "পেমেন্ট সফলভাবে ভেরিফাই করা হয়েছে!");
    refresh();
  };

  // Direct quick update of an instructor from the dashboard
  const handleUpdateInstructor = async (e) => {
    e.preventDefault();
    if (!editingInstructor) return;
    setSavingInstructor(true);
    const { ok, data, message } = await callApi("/api/admin/instructors", {
      method: "PATCH",
      body: {
        instructorId: editingInstructor._id,
        fullName: editingInstructor.fullName,
        phone: editingInstructor.phone || "",
        designation: editingInstructor.designation || "",
        specialization: editingInstructor.specialization || "",
        track: editingInstructor.track ?? "TOT-MEN",
        bio: editingInstructor.bio || "",
        experienceYears: Number(editingInstructor.experienceYears) || 0,
        rating: Number(editingInstructor.rating) || 0,
      },
    });
    setSavingInstructor(false);
    if (!ok) {
      showToast(message, "error");
      return;
    }
    showToast(message || "ইনস্ট্রাক্টর তথ্য সফলভাবে আপডেট হয়েছে!");
    if (selectedInstructorForProfile?._id === editingInstructor._id) setSelectedInstructorForProfile(data.instructor);
    setEditingInstructor(null);
    refresh();
  };

  const handleBroadcastNotice = async (e) => {
    e.preventDefault();
    if (!noticeForm.title.trim() || !noticeForm.content.trim()) {
      showToast("শিরোনাম ও নোটিশের বিবরণ আবশ্যক!", "error");
      return;
    }
    setSavingNotice(true);
    const { ok, message } = await callApi("/api/admin/announcements", { method: "POST", body: noticeForm });
    setSavingNotice(false);
    if (!ok) {
      showToast(message, "error");
      return;
    }
    showToast(message || "ঘোষণা সফলভাবে ব্রডকাস্ট হয়েছে!");
    setShowNoticeModal(false);
    setNoticeForm({ title: "", content: "", track: "all", priority: "normal", isPinned: false });
    refresh();
  };

  const handleTogglePin = async (notice) => {
    setBusyNoticeId(notice._id);
    const { ok, message } = await callApi("/api/admin/announcements", {
      method: "PATCH",
      body: { id: notice._id, isPinned: !notice.isPinned },
    });
    setBusyNoticeId(null);
    if (!ok) {
      showToast(message, "error");
      return;
    }
    showToast(notice.isPinned ? "নোটিশটি আনপিন করা হয়েছে।" : "নোটিশটি উপরে পিন করা হয়েছে।");
    refresh();
  };

  const handleDeleteNotice = async (notice) => {
    if (!(await confirm(`"${notice.title}" নোটিশটি স্থায়ীভাবে মুছে ফেলবেন? ট্রেইনি ও শিক্ষকদের ফিড থেকেও এটি সরে যাবে।`, { tone: "danger", title: "নোটিশ মুছে ফেলবেন?" }))) return;
    setBusyNoticeId(notice._id);
    const { ok, message } = await callApi(`/api/admin/announcements?id=${encodeURIComponent(notice._id)}`, { method: "DELETE" });
    setBusyNoticeId(null);
    if (!ok) {
      showToast(message, "error");
      return;
    }
    showToast(message || "নোটিশ মুছে ফেলা হয়েছে।");
    refresh();
  };

  const cardBox = isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900 border-slate-800 shadow-xl";
  const kpiBox = isLight
    ? "bg-white border-slate-200 shadow-sm hover:shadow-md"
    : "bg-slate-900/90 border-slate-800 shadow-xl";
  const inputCls = `w-full px-3.5 py-2.5 rounded-xl border text-xs outline-hidden font-medium ${
    isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-purple-600" : "bg-slate-800 border-slate-700 text-white focus:border-purple-500"
  }`;
  const notices = stats.notices || [];

  return (
    <div className="space-y-8">
      {confirmDialog}
      <AdminToast toast={toast} onClose={hideToast} />

      <DbErrorBanner message={loadError} isLight={isLight} onRetry={refresh} retrying={isRefreshing} />

      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 border ${
              isLight ? "bg-amber-100 text-amber-900 border-amber-300" : "bg-amber-500/10 border-amber-500/30 text-amber-300"
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isLight ? "text-amber-600" : "text-amber-400"}`} />
            Executive Control System
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
            TOT অ্যাডমিন ওভারভিউ ও এনালিটিক্স
          </h1>
          <p className={`text-xs sm:text-sm mt-1 font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
            ফজর একাডেমি টিচার্স ট্রেনিং (TOT) প্রোগ্রামের লাইভ এনরোলমেন্ট, পেমেন্ট, মূল্যায়ন ও ইনস্ট্রাক্টর ট্র্যাকার
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={refresh}
            disabled={isRefreshing}
            title="ডাটাবেজ থেকে সর্বশেষ তথ্য লোড করুন"
            className={`px-3 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60 ${
              isLight ? "bg-white hover:bg-slate-50 border-slate-300 text-slate-800 shadow-xs" : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200"
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} /> রিফ্রেশ
          </button>
          <button
            onClick={() => setShowNoticeModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-500/20 transition-all cursor-pointer"
          >
            <Megaphone className="w-4 h-4" /> ঘোষণা ব্রডকাস্ট
          </button>
          <Link
            href="/admin/evaluations"
            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C59B27] hover:brightness-110 text-[#051329] font-black text-xs flex items-center gap-1.5 shadow-md shadow-[#D4AF37]/20 transition-all"
          >
            <Award className="w-4 h-4" /> মূল্যায়ন ও ফলাফল
          </Link>
          <Link
            href="/admin/instructors"
            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition-all"
          >
            <GraduationCap className="w-4 h-4" /> ইনস্ট্রাক্টর
          </Link>
          <Link
            href="/admin/tots"
            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
          >
            <Users className="w-4 h-4" /> TOT ট্রেইনি
          </Link>
          <Link
            href="/admin/payments"
            className={`px-3.5 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all ${
              isLight ? "bg-white hover:bg-slate-50 border-slate-300 text-slate-800 shadow-xs" : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200"
            }`}
          >
            <CreditCard className="w-4 h-4" /> পেমেন্ট
          </Link>
        </div>
      </div>

      {/* 5 KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Revenue */}
        <div className={`p-5 rounded-3xl relative overflow-hidden border transition-all ${kpiBox}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${isLight ? "text-slate-600" : "text-slate-400"}`}>মোট সংগৃহীত ফি</span>
            <div className={`p-2 rounded-xl ${isLight ? "bg-emerald-100 text-emerald-700" : "bg-emerald-500/20 text-emerald-400"}`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black font-mono ${isLight ? "text-slate-900" : "text-white"}`}>
            ৳ {Number(stats.totalRevenue || 0).toLocaleString("en-US")}{" "}
            <span className={`text-xs font-sans font-medium ${isLight ? "text-slate-500" : "text-slate-400"}`}>BDT</span>
          </div>
          <div className={`mt-2 text-[11px] font-bold flex items-center gap-1 ${isLight ? "text-emerald-700" : "text-emerald-400"}`}>
            <CheckCircle2 className="w-3.5 h-3.5" /> {stats.validPayments} টি যাচাইকৃত (VALID) পেমেন্ট থেকে
          </div>
        </div>

        {/* KPI 2: Paid Trainees */}
        <div className={`p-5 rounded-3xl relative overflow-hidden border transition-all ${kpiBox}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${isLight ? "text-slate-600" : "text-slate-400"}`}>পরিশোধিত ট্রেইনি</span>
            <div className={`p-2 rounded-xl ${isLight ? "bg-blue-100 text-blue-700" : "bg-blue-500/20 text-blue-400"}`}>
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black font-mono ${isLight ? "text-blue-700" : "text-blue-400"}`}>
            {stats.paidTrainees}{" "}
            <span className={`text-xs font-sans font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              / {stats.totalTrainees} জন
            </span>
          </div>
          <div className={`mt-2 text-[11px] font-medium flex items-center justify-between ${isLight ? "text-slate-600" : "text-slate-400"}`}>
            <span>পুরুষ: {stats.menTrainees}</span>
            <span>মহিলা: {stats.womenTrainees}</span>
          </div>
        </div>

        {/* KPI 3: Pending */}
        <Link
          href="/admin/payments"
          title="পেমেন্ট ভেরিফিকেশন পেজে যান"
          className={`p-5 rounded-3xl relative overflow-hidden border transition-all block hover:-translate-y-0.5 ${kpiBox}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${isLight ? "text-slate-600" : "text-slate-400"}`}>যাচাইয়ের অপেক্ষায়</span>
            <div className={`p-2 rounded-xl ${isLight ? "bg-amber-100 text-amber-700" : "bg-amber-500/20 text-amber-400"}`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black font-mono ${isLight ? "text-amber-700" : "text-amber-400"}`}>
            {stats.pendingPayments}{" "}
            <span className={`text-xs font-sans font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>টি পেমেন্ট</span>
          </div>
          <div className={`mt-2 text-[11px] font-bold ${isLight ? "text-amber-800" : "text-amber-300/80"}`}>
            অ্যাকাউন্টে পেমেন্ট বাকি: {stats.pendingTrainees} জন ট্রেইনি
          </div>
        </Link>

        {/* KPI 4: Instructors */}
        <Link
          href="/admin/instructors"
          className={`group p-5 rounded-3xl relative overflow-hidden border transition-all block ${
            isLight
              ? "bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-purple-300"
              : "bg-slate-900/90 border-slate-800 shadow-xl hover:border-purple-500/40"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${isLight ? "text-slate-600" : "text-slate-400"}`}>ইনস্ট্রাক্টর</span>
            <div
              className={`p-2 rounded-xl transition-transform group-hover:scale-110 ${
                isLight ? "bg-purple-100 text-purple-700" : "bg-purple-500/20 text-purple-400"
              }`}
            >
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black font-mono ${isLight ? "text-purple-700" : "text-purple-400"}`}>
            {stats.totalInstructors}{" "}
            <span className={`text-xs font-sans font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>জন ট্রেইনার</span>
          </div>
          <div className="mt-2 text-[11px] font-medium flex items-center justify-between">
            <span className={isLight ? "text-slate-600" : "text-slate-400"}>পুরুষ ও মহিলা ফ্যাকাল্টি</span>
            <span
              className={`font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform ${
                isLight ? "text-purple-700" : "text-purple-400"
              }`}
            >
              ম্যানেজ করুন <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </Link>

        {/* KPI 5: Evaluations */}
        <Link
          href="/admin/evaluations"
          className={`group p-5 rounded-3xl relative overflow-hidden border transition-all block ${
            isLight
              ? "bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300"
              : "bg-slate-900/90 border-slate-800 shadow-xl hover:border-[#D4AF37]/40"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${isLight ? "text-slate-600" : "text-slate-400"}`}>মূল্যায়ন ও সনদপত্র</span>
            <div
              className={`p-2 rounded-xl transition-transform group-hover:scale-110 ${
                isLight ? "bg-amber-100 text-amber-800" : "bg-amber-500/20 text-[#D4AF37]"
              }`}
            >
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black font-mono ${isLight ? "text-amber-800" : "text-[#D4AF37]"}`}>
            {stats.totalEvaluated}{" "}
            <span className={`text-xs font-sans font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>জন মূল্যায়িত</span>
          </div>
          <div className="mt-2 text-[11px] font-medium space-y-0.5">
            <div className="flex items-center justify-between">
              <span className={`font-bold ${isLight ? "text-emerald-700" : "text-emerald-400"}`}>
                {stats.hiredCount} নিয়োগপ্রাপ্ত • {stats.certifiedCount} সার্টিফাইড
              </span>
              <span
                className={`font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform ${
                  isLight ? "text-amber-800" : "text-[#D4AF37]"
                }`}
              >
                ফলাফল <ChevronRight className="w-3 h-3" />
              </span>
            </div>
            <div className={isLight ? "text-slate-600" : "text-slate-400"}>
              সনদপ্রাপ্ত {stats.hiredCount + stats.certifiedCount} / মোট ট্রেইনি {stats.totalTrainees} • পর্যালোচনাধীন {stats.inReviewCount} •
              পুনঃমূল্যায়ন {stats.retakeCount}
            </div>
          </div>
        </Link>
      </div>

      {/* Grid: Recent Payments & Recent Trainees */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Box 1: Recent Payments */}
        <div className={`rounded-3xl p-6 border space-y-4 transition-all ${cardBox}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                <CreditCard className={`w-4 h-4 ${isLight ? "text-amber-600" : "text-amber-400"}`} />
                সর্বশেষ পেমেন্ট ট্রানজেকশন
              </h3>
              <p className={`text-xs mt-0.5 ${isLight ? "text-slate-500 font-medium" : "text-slate-400"}`}>১-ক্লিক ভেরিফিকেশন ও স্ট্যাটাস</p>
            </div>
            <Link
              href="/admin/payments"
              className={`text-xs font-bold flex items-center gap-1 ${isLight ? "text-amber-700 hover:text-amber-800" : "text-amber-400 hover:text-amber-300"}`}
            >
              সব দেখুন <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className={`divide-y ${isLight ? "divide-slate-200" : "divide-slate-800/80"}`}>
            {stats.recentPayments.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">কোনো সাম্প্রতিক পেমেন্ট ডাটা নেই।</div>
            ) : (
              stats.recentPayments.map((p) => (
                <div key={p._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className={`font-bold flex items-center gap-2 flex-wrap ${isLight ? "text-slate-900" : "text-white"}`}>
                      <span>{p.userName || p.userEmail}</span>
                      <span className={`text-[10px] font-mono ${isLight ? "text-slate-500" : "text-slate-400"}`}>({p.tranId})</span>
                    </div>
                    <div className={`text-[11px] mt-0.5 font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                      {formatMoney(p.amount, p.currency)} • {p.cardType || p.paymentMethod || "—"} • {trackLabel(p.track)} • {formatDate(p.createdAt)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {p.status === "VALID" ? (
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold border ${
                          isLight ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        }`}
                      >
                        ✓ Verified
                      </span>
                    ) : p.status === "REFUNDED" ? (
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold border ${
                          isLight ? "bg-slate-100 text-slate-700 border-slate-300" : "bg-slate-800 text-slate-300 border-slate-700"
                        }`}
                      >
                        REFUNDED
                      </span>
                    ) : (
                      <>
                        <span className={`text-[10px] font-bold ${isLight ? "text-slate-500" : "text-slate-400"}`}>{p.status}</span>
                        <button
                          onClick={() => handleVerifyPayment(p)}
                          disabled={verifyingId === p._id || isRefreshing}
                          className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-[10px] font-extrabold shadow-sm transition-colors cursor-pointer disabled:opacity-60"
                        >
                          {verifyingId === p._id ? "ভেরিফাই হচ্ছে..." : "ভেরিফাই করুন"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Box 2: Recent Trainees */}
        <div className={`rounded-3xl p-6 border space-y-4 transition-all ${cardBox}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                <Users className={`w-4 h-4 ${isLight ? "text-blue-600" : "text-blue-400"}`} />
                সর্বশেষ নিবন্ধিত শিক্ষক
              </h3>
              <p className={`text-xs mt-0.5 ${isLight ? "text-slate-500 font-medium" : "text-slate-400"}`}>TOT কোর্স শিক্ষার্থী তালিকা</p>
            </div>
            <Link
              href="/admin/tots"
              className={`text-xs font-bold flex items-center gap-1 ${isLight ? "text-blue-700 hover:text-blue-800" : "text-blue-400 hover:text-blue-300"}`}
            >
              সব দেখুন <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className={`divide-y ${isLight ? "divide-slate-200" : "divide-slate-800/80"}`}>
            {stats.recentUsers.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">কোনো শিক্ষার্থী ডাটা নেই।</div>
            ) : (
              stats.recentUsers.map((u) => (
                <div key={u._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl font-black flex items-center justify-center text-xs border shrink-0 ${
                        isLight ? "bg-slate-100 border-slate-200 text-slate-800" : "bg-slate-800 border-slate-700 text-slate-200"
                      }`}
                    >
                      {u.fullName ? u.fullName[0].toUpperCase() : "T"}
                    </div>
                    <div className="min-w-0">
                      <h4 className={`font-bold truncate ${isLight ? "text-slate-900" : "text-white"}`}>{u.fullName}</h4>
                      <p className={`text-[11px] font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                        {u.phone || "ফোন নেই"} • {trackLabel(u.track)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        u.paymentStatus === "paid" || u.paymentStatus === "free"
                          ? isLight
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : u.paymentStatus === "failed"
                          ? isLight
                            ? "bg-rose-50 text-rose-800 border-rose-300"
                            : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                          : isLight
                          ? "bg-amber-50 text-amber-900 border-amber-300"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      }`}
                    >
                      {PAYMENT_BADGE[u.paymentStatus] || u.paymentStatus || "—"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Box 3: Notices board */}
      <div className={`rounded-3xl p-6 border space-y-4 transition-all ${cardBox}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className={`text-base font-bold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
              <Megaphone className={`w-5 h-5 ${isLight ? "text-rose-600" : "text-rose-400"}`} />
              ঘোষণা ও নোটিশ বোর্ড ({notices.length})
            </h3>
            <p className={`text-xs mt-0.5 ${isLight ? "text-slate-500 font-medium" : "text-slate-400"}`}>
              ট্রেইনি ও শিক্ষক পোর্টালে প্রদর্শিত সকল নোটিশ — পিন / আনপিন ও মুছে ফেলা
            </p>
          </div>
          <button
            onClick={() => setShowNoticeModal(true)}
            className={`text-xs font-bold px-3.5 py-2 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
              isLight ? "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100" : "bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20"
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" /> নতুন ঘোষণা
          </button>
        </div>

        {notices.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500">এখনো কোনো ঘোষণা প্রকাশ করা হয়নি।</div>
        ) : (
          <div className={`divide-y ${isLight ? "divide-slate-200" : "divide-slate-800/80"}`}>
            {notices.map((n) => (
              <div key={n._id} className="py-3 flex items-start justify-between gap-3 text-xs">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {n.isPinned && <Pin className={`w-3.5 h-3.5 ${isLight ? "text-amber-600" : "text-amber-400"}`} />}
                    <span className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{n.title}</span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                        n.priority === "urgent"
                          ? isLight
                            ? "bg-rose-50 text-rose-800 border-rose-300"
                            : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                          : n.priority === "important"
                          ? isLight
                            ? "bg-amber-50 text-amber-900 border-amber-300"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          : isLight
                          ? "bg-slate-100 text-slate-700 border-slate-300"
                          : "bg-slate-800 text-slate-300 border-slate-700"
                      }`}
                    >
                      {PRIORITY_LABEL[n.priority] || n.priority}
                    </span>
                    <span className={`text-[10px] font-bold ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                      {NOTICE_TRACK_LABEL[n.track] || n.track}
                    </span>
                  </div>
                  <p className={`line-clamp-2 leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>{n.content}</p>
                  <p className={`text-[10px] ${isLight ? "text-slate-500" : "text-slate-500"}`}>
                    {n.instructorName || "—"} • {formatDate(n.createdAt, true)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleTogglePin(n)}
                    disabled={busyNoticeId === n._id}
                    title={n.isPinned ? "আনপিন করুন" : "উপরে পিন করুন"}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer disabled:opacity-50 ${
                      isLight ? "bg-white hover:bg-amber-50 border-slate-300 text-amber-700" : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-400"
                    }`}
                  >
                    {n.isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteNotice(n)}
                    disabled={busyNoticeId === n._id}
                    title="নোটিশ মুছুন"
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${
                      isLight ? "text-rose-600 hover:bg-rose-50 border border-rose-200" : "text-rose-400 hover:bg-rose-950/40 border border-rose-900/50"
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Box 4: Instructors Roster & Quick Update */}
      <div className={`rounded-3xl p-6 border space-y-5 transition-all ${cardBox}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className={`text-base font-bold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
              <GraduationCap className={`w-5 h-5 ${isLight ? "text-purple-600" : "text-purple-400"}`} />
              অনুমোদিত সিনিয়র ইনস্ট্রাক্টর ও ফ্যাকাল্টি প্যানেল
            </h3>
            <p className={`text-xs mt-0.5 ${isLight ? "text-slate-500 font-medium" : "text-slate-400"}`}>
              সরাসরি ড্যাশবোর্ড থেকে ফ্যাকাল্টি প্রোফাইল পরিদর্শন ও তাৎক্ষণিক তথ্য আপডেট
            </p>
          </div>
          <Link
            href="/admin/instructors"
            className={`text-xs font-bold px-3.5 py-2 rounded-xl border flex items-center gap-1.5 transition-all ${
              isLight ? "bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100" : "bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/20"
            }`}
          >
            ইনস্ট্রাক্টর ম্যানেজমেন্টে যান <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.recentInstructors.length === 0 ? (
            <div className="col-span-full text-center py-8 text-xs text-slate-500">
              কোনো ইনস্ট্রাক্টর এখনো যুক্ত করা হয়নি। ইনস্ট্রাক্টর প্যানেল থেকে নতুন ইনস্ট্রাক্টর যোগ করুন।
            </div>
          ) : (
            stats.recentInstructors.map((inst) => (
              <div
                key={inst._id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  isLight
                    ? "bg-slate-50/80 border-slate-200 hover:border-purple-300 hover:bg-white shadow-xs"
                    : "bg-slate-800/60 border-slate-700 hover:border-purple-500/50 hover:bg-slate-800"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center shrink-0 border ${
                          inst.gender === "female"
                            ? isLight
                              ? "bg-rose-100 text-rose-800 border-rose-200"
                              : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                            : isLight
                            ? "bg-purple-100 text-purple-800 border-purple-200"
                            : "bg-purple-500/20 text-purple-300 border-purple-500/30"
                        }`}
                      >
                        {inst.fullName ? inst.fullName[0].toUpperCase() : "I"}
                      </div>
                      <div>
                        <h4 className={`text-xs font-bold leading-tight ${isLight ? "text-slate-900" : "text-white"}`}>{inst.fullName}</h4>
                        <p className={`text-[10px] mt-0.5 ${isLight ? "text-purple-700 font-semibold" : "text-purple-300"}`}>
                          {inst.designation || "—"}
                          {inst.isActive === false && <span className="ml-1 text-rose-500 font-bold">(নিষ্ক্রিয়)</span>}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                        !isWomenTrack(inst.track)
                          ? isLight
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                          : isLight
                          ? "bg-pink-100 text-pink-800 border-pink-200"
                          : "bg-pink-500/20 text-pink-300 border-pink-500/30"
                      }`}
                    >
                      {trackLabel(inst.track)}
                    </span>
                  </div>

                  <p className={`text-[11px] leading-relaxed line-clamp-2 ${isLight ? "text-slate-600" : "text-slate-300"}`}>
                    {inst.specialization || "বিশেষায়িত ক্ষেত্র যুক্ত করা হয়নি"}
                  </p>

                  <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-dashed border-slate-200 dark:border-slate-700/60 text-[10px]">
                    <span className="flex items-center gap-1 font-bold text-amber-500">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {Number(inst.rating || 0).toFixed(1)}
                    </span>
                    <span className={`text-[10px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>•</span>
                    <span className={`font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                      {Number(inst.experienceYears || 0)} বছর অভিজ্ঞতা
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setSelectedInstructorForProfile(inst)}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold border flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                      isLight
                        ? "bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-2xs"
                        : "bg-slate-700/60 hover:bg-slate-700 border-slate-600 text-slate-200"
                    }`}
                  >
                    <Eye className="w-3 h-3 text-indigo-500" /> প্রোফাইল
                  </button>
                  <button
                    onClick={() => setEditingInstructor({ ...inst })}
                    className="flex-1 py-1.5 rounded-lg text-[11px] font-bold bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-1 shadow-sm transition-colors cursor-pointer"
                  >
                    <Edit className="w-3 h-3" /> আপডেট
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ----------------- MODAL 1: VIEW INSTRUCTOR PROFILE ----------------- */}
      {selectedInstructorForProfile && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`w-full max-w-lg rounded-3xl p-6 border shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 ${
              isLight ? "bg-white border-slate-200 text-slate-900" : "bg-slate-900 border-slate-800 text-white"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-14 h-14 rounded-2xl font-black text-xl flex items-center justify-center border shadow-inner ${
                    selectedInstructorForProfile.gender === "female"
                      ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                      : "bg-purple-500/20 text-purple-300 border-purple-500/30"
                  }`}
                >
                  {selectedInstructorForProfile.fullName ? selectedInstructorForProfile.fullName[0].toUpperCase() : "I"}
                </div>
                <div>
                  <h3 className="text-base font-black flex items-center gap-1.5">
                    {selectedInstructorForProfile.fullName}
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </h3>
                  <p className={`text-xs ${isLight ? "text-purple-700 font-bold" : "text-purple-300"}`}>
                    {selectedInstructorForProfile.designation || "—"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        !isWomenTrack(selectedInstructorForProfile.track)
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                          : "bg-pink-500/10 text-pink-400 border-pink-500/30"
                      }`}
                    >
                      {trackLabel(selectedInstructorForProfile.track)}
                    </span>
                    <span className="text-xs text-amber-500 font-bold flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400" /> {Number(selectedInstructorForProfile.rating || 0).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedInstructorForProfile(null)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-700" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className={`p-4 rounded-2xl border space-y-3 ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-800/50 border-slate-700/60"}`}>
              <div>
                <div className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                  বিশেষজ্ঞ ক্ষেত্র (Specialization)
                </div>
                <div className={`text-xs font-semibold ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                  {selectedInstructorForProfile.specialization || "তথ্য নেই"}
                </div>
              </div>

              <div>
                <div className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                  প্রশিক্ষকের বিবরণ (Bio)
                </div>
                <p className={`text-xs leading-relaxed ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                  {selectedInstructorForProfile.bio || "তথ্য নেই"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                <div>
                  <span className={isLight ? "text-slate-500 font-medium" : "text-slate-400"}>শিক্ষকতা অভিজ্ঞতা:</span>{" "}
                  <strong className={isLight ? "text-slate-900" : "text-white"}>
                    {Number(selectedInstructorForProfile.experienceYears || 0)} বছর
                  </strong>
                </div>
                <div>
                  <span className={isLight ? "text-slate-500 font-medium" : "text-slate-400"}>রেটিং:</span>{" "}
                  <strong className="text-amber-500 font-bold">{Number(selectedInstructorForProfile.rating || 0).toFixed(1)} / 5.0</strong>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Phone className={`w-3.5 h-3.5 ${isLight ? "text-slate-500" : "text-slate-400"}`} />
                <span className={isLight ? "text-slate-600" : "text-slate-400"}>ফোন:</span>
                <span className="font-mono font-bold">{selectedInstructorForProfile.phone || "তথ্য নেই"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className={`w-3.5 h-3.5 ${isLight ? "text-slate-500" : "text-slate-400"}`} />
                <span className={isLight ? "text-slate-600" : "text-slate-400"}>ইমেইল:</span>
                <span className="font-mono font-semibold">{selectedInstructorForProfile.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              {whatsappHref(selectedInstructorForProfile.phone) && (
                <a
                  href={whatsappHref(selectedInstructorForProfile.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp যোগাযোগ
                </a>
              )}
              <button
                onClick={() => {
                  setEditingInstructor({ ...selectedInstructorForProfile });
                  setSelectedInstructorForProfile(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" /> প্রোফাইল আপডেট
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- MODAL 2: QUICK EDIT INSTRUCTOR ----------------- */}
      {editingInstructor && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`w-full max-w-lg rounded-3xl p-6 border shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 ${
              isLight ? "bg-white border-slate-200 text-slate-900" : "bg-slate-900 border-slate-800 text-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <Edit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold">ইনস্ট্রাক্টর তথ্য আপডেট</h3>
                  <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>ড্যাশবোর্ড থেকে সরাসরি ডাটাবেস পরিবর্তন</p>
                </div>
              </div>
              <button
                onClick={() => setEditingInstructor(null)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-700" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateInstructor} className="space-y-4">
              <div className="space-y-1">
                <label className={`text-xs font-bold ${isLight ? "text-slate-700" : "text-slate-300"}`}>পুরো নাম (Full Name) *</label>
                <input
                  type="text"
                  required
                  value={editingInstructor.fullName || ""}
                  onChange={(e) => setEditingInstructor({ ...editingInstructor, fullName: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={`text-xs font-bold ${isLight ? "text-slate-700" : "text-slate-300"}`}>পদবি (Designation)</label>
                  <input
                    type="text"
                    value={editingInstructor.designation || ""}
                    onChange={(e) => setEditingInstructor({ ...editingInstructor, designation: e.target.value })}
                    className={inputCls}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-xs font-bold ${isLight ? "text-slate-700" : "text-slate-300"}`}>ফোন নম্বর (WhatsApp)</label>
                  <input
                    type="tel"
                    value={editingInstructor.phone || ""}
                    onChange={(e) => setEditingInstructor({ ...editingInstructor, phone: e.target.value })}
                    className={`${inputCls} font-mono`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className={`text-xs font-bold ${isLight ? "text-slate-700" : "text-slate-300"}`}>কোর্স ট্র্যাক</label>
                  <select
                    value={editingInstructor.track ?? "TOT-MEN"}
                    onChange={(e) => setEditingInstructor({ ...editingInstructor, track: e.target.value })}
                    className={inputCls}
                  >
                    <option value="TOT-MEN">TOT Men (পুরুষ)</option>
                    <option value="TOT-WOMEN-014">TOT Women 014 (মহিলা)</option>
                    <option value="TOT-WOMEN">TOT Women (মহিলা)</option>
                    <option value="">নির্দিষ্ট ব্যাচ নেই</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={`text-xs font-bold ${isLight ? "text-slate-700" : "text-slate-300"}`}>অভিজ্ঞতা (বছর)</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={editingInstructor.experienceYears ?? 0}
                    onChange={(e) => setEditingInstructor({ ...editingInstructor, experienceYears: e.target.value })}
                    className={`${inputCls} font-mono`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-xs font-bold ${isLight ? "text-slate-700" : "text-slate-300"}`}>রেটিং (০-৫)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={editingInstructor.rating ?? 0}
                    onChange={(e) => setEditingInstructor({ ...editingInstructor, rating: e.target.value })}
                    className={`${inputCls} font-mono`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className={`text-xs font-bold ${isLight ? "text-slate-700" : "text-slate-300"}`}>বিশেষজ্ঞ ক্ষেত্র (Specialization)</label>
                <input
                  type="text"
                  value={editingInstructor.specialization || ""}
                  onChange={(e) => setEditingInstructor({ ...editingInstructor, specialization: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div className="space-y-1">
                <label className={`text-xs font-bold ${isLight ? "text-slate-700" : "text-slate-300"}`}>প্রশিক্ষক পরিচিতি (Bio)</label>
                <textarea
                  rows={3}
                  value={editingInstructor.bio || ""}
                  onChange={(e) => setEditingInstructor({ ...editingInstructor, bio: e.target.value })}
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingInstructor(null)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    isLight ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700" : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                  }`}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={savingInstructor}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition-all cursor-pointer disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  {savingInstructor ? "সংরক্ষণ হচ্ছে..." : "আপডেট সংরক্ষণ করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast Announcement Modal */}
      {showNoticeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#051329] border border-[#C59B27]/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 relative">
            <button
              onClick={() => setShowNoticeModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1">
                <Megaphone className="w-3.5 h-3.5" /> Broadcast Announcement
              </span>
              <h3 className="text-xl font-black text-white">ঘোষণা ব্রডকাস্ট করুন</h3>
              <p className="text-xs text-slate-400">এই নোটিশটি নির্বাচিত ব্যাচের ট্রেইনি ও শিক্ষক ড্যাশবোর্ডের নোটিশ ফিডে প্রদর্শিত হবে</p>
            </div>

            <form onSubmit={handleBroadcastNotice} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">শিরোনাম (Title):</label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  placeholder="উদা: লাইভ ডেমো ক্লাস ও পরীক্ষা সংক্রান্ত জরুরি বিজ্ঞপ্তি"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-[#D4AF37] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">লক্ষ্যমাত্রা (Target Track):</label>
                  <select
                    value={noticeForm.track}
                    onChange={(e) => setNoticeForm({ ...noticeForm, track: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-[#D4AF37] focus:outline-hidden"
                  >
                    <option value="all">সকল ব্যাচ ও ট্রেইনি (ALL)</option>
                    <option value="TOT-MEN">শুধুমাত্র পুরুষ ব্যাচ (MEN)</option>
                    <option value="TOT-WOMEN-014">শুধুমাত্র মহিলা ব্যাচ 014</option>
                    <option value="TOT-WOMEN">শুধুমাত্র মহিলা ব্যাচ (WOMEN)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">অগ্রাধিকার (Priority):</label>
                  <select
                    value={noticeForm.priority}
                    onChange={(e) => setNoticeForm({ ...noticeForm, priority: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-[#D4AF37] focus:outline-hidden"
                  >
                    <option value="normal">সাধারণ (Normal)</option>
                    <option value="important">জরুরি (Important)</option>
                    <option value="urgent">অতি জরুরি (Urgent Red)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">বিজ্ঞপ্তির বিস্তারিত বিবরণ:</label>
                <textarea
                  required
                  rows={4}
                  maxLength={5000}
                  value={noticeForm.content}
                  onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                  placeholder="বিজ্ঞপ্তির বিস্তারিত বার্তা এখানে লিখুন..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-[#D4AF37] focus:outline-hidden resize-none"
                />
              </div>

              <label className="flex items-center gap-2 text-slate-300 font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={noticeForm.isPinned}
                  onChange={(e) => setNoticeForm({ ...noticeForm, isPinned: e.target.checked })}
                  className="w-4 h-4 rounded cursor-pointer"
                />
                নোটিশটি ফিডের উপরে পিন করে রাখুন
              </label>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNoticeModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={savingNotice}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {savingNotice ? "ব্রডকাস্ট হচ্ছে..." : "এখনই ব্রডকাস্ট করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
