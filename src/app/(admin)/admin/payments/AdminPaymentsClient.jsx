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

export default function AdminPaymentsClient({ initialPayments }) {
  const [payments, setPayments] = useState(initialPayments || []);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

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
          <h1 className="text-xl sm:text-2xl font-black text-white">
            পেমেন্ট ভেরিফিকেশন ও ট্রানজেকশন লেজার
          </h1>
          <p className="text-xs text-slate-400">
            SSLCommerz ও ম্যানুয়াল bKash পেমেন্ট ট্রানজেকশন অডিট ও ১-ক্লিক ভেরিফিকেশন
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl flex items-center gap-3">
          <span className="text-xs text-slate-400 font-bold">মোট ভেরিফায়েড রেভিনিউ:</span>
          <span className="text-lg font-black text-emerald-400 font-mono">
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
            className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-3 pl-11 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 shadow-xl"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500 w-full sm:w-auto"
        >
          <option value="all">সকল স্ট্যাটাস</option>
          <option value="VALID">✓ VALID (ভেরিফায়েড)</option>
          <option value="PENDING">⏳ PENDING (পেন্ডিং)</option>
          <option value="FAILED">✕ FAILED (ব্যর্থ)</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/90 text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th className="p-4">ট্রানজেকশন আইডি (TrxID)</th>
                <th className="p-4">শিক্ষার্থীর নাম ও ইমেইল</th>
                <th className="p-4">পরিমাণ ও মেথড</th>
                <th className="p-4">ট্র্যাক / ব্যাচ</th>
                <th className="p-4">স্ট্যাটাস</th>
                <th className="p-4 text-right">ভেরিফিকেশন অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    কোনো পেমেন্ট রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="font-mono font-bold text-amber-400 text-xs">{p.tranId}</div>
                      {p.valId && (
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          ValID: {p.valId}
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-white">{p.userName || "Candidate Teacher"}</div>
                      <div className="text-[11px] text-slate-400">{p.userEmail}</div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-white">৳ {p.amount || 1000} BDT</div>
                      <div className="text-[11px] text-slate-400 uppercase">
                        {p.cardType || "SSLCommerz"}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {p.track || "TOT-MEN"}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          p.status === "VALID"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : p.status === "PENDING"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
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
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all cursor-pointer"
                          >
                            ✓ অনুমোদন দিন
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus(p._id, p.tranId, "PENDING")}
                            disabled={updatingId === p._id}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition-all cursor-pointer"
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
