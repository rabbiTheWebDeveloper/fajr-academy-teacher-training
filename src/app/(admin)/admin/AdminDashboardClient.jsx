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

export default function AdminDashboardClient({ initialStats }) {
  const [stats, setStats] = useState(initialStats);
  const [verifyingId, setVerifyingId] = useState(null);

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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Executive Control System
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            TOT অ্যাডমিন ওভারভিউ ও এনালিটিক্স
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            ফজর একাডেমি টিচার্স ট্রেনিং (TOT) প্রোগ্রামের লাইভ এনরোলমেন্ট ও পেমেন্ট ট্র্যাকার
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/users"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Users className="w-4 h-4" /> ইউজার ম্যানেজমেন্ট
          </Link>
          <Link
            href="/admin/payments"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <CreditCard className="w-4 h-4" /> পেমেন্ট ভেরিফাই
          </Link>
        </div>
      </div>

      {/* 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Revenue */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">মোট সংগৃহীত ফি</span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            ৳ {stats.totalRevenue.toLocaleString()} <span className="text-xs text-slate-400 font-sans">BDT</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> SSLCommerz 256-Bit ভেরিফায়েড
          </div>
        </div>

        {/* KPI 2: Paid Trainees */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">পরিশোধিত ট্রেইনি</span>
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-400 font-mono">
            {stats.paidTrainees} <span className="text-xs text-slate-400 font-sans">জন শিক্ষক</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>পুরুষ: {stats.menTrainees}</span>
            <span>মহিলা: {stats.womenTrainees}</span>
          </div>
        </div>

        {/* KPI 3: Pending Payments */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">পেন্ডিং আবেদন</span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
            {stats.pendingTrainees} <span className="text-xs text-slate-400 font-sans">জন</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-300/80 font-semibold">
            অপেক্ষমান কোর্স পেমেন্ট
          </div>
        </div>

        {/* KPI 4: Instructors */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">সিনিয়র ইনস্ট্রাক্টর</span>
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">
            {stats.totalInstructors || 4} <span className="text-xs text-slate-400 font-sans">জন ট্রেইনার</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            পুরুষ ও মহিলা ফ্যাকাল্টি
          </div>
        </div>
      </div>

      {/* Grid: Recent Payments & Recent Trainees */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Box 1: Recent Payments Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-400" />
                সর্বশেষ পেমেন্ট ট্রানজেকশন
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">১-ক্লিক ভেরিফিকেশন ও স্ট্যাটাস</p>
            </div>
            <Link
              href="/admin/payments"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              সব দেখুন <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {stats.recentPayments.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                কোনো সাম্প্রতিক পেমেন্ট ডাটা নেই।
              </div>
            ) : (
              stats.recentPayments.map((p) => (
                <div key={p._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>{p.userName || p.userEmail}</span>
                      <span className="text-[10px] font-mono text-slate-400">({p.tranId})</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      ৳ {p.amount || 1000} • {p.cardType || "SSLCommerz"} • {p.track || "TOT-MEN"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {p.status === "VALID" ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                        ✓ Verified
                      </span>
                    ) : (
                      <button
                        onClick={() => handleVerifyPayment(p._id, p.tranId)}
                        disabled={verifyingId === p._id}
                        className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-bold transition-colors cursor-pointer"
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
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                সর্বশেষ নিবন্ধিত শিক্ষক
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">TOT কোর্স শিক্ষার্থী তালিকা</p>
            </div>
            <Link
              href="/admin/users"
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              সব দেখুন <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {stats.recentUsers.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                কোনো শিক্ষার্থী ডাটা নেই।
              </div>
            ) : (
              stats.recentUsers.map((u) => (
                <div key={u._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-200 font-bold flex items-center justify-center text-xs">
                      {u.fullName ? u.fullName[0].toUpperCase() : "T"}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{u.fullName}</h4>
                      <p className="text-[11px] text-slate-400">
                        {u.phone} • {u.track === "TOT-MEN" ? "TOT Men" : "TOT Women 014"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        u.paymentStatus === "paid"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {u.paymentStatus === "paid" ? "Paid" : "Pending"}
                    </span>
                    <Link
                      href={`/id-card?tran_id=${u.tranId}`}
                      target="_blank"
                      className="text-indigo-400 hover:underline text-[11px] font-bold"
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
