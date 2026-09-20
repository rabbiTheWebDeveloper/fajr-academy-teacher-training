'use client';

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Award,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Download,
  GraduationCap,
  Star,
  Eye,
  Edit,
  X,
  Save,
  Phone,
  Mail,
  MessageCircle,
  Check,
  Megaphone,
} from "lucide-react";
import { useAdminTheme } from "../AdminThemeContext";

export default function AdminDashboardClient({ initialStats }) {
  const [stats, setStats] = useState(initialStats);
  const [verifyingId, setVerifyingId] = useState(null);
  const { isLight } = useAdminTheme();

  // Announcement modal & state
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeForm, setNoticeForm] = useState({
    title: "",
    content: "",
    track: "all",
    priority: "normal",
  });
  const [savingNotice, setSavingNotice] = useState(false);

  // Instructor modals & live updates
  const [selectedInstructorForProfile, setSelectedInstructorForProfile] = useState(null);
  const [editingInstructor, setEditingInstructor] = useState(null);
  const [savingInstructor, setSavingInstructor] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (text, type = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleVerifyPayment = async (paymentId, tranId) => {
    setVerifyingId(paymentId || tranId);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, tranId, status: "VALID" }),
      });

      if (res.ok) {
        setStats((prev) => ({
          ...prev,
          paidTrainees: prev.paidTrainees + 1,
          pendingTrainees: Math.max(0, prev.pendingTrainees - 1),
          totalRevenue: prev.totalRevenue + 1000,
          recentPayments: prev.recentPayments.map((p) =>
            p._id === paymentId || p.tranId === tranId ? { ...p, status: "VALID" } : p
          ),
        }));
        showToast("পেমেন্ট সফলভাবে ভেরিফাই করা হয়েছে!");
      }
    } catch (err) {
      console.error(err);
      showToast("পেমেন্ট ভেরিফিকেশন ব্যর্থ হয়েছে", "error");
    } finally {
      setVerifyingId(null);
    }
  };

  // Direct Quick Update Instructor from Dashboard
  const handleUpdateInstructor = async (e) => {
    e.preventDefault();
    if (!editingInstructor) return;
    setSavingInstructor(true);

    try {
      const res = await fetch("/api/admin/instructors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructorId: editingInstructor._id,
          fullName: editingInstructor.fullName,
          phone: editingInstructor.phone,
          designation: editingInstructor.designation,
          specialization: editingInstructor.specialization,
          track: editingInstructor.track,
          bio: editingInstructor.bio,
          experienceYears: editingInstructor.experienceYears,
          rating: editingInstructor.rating,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.instructor) {
        setStats((prev) => ({
          ...prev,
          recentInstructors: (prev.recentInstructors || []).map((i) =>
            i._id === editingInstructor._id ? data.instructor : i
          ),
        }));
        showToast("ইনস্ট্রাক্টর তথ্য সফলভাবে আপডেট হয়েছে!");
        setEditingInstructor(null);
        if (selectedInstructorForProfile?._id === editingInstructor._id) {
          setSelectedInstructorForProfile(data.instructor);
        }
      } else {
        showToast(data.message || "আপডেট ব্যর্থ হয়েছে", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("সার্ভার ত্রুটি: পুনরায় চেষ্টা করুন", "error");
    } finally {
      setSavingInstructor(false);
    }
  };

  const handleBroadcastNotice = async (e) => {
    e.preventDefault();
    if (!noticeForm.title || !noticeForm.content) {
      showToast("শিরোনাম ও নোটিশের বিবরণ আবশ্যক!", "error");
      return;
    }
    setSavingNotice(true);
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noticeForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("ঘোষণা সফলভাবে সকল ট্রেইনি ও শিক্ষকের পোর্টালে ব্রডকাস্ট হয়েছে!");
        setShowNoticeModal(false);
        setNoticeForm({
          title: "",
          content: "",
          track: "all",
          priority: "normal",
        });
      } else {
        showToast(data.message || "ব্রডকাস্ট ব্যর্থ হয়েছে", "error");
      }
    } catch (err) {
      showToast("সার্ভার সংযোগে ত্রুটি", "error");
    } finally {
      setSavingNotice(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border ${
              toastMsg.type === "error"
                ? "bg-rose-900 border-rose-700 text-white"
                : "bg-emerald-950 border-emerald-500 text-emerald-100"
            }`}
          >
            {toastMsg.type === "error" ? (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            ) : (
              <Check className="w-4 h-4 text-emerald-400" />
            )}
            <span>{toastMsg.text}</span>
          </div>
        </div>
      )}

      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 border ${
              isLight
                ? "bg-amber-100 text-amber-900 border-amber-300"
                : "bg-amber-500/10 border-amber-500/30 text-amber-300"
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isLight ? "text-amber-600" : "text-amber-400"}`} />
            Executive Control System
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-black tracking-tight ${
              isLight ? "text-slate-900" : "text-white"
            }`}
          >
            TOT অ্যাডমিন ওভারভিউ ও এনালিটিক্স
          </h1>
          <p className={`text-xs sm:text-sm mt-1 font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
            ফজর একাডেমি টিচার্স ট্রেনিং (TOT) প্রোগ্রামের লাইভ এনরোলমেন্ট, পেমেন্ট, মূল্যায়ন ও ইনস্ট্রাক্টর ট্র্যাকার
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
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
            href="/admin/users"
            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
          >
            <Users className="w-4 h-4" /> ইউজার
          </Link>
          <Link
            href="/admin/payments"
            className={`px-3.5 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all ${
              isLight
                ? "bg-white hover:bg-slate-50 border-slate-300 text-slate-800 shadow-xs"
                : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200"
            }`}
          >
            <CreditCard className="w-4 h-4" /> পেমেন্ট
          </Link>
        </div>
      </div>

      {/* 5 KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Revenue */}
        <div
          className={`p-5 rounded-3xl relative overflow-hidden border transition-all ${
            isLight
              ? "bg-white border-slate-200 shadow-sm hover:shadow-md"
              : "bg-slate-900/90 border-slate-800 shadow-xl"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              মোট সংগৃহীত ফি
            </span>
            <div
              className={`p-2 rounded-xl ${
                isLight ? "bg-emerald-100 text-emerald-700" : "bg-emerald-500/20 text-emerald-400"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-2xl sm:text-3xl font-black font-mono ${
              isLight ? "text-slate-900" : "text-white"
            }`}
          >
            ৳ {stats.totalRevenue.toLocaleString()}{" "}
            <span className={`text-xs font-sans font-medium ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              BDT
            </span>
          </div>
          <div
            className={`mt-2 text-[11px] font-bold flex items-center gap-1 ${
              isLight ? "text-emerald-700" : "text-emerald-400"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> SSLCommerz 256-Bit ভেরিফায়েড
          </div>
        </div>

        {/* KPI 2: Paid Trainees */}
        <div
          className={`p-5 rounded-3xl relative overflow-hidden border transition-all ${
            isLight
              ? "bg-white border-slate-200 shadow-sm hover:shadow-md"
              : "bg-slate-900/90 border-slate-800 shadow-xl"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              পরিশোধিত ট্রেইনি
            </span>
            <div
              className={`p-2 rounded-xl ${
                isLight ? "bg-blue-100 text-blue-700" : "bg-blue-500/20 text-blue-400"
              }`}
            >
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-2xl sm:text-3xl font-black font-mono ${
              isLight ? "text-blue-700" : "text-blue-400"
            }`}
          >
            {stats.paidTrainees}{" "}
            <span className={`text-xs font-sans font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              জন শিক্ষক
            </span>
          </div>
          <div className={`mt-2 text-[11px] font-medium flex items-center justify-between ${isLight ? "text-slate-600" : "text-slate-400"}`}>
            <span>পুরুষ: {stats.menTrainees}</span>
            <span>মহিলা: {stats.womenTrainees}</span>
          </div>
        </div>

        {/* KPI 3: Pending Payments */}
        <div
          className={`p-5 rounded-3xl relative overflow-hidden border transition-all ${
            isLight
              ? "bg-white border-slate-200 shadow-sm hover:shadow-md"
              : "bg-slate-900/90 border-slate-800 shadow-xl"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              পেন্ডিং আবেদন
            </span>
            <div
              className={`p-2 rounded-xl ${
                isLight ? "bg-amber-100 text-amber-700" : "bg-amber-500/20 text-amber-400"
              }`}
            >
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-2xl sm:text-3xl font-black font-mono ${
              isLight ? "text-amber-700" : "text-amber-400"
            }`}
          >
            {stats.pendingTrainees}{" "}
            <span className={`text-xs font-sans font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              জন
            </span>
          </div>
          <div
            className={`mt-2 text-[11px] font-bold ${
              isLight ? "text-amber-800" : "text-amber-300/80"
            }`}
          >
            অপেক্ষমান কোর্স পেমেন্ট
          </div>
        </div>

        {/* KPI 4: Instructors (Direct Link to Management) */}
        <Link
          href="/admin/instructors"
          className={`group p-5 rounded-3xl relative overflow-hidden border transition-all block ${
            isLight
              ? "bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-purple-300"
              : "bg-slate-900/90 border-slate-800 shadow-xl hover:border-purple-500/40"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              সিনিয়র ইনস্ট্রাক্টর
            </span>
            <div
              className={`p-2 rounded-xl transition-transform group-hover:scale-110 ${
                isLight ? "bg-purple-100 text-purple-700" : "bg-purple-500/20 text-purple-400"
              }`}
            >
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-2xl sm:text-3xl font-black font-mono ${
              isLight ? "text-purple-700" : "text-purple-400"
            }`}
          >
            {stats.totalInstructors || stats.recentInstructors?.length || 4}{" "}
            <span className={`text-xs font-sans font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              জন ট্রেইনার
            </span>
          </div>
          <div className="mt-2 text-[11px] font-medium flex items-center justify-between">
            <span className={isLight ? "text-slate-600" : "text-slate-400"}>পুরুষ ও মহিলা ফ্যাকাল্টি</span>
            <span className={`font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform ${isLight ? "text-purple-700" : "text-purple-400"}`}>
              ম্যানেজ করুন <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </Link>

        {/* KPI 5: Evaluations & Certified Hired */}
        <Link
          href="/admin/evaluations"
          className={`group p-5 rounded-3xl relative overflow-hidden border transition-all block ${
            isLight
              ? "bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300"
              : "bg-slate-900/90 border-slate-800 shadow-xl hover:border-[#D4AF37]/40"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              মূল্যায়ন ও সনদপত্র
            </span>
            <div
              className={`p-2 rounded-xl transition-transform group-hover:scale-110 ${
                isLight ? "bg-amber-100 text-amber-800" : "bg-amber-500/20 text-[#D4AF37]"
              }`}
            >
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-2xl sm:text-3xl font-black font-mono ${
              isLight ? "text-amber-800" : "text-[#D4AF37]"
            }`}
          >
            {stats.totalEvaluated || 0}{" "}
            <span className={`text-xs font-sans font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              জন মূল্যায়িত
            </span>
          </div>
          <div className="mt-2 text-[11px] font-medium flex items-center justify-between">
            <span className="text-emerald-400 font-bold">
              {stats.certifiedHiredCount || 0} জন শিক্ষক নির্বাচিত
            </span>
            <span className={`font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform ${isLight ? "text-amber-800" : "text-[#D4AF37]"}`}>
              ফলাফল <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </Link>
      </div>

      {/* Grid: Recent Payments & Recent Trainees */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Box 1: Recent Payments Table */}
        <div
          className={`rounded-3xl p-6 border space-y-4 transition-all ${
            isLight
              ? "bg-white border-slate-200 shadow-sm"
              : "bg-slate-900 border-slate-800 shadow-xl"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3
                className={`text-sm font-bold flex items-center gap-2 ${
                  isLight ? "text-slate-900" : "text-white"
                }`}
              >
                <CreditCard className={`w-4 h-4 ${isLight ? "text-amber-600" : "text-amber-400"}`} />
                সর্বশেষ পেমেন্ট ট্রানজেকশন
              </h3>
              <p className={`text-xs mt-0.5 ${isLight ? "text-slate-500 font-medium" : "text-slate-400"}`}>
                ১-ক্লিক ভেরিফিকেশন ও স্ট্যাটাস
              </p>
            </div>
            <Link
              href="/admin/payments"
              className={`text-xs font-bold flex items-center gap-1 ${
                isLight
                  ? "text-amber-700 hover:text-amber-800"
                  : "text-amber-400 hover:text-amber-300"
              }`}
            >
              সব দেখুন <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className={`divide-y ${isLight ? "divide-slate-200" : "divide-slate-800/80"}`}>
            {stats.recentPayments.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                কোনো সাম্প্রতিক পেমেন্ট ডাটা নেই।
              </div>
            ) : (
              stats.recentPayments.map((p) => (
                <div key={p._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className={`font-bold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                      <span>{p.userName || p.userEmail}</span>
                      <span className={`text-[10px] font-mono ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                        ({p.tranId})
                      </span>
                    </div>
                    <div className={`text-[11px] mt-0.5 font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                      ৳ {p.amount || 1000} • {p.cardType || "SSLCommerz"} • {p.track || "TOT-MEN"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {p.status === "VALID" ? (
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold border ${
                          isLight
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        }`}
                      >
                        ✓ Verified
                      </span>
                    ) : (
                      <button
                        onClick={() => handleVerifyPayment(p._id, p.tranId)}
                        disabled={verifyingId === p._id}
                        className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-[10px] font-extrabold shadow-sm transition-colors cursor-pointer"
                      >
                        {verifyingId === p._id ? "ভেরিফাই হচ্ছে..." : "ভেরিফাই করুন"}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Box 2: Recent Trainees */}
        <div
          className={`rounded-3xl p-6 border space-y-4 transition-all ${
            isLight
              ? "bg-white border-slate-200 shadow-sm"
              : "bg-slate-900 border-slate-800 shadow-xl"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3
                className={`text-sm font-bold flex items-center gap-2 ${
                  isLight ? "text-slate-900" : "text-white"
                }`}
              >
                <Users className={`w-4 h-4 ${isLight ? "text-blue-600" : "text-blue-400"}`} />
                সর্বশেষ নিবন্ধিত শিক্ষক
              </h3>
              <p className={`text-xs mt-0.5 ${isLight ? "text-slate-500 font-medium" : "text-slate-400"}`}>
                TOT কোর্স শিক্ষার্থী তালিকা
              </p>
            </div>
            <Link
              href="/admin/users"
              className={`text-xs font-bold flex items-center gap-1 ${
                isLight
                  ? "text-blue-700 hover:text-blue-800"
                  : "text-blue-400 hover:text-blue-300"
              }`}
            >
              সব দেখুন <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className={`divide-y ${isLight ? "divide-slate-200" : "divide-slate-800/80"}`}>
            {stats.recentUsers.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                কোনো শিক্ষার্থী ডাটা নেই।
              </div>
            ) : (
              stats.recentUsers.map((u) => (
                <div key={u._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl font-black flex items-center justify-center text-xs border ${
                        isLight
                          ? "bg-slate-100 border-slate-200 text-slate-800"
                          : "bg-slate-800 border-slate-700 text-slate-200"
                      }`}
                    >
                      {u.fullName ? u.fullName[0].toUpperCase() : "T"}
                    </div>
                    <div>
                      <h4 className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                        {u.fullName}
                      </h4>
                      <p className={`text-[11px] font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                        {u.phone} • {u.track === "TOT-MEN" ? "TOT Men" : "TOT Women 014"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        u.paymentStatus === "paid"
                          ? isLight
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : isLight
                          ? "bg-amber-50 text-amber-900 border-amber-300"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      }`}
                    >
                      {u.paymentStatus === "paid" ? "Paid" : "Pending"}
                    </span>
                    <Link
                      href={`/id-card?tran_id=${u.tranId}`}
                      target="_blank"
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-colors ${
                        isLight
                          ? "bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700"
                          : "text-indigo-400 hover:underline"
                      }`}
                    >
                      আইডি
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Box 3: Senior Instructors Roster & Quick Update Module */}
      <div
        className={`rounded-3xl p-6 border space-y-5 transition-all ${
          isLight
            ? "bg-white border-slate-200 shadow-sm"
            : "bg-slate-900 border-slate-800 shadow-xl"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3
              className={`text-base font-bold flex items-center gap-2 ${
                isLight ? "text-slate-900" : "text-white"
              }`}
            >
              <GraduationCap className={`w-5 h-5 ${isLight ? "text-purple-600" : "text-purple-400"}`} />
              অনুমোদিত সিনিয়র ইনস্ট্রাক্টর ও ফ্যাকাল্টি প্যানেল
            </h3>
            <p className={`text-xs mt-0.5 ${isLight ? "text-slate-500 font-medium" : "text-slate-400"}`}>
              সরাসরি ড্যাশবোর্ড থেকে ফ্যাকাল্টি প্রোফাইল পরিদর্শন ও তাৎক্ষণিক তথ্য আপডেট
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              href="/admin/instructors"
              className={`text-xs font-bold px-3.5 py-2 rounded-xl border flex items-center gap-1.5 transition-all ${
                isLight
                  ? "bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100"
                  : "bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/20"
              }`}
            >
              ইনস্ট্রাক্টর ম্যানেজমেন্টে যান <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Instructors Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {!stats.recentInstructors || stats.recentInstructors.length === 0 ? (
            <div className="col-span-full text-center py-8 text-xs text-slate-500">
              কোনো ইনস্ট্রাক্টর ডাটা পাওয়া যায়নি।
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
                {/* Header */}
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
                        <h4 className={`text-xs font-bold leading-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                          {inst.fullName}
                        </h4>
                        <p className={`text-[10px] mt-0.5 ${isLight ? "text-purple-700 font-semibold" : "text-purple-300"}`}>
                          {inst.designation || "Senior Lead Trainer"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                        inst.track === "TOT-MEN"
                          ? isLight
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                          : isLight
                          ? "bg-pink-100 text-pink-800 border-pink-200"
                          : "bg-pink-500/20 text-pink-300 border-pink-500/30"
                      }`}
                    >
                      {inst.track === "TOT-MEN" ? "TOT Men" : "TOT Women"}
                    </span>
                  </div>

                  {/* Specialization snippet */}
                  <p className={`text-[11px] leading-relaxed line-clamp-2 ${isLight ? "text-slate-600" : "text-slate-300"}`}>
                    {inst.specialization || "আন্তর্জাতিক কুরআন টিচিং পেডাগজি ও আধুনিক তাজবীদ মেথডোলজি"}
                  </p>

                  {/* Badges / Rating */}
                  <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-dashed border-slate-200 dark:border-slate-700/60 text-[10px]">
                    <span className="flex items-center gap-1 font-bold text-amber-500">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {inst.rating || 4.9}
                    </span>
                    <span className={`text-[10px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>•</span>
                    <span className={`font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                      {inst.experienceYears || 5}+ বছর অভিজ্ঞতা
                    </span>
                  </div>
                </div>

                {/* Card Actions: View Profile & Quick Update */}
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
            {/* Header */}
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
                    {selectedInstructorForProfile.designation || "Senior Lead Trainer"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        selectedInstructorForProfile.track === "TOT-MEN"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                          : "bg-pink-500/10 text-pink-400 border-pink-500/30"
                      }`}
                    >
                      {selectedInstructorForProfile.track === "TOT-MEN" ? "TOT Men Track" : "TOT Women Track"}
                    </span>
                    <span className="text-xs text-amber-500 font-bold flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400" /> {selectedInstructorForProfile.rating || 4.95}
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

            {/* Specialization & Bio */}
            <div className={`p-4 rounded-2xl border space-y-3 ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-800/50 border-slate-700/60"}`}>
              <div>
                <div className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                  বিশেষজ্ঞ ক্ষেত্র (Specialization)
                </div>
                <div className={`text-xs font-semibold ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                  {selectedInstructorForProfile.specialization || "আন্তর্জাতিক কুরআন টিচিং পেডাগজি ও তাজবীদ"}
                </div>
              </div>

              <div>
                <div className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                  প্রশিক্ষকের বিবরণ (Bio)
                </div>
                <p className={`text-xs leading-relaxed ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                  {selectedInstructorForProfile.bio || "ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) কোর্সের সিনিয়র প্রশিক্ষক।"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                <div>
                  <span className={isLight ? "text-slate-500 font-medium" : "text-slate-400"}>শিক্ষকতা অভিজ্ঞতা:</span>{" "}
                  <strong className={isLight ? "text-slate-900" : "text-white"}>{selectedInstructorForProfile.experienceYears || 5}+ বছর</strong>
                </div>
                <div>
                  <span className={isLight ? "text-slate-500 font-medium" : "text-slate-400"}>রেটিং:</span>{" "}
                  <strong className="text-amber-500 font-bold">{selectedInstructorForProfile.rating || 4.95} / 5.0</strong>
                </div>
              </div>
            </div>

            {/* Contact Details */}
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

            {/* Modal Footer Actions */}
            <div className="flex items-center gap-2 pt-2">
              {selectedInstructorForProfile.phone && (
                <a
                  href={`https://wa.me/88${selectedInstructorForProfile.phone.replace(/[^0-9]/g, "")}`}
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

      {/* ----------------- MODAL 2: QUICK EDIT INSTRUCTOR (DIRECT DASHBOARD UPDATE) ----------------- */}
      {editingInstructor && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`w-full max-w-lg rounded-3xl p-6 border shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 ${
              isLight ? "bg-white border-slate-200 text-slate-900" : "bg-slate-900 border-slate-800 text-white"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <Edit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold">ইনস্ট্রাক্টর তথ্য আপডেট</h3>
                  <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    ড্যাশবোর্ড থেকে সরাসরি ডাটাবেস পরিবর্তন
                  </p>
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
                <label className={`text-xs font-bold ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                  পুরো নাম (Full Name) *
                </label>
                <input
                  type="text"
                  required
                  value={editingInstructor.fullName || ""}
                  onChange={(e) => setEditingInstructor({ ...editingInstructor, fullName: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-hidden font-medium ${
                    isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-purple-600" : "bg-slate-800 border-slate-700 text-white focus:border-purple-500"
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={`text-xs font-bold ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                    পদবি (Designation)
                  </label>
                  <input
                    type="text"
                    value={editingInstructor.designation || ""}
                    onChange={(e) => setEditingInstructor({ ...editingInstructor, designation: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-hidden font-medium ${
                      isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-purple-600" : "bg-slate-800 border-slate-700 text-white focus:border-purple-500"
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-xs font-bold ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                    ফোন নম্বর (WhatsApp)
                  </label>
                  <input
                    type="tel"
                    value={editingInstructor.phone || ""}
                    onChange={(e) => setEditingInstructor({ ...editingInstructor, phone: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-hidden font-mono ${
                      isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-purple-600" : "bg-slate-800 border-slate-700 text-white focus:border-purple-500"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className={`text-xs font-bold ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                    কোর্স ট্র্যাক
                  </label>
                  <select
                    value={editingInstructor.track || "TOT-MEN"}
                    onChange={(e) => setEditingInstructor({ ...editingInstructor, track: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs outline-hidden font-medium ${
                      isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-purple-600" : "bg-slate-800 border-slate-700 text-white focus:border-purple-500"
                    }`}
                  >
                    <option value="TOT-MEN">TOT Men (পুরুষ)</option>
                    <option value="TOT-WOMEN-014">TOT Women (মহিলা)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={`text-xs font-bold ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                    অভিজ্ঞতা (বছর)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={editingInstructor.experienceYears || 5}
                    onChange={(e) => setEditingInstructor({ ...editingInstructor, experienceYears: Number(e.target.value) })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-hidden font-mono ${
                      isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-purple-600" : "bg-slate-800 border-slate-700 text-white focus:border-purple-500"
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-xs font-bold ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                    রেটিং (১-৫)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max="5"
                    value={editingInstructor.rating || 4.95}
                    onChange={(e) => setEditingInstructor({ ...editingInstructor, rating: parseFloat(e.target.value) })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-hidden font-mono ${
                      isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-purple-600" : "bg-slate-800 border-slate-700 text-white focus:border-purple-500"
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className={`text-xs font-bold ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                  বিশেষজ্ঞ ক্ষেত্র (Specialization)
                </label>
                <input
                  type="text"
                  value={editingInstructor.specialization || ""}
                  onChange={(e) => setEditingInstructor({ ...editingInstructor, specialization: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-hidden font-medium ${
                    isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-purple-600" : "bg-slate-800 border-slate-700 text-white focus:border-purple-500"
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className={`text-xs font-bold ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                  প্রশিক্ষক পরিচিতি (Bio)
                </label>
                <textarea
                  rows={3}
                  value={editingInstructor.bio || ""}
                  onChange={(e) => setEditingInstructor({ ...editingInstructor, bio: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-hidden font-medium resize-none ${
                    isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-purple-600" : "bg-slate-800 border-slate-700 text-white focus:border-purple-500"
                  }`}
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
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition-all cursor-pointer"
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
              <h3 className="text-xl font-black text-white">
                ঘোষণা ব্রডকাস্ট করুন
              </h3>
              <p className="text-xs text-slate-400">
                এই নোটিশটি সরাসরি সকল ট্রেইনি ও শিক্ষক ড্যাশবোর্ডের লাইভ নোটিশ ফিডে প্রদর্শিত হবে
              </p>
            </div>

            <form onSubmit={handleBroadcastNotice} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  শিরোনাম (Title):
                </label>
                <input
                  type="text"
                  required
                  value={noticeForm.title}
                  onChange={(e) =>
                    setNoticeForm({ ...noticeForm, title: e.target.value })
                  }
                  placeholder="উদা: লাইভ ডেমো ক্লাস ও পরীক্ষা সংক্রান্ত জরুরি বিজ্ঞপ্তি"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-[#D4AF37] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    লক্ষ্যমাত্রা (Target Track):
                  </label>
                  <select
                    value={noticeForm.track}
                    onChange={(e) =>
                      setNoticeForm({ ...noticeForm, track: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-[#D4AF37] focus:outline-hidden"
                  >
                    <option value="all">সকল ব্যাচ ও ট্রেইনি (ALL)</option>
                    <option value="TOT-MEN">শুধুমাত্র পুরুষ ব্যাচ (MEN)</option>
                    <option value="TOT-WOMEN-014">শুধুমাত্র মহিলা ব্যাচ (WOMEN)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    অগ্রাধিকার (Priority):
                  </label>
                  <select
                    value={noticeForm.priority}
                    onChange={(e) =>
                      setNoticeForm({ ...noticeForm, priority: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-[#D4AF37] focus:outline-hidden"
                  >
                    <option value="normal">সাধারণ (Normal)</option>
                    <option value="important">জরুরি (Important)</option>
                    <option value="urgent">অতি জরুরি (Urgent Red)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  বিজ্ঞপ্তির বিস্তারিত বিবরণ:
                </label>
                <textarea
                  required
                  rows={4}
                  value={noticeForm.content}
                  onChange={(e) =>
                    setNoticeForm({ ...noticeForm, content: e.target.value })
                  }
                  placeholder="বিজ্ঞপ্তির বিস্তারিত বার্তা এখানে লিখুন..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-[#D4AF37] focus:outline-hidden resize-none"
                />
              </div>

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
