'use client';

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Crown,
  Eye,
  EyeOff,
  KeyRound,
  Laptop,
  Lock,
  LogOut,
  Mail,
  Monitor,
  Phone,
  RefreshCw,
  Save,
  ShieldCheck,
  Smartphone,
  Tablet,
  User,
  UserCog,
} from "lucide-react";
import { useAdminTheme } from "../../AdminThemeContext";
import { AdminToast, DbErrorBanner, callApi, formatDate, useConfirm, useToast } from "../../_shared/admin-ui";
import { ACTION_LABEL, PERMISSION_MODULES, permissionKey } from "@/lib/rbac";

const TABS = [
  { id: "profile", label: "প্রোফাইল ও তথ্য", icon: User },
  { id: "password", label: "পাসওয়ার্ড পরিবর্তন", icon: KeyRound },
  { id: "security", label: "রোল, পারমিশন ও সেশন", icon: ShieldCheck },
];

const DEVICE_ICON = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
  unknown: Laptop,
};

function passwordStrength(pw) {
  if (!pw) return { score: 0, label: "", cls: "" };
  let score = 0;
  if (pw.length >= 6) score += 1;
  if (pw.length >= 10) score += 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score += 1;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score += 1;
  if (score <= 1) return { score, label: "দুর্বল", cls: "text-rose-500" };
  if (score === 2) return { score, label: "মাঝারি", cls: "text-amber-500" };
  if (score === 3) return { score, label: "ভালো", cls: "text-emerald-500" };
  return { score, label: "শক্তিশালী", cls: "text-emerald-400" };
}

export default function AdminUserSettingClient({
  initialUser,
  access,
  initialSessions = [],
  loadError: initialLoadError = null,
}) {
  const router = useRouter();
  const { isLight } = useAdminTheme();
  const { toast, showToast, hideToast } = useToast();
  const { confirm, confirmDialog } = useConfirm();

  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(initialUser);
  const [sessions, setSessions] = useState(initialSessions);
  const [loadError, setLoadError] = useState(initialLoadError);
  const [reloading, setReloading] = useState(false);

  // Profile form state
  const [profile, setProfile] = useState(() => ({
    fullName: initialUser?.fullName || access?.fullName || "",
    phone: initialUser?.phone || "",
    designation: initialUser?.designation || "",
    department: initialUser?.department || "",
    gender: initialUser?.gender || "",
    avatar: initialUser?.avatar || "",
  }));
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form state
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    logoutOtherDevices: true,
  });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [savingPw, setSavingPw] = useState(false);

  // Session actions
  const [busySessionId, setBusySessionId] = useState(null);

  const reload = async () => {
    setReloading(true);
    const { ok, data, message } = await callApi("/api/admin/user-setting");
    setReloading(false);
    if (!ok) {
      showToast(message, "error");
      return;
    }
    if (data.user) {
      setUser(data.user);
      setProfile({
        fullName: data.user.fullName || "",
        phone: data.user.phone || "",
        designation: data.user.designation || "",
        department: data.user.department || "",
        gender: data.user.gender || "",
        avatar: data.user.avatar || "",
      });
    }
    if (Array.isArray(data.sessions)) setSessions(data.sessions);
    setLoadError(null);
    showToast("সর্বশেষ অ্যাকাউন্ট তথ্য লোড হয়েছে।");
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (profile.fullName.trim().length < 2) {
      showToast("পূর্ণ নাম কমপক্ষে ২ অক্ষরের হতে হবে।", "error");
      return;
    }
    setSavingProfile(true);
    const { ok, data, message } = await callApi("/api/admin/user-setting", {
      method: "PATCH",
      body: profile,
    });
    setSavingProfile(false);
    if (!ok) {
      showToast(message, "error");
      return;
    }
    if (data.user) {
      setUser(data.user);
      setProfile({
        fullName: data.user.fullName || "",
        phone: data.user.phone || "",
        designation: data.user.designation || "",
        department: data.user.department || "",
        gender: data.user.gender || "",
        avatar: data.user.avatar || "",
      });
    }
    showToast(message || "প্রোফাইল সফলভাবে আপডেট হয়েছে!");
    router.refresh();
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword) {
      showToast("বর্তমান পাসওয়ার্ড দিন।", "error");
      return;
    }
    if (pwForm.newPassword.trim().length < 6) {
      showToast("নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।", "error");
      return;
    }
    if (pwForm.newPassword.trim() !== pwForm.confirmPassword.trim()) {
      showToast("নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মেলেনি।", "error");
      return;
    }

    setSavingPw(true);
    const { ok, data, message } = await callApi("/api/admin/user-setting", {
      method: "POST",
      body: {
        action: "change-password",
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword.trim(),
        confirmPassword: pwForm.confirmPassword.trim(),
        logoutOtherDevices: pwForm.logoutOtherDevices,
      },
    });
    setSavingPw(false);
    if (!ok) {
      showToast(message, "error");
      return;
    }
    if (Array.isArray(data.sessions)) setSessions(data.sessions);
    setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "", logoutOtherDevices: true });
    showToast(message || "পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!");
  };

  const handleRevokeSession = async (sessionId) => {
    setBusySessionId(sessionId);
    const { ok, data, message } = await callApi("/api/admin/user-setting", {
      method: "POST",
      body: { action: "revoke-session", sessionId },
    });
    setBusySessionId(null);
    if (!ok) {
      showToast(message, "error");
      return;
    }
    if (Array.isArray(data.sessions)) setSessions(data.sessions);
    showToast(message || "সেশন বন্ধ করা হয়েছে।");
  };

  const handleRevokeAllOthers = async () => {
    if (
      !(await confirm("বর্তমান ডিভাইস ছাড়া আপনার অন্যান্য সব লগইন ডিভাইস থেকে লগআউট করবেন?", {
        tone: "warning",
        title: "অন্যান্য ডিভাইস লগআউট করবেন?",
        confirmLabel: "হ্যাঁ, লগআউট করুন",
      }))
    ) {
      return;
    }
    setBusySessionId("__all__");
    const { ok, data, message } = await callApi("/api/admin/user-setting", {
      method: "POST",
      body: { action: "revoke-other-sessions" },
    });
    setBusySessionId(null);
    if (!ok) {
      showToast(message, "error");
      return;
    }
    if (Array.isArray(data.sessions)) setSessions(data.sessions);
    showToast(message);
  };

  const strength = passwordStrength(pwForm.newPassword);
  const pwMismatch = Boolean(pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword);
  const otherSessionsCount = sessions.filter((s) => !s.isCurrent).length;

  const panelCls = `rounded-3xl border p-5 sm:p-7 space-y-6 ${
    isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900 border-slate-800 shadow-xl"
  }`;
  const labelCls = `block text-xs font-bold mb-1.5 ${isLight ? "text-slate-700" : "text-slate-300"}`;
  const inputCls = `w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-hidden ${
    isLight
      ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500"
      : "bg-slate-950 border-slate-700 text-white focus:border-amber-500"
  }`;
  const muted = isLight ? "text-slate-600" : "text-slate-400";
  const initial = (user?.fullName || access?.fullName || access?.email || "A").trim().charAt(0).toUpperCase();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {confirmDialog}
      <AdminToast toast={toast} onClose={hideToast} />
      <DbErrorBanner message={loadError} isLight={isLight} onRetry={reload} retrying={reloading} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 border ${
              isLight
                ? "bg-amber-100 text-amber-900 border-amber-300"
                : "bg-amber-500/10 border-amber-500/30 text-amber-300"
            }`}
          >
            <UserCog className="w-3.5 h-3.5 text-amber-500" />
            Logged-in Account Settings &amp; Security
          </div>
          <h1 className={`text-xl sm:text-3xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
            ইউজার সেটিংস ও পাসওয়ার্ড
          </h1>
          <p className={`text-xs sm:text-sm mt-1 font-medium ${muted}`}>
            আপনার ব্যক্তিগত প্রোফাইল তথ্য, পাসওয়ার্ড পরিবর্তন, রোল পারমিশন এবং সক্রিয় লগইন ডিভাইস পরিচালনা করুন
          </p>
        </div>

        <button
          type="button"
          onClick={reload}
          disabled={reloading}
          className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60 ${
            isLight
              ? "bg-white border-slate-300 text-slate-800 hover:bg-slate-50"
              : "bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800"
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${reloading ? "animate-spin" : ""}`} /> রিফ্রেশ
        </button>
      </div>

      {/* Account Summary Card */}
      <div className={panelCls}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border-2 border-amber-500/40 bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-md">
            {profile.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar} alt={profile.fullName} className="w-full h-full object-cover" />
            ) : (
              initial
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className={`text-lg font-black ${isLight ? "text-slate-900" : "text-white"}`}>
                {user?.fullName || access?.fullName}
              </h2>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  access?.isSuper
                    ? isLight
                      ? "bg-amber-50 text-amber-900 border-amber-300"
                      : "bg-amber-500/15 text-amber-300 border-amber-500/40"
                    : isLight
                      ? "bg-indigo-50 text-indigo-800 border-indigo-200"
                      : "bg-indigo-500/15 text-indigo-300 border-indigo-500/35"
                }`}
              >
                {access?.isSuper ? <Crown className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                {access?.roleLabel}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  isLight
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-emerald-500/15 text-emerald-300 border-emerald-500/35"
                }`}
              >
                <CheckCircle2 className="w-3 h-3" /> সক্রিয় অ্যাকাউন্ট
              </span>
            </div>

            <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs ${muted}`}>
              <span className="inline-flex items-center gap-1 break-all">
                <Mail className="w-3.5 h-3.5 text-amber-500 shrink-0" /> {user?.email || access?.email}
              </span>
              {user?.phone && (
                <span className="inline-flex items-center gap-1 font-mono">
                  <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" /> {user.phone}
                </span>
              )}
              {user?.lastLogin && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" /> সর্বশেষ লগইন: {formatDate(user.lastLogin, true)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="ইউজার সেটিংস ট্যাব"
        className={`flex items-center gap-1.5 p-1.5 rounded-2xl border overflow-x-auto ${
          isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
        }`}
      >
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                active
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/20"
                  : isLight
                    ? "text-slate-700 hover:bg-slate-100"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROFILE INFO */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile} className={panelCls}>
          <div className={`border-b pb-4 ${isLight ? "border-slate-200" : "border-slate-800"}`}>
            <h3 className={`text-base font-black flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
              <User className="w-5 h-5 text-amber-500" /> ব্যক্তিগত তথ্য ও প্রোফাইল
            </h3>
            <p className={`text-xs mt-1 ${muted}`}>
              আপনার নাম, মোবাইল নম্বর, পদবী ও প্রোফাইল ছবি আপডেট করুন। ইমেইল পরিবর্তনের জন্য সুপার অ্যাডমিনের সাথে যোগাযোগ করুন।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>পূর্ণ নাম *</label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={100}
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>লগইন ইমেইল (পরিবর্তনযোগ্য নয়)</label>
              <input
                type="email"
                value={user?.email || access?.email || ""}
                disabled
                className={`${inputCls} opacity-60 cursor-not-allowed`}
              />
            </div>

            <div>
              <label className={labelCls}>মোবাইল নম্বর</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="017XXXXXXXX"
                className={`${inputCls} font-mono`}
              />
            </div>

            <div>
              <label className={labelCls}>লিঙ্গ (Gender)</label>
              <select
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                className={inputCls}
              >
                <option value="">নির্বাচন করুন</option>
                <option value="male">পুরুষ (Male)</option>
                <option value="female">মহিলা (Female)</option>
                <option value="other">অন্যান্য</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-amber-500" /> পদবী (Designation)
                </span>
              </label>
              <input
                type="text"
                maxLength={100}
                value={profile.designation}
                onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                placeholder="System Administrator"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>
                <span className="inline-flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-amber-500" /> বিভাগ (Department)
                </span>
              </label>
              <input
                type="text"
                maxLength={100}
                value={profile.department}
                onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                placeholder="Administration"
                className={inputCls}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelCls}>প্রোফাইল ছবির লিংক (ঐচ্ছিক, https://)</label>
              <input
                type="url"
                value={profile.avatar}
                onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
                placeholder="https://res.cloudinary.com/..."
                className={`${inputCls} font-mono`}
              />
            </div>
          </div>

          <div className={`pt-4 border-t flex items-center justify-between gap-3 ${isLight ? "border-slate-200" : "border-slate-800"}`}>
            <span className={`text-[11px] ${muted}`}>
              {user?.createdAt ? `অ্যাকাউন্ট তৈরি: ${formatDate(user.createdAt)}` : ""}
            </span>
            <button
              type="submit"
              disabled={savingProfile || !user}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {savingProfile ? "সংরক্ষণ হচ্ছে..." : "প্রোফাইল সংরক্ষণ করুন"}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: PASSWORD CHANGE / RESET */}
      {activeTab === "password" && (
        <form onSubmit={handleChangePassword} className={panelCls}>
          <div className={`border-b pb-4 ${isLight ? "border-slate-200" : "border-slate-800"}`}>
            <h3 className={`text-base font-black flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
              <KeyRound className="w-5 h-5 text-amber-500" /> পাসওয়ার্ড পরিবর্তন ও রিসেট
            </h3>
            <p className={`text-xs mt-1 ${muted}`}>
              অ্যাকাউন্ট সুরক্ষিত রাখতে নিয়মিত শক্তিশালী পাসওয়ার্ড ব্যবহার করুন (কমপক্ষে ৬ অক্ষর)।
            </p>
          </div>

          <div className="space-y-4 max-w-lg">
            <div>
              <label className={labelCls}>বর্তমান পাসওয়ার্ড *</label>
              <div className="relative">
                <input
                  type={showPw.current ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  placeholder="আপনার বর্তমান পাসওয়ার্ড লিখুন"
                  className={`${inputCls} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => ({ ...s, current: !s.current }))}
                  aria-label="পাসওয়ার্ড দেখুন"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 cursor-pointer"
                >
                  {showPw.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`text-xs font-bold ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                  নতুন পাসওয়ার্ড *
                </label>
                {strength.label && (
                  <span className={`text-[11px] font-bold ${strength.cls}`}>শক্তি: {strength.label}</span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPw.next ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  placeholder="কমপক্ষে ৬ অক্ষরের নতুন পাসওয়ার্ড"
                  className={`${inputCls} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => ({ ...s, next: !s.next }))}
                  aria-label="পাসওয়ার্ড দেখুন"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 cursor-pointer"
                >
                  {showPw.next ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className={labelCls}>নতুন পাসওয়ার্ড নিশ্চিত করুন *</label>
              <div className="relative">
                <input
                  type={showPw.confirm ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                  placeholder="নতুন পাসওয়ার্ডটি আবার লিখুন"
                  className={`${inputCls} pr-10 ${pwMismatch ? "border-rose-500" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => ({ ...s, confirm: !s.confirm }))}
                  aria-label="পাসওয়ার্ড দেখুন"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 cursor-pointer"
                >
                  {showPw.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {pwMismatch && <p className="text-[11px] font-bold text-rose-500 mt-1">পাসওয়ার্ড দুটি মেলেনি।</p>}
            </div>

            <label
              className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer text-xs ${
                isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
              }`}
            >
              <input
                type="checkbox"
                checked={pwForm.logoutOtherDevices}
                onChange={(e) => setPwForm({ ...pwForm, logoutOtherDevices: e.target.checked })}
                className="mt-0.5 rounded border-slate-400 text-amber-500 cursor-pointer"
              />
              <span>
                <strong className={isLight ? "text-slate-900" : "text-white"}>
                  পাসওয়ার্ড পরিবর্তনের পর অন্যান্য সব ডিভাইস থেকে লগআউট করুন
                </strong>
                <span className={`block text-[11px] mt-0.5 ${muted}`}>
                  আপনার বর্তমান ব্রাউজার সেশন চালু থাকবে, বাকি সব ডিভাইসের সেশন বন্ধ হয়ে যাবে।
                </span>
              </span>
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Link
                href="/forgot-password"
                className="text-xs font-bold text-amber-500 hover:underline inline-flex items-center gap-1"
              >
                <Lock className="w-3.5 h-3.5" /> বর্তমান পাসওয়ার্ড ভুলে গেছেন? ইমেইল রিসেট লিংক পাঠান
              </Link>

              <button
                type="submit"
                disabled={savingPw || pwMismatch}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
              >
                <KeyRound className="w-4 h-4" /> {savingPw ? "পরিবর্তন হচ্ছে..." : "পাসওয়ার্ড আপডেট করুন"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: ROLE, PERMISSIONS & ACTIVE SESSIONS */}
      {activeTab === "security" && (
        <div className="space-y-6">
          {/* Role & Permissions */}
          <div className={panelCls}>
            <div className={`border-b pb-4 flex items-center justify-between gap-3 ${isLight ? "border-slate-200" : "border-slate-800"}`}>
              <div>
                <h3 className={`text-base font-black flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                  <ShieldCheck className="w-5 h-5 text-amber-500" /> আপনার রোল ও অনুমতিসমূহ
                </h3>
                <p className={`text-xs mt-1 ${muted}`}>
                  বর্তমান রোল: <strong>{access?.roleLabel}</strong> ({access?.role})
                </p>
              </div>
              {access?.isSuper && (
                <Link
                  href="/admin/users"
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black"
                >
                  সব রোল ম্যানেজ করুন →
                </Link>
              )}
            </div>

            {access?.isSuper ? (
              <div
                className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2.5 ${
                  isLight ? "bg-amber-50 border-amber-200 text-amber-950" : "bg-amber-500/10 border-amber-500/30 text-amber-200"
                }`}
              >
                <Crown className="w-5 h-5 text-amber-500 shrink-0" />
                <span>
                  সুপার অ্যাডমিন হিসেবে সব মডিউলে পূর্ণ অ্যাক্সেস রয়েছে (দেখা, যোগ করা, সম্পাদনা, মুছে ফেলা এবং অ্যাডমিন ইউজার ও রোল পরিচালনা)।
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {PERMISSION_MODULES.map((m) => {
                  const granted = m.actions.filter((a) =>
                    (access?.permissions || []).includes(permissionKey(m.id, a))
                  );
                  return (
                    <div
                      key={m.id}
                      className={`p-3.5 rounded-2xl border space-y-1.5 ${
                        granted.length > 0
                          ? isLight
                            ? "bg-slate-50 border-slate-200"
                            : "bg-slate-950/70 border-slate-800"
                          : isLight
                            ? "bg-slate-50/40 border-slate-200/60 opacity-60"
                            : "bg-slate-950/30 border-slate-800/60 opacity-60"
                      }`}
                    >
                      <div className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{m.label}</div>
                      {granted.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {granted.map((a) => (
                            <span
                              key={a}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                isLight
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                              }`}
                            >
                              ✓ {ACTION_LABEL[a]}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500">অনুমতি নেই</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Sessions */}
          <div className={panelCls}>
            <div className={`border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isLight ? "border-slate-200" : "border-slate-800"}`}>
              <div>
                <h3 className={`text-base font-black flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                  <Monitor className="w-5 h-5 text-amber-500" /> সক্রিয় লগইন সেশন ({sessions.length})
                </h3>
                <p className={`text-xs mt-1 ${muted}`}>যে ডিভাইসগুলোতে আপনার অ্যাকাউন্ট বর্তমানে লগইন আছে</p>
              </div>

              {otherSessionsCount > 0 && (
                <button
                  type="button"
                  disabled={busySessionId === "__all__"}
                  onClick={handleRevokeAllOthers}
                  className="px-3.5 py-2 rounded-xl border border-rose-500/35 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <LogOut className="w-3.5 h-3.5" /> অন্যান্য সব ডিভাইস লগআউট ({otherSessionsCount})
                </button>
              )}
            </div>

            {sessions.length === 0 ? (
              <p className={`text-xs ${muted}`}>কোনো অতিরিক্ত সেশন রেকর্ড পাওয়া যায়নি।</p>
            ) : (
              <div className="space-y-2.5">
                {sessions.map((s) => {
                  const Icon = DEVICE_ICON[s.deviceType] || Laptop;
                  return (
                    <div
                      key={s._id}
                      className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                        isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/70 border-slate-800"
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span
                          className={`p-2 rounded-xl shrink-0 ${
                            s.isCurrent
                              ? "bg-emerald-500/15 text-emerald-500"
                              : isLight
                                ? "bg-slate-200 text-slate-600"
                                : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`font-bold capitalize ${isLight ? "text-slate-900" : "text-white"}`}>
                              {s.deviceType || "Unknown"} ডিভাইস
                            </span>
                            {s.isCurrent && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-500 border border-emerald-500/35">
                                বর্তমান ডিভাইস
                              </span>
                            )}
                          </div>
                          {s.userAgent && (
                            <p className={`text-[11px] truncate max-w-md mt-0.5 ${muted}`}>{s.userAgent}</p>
                          )}
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {s.ipAddress ? `IP: ${s.ipAddress} · ` : ""}
                            সর্বশেষ সক্রিয়: {formatDate(s.lastActive || s.createdAt, true)}
                          </p>
                        </div>
                      </div>

                      {!s.isCurrent && (
                        <button
                          type="button"
                          disabled={busySessionId === s._id}
                          onClick={() => handleRevokeSession(s._id)}
                          className="self-start sm:self-center px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-[11px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50 shrink-0"
                        >
                          <LogOut className="w-3 h-3" /> লগআউট
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
