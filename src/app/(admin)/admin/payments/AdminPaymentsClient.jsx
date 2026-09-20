'use client';

import React, { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  Download,
  ExternalLink,
  Plus
} from "lucide-react";
import { useAdminTheme } from "../../AdminThemeContext";

export default function AdminPaymentsClient({ initialPayments }) {
  const [payments, setPayments] = useState(initialPayments || []);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const { isLight } = useAdminTheme();

  const handleUpdateStatus = async (paymentId, tranId, nextStatus) => {
    setUpdatingId(paymentId || tranId);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, tranId, status: nextStatus }),
      });

      if (res.ok) {
        setPayments((prev) =>
          prev.map((p) =>
            p._id === paymentId || p.tranId === tranId ? { ...p, status: nextStatus } : p
          )
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = payments.filter((p) => {
    const matchesSearch =
      (p.tranId || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.userEmail || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.userName || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.valId || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" ? true : p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCollected = payments
    .filter((p) => p.status === "VALID")
    .reduce((acc, curr) => acc + (curr.amount || 1000), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1
            className={`text-xl sm:text-2xl font-black tracking-tight ${
              isLight ? "text-slate-900" : "text-white"
            }`}
          >
            পেমেন্ট ভেরিফিকেশন ও ট্রানজেকশন লেজার
          </h1>
          <p className={`text-xs mt-1 font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
            SSLCommerz গেটওয়ে পেমেন্ট ট্রানজেকশন অডিট ও ১-ক্লিক ভেরিফিকেশন
          </p>
        </div>

        <div
          className={`px-4 py-2.5 rounded-2xl flex items-center gap-3 border shadow-xs transition-all ${
            isLight
              ? "bg-emerald-50/90 border-emerald-200 text-emerald-950"
              : "bg-slate-900 border-slate-800 text-white shadow-xl"
          }`}
        >
          <span className={`text-xs font-bold ${isLight ? "text-emerald-800" : "text-slate-400"}`}>
            মোট ভেরিফায়েড রেভিনিউ:
          </span>
          <span className={`text-lg font-black font-mono ${isLight ? "text-emerald-700" : "text-emerald-400"}`}>
            ৳ {totalCollected.toLocaleString()} BDT
          </span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="TrxID, ইমেইল, ভ্যালিডেশন আইডি দিয়ে খুঁজুন..."
            className={`w-full rounded-2xl px-4 py-3 pl-11 text-xs sm:text-sm font-medium border shadow-xs outline-hidden transition-all ${
              isLight
                ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                : "bg-slate-900/90 border-slate-800 text-white placeholder-slate-500 focus:border-amber-500 shadow-xl"
            }`}
          />
          <Search
            className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 ${
              isLight ? "text-slate-400" : "text-slate-500"
            }`}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`rounded-2xl px-4 py-3 text-xs font-bold border shadow-xs outline-hidden transition-all w-full sm:w-auto cursor-pointer ${
            isLight
              ? "bg-white border-slate-300 text-slate-800 focus:border-amber-500"
              : "bg-slate-900 border-slate-800 text-white focus:border-amber-500"
          }`}
        >
          <option value="all">সকল স্ট্যাটাস</option>
          <option value="VALID">✓ VALID (ভেরিফায়েড)</option>
          <option value="PENDING">⏳ PENDING (পেন্ডিং)</option>
          <option value="FAILED">✕ FAILED (ব্যর্থ)</option>
        </select>
      </div>

      {/* Payments Table */}
      <div
        className={`rounded-3xl border overflow-hidden transition-all ${
          isLight
            ? "bg-white border-slate-200 shadow-sm"
            : "bg-slate-900 border-slate-800 shadow-2xl"
        }`}
      >
        <div className="overflow-x-auto">
          <table className={`w-full text-left text-xs ${isLight ? "text-slate-700" : "text-slate-300"}`}>
            <thead
              className={`font-bold border-b transition-colors ${
                isLight
                  ? "bg-slate-100/90 text-slate-800 border-slate-200"
                  : "bg-slate-950/90 text-slate-400 border-slate-800"
              }`}
            >
              <tr>
                <th className="p-4">ট্রানজেকশন আইডি (TrxID)</th>
                <th className="p-4">শিক্ষার্থীর নাম ও ইমেইল</th>
                <th className="p-4">পরিমাণ ও মেথড</th>
                <th className="p-4">ট্র্যাক / ব্যাচ</th>
                <th className="p-4">স্ট্যাটাস</th>
                <th className="p-4 text-right">ভেরিফিকেশন অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? "divide-slate-200" : "divide-slate-800/60"}`}>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                    কোনো পেমেন্ট রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p._id}
                    className={`transition-colors ${
                      isLight ? "hover:bg-slate-50/80" : "hover:bg-slate-800/40"
                    }`}
                  >
                    <td className="p-4">
                      <div
                        className={`font-mono font-bold text-xs ${
                          isLight ? "text-amber-700" : "text-amber-400"
                        }`}
                      >
                        {p.tranId}
                      </div>
                      {p.valId && (
                        <div
                          className={`text-[10px] font-mono mt-0.5 ${
                            isLight ? "text-slate-500" : "text-slate-500"
                          }`}
                        >
                          ValID: {p.valId}
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <div className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                        {p.userName || "Candidate Teacher"}
                      </div>
                      <div
                        className={`text-[11px] ${
                          isLight ? "text-slate-600 font-medium" : "text-slate-400"
                        }`}
                      >
                        {p.userEmail}
                      </div>
                    </td>

                    <td className="p-4">
                      <div
                        className={`font-bold font-mono ${
                          isLight ? "text-slate-900" : "text-white"
                        }`}
                      >
                        ৳ {p.amount || 1000} BDT
                      </div>
                      <div
                        className={`text-[11px] uppercase font-medium ${
                          isLight ? "text-slate-500" : "text-slate-400"
                        }`}
                      >
                        {p.cardType || "SSLCommerz"}
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                          p.track === "TOT-MEN"
                            ? isLight
                              ? "bg-blue-50 text-blue-800 border-blue-200"
                              : "bg-blue-500/10 text-blue-300 border-blue-500/20"
                            : isLight
                            ? "bg-pink-50 text-pink-800 border-pink-200"
                            : "bg-pink-500/10 text-pink-300 border-pink-500/20"
                        }`}
                      >
                        {p.track || "TOT-MEN"}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                          p.status === "VALID"
                            ? isLight
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : p.status === "PENDING"
                            ? isLight
                              ? "bg-amber-50 text-amber-900 border-amber-300"
                              : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            : isLight
                            ? "bg-rose-50 text-rose-800 border-rose-300"
                            : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                        }`}
                      >
                        {p.status === "VALID" ? "✓ VALID" : p.status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {p.status !== "VALID" ? (
                          <button
                            onClick={() => handleUpdateStatus(p._id, p.tranId, "VALID")}
                            disabled={updatingId === p._id}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all shadow-sm cursor-pointer"
                          >
                            ✓ অনুমোদন দিন
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus(p._id, p.tranId, "PENDING")}
                            disabled={updatingId === p._id}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                              isLight
                                ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 shadow-2xs"
                                : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                            }`}
                          >
                            পেন্ডিং করুন
                          </button>
                        )}
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
