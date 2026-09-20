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
import { useAdminTheme } from "../../AdminThemeContext";

export default function AdminUsersClient({ initialUsers }) {
  const [users, setUsers] = useState(initialUsers || []);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [trackFilter, setTrackFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { isLight } = useAdminTheme();

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

  const handleToggleRole = async (user, nextRole) => {
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

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই ইউজার অ্যাকাউন্ট মুছে ফেলতে চান?")) return;
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u._id !== userId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      (u.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.phone || "").toLowerCase().includes(search.toLowerCase()) ||
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
          <h1
            className={`text-xl sm:text-2xl font-black tracking-tight ${
              isLight ? "text-slate-900" : "text-white"
            }`}
          >
            টিচার ও ইউজার ডাটাবেজ ({filtered.length} জন)
          </h1>
          <p className={`text-xs mt-1 font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
            নিবন্ধিত প্রার্থীদের রোল পরিবর্তন, পেমেন্ট সক্রিয়করণ ও এক্সেস নিয়ন্ত্রণ
          </p>
        </div>

        {/* Filters and Add Button */}
        <div className="flex flex-wrap items-center gap-2 text-xs w-full sm:w-auto">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> নতুন ইউজার / অ্যাডমিন
          </button>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className={`border rounded-xl px-3 py-2 text-xs font-bold transition-colors cursor-pointer outline-hidden ${
              isLight
                ? "bg-white border-slate-300 text-slate-800 focus:border-amber-500 shadow-2xs"
                : "bg-slate-900 border-slate-800 text-white focus:border-amber-500"
            }`}
          >
            <option value="all">সকল রোল</option>
            <option value="teacher">Teacher</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Admin</option>
            <option value="organizer">Organizer</option>
            <option value="super-admin">Super Admin</option>
            <option value="staff">Staff</option>
          </select>

          <select
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value)}
            className={`border rounded-xl px-3 py-2 text-xs font-bold transition-colors cursor-pointer outline-hidden ${
              isLight
                ? "bg-white border-slate-300 text-slate-800 focus:border-amber-500 shadow-2xs"
                : "bg-slate-900 border-slate-800 text-white focus:border-amber-500"
            }`}
          >
            <option value="all">সকল ট্র্যাক</option>
            <option value="men">TOT MEN</option>
            <option value="women">TOT WOMEN (014)</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className={`border rounded-xl px-3 py-2 text-xs font-bold transition-colors cursor-pointer outline-hidden ${
              isLight
                ? "bg-white border-slate-300 text-slate-800 focus:border-amber-500 shadow-2xs"
                : "bg-slate-900 border-slate-800 text-white focus:border-amber-500"
            }`}
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

      {/* Table Box */}
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
                <th className="p-4">নাম ও আইডি</th>
                <th className="p-4">যোগাযোগ</th>
                <th className="p-4">ট্র্যাক / ব্যাচ</th>
                <th className="p-4">রোল</th>
                <th className="p-4">পেমেন্ট স্ট্যাটাস</th>
                <th className="p-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? "divide-slate-200" : "divide-slate-800/60"}`}>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                    কোনো ইউজার পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr
                    key={u._id}
                    className={`transition-colors ${
                      isLight ? "hover:bg-slate-50/80" : "hover:bg-slate-800/40"
                    }`}
                  >
                    <td className="p-4">
                      <div className={`font-bold text-sm ${isLight ? "text-slate-900" : "text-white"}`}>
                        {u.fullName}
                      </div>
                      <div
                        className={`text-[11px] font-mono mt-0.5 ${
                          isLight ? "text-amber-700 font-semibold" : "text-amber-400"
                        }`}
                      >
                        {u.tranId || "TOT-TR-014"}
                      </div>
                    </td>

                    <td className="p-4 space-y-0.5">
                      <div className={`font-medium ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                        {u.phone}
                      </div>
                      <div className={`text-[11px] ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                        {u.email}
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-block text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                          u.track === "TOT-MEN" || u.gender === "male"
                            ? isLight
                              ? "bg-blue-50 text-blue-800 border-blue-200"
                              : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                            : isLight
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
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
                        className={`border rounded-lg px-2.5 py-1 text-[11px] font-bold cursor-pointer outline-hidden ${
                          isLight
                            ? "bg-white border-slate-300 text-slate-800 focus:border-amber-500 shadow-2xs"
                            : "bg-slate-950 border-slate-800 text-white focus:border-amber-500"
                        }`}
                      >
                        <option value="teacher">Teacher</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Admin</option>
                        <option value="organizer">Organizer</option>
                        <option value="super-admin">Super Admin</option>
                        <option value="staff">Staff</option>
                      </select>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => handleTogglePayment(u)}
                        disabled={updatingId === u._id}
                        className={`text-[10px] font-extrabold px-3 py-1 rounded-full border cursor-pointer transition-all ${
                          u.paymentStatus === "paid"
                            ? isLight
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30"
                            : isLight
                            ? "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
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
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                            isLight
                              ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 shadow-2xs"
                              : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
                          }`}
                        >
                          আইডি
                        </Link>
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isLight
                              ? "text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200"
                              : "text-rose-400 hover:bg-rose-950/40"
                          }`}
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 ${
              isLight ? "bg-white border-slate-200 text-slate-900" : "bg-slate-900 border-slate-800 text-white"
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isLight ? "border-slate-200" : "border-slate-800"}`}>
              <h3 className="text-base font-bold">
                নতুন ইউজার / অ্যাডমিন অ্যাকাউন্ট তৈরি
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  isLight ? "text-slate-500 hover:bg-slate-100" : "text-slate-400 hover:text-white"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createMsg && (
              <div
                className={`p-3 rounded-xl border text-xs font-bold ${
                  createMsg.includes("সফল")
                    ? isLight
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : isLight
                    ? "bg-rose-50 text-rose-800 border-rose-300"
                    : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                }`}
              >
                {createMsg}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className={`font-bold block mb-1 ${isLight ? "text-slate-700" : "text-slate-400"}`}>
                  পূর্ণ নাম *
                </label>
                <input
                  type="text"
                  required
                  value={createForm.fullName}
                  onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                  placeholder="ব্যবহারকারীর পুরো নাম..."
                  className={`w-full rounded-xl px-3 py-2 border outline-hidden font-medium ${
                    isLight
                      ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500"
                      : "bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-amber-500"
                  }`}
                />
              </div>

              <div>
                <label className={`font-bold block mb-1 ${isLight ? "text-slate-700" : "text-slate-400"}`}>
                  ইমেইল অ্যাড্রেস *
                </label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="admin@fajracademy.io"
                  className={`w-full rounded-xl px-3 py-2 border outline-hidden font-medium ${
                    isLight
                      ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500"
                      : "bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-amber-500"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`font-bold block mb-1 ${isLight ? "text-slate-700" : "text-slate-400"}`}>
                    মোবাইল নম্বর
                  </label>
                  <input
                    type="text"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    placeholder="01XXXXXXXXX"
                    className={`w-full rounded-xl px-3 py-2 border outline-hidden font-mono ${
                      isLight
                        ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500"
                        : "bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-amber-500"
                    }`}
                  />
                </div>

                <div>
                  <label className={`font-bold block mb-1 ${isLight ? "text-slate-700" : "text-slate-400"}`}>
                    পাসওয়ার্ড
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className={`w-full rounded-xl px-3 py-2 border outline-hidden font-mono ${
                      isLight
                        ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500"
                        : "bg-slate-950 border-slate-800 text-white font-mono"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`font-bold block mb-1 ${isLight ? "text-slate-700" : "text-slate-400"}`}>
                    অ্যাকাউন্ট রোল *
                  </label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                    className={`w-full rounded-xl px-3 py-2 border outline-hidden font-bold cursor-pointer ${
                      isLight
                        ? "bg-slate-50 border-slate-300 text-slate-800 focus:border-amber-500"
                        : "bg-slate-950 border-slate-800 text-white focus:border-amber-500"
                    }`}
                  >
                    <option value="admin">Admin (অ্যাডমিন)</option>
                    <option value="instructor">Instructor (ট্রেইনার)</option>
                    <option value="teacher">Teacher (শিক্ষার্থী)</option>
                    <option value="organizer">Organizer (অর্গানাইজার)</option>
                    <option value="super-admin">Super Admin (সুপার অ্যাডমিন)</option>
                    <option value="staff">Staff (স্টাফ)</option>
                  </select>
                </div>

                <div>
                  <label className={`font-bold block mb-1 ${isLight ? "text-slate-700" : "text-slate-400"}`}>
                    ট্র্যাক / ব্যাচ
                  </label>
                  <select
                    value={createForm.track}
                    onChange={(e) => setCreateForm({ ...createForm, track: e.target.value })}
                    className={`w-full rounded-xl px-3 py-2 border outline-hidden font-bold cursor-pointer ${
                      isLight
                        ? "bg-slate-50 border-slate-300 text-slate-800 focus:border-amber-500"
                        : "bg-slate-950 border-slate-800 text-white focus:border-amber-500"
                    }`}
                  >
                    <option value="TOT-MEN">TOT MEN</option>
                    <option value="TOT-WOMEN-014">TOT WOMEN (014)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`font-bold block mb-1 ${isLight ? "text-slate-700" : "text-slate-400"}`}>
                  পেমেন্ট স্ট্যাটাস
                </label>
                <select
                  value={createForm.paymentStatus}
                  onChange={(e) => setCreateForm({ ...createForm, paymentStatus: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 border outline-hidden font-bold cursor-pointer ${
                    isLight
                      ? "bg-slate-50 border-slate-300 text-slate-800 focus:border-amber-500"
                      : "bg-slate-950 border-slate-800 text-white focus:border-amber-500"
                  }`}
                >
                  <option value="paid">✓ Paid (সক্রিয় কোর্স এক্সেস)</option>
                  <option value="pending">⏳ Pending (পেমেন্ট বকেয়া)</option>
                </select>
              </div>

              <div className={`flex items-center justify-end gap-2.5 pt-3 border-t ${isLight ? "border-slate-200" : "border-slate-800"}`}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className={`px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
                    isLight
                      ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black shadow-md shadow-amber-500/20 transition-all cursor-pointer"
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
