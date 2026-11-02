'use client';

import React, { useState } from "react";
import { Search, Trash2, X, Plus, RefreshCw, Power, KeyRound, ShieldCheck } from "lucide-react";
import { useAdminTheme } from "../../AdminThemeContext";
import {
  ADMIN_ROLE_OPTIONS,
  AdminToast,
  DbErrorBanner,
  GeneratedPasswordBox,
  callApi,
  formatDate,
  useConfirm,
  useToast,
} from "../../_shared/admin-ui";

const EMPTY_FORM = { fullName: "", email: "", phone: "", password: "", role: "admin", designation: "" };
const ROLE_SHORT = { admin: "Admin", "super-admin": "Super Admin", staff: "Staff (পুরনো)", organizer: "Organizer (পুরনো)" };

/**
 * Admin → অ্যাডমিন ইউজার: admin accounts only (UserModel, collection "users").
 * TOT trainees and instructors are separate models with their own screens.
 */
export default function AdminUsersClient({ initialUsers, loadError: initialLoadError, currentUserId, currentRole }) {
  const [users, setUsers] = useState(initialUsers || []);
  const [loadError, setLoadError] = useState(initialLoadError);
  const [reloading, setReloading] = useState(false);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [passwordInfo, setPasswordInfo] = useState(null); // { title, email, password } shown once
  const { isLight } = useAdminTheme();
  const { toast, showToast, hideToast } = useToast();
  const { confirm, confirmDialog } = useConfirm();
  const isSuper = currentRole === "super-admin";

  const replaceUser = (updated) => setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));

  const reload = async () => {
    setReloading(true);
    const { ok, data, message } = await callApi("/api/admin/users");
    setReloading(false);
    if (!ok) return showToast(message, "error");
    setUsers(data.users || []);
    setLoadError(null);
    showToast(`${(data.users || []).length} জন অ্যাডমিনের তথ্য লোড হয়েছে।`);
  };

  const closeCreate = () => {
    setShowCreate(false);
    setForm(EMPTY_FORM);
    setCreateError("");
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError("");
    const { ok, data, message } = await callApi("/api/admin/users", { method: "POST", body: form });
    setCreating(false);
    if (!ok) {
      setCreateError(message);
      return;
    }
    if (data.user) setUsers((prev) => [data.user, ...prev.filter((u) => u._id !== data.user._id)]);
    showToast(message || "অ্যাডমিন অ্যাকাউন্ট তৈরি হয়েছে!");
    if (data.generatedPassword) {
      setPasswordInfo({ title: "নতুন অ্যাডমিনের পাসওয়ার্ড", email: data.user?.email || form.email, password: data.generatedPassword });
    }
    closeCreate();
  };

  const patchUser = async (user, body, successText) => {
    setBusyId(user._id);
    const { ok, data, message } = await callApi("/api/admin/users", { method: "PATCH", body: { id: user._id, ...body } });
    setBusyId(null);
    if (!ok) {
      showToast(message, "error");
      return null;
    }
    if (data.user) replaceUser(data.user);
    showToast(successText || message || "আপডেট হয়েছে।");
    return data;
  };

  const handleRole = async (user, role) => {
    if (role === user.role) return;
    if (!(await confirm(`"${user.fullName}"-এর রোল ${ROLE_SHORT[user.role] || user.role} থেকে ${ROLE_SHORT[role]} করবেন?`, { title: "রোল পরিবর্তন করবেন?", confirmLabel: "হ্যাঁ, পরিবর্তন করুন" }))) return;
    patchUser(user, { role }, `রোল পরিবর্তন হয়েছে: ${ROLE_SHORT[role]}`);
  };

  const handleToggleActive = async (user) => {
    const next = user.isActive === false;
    const text = next
      ? `"${user.fullName}"-এর অ্যাকাউন্ট আবার সক্রিয় করবেন?`
      : `"${user.fullName}"-এর অ্যাকাউন্ট নিষ্ক্রিয় করবেন? নিষ্ক্রিয় অ্যাকাউন্ট দিয়ে লগইন করা যাবে না।`;
    if (!(await confirm(text, { tone: next ? "primary" : "warning", title: next ? "অ্যাকাউন্ট সক্রিয় করবেন?" : "অ্যাকাউন্ট নিষ্ক্রিয় করবেন?", confirmLabel: next ? "হ্যাঁ, সক্রিয় করুন" : "হ্যাঁ, নিষ্ক্রিয় করুন" }))) return;
    patchUser(user, { isActive: next }, next ? "অ্যাকাউন্ট সক্রিয় করা হয়েছে।" : "অ্যাকাউন্ট নিষ্ক্রিয় করা হয়েছে।");
  };

  const handleReset = async (user) => {
    if (!(await confirm(`"${user.fullName}"-এর জন্য নতুন পাসওয়ার্ড তৈরি করবেন?\n\nপুরনো পাসওয়ার্ড আর কাজ করবে না।`, { tone: "warning", title: "নতুন পাসওয়ার্ড তৈরি করবেন?", confirmLabel: "হ্যাঁ, তৈরি করুন" }))) return;
    const data = await patchUser(user, { resetPassword: true }, "নতুন পাসওয়ার্ড তৈরি হয়েছে।");
    if (data?.generatedPassword) setPasswordInfo({ title: `নতুন পাসওয়ার্ড — ${user.fullName}`, email: user.email, password: data.generatedPassword });
  };

  const handleDelete = async (user) => {
    if (!(await confirm(`"${user.fullName}" (${user.email}) অ্যাডমিন অ্যাকাউন্টটি স্থায়ীভাবে মুছে ফেলবেন?`, { tone: "danger", title: "অ্যাডমিন অ্যাকাউন্ট মুছে ফেলবেন?" }))) return;
    setBusyId(user._id);
    const { ok, message } = await callApi(`/api/admin/users?id=${encodeURIComponent(user._id)}`, { method: "DELETE" });
    setBusyId(null);
    if (!ok) return showToast(message, "error");
    setUsers((prev) => prev.filter((u) => u._id !== user._id));
    showToast(message || "অ্যাডমিন মুছে ফেলা হয়েছে।");
  };

  const q = search.trim().toLowerCase();
  const filtered = users.filter(
    (u) =>
      !q ||
      [u.fullName, u.email, u.phone, u.designation].some((v) => String(v || "").toLowerCase().includes(q))
  );

  const card = isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900 border-slate-800 shadow-2xl";
  const muted = isLight ? "text-slate-600" : "text-slate-400";
  const btn = `border rounded-xl px-3 py-2 text-xs font-bold transition-colors cursor-pointer outline-hidden ${
    isLight ? "bg-white border-slate-300 text-slate-800 shadow-2xs" : "bg-slate-900 border-slate-800 text-white"
  }`;
  const cellSelect = `border rounded-lg px-2.5 py-1 text-[11px] font-bold cursor-pointer outline-hidden disabled:opacity-50 disabled:cursor-not-allowed ${
    isLight ? "bg-white border-slate-300 text-slate-800" : "bg-slate-950 border-slate-800 text-white"
  }`;
  const field = `w-full rounded-xl px-3 py-2 border outline-hidden font-medium ${
    isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500" : "bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-amber-500"
  }`;
  const label = `font-bold block mb-1 ${isLight ? "text-slate-700" : "text-slate-400"}`;
  const iconBtn = (tone) =>
    `p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
      tone === "danger"
        ? isLight ? "text-rose-600 hover:bg-rose-50" : "text-rose-400 hover:bg-rose-950/40"
        : isLight ? "text-amber-700 hover:bg-amber-50" : "text-amber-400 hover:bg-amber-950/40"
    }`;

  const emptyText = users.length === 0 ? "কোনো অ্যাডমিন অ্যাকাউন্ট নেই।" : "খোঁজের সাথে মেলে এমন কোনো অ্যাডমিন পাওয়া যায়নি।";

  // Per-row flags and cell renderers shared by the desktop table and the phone cards.
  const flagsOf = (u) => ({
    isSelf: u._id === currentUserId,
    busy: busyId === u._id,
    active: u.isActive !== false,
    lockedSuper: u.role === "super-admin" && !isSuper,
  });

  const nameBlock = (u, isSelf) => (
    <>
      <div className={`font-bold text-sm wrap-break-word ${isLight ? "text-slate-900" : "text-white"}`}>
        {u.fullName}
        {isSelf && <span className="ml-1.5 text-[10px] font-bold text-amber-500">(আপনি)</span>}
      </div>
      <div className={`text-[11px] mt-0.5 ${muted}`}>{u.designation || "—"}</div>
    </>
  );

  const roleSelect = (u, { busy, isSelf, lockedSuper }) => (
    <select
      value={u.role}
      disabled={busy || isSelf || lockedSuper}
      title={isSelf ? "নিজের রোল নিজে পরিবর্তন করা যায় না" : lockedSuper ? "শুধু সুপার-অ্যাডমিন পরিবর্তন করতে পারবেন" : undefined}
      aria-label={`${u.fullName}-এর রোল`}
      onChange={(e) => handleRole(u, e.target.value)}
      className={cellSelect}
    >
      {!ADMIN_ROLE_OPTIONS.some((r) => r.value === u.role) && <option value={u.role}>{ROLE_SHORT[u.role] || u.role}</option>}
      {ADMIN_ROLE_OPTIONS.map((r) => (
        <option key={r.value} value={r.value} disabled={r.value === "super-admin" && !isSuper}>
          {ROLE_SHORT[r.value]}
        </option>
      ))}
    </select>
  );

  const activeToggle = (u, { busy, isSelf, active, lockedSuper }) => (
    <button
      type="button"
      onClick={() => handleToggleActive(u)}
      disabled={busy || (isSelf && active) || lockedSuper}
      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        active
          ? isLight ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
          : isLight ? "bg-slate-100 text-slate-600 border-slate-300" : "bg-slate-800 text-slate-400 border-slate-700"
      }`}
    >
      <Power className="w-3 h-3" /> {active ? "সক্রিয়" : "নিষ্ক্রিয়"}
    </button>
  );

  const rowActions = (u, { busy, isSelf, lockedSuper }) => (
    <div className="flex items-center justify-end gap-1">
      <button type="button" onClick={() => handleReset(u)} disabled={busy || lockedSuper} title="নতুন পাসওয়ার্ড তৈরি করুন" className={iconBtn("warn")}>
        <KeyRound className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => handleDelete(u)}
        disabled={busy || isSelf || lockedSuper}
        title={isSelf ? "নিজের অ্যাকাউন্ট মুছে ফেলা যায় না" : "মুছে ফেলুন"}
        className={iconBtn("danger")}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {confirmDialog}
      <AdminToast toast={toast} onClose={hideToast} />
      <DbErrorBanner message={loadError} isLight={isLight} onRetry={reload} retrying={reloading} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
            <ShieldCheck className="w-6 h-6 text-amber-500" /> অ্যাডমিন ইউজার ({filtered.length} / {users.length} জন)
          </h1>
          <p className={`text-xs mt-1 font-medium ${muted}`}>
            অ্যাডমিন প্যানেলে প্রবেশাধিকারসহ অ্যাকাউন্ট (User মডেল)। ট্রেইনি ও ইনস্ট্রাক্টর আলাদা পেজে পরিচালিত হয়।
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setShowCreate(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> নতুন অ্যাডমিন
          </button>
          <button type="button" onClick={reload} disabled={reloading} className={`${btn} flex items-center gap-1.5 disabled:opacity-60`}>
            <RefreshCw className={`w-3.5 h-3.5 ${reloading ? "animate-spin" : ""}`} /> রিফ্রেশ
          </button>
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="নাম, ইমেইল, ফোন বা পদবী দিয়ে খুঁজুন..."
          className={`w-full rounded-2xl px-4 py-3 pl-11 text-xs sm:text-sm font-medium border outline-hidden ${
            isLight ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-amber-500" : "bg-slate-900/90 border-slate-800 text-white placeholder-slate-500 focus:border-amber-500"
          }`}
        />
        <Search className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 ${isLight ? "text-slate-400" : "text-slate-500"}`} />
      </div>

      <div className={`rounded-3xl border overflow-hidden ${card}`}>
        <div className="hidden md:block overflow-x-auto">
          <table className={`w-full text-left text-xs ${isLight ? "text-slate-700" : "text-slate-300"}`}>
            <thead className={`font-bold border-b ${isLight ? "bg-slate-100/90 text-slate-800 border-slate-200" : "bg-slate-950/90 text-slate-400 border-slate-800"}`}>
              <tr>
                <th className="p-4">নাম ও পদবী</th>
                <th className="p-4">যোগাযোগ</th>
                <th className="p-4">রোল</th>
                <th className="p-4">অ্যাকাউন্ট</th>
                <th className="p-4">সর্বশেষ লগইন</th>
                <th className="p-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? "divide-slate-200" : "divide-slate-800/60"}`}>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                    {emptyText}
                  </td>
                </tr>
              ) : (
                filtered.map((u) => {
                  const f = flagsOf(u);
                  return (
                    <tr key={u._id} className={`${isLight ? "hover:bg-slate-50/80" : "hover:bg-slate-800/40"} ${f.active ? "" : "opacity-70"}`}>
                      <td className="p-4">{nameBlock(u, f.isSelf)}</td>
                      <td className="p-4 space-y-0.5">
                        <div className={`font-medium ${isLight ? "text-slate-800" : "text-slate-200"}`}>{u.phone || "—"}</div>
                        <div className={`text-[11px] ${muted}`}>{u.email}</div>
                      </td>
                      <td className="p-4">{roleSelect(u, f)}</td>
                      <td className="p-4">{activeToggle(u, f)}</td>
                      <td className={`p-4 text-[11px] ${muted}`}>{formatDate(u.lastLogin, true)}</td>
                      <td className="p-4 text-right">{rowActions(u, f)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Phone layout: one card per admin */}
        <ul className={`md:hidden divide-y ${isLight ? "divide-slate-200" : "divide-slate-800/60"}`}>
          {filtered.length === 0 ? (
            <li className="p-8 text-center text-slate-500 font-medium text-xs">{emptyText}</li>
          ) : (
            filtered.map((u) => {
              const f = flagsOf(u);
              return (
                <li key={u._id} className={`p-4 space-y-3 ${f.active ? "" : "opacity-70"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">{nameBlock(u, f.isSelf)}</div>
                    {rowActions(u, f)}
                  </div>
                  <div className={`text-[11px] space-y-0.5 ${muted}`}>
                    {u.phone && <div className={`font-semibold ${isLight ? "text-slate-800" : "text-slate-200"}`}>{u.phone}</div>}
                    <div className="break-all">{u.email}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {roleSelect(u, f)}
                    {activeToggle(u, f)}
                  </div>
                  <div className={`text-[10px] ${muted}`}>সর্বশেষ লগইন: {formatDate(u.lastLogin, true)}</div>
                </li>
              );
            })
          )}
        </ul>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className={`border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 my-8 ${isLight ? "bg-white border-slate-200 text-slate-900" : "bg-slate-900 border-slate-800 text-white"}`}>
            <div className={`flex items-center justify-between border-b pb-3 ${isLight ? "border-slate-200" : "border-slate-800"}`}>
              <h3 className="text-base font-bold">নতুন অ্যাডমিন অ্যাকাউন্ট</h3>
              <button onClick={closeCreate} className={`p-1 rounded-lg cursor-pointer ${isLight ? "text-slate-500 hover:bg-slate-100" : "text-slate-400 hover:text-white"}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            {createError && (
              <div role="alert" className={`p-3 rounded-xl border text-xs font-bold ${isLight ? "bg-rose-50 text-rose-800 border-rose-300" : "bg-rose-500/20 text-rose-300 border-rose-500/40"}`}>
                {createError}
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className={label}>পূর্ণ নাম *</label>
                <input type="text" required minLength={2} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className={field} />
              </div>
              <div>
                <label className={label}>ইমেইল অ্যাড্রেস *</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@example.com" className={field} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>মোবাইল নম্বর</label>
                  <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" className={`${field} font-mono`} />
                </div>
                <div>
                  <label className={label}>পাসওয়ার্ড</label>
                  <input
                    type="text"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="খালি রাখলে স্বয়ংক্রিয়"
                    className={`${field} font-mono`}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>রোল *</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={`${field} font-bold cursor-pointer`}>
                    {ADMIN_ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value} disabled={r.value === "super-admin" && !isSuper}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={label}>পদবী</label>
                  <input type="text" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="System Administrator" className={field} />
                </div>
              </div>
              <p className={`text-[11px] leading-relaxed ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                একই ইমেইল দিয়ে ট্রেইনি বা ইনস্ট্রাক্টর অ্যাকাউন্ট থাকলে অ্যাডমিন তৈরি হবে না।
              </p>
              <div className={`flex items-center justify-end gap-2.5 pt-3 border-t ${isLight ? "border-slate-200" : "border-slate-800"}`}>
                <button type="button" onClick={closeCreate} className={`px-4 py-2 rounded-xl font-bold cursor-pointer ${isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>
                  বাতিল
                </button>
                <button type="submit" disabled={creating} className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-60">
                  {creating ? "তৈরি হচ্ছে..." : "অ্যাকাউন্ট তৈরি করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {passwordInfo && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 ${isLight ? "bg-white border-slate-200 text-slate-900" : "bg-slate-900 border-slate-800 text-white"}`}>
            <h3 className="text-base font-bold">{passwordInfo.title}</h3>
            <GeneratedPasswordBox password={passwordInfo.password} email={passwordInfo.email} isLight={isLight} onDone={() => setPasswordInfo(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
