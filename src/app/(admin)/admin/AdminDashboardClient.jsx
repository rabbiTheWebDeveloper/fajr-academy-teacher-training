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
  Download
} from "lucide-react";
import { useAdminTheme } from "../AdminThemeContext";

export default function AdminDashboardClient({ initialStats }) {
  const [stats, setStats] = useState(initialStats);
  const [verifyingId, setVerifyingId] = useState(null);
  const { isLight } = useAdminTheme();

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
      }
    } catch (err) {
      console.error(err);
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="space-y-8">
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
            ফজর একাডেমি টিচার্স ট্রেনিং (TOT) প্রোগ্রামের লাইভ এনরোলমেন্ট ও পেমেন্ট ট্র্যাকার
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/users"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
          >
            <Users className="w-4 h-4" /> ইউজার ম্যানেজমেন্ট
          </Link>
          <Link
            href="/admin/payments"
            className={`px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all ${
              isLight
                ? "bg-white hover:bg-slate-50 border-slate-300 text-slate-800 shadow-xs"
                : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200"
            }`}
          >
            <CreditCard className="w-4 h-4" /> পেমেন্ট ভেরিফাই
          </Link>
        </div>
      </div>

      {/* 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* KPI 4: Instructors */}
        <div
          className={`p-5 rounded-3xl relative overflow-hidden border transition-all ${
            isLight
              ? "bg-white border-slate-200 shadow-sm hover:shadow-md"
              : "bg-slate-900/90 border-slate-800 shadow-xl"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              সিনিয়র ইনস্ট্রাক্টর
            </span>
            <div
              className={`p-2 rounded-xl ${
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
            {stats.totalInstructors || 4}{" "}
            <span className={`text-xs font-sans font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              জন ট্রেইনার
            </span>
          </div>
          <div className={`mt-2 text-[11px] font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
            পুরুষ ও মহিলা ফ্যাকাল্টি
          </div>
        </div>
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
    </div>
  );
}
