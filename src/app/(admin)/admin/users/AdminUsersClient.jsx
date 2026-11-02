'use client';

import React, { useState } from "react";
import Link from "next/link";
import { Search, Trash2, X, Plus, RefreshCw, Power } from "lucide-react";
import { useAdminTheme } from "../../AdminThemeContext";
import {
  AdminToast,
  DbErrorBanner,
  GeneratedPasswordBox,
  ROLE_OPTIONS,
  callApi,
  formatMoney,
  isWomenTrack,
  trackLabel,
  useToast,
} from "../../_shared/admin-ui";

const EMPTY_FORM = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  role: "teacher",
  track: "TOT-MEN",
  gender: "male",
  paymentStatus: "pending",
  designation: "",
};

const STAFF_ROLES = ["admin", "super-admin", "instructor", "staff", "organizer"];
const ROLE_SHORT = Object.fromEntries(ROLE_OPTIONS.map((r) => [r.value, r.label.split(" (")[0]]));

const PAYMENT_LABEL = {
  paid: "✓ Paid",
  pending: "⏳ Pending",
  failed: "✕ Failed",
  free: "★ Free",
};

function paymentConfirmText(user, next) {
  if (next === "paid") {
    return `"${user.fullName}"-কে Paid করবেন?\n\nকোর্স ফি-এর একটি ম্যানুয়াল (VALID) পেমেন্ট রেকর্ড তৈরি হবে এবং ট্রেইনির কোর্স এনরোলমেন্ট সক্রিয় হবে। (আগে থেকেই যাচাইকৃত পেমেন্ট থাকলে সেটিই ব্যবহার হবে।)`;
  }
  if (next === "free") {
    return `"${user.fullName}"-কে ফ্রি (কমপ্লিমেন্টারি) অ্যাক্সেস দেবেন?\n\nকোনো পেমেন্ট রেকর্ড তৈরি হবে না এবং অ্যাকাউন্ট সক্রিয় থাকবে।`;
  }
  if (user.paymentStatus === "paid") {
    return `"${user.fullName}"-এর পেমেন্ট স্ট্যাটাস "${next}" করবেন?\n\n⚠ এতে এই ট্রেইনির যাচাইকৃত পেমেন্ট থেকে পাওয়া কোর্স এনরোলমেন্ট বাতিল (pending) হয়ে যাবে।`;
  }
  return `"${user.fullName}"-এর পেমেন্ট স্ট্যাটাস "${next}" করবেন?`;
}

export default function AdminUsersClient({ initialUsers, loadError: initialLoadError, currentUserId }) {
  const [users, setUsers] = useState(initialUsers || []);
  const [loadError, setLoadError] = useState(initialLoadError);
  const [reloading, setReloading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [trackFilter, setTrackFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [busyId, setBusyId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { isLight } = useAdminTheme();
  const { toast, showToast, hideToast } = useToast();

  const [createForm, setCreateForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createdInfo, setCreatedInfo] = useState(null); // { email, password } shown once

  const replaceUser = (updated) => setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));

  const reload = async () => {
    setReloading(true);
    const { ok, data, message } = await callApi("/api/admin/users");
    setReloading(false);
    if (!ok) {
      showToast(message, "error");
      return;
    }
    setUsers(data.users || []);
    setLoadError(null);
    showToast(`${(data.users || []).length} জন ইউজারের সর্বশেষ তথ্য লোড হয়েছে।`);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateForm(EMPTY_FORM);
    setCreateError("");
    setCreatedInfo(null);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError("");
    const { ok, data, message } = await callApi("/api/admin/users", { method: "POST", body: createForm });
    setCreating(false);

    if (!ok) {
      setCreateError(message);
      showToast(message, "error");
      return;
    }
    if (data.user) setUsers((prev) => [data.user, ...prev.filter((u) => u._id !== data.user._id)]);
    showToast(message || "ইউজার সফলভাবে তৈরি হয়েছে!");
    if (data.generatedPassword) {
      setCreatedInfo({ email: data.user?.email || createForm.email, password: data.generatedPassword });
    } else {
      closeCreateModal();
    }
  };

  const patchUser = async (user, body, successText) => {
    setBusyId(user._id);
    const { ok, data, message } = await callApi("/api/admin/users", { method: "PATCH", body: { userId: user._id, ...body } });
    setBusyId(null);
    if (!ok) {
      showToast(message, "error");
      return false;
    }
    if (data.user) replaceUser(data.user);
    showToast(successText || message || "ইউজার আপডেট হয়েছে।");
    return true;
  };

  const handleChangeRole = (user, nextRole) => {
    if (nextRole === user.role) return;
    const from = ROLE_SHORT[user.role] || user.role;
    const to = ROLE_SHORT[nextRole] || nextRole;
    if (!window.confirm(`"${user.fullName}"-এর রোল ${from} থেকে ${to} করবেন?`)) return;
    patchUser(user, { role: nextRole }, `রোল পরিবর্তন হয়েছে: ${to}`);
  };

  const handleChangePayment = (user, next) => {
    if (next === user.paymentStatus) return;
    if (!window.confirm(paymentConfirmText(user, next))) return;
    patchUser(user, { paymentStatus: next });
  };

  const handleToggleActive = (user) => {
    const next = user.isActive === false;
    const text = next
      ? `"${user.fullName}"-এর অ্যাকাউন্ট আবার সক্রিয় করবেন?`
      : `"${user.fullName}"-এর অ্যাকাউন্ট নিষ্ক্রিয় করবেন? নিষ্ক্রিয় অ্যাকাউন্ট দিয়ে লগইন করা যাবে না।`;
    if (!window.confirm(text)) return;
    patchUser(user, { isActive: next }, next ? "অ্যাকাউন্ট সক্রিয় করা হয়েছে।" : "অ্যাকাউন্ট নিষ্ক্রিয় করা হয়েছে।");
  };

  const handleDeleteUser = async (user) => {
    if (
      !window.confirm(
        `"${user.fullName}" (${user.email}) অ্যাকাউন্টটি স্থায়ীভাবে মুছে ফেলবেন?\n\nএর সাথে তার কোর্স এনরোলমেন্ট, মূল্যায়ন ও লগইন সেশন মুছে যাবে। পেমেন্ট রেকর্ড আর্থিক হিসাবের জন্য রাখা হবে।`
      )
    )
      return;
    setBusyId(user._id);
    const { ok, message } = await callApi(`/api/admin/users?userId=${encodeURIComponent(user._id)}`, { method: "DELETE" });
    setBusyId(null);
    if (!ok) {
      showToast(message, "error");
      return;
    }
    setUsers((prev) => prev.filter((u) => u._id !== user._id));
    showToast(message || "ইউজার মুছে ফেলা হয়েছে।");
  };

  const q = search.trim().toLowerCase();
  const filtered = users.filter((u) => {
    const matchesSearch =
      !q ||
      (u.fullName || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.phone || "").toLowerCase().includes(q) ||
      (u.tranId || "").toLowerCase().includes(q);
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesTrack =
      trackFilter === "all"
        ? true
        : trackFilter === "men"
        ? u.track === "TOT-MEN"
        : trackFilter === "women"
        ? isWomenTrack(u.track)
        : !u.track;
    const matchesPayment = paymentFilter === "all" || u.paymentStatus === paymentFilter;
    return matchesSearch && matchesRole && matchesTrack && matchesPayment;
  });

  const selectCls = `border rounded-xl px-3 py-2 text-xs font-bold transition-colors cursor-pointer outline-hidden ${
    isLight ? "bg-white border-slate-300 text-slate-800 focus:border-amber-500 shadow-2xs" : "bg-slate-900 border-slate-800 text-white focus:border-amber-500"
  }`;
  const cellSelectCls = `border rounded-lg px-2.5 py-1 text-[11px] font-bold cursor-pointer outline-hidden disabled:opacity-50 disabled:cursor-not-allowed ${
    isLight ? "bg-white border-slate-300 text-slate-800 focus:border-amber-500 shadow-2xs" : "bg-slate-950 border-slate-800 text-white focus:border-amber-500"
  }`;
  const fieldCls = `w-full rounded-xl px-3 py-2 border outline-hidden font-medium ${
    isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500" : "bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-amber-500"
  }`;
  const labelCls = `font-bold block mb-1 ${isLight ? "text-slate-700" : "text-slate-400"}`;
  const isStaffRole = STAFF_ROLES.includes(createForm.role);

  return (
    <div className="space-y-6">
      <AdminToast toast={toast} onClose={hideToast} />
      <DbErrorBanner message={loadError} isLight={isLight} onRetry={reload} retrying={reloading} />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
            টিচার ও ইউজার ডাটাবেজ ({filtered.length} / {users.length} জন)
          </h1>
          <p className={`text-xs mt-1 font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
            নিবন্ধিত প্রার্থীদের রোল পরিবর্তন, পেমেন্ট সক্রিয়করণ ও এক্সেস নিয়ন্ত্রণ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs w-full sm:w-auto">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> নতুন ইউজার / অ্যাডমিন
          </button>

          <button
            type="button"
            onClick={reload}
            disabled={reloading}
            title="ডাটাবেজ থেকে আবার লোড করুন"
            className={`${selectCls} flex items-center gap-1.5 disabled:opacity-60`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reloading ? "animate-spin" : ""}`} /> রিফ্রেশ
          </button>

          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className={selectCls}>
            <option value="all">সকল রোল</option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

          <select value={trackFilter} onChange={(e) => setTrackFilter(e.target.value)} className={selectCls}>
            <option value="all">সকল ট্র্যাক</option>
            <option value="men">TOT MEN</option>
            <option value="women">TOT WOMEN</option>
            <option value="none">ব্যাচ নেই</option>
          </select>

          <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className={selectCls}>
            <option value="all">সকল পেমেন্ট</option>
            <option value="paid">✓ Paid</option>
            <option value="pending">⏳ Pending</option>
            <option value="failed">✕ Failed</option>
            <option value="free">★ Free</option>
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="নাম, ইমেইল, ফোন নম্বর অথবা TrxID দিয়ে খুঁজুন..."
          className={`w-full rounded-2xl px-4 py-3 pl-11 text-xs sm:text-sm font-medium border shadow-xs outline-hidden transition-all ${
            isLight
              ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              : "bg-slate-900/90 border-slate-800 text-white placeholder-slate-500 focus:border-amber-500 shadow-xl"
          }`}
        />
        <Search className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 ${isLight ? "text-slate-400" : "text-slate-500"}`} />
      </div>

      {/* Table Box */}
      <div
        className={`rounded-3xl border overflow-hidden transition-all ${
          isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900 border-slate-800 shadow-2xl"
        }`}
      >
        <div className="overflow-x-auto">
          <table className={`w-full text-left text-xs ${isLight ? "text-slate-700" : "text-slate-300"}`}>
            <thead
              className={`font-bold border-b transition-colors ${
                isLight ? "bg-slate-100/90 text-slate-800 border-slate-200" : "bg-slate-950/90 text-slate-400 border-slate-800"
              }`}
            >
              <tr>
                <th className="p-4">নাম ও আইডি</th>
                <th className="p-4">যোগাযোগ</th>
                <th className="p-4">ট্র্যাক / ব্যাচ</th>
                <th className="p-4">রোল</th>
                <th className="p-4">পেমেন্ট স্ট্যাটাস</th>
                <th className="p-4">অ্যাকাউন্ট</th>
                <th className="p-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? "divide-slate-200" : "divide-slate-800/60"}`}>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-medium">
                    {users.length === 0 ? "কোনো ইউজার নেই।" : "ফিল্টারের সাথে মেলে এমন কোনো ইউজার পাওয়া যায়নি।"}
                  </td>
                </tr>
              ) : (
                filtered.map((u) => {
                  const isSelf = u._id === currentUserId;
                  const busy = busyId === u._id;
                  const active = u.isActive !== false;
                  return (
                    <tr
                      key={u._id}
                      className={`transition-colors ${isLight ? "hover:bg-slate-50/80" : "hover:bg-slate-800/40"} ${active ? "" : "opacity-70"}`}
                    >
                      <td className="p-4">
                        <div className={`font-bold text-sm ${isLight ? "text-slate-900" : "text-white"}`}>
                          {u.fullName}
                          {isSelf && <span className="ml-1.5 text-[10px] font-bold text-amber-500">(আপনি)</span>}
                        </div>
                        <div className={`text-[11px] font-mono mt-0.5 ${isLight ? "text-amber-700 font-semibold" : "text-amber-400"}`}>
                          {u.tranId || "—"}
                        </div>
                      </td>

                      <td className="p-4 space-y-0.5">
                        <div className={`font-medium ${isLight ? "text-slate-800" : "text-slate-200"}`}>{u.phone || "—"}</div>
                        <div className={`text-[11px] ${isLight ? "text-slate-600" : "text-slate-400"}`}>{u.email}</div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-block text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                            !u.track
                              ? isLight
                                ? "bg-slate-100 text-slate-600 border-slate-300"
                                : "bg-slate-800 text-slate-400 border-slate-700"
                              : !isWomenTrack(u.track)
                              ? isLight
                                ? "bg-blue-50 text-blue-800 border-blue-200"
                                : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                              : isLight
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          }`}
                        >
                          {trackLabel(u.track)}
                        </span>
                      </td>

                      <td className="p-4">
                        <select
                          value={u.role || "teacher"}
                          disabled={busy || isSelf}
                          title={isSelf ? "নিজের রোল নিজে পরিবর্তন করা যায় না" : undefined}
                          onChange={(e) => handleChangeRole(u, e.target.value)}
                          className={cellSelectCls}
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r.value} value={r.value}>
                              {ROLE_SHORT[r.value]}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-col items-start gap-1">
                          <select
                            value={u.paymentStatus || "pending"}
                            disabled={busy}
                            onChange={(e) => handleChangePayment(u, e.target.value)}
                            className={`border rounded-full px-2.5 py-1 text-[10px] font-extrabold cursor-pointer outline-hidden disabled:opacity-50 disabled:cursor-not-allowed ${
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
                            {Object.entries(PAYMENT_LABEL).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                          {u.paymentStatus === "paid" && (
                            <span className={`text-[10px] font-mono font-bold ${isLight ? "text-emerald-700" : "text-emerald-400"}`}>
                              পরিশোধিত: {formatMoney(u.paidAmount)}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(u)}
                          disabled={busy || (isSelf && active)}
                          title={active ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
                          className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            active
                              ? isLight
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30"
                              : isLight
                              ? "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
                              : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                          }`}
                        >
                          <Power className="w-3 h-3" />
                          {active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                        </button>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/id-card?user=${encodeURIComponent(u._id)}`}
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
                            onClick={() => handleDeleteUser(u)}
                            disabled={busy || isSelf}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                              isLight ? "text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200" : "text-rose-400 hover:bg-rose-950/40"
                            }`}
                            title={isSelf ? "নিজের অ্যাকাউন্ট মুছে ফেলা যায় না" : "মুছে ফেলুন"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User / Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 my-8 animate-in fade-in zoom-in-95 duration-150 ${
              isLight ? "bg-white border-slate-200 text-slate-900" : "bg-slate-900 border-slate-800 text-white"
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isLight ? "border-slate-200" : "border-slate-800"}`}>
              <h3 className="text-base font-bold">নতুন ইউজার / অ্যাডমিন অ্যাকাউন্ট তৈরি</h3>
              <button
                onClick={closeCreateModal}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${isLight ? "text-slate-500 hover:bg-slate-100" : "text-slate-400 hover:text-white"}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createdInfo ? (
              <GeneratedPasswordBox password={createdInfo.password} email={createdInfo.email} isLight={isLight} onDone={closeCreateModal} />
            ) : (
              <>
                {createError && (
                  <div
                    role="alert"
                    className={`p-3 rounded-xl border text-xs font-bold ${
                      isLight ? "bg-rose-50 text-rose-800 border-rose-300" : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    }`}
                  >
                    {createError}
                  </div>
                )}

                <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
                  <div>
                    <label className={labelCls}>পূর্ণ নাম *</label>
                    <input
                      type="text"
                      required
                      minLength={2}
                      value={createForm.fullName}
                      onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                      placeholder="ব্যবহারকারীর পুরো নাম..."
                      className={fieldCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>ইমেইল অ্যাড্রেস *</label>
                    <input
                      type="email"
                      required
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                      placeholder="name@example.com"
                      className={fieldCls}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>মোবাইল নম্বর</label>
                      <input
                        type="text"
                        value={createForm.phone}
                        onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                        placeholder="01XXXXXXXXX"
                        className={`${fieldCls} font-mono`}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>পাসওয়ার্ড</label>
                      <input
                        type="text"
                        autoComplete="new-password"
                        value={createForm.password}
                        onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                        placeholder="খালি রাখলে স্বয়ংক্রিয় পাসওয়ার্ড তৈরি হবে"
                        className={`${fieldCls} font-mono`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>অ্যাকাউন্ট রোল *</label>
                      <select
                        value={createForm.role}
                        onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                        className={`${fieldCls} font-bold cursor-pointer`}
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>ট্র্যাক / ব্যাচ</label>
                      <select
                        value={createForm.track}
                        onChange={(e) => setCreateForm({ ...createForm, track: e.target.value })}
                        className={`${fieldCls} font-bold cursor-pointer`}
                      >
                        <option value="TOT-MEN">TOT MEN</option>
                        <option value="TOT-WOMEN-014">TOT WOMEN (014)</option>
                        <option value="TOT-WOMEN">TOT WOMEN</option>
                        <option value="">কোনো ব্যাচ নয়</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>লিঙ্গ</label>
                      <select
                        value={createForm.gender}
                        onChange={(e) => setCreateForm({ ...createForm, gender: e.target.value })}
                        className={`${fieldCls} cursor-pointer`}
                      >
                        <option value="male">পুরুষ</option>
                        <option value="female">মহিলা</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>পেমেন্ট স্ট্যাটাস</label>
                      <select
                        value={isStaffRole ? "free" : createForm.paymentStatus}
                        disabled={isStaffRole}
                        onChange={(e) => setCreateForm({ ...createForm, paymentStatus: e.target.value })}
                        className={`${fieldCls} font-bold cursor-pointer disabled:opacity-60`}
                      >
                        <option value="pending">⏳ Pending (পেমেন্ট বকেয়া)</option>
                        <option value="paid">✓ Paid (ম্যানুয়াল পেমেন্ট + এনরোলমেন্ট)</option>
                        <option value="free">★ Free (কমপ্লিমেন্টারি)</option>
                        <option value="failed">✕ Failed</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>পদবী (ঐচ্ছিক)</label>
                    <input
                      type="text"
                      value={createForm.designation}
                      onChange={(e) => setCreateForm({ ...createForm, designation: e.target.value })}
                      placeholder="খালি রাখলে রোল অনুযায়ী স্বয়ংক্রিয় পদবী বসবে"
                      className={fieldCls}
                    />
                  </div>

                  <p className={`text-[11px] leading-relaxed ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    {isStaffRole
                      ? "স্টাফ / ইনস্ট্রাক্টর / অ্যাডমিন অ্যাকাউন্ট সবসময় ফ্রি অ্যাক্সেস পায়।"
                      : createForm.paymentStatus === "paid"
                      ? "Paid নির্বাচন করলে কোর্স ফি-এর একটি ম্যানুয়াল পেমেন্ট রেকর্ড তৈরি হবে এবং কোর্সে এনরোলমেন্ট সক্রিয় হবে।"
                      : "পরে ইউজার তালিকা বা পেমেন্ট পেজ থেকে পেমেন্ট যাচাই করা যাবে।"}
                  </p>

                  <div className={`flex items-center justify-end gap-2.5 pt-3 border-t ${isLight ? "border-slate-200" : "border-slate-800"}`}>
                    <button
                      type="button"
                      onClick={closeCreateModal}
                      className={`px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
                        isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-60"
                    >
                      {creating ? "তৈরি হচ্ছে..." : "অ্যাকাউন্ট তৈরি করুন"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
