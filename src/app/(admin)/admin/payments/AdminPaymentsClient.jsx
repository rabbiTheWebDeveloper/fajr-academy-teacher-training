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
  Plus,
  Trash2,
  X,
  Sparkles,
} from "lucide-react";
import { useAdminTheme } from "../../AdminThemeContext";

export default function AdminPaymentsClient({ initialPayments }) {
  const [payments, setPayments] = useState(initialPayments || []);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const { isLight } = useAdminTheme();

  // Form state for offline payment entry
  const [formData, setFormData] = useState({
    userName: "",
    userEmail: "",
    userPhone: "",
    amount: 1000,
    track: "TOT-MEN",
    cardType: "BKASH",
    tranId: "",
  });

  const showToast = (text, type = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

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
            p._id === paymentId || p.tranId === tranId
              ? { ...p, status: nextStatus }
              : p
          )
        );
        showToast(
          nextStatus === "VALID"
            ? "পেমেন্ট সফলভাবে ভেরিফাই ও ইউজার একটিভ করা হয়েছে!"
            : "স্ট্যাটাস আপডেট সম্পন্ন হয়েছে।"
        );
      }
    } catch (err) {
      console.error(err);
      showToast("স্ট্যাটাস আপডেট ব্যর্থ হয়েছে", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (paymentId, tranId) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই পেমেন্ট রেকর্ডটি মুছে ফেলতে চান?")) {
      return;
    }

    setDeletingId(paymentId || tranId);
    try {
      const res = await fetch(
        `/api/admin/payments?id=${paymentId}&tranId=${tranId || ""}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setPayments((prev) =>
          prev.filter((p) => p._id !== paymentId && p.tranId !== tranId)
        );
        showToast("পেমেন্ট রেকর্ড সফলভাবে মুছে ফেলা হয়েছে!");
      }
    } catch (err) {
      showToast("মুছে ফেলা ব্যর্থ হয়েছে", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateOfflinePayment = async (e) => {
    e.preventDefault();
    if (!formData.userEmail) {
      showToast("ইউজারের ইমেইল আবশ্যক!", "error");
      return;
    }

    setSavingPayment(true);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPayments((prev) => [data.payment, ...prev]);
        setShowAddModal(false);
        setFormData({
          userName: "",
          userEmail: "",
          userPhone: "",
          amount: 1000,
          track: "TOT-MEN",
          cardType: "BKASH",
          tranId: "",
        });
        showToast("ম্যানুয়াল পেমেন্ট সফলভাবে যুক্ত ও ট্রেইনি অ্যাক্টিভ হয়েছে!");
      } else {
        showToast(data.message || "পেমেন্ট এন্ট্রি ব্যর্থ হয়েছে", "error");
      }
    } catch (err) {
      showToast("সার্ভার ত্রুটি", "error");
    } finally {
      setSavingPayment(false);
    }
  };

  const filtered = payments.filter((p) => {
    const matchesSearch =
      (p.tranId || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.userEmail || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.userName || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.valId || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ? true : p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCollected = payments
    .filter((p) => p.status === "VALID")
    .reduce((acc, curr) => acc + (curr.amount || 1000), 0);

  return (
    <div className="space-y-6">
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
          <p
            className={`text-xs mt-1 font-medium ${
              isLight ? "text-slate-600" : "text-slate-400"
            }`}
          >
            SSLCommerz ও ম্যানুয়াল বিকাশ/নগদ পেমেন্ট অডিট ও ভেরিফিকেশন কনসোল
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`px-4 py-2.5 rounded-2xl flex items-center gap-3 border shadow-xs transition-all ${
              isLight
                ? "bg-emerald-50/90 border-emerald-200 text-emerald-950"
                : "bg-slate-900 border-slate-800 text-white shadow-xl"
            }`}
          >
            <span
              className={`text-xs font-bold ${
                isLight ? "text-emerald-800" : "text-slate-400"
              }`}
            >
              মোট রেভিনিউ:
            </span>
            <span
              className={`text-lg font-black font-mono ${
                isLight ? "text-emerald-700" : "text-emerald-400"
              }`}
            >
              ৳ {totalCollected.toLocaleString()} BDT
            </span>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#051329] font-bold text-xs shadow-lg hover:shadow-[#D4AF37]/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> ম্যানুয়াল পেমেন্ট
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="TrxID, ইমেইল, নাম দিয়ে খুঁজুন..."
            className={`w-full rounded-2xl px-4 py-3 pl-11 text-xs sm:text-sm font-medium border shadow-xs outline-hidden transition-all ${
              isLight
                ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-amber-500"
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
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr
                className={`border-b text-[10px] uppercase font-black tracking-wider ${
                  isLight
                    ? "bg-slate-50/80 text-slate-500 border-slate-200"
                    : "bg-slate-950/50 text-slate-400 border-slate-800"
                }`}
              >
                <th className="p-4">ট্রেইনি বিবরণ</th>
                <th className="p-4">ট্রানজেকশন ID</th>
                <th className="p-4">মাধ্যম / মেথড</th>
                <th className="p-4">পরিমাণ</th>
                <th className="p-4">তারিখ ও সময়</th>
                <th className="p-4">স্ট্যাটাস</th>
                <th className="p-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y font-medium ${
                isLight ? "divide-slate-100" : "divide-slate-800/60"
              }`}
            >
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="p-8 text-center text-slate-400 font-semibold"
                  >
                    কোনো পেমেন্ট রেকর্ড পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p._id || p.tranId}
                    className={`transition-colors ${
                      isLight ? "hover:bg-slate-50/80" : "hover:bg-slate-800/40"
                    }`}
                  >
                    <td className="p-4">
                      <div
                        className={`font-bold ${
                          isLight ? "text-slate-900" : "text-white"
                        }`}
                      >
                        {p.userName || p.userEmail?.split("@")[0] || "Teacher Candidate"}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {p.userEmail}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="font-mono text-[#D4AF37] font-bold">
                        {p.tranId}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {p.cardType || p.paymentMethod || "SSLCommerz"}
                      </span>
                    </td>

                    <td className="p-4 font-bold text-emerald-400 font-mono text-sm">
                      ৳{p.amount || 1000}
                    </td>

                    <td className="p-4 text-slate-400 text-[11px]">
                      {p.createdAt
                        ? new Date(p.createdAt).toLocaleDateString("bn-BD", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "১০ সেপ্টেম্বর ২০২৬"}
                    </td>

                    <td className="p-4">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                          p.status === "VALID"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : p.status === "PENDING"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
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
                            onClick={() =>
                              handleUpdateStatus(p._id, p.tranId, "VALID")
                            }
                            disabled={updatingId === p._id}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all shadow-sm cursor-pointer"
                          >
                            ✓ অনুমোদন দিন
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleUpdateStatus(p._id, p.tranId, "PENDING")
                            }
                            disabled={updatingId === p._id}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-bold transition-all cursor-pointer"
                          >
                            পেন্ডিং করুন
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(p._id, p.tranId)}
                          disabled={deletingId === p._id}
                          className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 transition-colors cursor-pointer"
                          title="রেকর্ড মুছুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Offline Payment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#051329] border border-[#C59B27]/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                Offline Payment Entry
              </span>
              <h3 className="text-xl font-black text-white">
                ম্যানুয়াল পেমেন্ট রেকর্ড যুক্ত করুন
              </h3>
              <p className="text-xs text-slate-400">
                বিকাশ/নগদ/ব্যাংক ট্রান্সফারের মাধ্যমে প্রাপ্ত কোর্স ফি এন্ট্রি ও ট্রেইনি অ্যাকাউন্ট অ্যাক্টিভেশন
              </p>
            </div>

            <form onSubmit={handleCreateOfflinePayment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  ট্রেইনির পূর্ণ নাম:
                </label>
                <input
                  type="text"
                  required
                  value={formData.userName}
                  onChange={(e) =>
                    setFormData({ ...formData, userName: e.target.value })
                  }
                  placeholder="উদা: হাফেজ মুহিব্বুল্লাহ"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-[#D4AF37] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    ইমেইল (লগইন ইউজারনেম):
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.userEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, userEmail: e.target.value })
                    }
                    placeholder="teacher@fajracademy.io"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-[#D4AF37] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    ফোন নম্বর:
                  </label>
                  <input
                    type="text"
                    value={formData.userPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, userPhone: e.target.value })
                    }
                    placeholder="01711223344"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-[#D4AF37] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    ব্যাচ ট্র্যাক:
                  </label>
                  <select
                    value={formData.track}
                    onChange={(e) =>
                      setFormData({ ...formData, track: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-[#D4AF37] focus:outline-hidden"
                  >
                    <option value="TOT-MEN">TOT-MEN (পুরুষ ব্যাচ)</option>
                    <option value="TOT-WOMEN-014">TOT-WOMEN-014 (মহিলা ব্যাচ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    পেমেন্ট মাধ্যম:
                  </label>
                  <select
                    value={formData.cardType}
                    onChange={(e) =>
                      setFormData({ ...formData, cardType: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-[#D4AF37] focus:outline-hidden"
                  >
                    <option value="BKASH">বিকাশ (bKash Manual)</option>
                    <option value="NAGAD">নগদ (Nagad Manual)</option>
                    <option value="BANK_TRANSFER">ব্যাংক ডিপোজিট</option>
                    <option value="CASH">ক্যাশ / সরাসরি প্রদান</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    পরিশোধের পরিমাণ (BDT):
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-[#D4AF37] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    TrxID (ঐচ্ছিক):
                  </label>
                  <input
                    type="text"
                    value={formData.tranId}
                    onChange={(e) =>
                      setFormData({ ...formData, tranId: e.target.value })
                    }
                    placeholder="উদা: BK9X287A"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-[#D4AF37] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold cursor-pointer"
                >
                  বাতিল
                </button>

                <button
                  type="submit"
                  disabled={savingPayment}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#051329] font-bold shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {savingPayment ? "সংরক্ষণ হচ্ছে..." : "পেমেন্ট নিশ্চিত ও অ্যাক্টিভ করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
