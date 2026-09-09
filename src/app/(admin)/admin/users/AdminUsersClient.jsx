'use client';

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Trash2,
  Edit,
  ArrowLeft,
  Check,
  X,
  Plus
} from "lucide-react";

export default function AdminUsersClient({ initialUsers }) {
  const [users, setUsers] = useState(initialUsers || []);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [trackFilter, setTrackFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "Fajr@Admin2026",
    role: "admin",
    track: "TOT-MEN",
    gender: "male",
    paymentStatus: "paid",
  });
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState("");

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateMsg("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUsers((prev) => [data.user, ...prev]);
        setCreateMsg(data.message || "ইউজার সফলভাবে তৈরি হয়েছে!");
        setTimeout(() => {
          setShowCreateModal(false);
          setCreateMsg("");
          setCreateForm({
            fullName: "",
            email: "",
            phone: "",
            password: "Fajr@Admin2026",
            role: "admin",
            track: "TOT-MEN",
            gender: "male",
            paymentStatus: "paid",
          });
        }, 1500);
      } else {
        setCreateMsg(data.message || "তৈরি ব্যর্থ হয়েছে");
      }
    } catch (err) {
      setCreateMsg("সার্ভার ত্রুটি");
    } finally {
      setCreating(false);
    }
  };

  const handleTogglePayment = async (user) => {
    const nextStatus = user.paymentStatus === "paid" ? "pending" : "paid";
    setUpdatingId(user._id);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id, paymentStatus: nextStatus }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, paymentStatus: nextStatus } : u))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleRole = async (user, nextRole) => {
    setUpdatingId(user._id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id, role: nextRole }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, role: nextRole } : u))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই ইউজার অ্যাকাউন্ট মুছে ফেলতে চান?")) return;
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, { method: "DELETE" });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u._id !== userId));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      (u.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.phone || "").includes(search) ||
      (u.tranId || "").toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === "all" ? true : u.role === roleFilter;

    const matchesTrack =
      trackFilter === "all"
        ? true
        : trackFilter === "men"
        ? u.track === "TOT-MEN" || u.gender === "male"
        : u.track?.includes("WOMEN") || u.gender === "female";

    const matchesPayment = paymentFilter === "all" ? true : u.paymentStatus === paymentFilter;

    return matchesSearch && matchesRole && matchesTrack && matchesPayment;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            টিচার ও ইউজার ডাটাবেজ ({filtered.length} জন)
          </h1>
          <p className="text-xs text-slate-400">
            নিবন্ধিত প্রার্থীদের রোল পরিবর্তন, পেমেন্ট সক্রিয়করণ ও এক্সেস নিয়ন্ত্রণ
          </p>
        </div>

        {/* Filters and Add Button */}
        <div className="flex flex-wrap items-center gap-2 text-xs w-full sm:w-auto">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> নতুন ইউজার / অ্যাডমিন
          </button>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">সকল রোল</option>
            <option value="teacher">Teacher</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">সকল ট্র্যাক</option>
            <option value="men">TOT MEN</option>
            <option value="women">TOT WOMEN (014)</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">সকল পেমেন্ট</option>
            <option value="paid">✓ Paid</option>
            <option value="pending">⏳ Pending</option>
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="নাম, ইমেইল, ফোন নম্বর অথবা TrxID দিয়ে খুঁজুন..."
          className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-3 pl-11 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 shadow-xl"
        />
        <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
      </div>

      {/* Table Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/90 text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th className="p-4">নাম ও আইডি</th>
                <th className="p-4">যোগাযোগ</th>
                <th className="p-4">ট্র্যাক / ব্যাচ</th>
                <th className="p-4">রোল</th>
                <th className="p-4">পেমেন্ট স্ট্যাটাস</th>
                <th className="p-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    কোনো ইউজার পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{u.fullName}</div>
                      <div className="text-[11px] text-amber-400 font-mono mt-0.5">
                        {u.tranId || "TOT-TR-014"}
                      </div>
                    </td>

                    <td className="p-4 space-y-0.5">
                      <div className="text-slate-200 font-medium">{u.phone}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          u.track === "TOT-MEN" || u.gender === "male"
                            ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        }`}
                      >
                        {u.track === "TOT-MEN" || u.gender === "male" ? "TOT MEN" : "TOT WOMEN 014"}
                      </span>
                    </td>

                    <td className="p-4">
                      <select
                        value={u.role || "teacher"}
                        onChange={(e) => handleToggleRole(u, e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="teacher">Teacher</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => handleTogglePayment(u)}
                        disabled={updatingId === u._id}
                        className={`text-[10px] font-bold px-3 py-1 rounded-full border cursor-pointer transition-all ${
                          u.paymentStatus === "paid"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30"
                        }`}
                      >
                        {u.paymentStatus === "paid" ? "✓ Paid (৳১,০০০)" : "⏳ Pending (ক্লিক করে Paid করুন)"}
                      </button>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/id-card?tran_id=${u.tranId}`}
                          target="_blank"
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold"
                        >
                          আইডি
                        </Link>
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40"
                          title="মুছে ফেলুন"
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

      {/* Create User / Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                নতুন ইউজার / অ্যাডমিন অ্যাকাউন্ট তৈরি
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createMsg && (
              <div className="p-3 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                {createMsg}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 font-bold block mb-1">পূর্ণ নাম *</label>
                <input
                  type="text"
                  required
                  value={createForm.fullName}
                  onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                  placeholder="ব্যবহারকারীর পুরো নাম..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">ইমেইল অ্যাড্রেস *</label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="admin@fajracademy.io"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">মোবাইল নম্বর</label>
                  <input
                    type="text"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">পাসওয়ার্ড</label>
                  <input
                    type="text"
                    required
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">অ্যাকাউন্ট রোল *</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="admin">Admin (অ্যাডমিন)</option>
                    <option value="instructor">Instructor (ট্রেইনার)</option>
                    <option value="teacher">Teacher (শিক্ষার্থী)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">ট্র্যাক / ব্যাচ</label>
                  <select
                    value={createForm.track}
                    onChange={(e) => setCreateForm({ ...createForm, track: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="TOT-MEN">TOT MEN</option>
                    <option value="TOT-WOMEN-014">TOT WOMEN (014)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">পেমেন্ট স্ট্যাটাস</label>
                <select
                  value={createForm.paymentStatus}
                  onChange={(e) => setCreateForm({ ...createForm, paymentStatus: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="paid">✓ Paid (সক্রিয় কোর্স এক্সেস)</option>
                  <option value="pending">⏳ Pending (পেমেন্ট বকেয়া)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-md transition-all cursor-pointer"
                >
                  {creating ? "তৈরি হচ্ছে..." : "অ্যাকাউন্ট তৈরি করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
