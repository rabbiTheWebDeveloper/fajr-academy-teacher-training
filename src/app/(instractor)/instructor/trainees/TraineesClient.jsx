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
  Download
} from "lucide-react";

export default function TraineesClient({ initialTrainees }) {
  const [search, setSearch] = useState("");
  const [trackFilter, setTrackFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const filtered = (initialTrainees || []).filter((t) => {
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

    return matchesSearch && matchesTrack && matchesPayment;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/instructor"
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> ড্যাশবোর্ড
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
            টিচার ট্রেইনি তালিকা ({filtered.length} জন)
          </h1>
          <p className="text-xs text-slate-400">
            TOT Men ও TOT Women ব্যাচে নিবন্ধিত প্রার্থীদের তথ্য ও প্রোফাইল
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs w-full sm:w-auto">
          <select
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="all">সকল ব্যাচ</option>
            <option value="men">👨 TOT MEN</option>
            <option value="women">🧕 TOT WOMEN (014)</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="all">সকল স্ট্যাটাস</option>
            <option value="paid">✓ Paid (পরিশোধিত)</option>
            <option value="pending">⏳ Pending (বকেয়া)</option>
          </select>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="নাম, ইমেইল, ফোন নম্বর অথবা TrxID দিয়ে সার্চ করুন..."
          className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-3 pl-11 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-xl"
        />
        <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
      </div>

      {/* Trainees Grid Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th className="p-4">ট্রেইনির নাম</th>
                <th className="p-4">ব্যাচ ও ট্র্যাক</th>
                <th className="p-4">যোগাযোগ</th>
                <th className="p-4">দক্ষতা ও ল্যাপটপ</th>
                <th className="p-4">পেমেন্ট</th>
                <th className="p-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    কোনো ট্রেইনি তথ্য পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{t.fullName}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
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

                    <td className="p-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Phone className="w-3 h-3 text-slate-500" /> {t.phone}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                        <Mail className="w-3 h-3 text-slate-500" /> {t.email}
                      </div>
                    </td>

                    <td className="p-4 space-y-0.5">
                      <div className="text-[11px]">কুরআন: <strong className="text-white">{t.quranSkill || "fluent"}</strong></div>
                      <div className="text-[11px]">ল্যাপটপ: <strong className="text-white">{t.hasLaptop === "yes" ? "আছে" : "প্রয়োজন"}</strong></div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.paymentStatus === "paid"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {t.paymentStatus === "paid" ? "✓ ৳১,০০০ Paid" : "Pending"}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <Link
                        href={`/id-card?tran_id=${t.tranId}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> কার্ড দেখুন
                      </Link>
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
