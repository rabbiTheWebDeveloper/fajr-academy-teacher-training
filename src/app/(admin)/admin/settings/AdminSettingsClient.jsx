'use client';

import React, { useState } from "react";
import {
  CreditCard,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  Lock,
  Sun,
  Moon,
  RotateCcw,
  RefreshCw,
  Copy,
  Check,
  Database,
  Building2,
  Info,
} from "lucide-react";
import { useAdminTheme } from "../../AdminThemeContext";
import { DbErrorBanner, callApi } from "../../_shared/admin-ui";

/** Exactly the keys PUT /api/admin/settings accepts (gateway credentials are env-only). */
const EDITABLE = [
  "siteTitle",
  "instituteName",
  "tagline",
  "officeAddress",
  "coursePrice",
  "regularCoursePrice",
  "currentBatch",
  "admissionStatus",
  "maxSeatsPerBatch",
  "certificatePrefix",
  "orientationDate",
  "orientationTime",
  "bkashMerchantNumber",
  "nagadMerchantNumber",
  "helplinePhone",
  "supportEmail",
  "whatsappSupport",
  "whatsappCommunityGroup",
  "adminNotificationEmail",
  "registrationOpen",
  "emailNotificationEnabled",
  "defaultTheme",
];

function pickEditable(source) {
  const out = {};
  for (const k of EDITABLE) if (source?.[k] !== undefined) out[k] = source[k];
  return out;
}

export default function AdminSettingsClient({ initialSettings, isDefault, gateway: initialGateway, loadError: initialLoadError }) {
  const [settings, setSettings] = useState(initialSettings || {});
  const [loaded, setLoaded] = useState(Boolean(initialSettings));
  const [notSavedYet, setNotSavedYet] = useState(Boolean(isDefault));
  const [gateway, setGateway] = useState(initialGateway || { mode: "sandbox", configured: false });
  const [loadError, setLoadError] = useState(initialLoadError);
  const [reloading, setReloading] = useState(false);
  const [activeTab, setActiveTab] = useState("pricing");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const { theme, setTheme, isLight } = useAdminTheme();

  const handleChange = (field, val) => {
    setSettings((prev) => ({ ...prev, [field]: val }));
  };

  const flash = (type, text) => {
    if (type === "success") {
      setSaveError(null);
      setSaveSuccess(text);
      setTimeout(() => setSaveSuccess(null), 4000);
    } else {
      setSaveSuccess(null);
      setSaveError(text);
      setTimeout(() => setSaveError(null), 8000);
    }
  };

  const applyServer = (data) => {
    if (data.settings) setSettings(pickEditable(data.settings));
    if (data.gateway) setGateway(data.gateway);
    setLoaded(true);
    setNotSavedYet(false);
    setLoadError(null);
  };

  const reload = async () => {
    setReloading(true);
    const { ok, data, message } = await callApi("/api/admin/settings");
    setReloading(false);
    if (!ok) {
      flash("error", message);
      return;
    }
    applyServer(data);
    flash("success", "ডাটাবেজ থেকে সর্বশেষ সেটিংস লোড হয়েছে।");
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!loaded) {
      flash("error", "বর্তমান সেটিংস লোড হয়নি — আগে 'আবার চেষ্টা করুন' দিয়ে সেটিংস লোড করুন, তারপর সংরক্ষণ করুন।");
      return;
    }
    setSaving(true);
    setSaveSuccess(null);
    setSaveError(null);
    const { ok, data, message } = await callApi("/api/admin/settings", { method: "PUT", body: pickEditable(settings) });
    setSaving(false);
    if (!ok) {
      flash("error", message || "সংরক্ষণ ব্যর্থ হয়েছে");
      return;
    }
    applyServer(data);
    flash("success", message || "সেটিংস ডাটাবেসে সফলভাবে আপডেট হয়েছে!");
  };

  const handleResetDefaults = async () => {
    if (!window.confirm("আপনি কি নিশ্চিত যে সমস্ত সেটিংস ডিফল্ট মানে রিসেট করতে চান? বর্তমান সব পরিবর্তন মুছে যাবে।")) return;

    setSaving(true);
    const { ok, data, message } = await callApi("/api/admin/settings", { method: "POST", body: { action: "reset" } });
    setSaving(false);
    if (!ok) {
      flash("error", message || "রিসেট ব্যর্থ হয়েছে");
      return;
    }
    applyServer(data);
    flash("success", message || "ডিফল্ট সেটিংস সফলভাবে পুনরুদ্ধার করা হয়েছে!");
  };

  const handleCopy = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      flash("error", "ক্লিপবোর্ডে কপি করা যায়নি — লিংকটি নিজে নির্বাচন করে কপি করুন।");
    }
  };

  const tabs = [
    { id: "pricing", label: "কোর্স ও ভর্তি ফি", icon: CreditCard },
    { id: "gateway", label: "পেমেন্ট গেটওয়ে", icon: ShieldCheck },
    { id: "support", label: "প্রতিষ্ঠান ও সাপোর্ট", icon: Phone },
    { id: "security", label: "ভর্তি ও নোটিফিকেশন", icon: Lock },
    { id: "theme", label: "থিম ও ডিসপ্লে", icon: Sun },
  ];

  const panelCls = `p-6 sm:p-8 rounded-3xl border space-y-6 transition-all ${
    isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900 border-slate-800 shadow-xl"
  }`;
  const labelCls = `block font-bold mb-1.5 ${isLight ? "text-slate-700" : "text-slate-300"}`;
  const inputCls = `w-full px-3 py-2.5 rounded-xl border text-xs outline-hidden ${
    isLight ? "" : "bg-slate-950 border-slate-700 text-white focus:border-amber-500"
  }`;
  const hintCls = "text-[11px] text-slate-400 mt-1 leading-relaxed";
  const val = (k) => settings[k] ?? "";
  const disabled = saving || !loaded;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 border ${
              isLight ? "bg-amber-100 text-amber-900 border-amber-300" : "bg-amber-500/10 border-amber-500/30 text-amber-300"
            }`}
          >
            <Database className="w-3.5 h-3.5 text-amber-500" />
            MongoDB Persisted Config System
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
            গ্লোবাল সিস্টেম সেটিংস ও মডেল কনফিগারেশন
          </h1>
          <p className={`text-xs sm:text-sm mt-1 font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
            কোর্স ফি, ভর্তি নিয়ন্ত্রণ, হেল্পলাইন, নোটিফিকেশন ও থিম লাইভ নিয়ন্ত্রণ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={reload}
            disabled={reloading || saving}
            className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 ${
              isLight ? "bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-xs" : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300"
            }`}
            title="ডাটাবেজ থেকে আবার লোড করুন"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${reloading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">রিফ্রেশ</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={disabled}
            className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 ${
              isLight ? "bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-xs" : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300"
            }`}
            title="ডিফল্ট সেটিংসে ফিরিয়ে নিন"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">রিসেট</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={disabled}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> সংরক্ষণ হচ্ছে...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> সেটিংস সংরক্ষণ
              </>
            )}
          </button>
        </div>
      </div>

      <DbErrorBanner message={loadError} isLight={isLight} onRetry={reload} retrying={reloading} />

      {notSavedYet && loaded && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
            isLight ? "bg-blue-50 border-blue-200 text-blue-900" : "bg-blue-500/10 border-blue-500/30 text-blue-200"
          }`}
        >
          <Info className="w-4 h-4 shrink-0" />
          <span>এখনো কোনো সেটিংস সংরক্ষণ করা হয়নি — নিচে ডিফল্ট মান দেখানো হচ্ছে। &quot;সেটিংস সংরক্ষণ&quot; চাপলে এগুলো ডাটাবেজে সংরক্ষিত হবে।</span>
        </div>
      )}

      {saveSuccess && (
        <div role="status" className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {saveError && (
        <div role="alert" className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Tabs Bar */}
      <div className={`flex items-center gap-1.5 p-1.5 rounded-2xl border overflow-x-auto ${isLight ? "bg-white border-slate-200 shadow-xs" : "bg-slate-900 border-slate-800"}`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                active
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20 font-black"
                  : isLight
                  ? "text-slate-700 hover:text-slate-950 hover:bg-slate-100"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? "text-slate-950" : isLight ? "text-slate-500" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Content Panel */}
      <form onSubmit={handleSave} className="space-y-6">
        <fieldset disabled={!loaded} className="space-y-6 disabled:opacity-60">
          {/* TAB 1: PRICING & ADMISSION */}
          {activeTab === "pricing" && (
            <div className={panelCls}>
              <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className={`text-base font-black flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                    <CreditCard className="w-5 h-5 text-amber-500" /> কোর্স ফি ও ভর্তি কনফিগারেশন
                  </h3>
                  <p className={`text-xs mt-1 font-medium ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    প্রোগ্রামের অফার ফি, রেগুলার ফি, ব্যাচ নম্বর ও ভর্তি স্ট্যাটাস নিয়ন্ত্রণ
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                    settings.admissionStatus === "open"
                      ? isLight
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : isLight
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {settings.admissionStatus === "open" ? "● ভর্তি চলছে (OPEN)" : settings.admissionStatus === "waitlist" ? "● ওয়েটিং লিস্ট" : "● ভর্তি বন্ধ"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
                <div>
                  <label className={labelCls}>অফার কোর্স ফি (BDT) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={val("coursePrice")}
                      onChange={(e) => handleChange("coursePrice", e.target.value)}
                      className={`${inputCls} font-mono font-bold text-sm`}
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                  </div>
                  <p className={hintCls}>ডিফল্ট মূল্য — কোনো কোর্সে নিজস্ব ফি সেট না থাকলে এই পরিমাণ চার্জ হয়। প্রতিটি ব্যাচের ফি &quot;কোর্স ও সেশন&quot; পেজ থেকে নির্ধারিত হয়।</p>
                </div>

                <div>
                  <label className={labelCls}>রেগুলার ফি (স্ট্রাইকথ্রু মূল্য)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={val("regularCoursePrice")}
                      onChange={(e) => handleChange("regularCoursePrice", e.target.value)}
                      className={`${inputCls} font-mono text-sm`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                  </div>
                  <p className={hintCls}>মার্কেটিং পৃষ্ঠায় ডিসকাউন্ট হিসেবে দৃশ্যমান হবে।</p>
                </div>

                <div>
                  <label className={labelCls}>ভর্তি স্ট্যাটাস</label>
                  <select value={val("admissionStatus") || "open"} onChange={(e) => handleChange("admissionStatus", e.target.value)} className={`${inputCls} font-bold`}>
                    <option value="open">Open (ভর্তি চালু রয়েছে)</option>
                    <option value="closed">Closed (ভর্তি বন্ধ)</option>
                    <option value="waitlist">Waitlist (ওয়েটিং লিস্ট)</option>
                  </select>
                  <p className={hintCls}>
                    Closed হলে চেকআউটে সার্ভার নতুন পেমেন্ট শুরু করতে দেয় না। Waitlist হলে রেজিস্ট্রেশন পেজে ওয়েটিং লিস্টের বার্তা দেখায়।
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelCls}>বর্তমান ব্যাচের নাম ও ট্র্যাক</label>
                  <input
                    type="text"
                    value={val("currentBatch")}
                    onChange={(e) => handleChange("currentBatch", e.target.value)}
                    className={`${inputCls} font-medium`}
                    placeholder="যেমন: TOT Batch 014 (September 2026)"
                  />
                </div>

                <div>
                  <label className={labelCls}>সর্বোচ্চ শিক্ষার্থী কোটা</label>
                  <input
                    type="number"
                    min="0"
                    value={val("maxSeatsPerBatch")}
                    onChange={(e) => handleChange("maxSeatsPerBatch", e.target.value)}
                    className={`${inputCls} font-mono`}
                  />
                </div>

                <div>
                  <label className={labelCls}>সার্টিফিকেট নম্বর প্রিফিক্স</label>
                  <input
                    type="text"
                    value={val("certificatePrefix")}
                    onChange={(e) => handleChange("certificatePrefix", e.target.value)}
                    className={`${inputCls} font-mono`}
                    placeholder="FJR-TOT-2026"
                  />
                </div>

                <div>
                  <label className={labelCls}>ওরিয়েন্টেশন তারিখ</label>
                  <input
                    type="text"
                    value={val("orientationDate")}
                    onChange={(e) => handleChange("orientationDate", e.target.value)}
                    className={inputCls}
                    placeholder="২০ সেপ্টেম্বর ২০২৬"
                  />
                </div>

                <div>
                  <label className={labelCls}>ক্লাস / ওরিয়েন্টেশন সময়</label>
                  <input
                    type="text"
                    value={val("orientationTime")}
                    onChange={(e) => handleChange("orientationTime", e.target.value)}
                    className={inputCls}
                    placeholder="রাত ৮:০০ টা – ৯:৩০ টা"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PAYMENT GATEWAY (read-only status) */}
          {activeTab === "gateway" && (
            <div className={panelCls}>
              <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className={`text-base font-black flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                    <ShieldCheck className="w-5 h-5 text-emerald-500" /> SSLCommerz গেটওয়ে ও মোবাইল ব্যাংকিং
                  </h3>
                  <p className={`text-xs mt-1 font-medium ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    গেটওয়ের ক্রেডেনশিয়াল সার্ভারের এনভায়রনমেন্ট ভেরিয়েবলে থাকে — এখান থেকে দেখা বা পরিবর্তন করা যায় না
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    gateway.mode === "live"
                      ? isLight
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : isLight
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {gateway.mode === "live" ? "🟢 Live Gateway" : "🟡 Sandbox Mode"}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                {/* Read-only gateway status card */}
                <div
                  className={`sm:col-span-2 p-4 rounded-2xl border space-y-2 ${
                    gateway.configured
                      ? isLight
                        ? "bg-emerald-50 border-emerald-200"
                        : "bg-emerald-500/10 border-emerald-500/30"
                      : isLight
                      ? "bg-rose-50 border-rose-200"
                      : "bg-rose-500/10 border-rose-500/30"
                  }`}
                >
                  <div className={`font-black text-sm flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                    {gateway.configured ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
                    <span>
                      SSLCommerz: <span className="font-mono uppercase">{gateway.mode}</span> ·{" "}
                      {gateway.configured ? "কনফিগার করা আছে" : "কনফিগার করা নেই — .env-এ SSLCOMMERZ_STORE_ID/PASSWORD দিন"}
                    </span>
                  </div>
                  <p className={`leading-relaxed ${isLight ? "text-slate-600" : "text-slate-300"}`}>
                    অনলাইন পেমেন্ট সার্ভারে SSLCommerz validation API দিয়ে স্বয়ংক্রিয়ভাবে যাচাই হয় এবং যাচাইয়ের সাথে সাথে ট্রেইনির অ্যাকাউন্ট ও কোর্স
                    এনরোলমেন্ট সক্রিয় হয় — আলাদা অনুমোদনের প্রয়োজন নেই। Live/Sandbox মোড{" "}
                    <code className="font-mono text-amber-600 dark:text-amber-400">SSLCOMMERZ_IS_LIVE</code> এনভায়রনমেন্ট ভেরিয়েবল দিয়ে নির্ধারিত হয়।
                  </p>
                </div>

                <div>
                  <label className={labelCls}>bKash মার্চেন্ট হেল্পলাইন / নাম্বার</label>
                  <input
                    type="text"
                    value={val("bkashMerchantNumber")}
                    onChange={(e) => handleChange("bkashMerchantNumber", e.target.value)}
                    className={`${inputCls} font-mono`}
                  />
                </div>

                <div>
                  <label className={labelCls}>Nagad মার্চেন্ট নাম্বার</label>
                  <input
                    type="text"
                    value={val("nagadMerchantNumber")}
                    onChange={(e) => handleChange("nagadMerchantNumber", e.target.value)}
                    className={`${inputCls} font-mono`}
                  />
                </div>
                <p className={`sm:col-span-2 -mt-3 ${hintCls}`}>
                  ম্যানুয়াল বিকাশ/নগদ পেমেন্টের নম্বর হিসেবে ট্রেইনিদের দেখানো হয়। প্রাপ্ত পেমেন্ট &quot;পেমেন্ট ভেরিফিকেশন&quot; পেজ থেকে ম্যানুয়ালি রেকর্ড করুন।
                </p>

                {/* IPN Webhook URL Info Box */}
                <div
                  className={`sm:col-span-2 p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                  }`}
                >
                  <div>
                    <span className={`font-bold block text-xs ${isLight ? "text-slate-900" : "text-white"}`}>
                      SSLCommerz IPN (Instant Payment Notification) Webhook Endpoint
                    </span>
                    <code className="text-[11px] text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">/api/payment/sslcommerz/ipn</code>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(`${window.location.origin}/api/payment/sslcommerz/ipn`, "ipn")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      copiedField === "ipn"
                        ? "bg-emerald-500 text-white border-emerald-600"
                        : isLight
                        ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
                        : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {copiedField === "ipn" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === "ipn" ? "কপি হয়েছে" : "URL কপি করুন"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INSTITUTE, SUPPORT & CONTACT */}
          {activeTab === "support" && (
            <div className={panelCls}>
              <div className="border-b pb-4 border-slate-200 dark:border-slate-800">
                <h3 className={`text-base font-black flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                  <Building2 className="w-5 h-5 text-blue-500" /> প্রতিষ্ঠান, হেল্পলাইন ও কমিউনিটি তথ্য
                </h3>
                <p className={`text-xs mt-1 font-medium ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                  ওয়েবসাইটের শিরোনাম, শিক্ষার্থীদের জন্য ফ্লোটিং হোয়াটসঅ্যাপ বাটন, ফোন ও ইমেইল সহায়তা লিঙ্ক
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                <div>
                  <label className={labelCls}>প্রতিষ্ঠানের নাম</label>
                  <input type="text" value={val("instituteName")} onChange={(e) => handleChange("instituteName", e.target.value)} className={inputCls} />
                </div>

                <div>
                  <label className={labelCls}>ওয়েবসাইট শিরোনাম (Site Title)</label>
                  <input type="text" value={val("siteTitle")} onChange={(e) => handleChange("siteTitle", e.target.value)} className={inputCls} />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelCls}>ট্যাগলাইন</label>
                  <input type="text" value={val("tagline")} onChange={(e) => handleChange("tagline", e.target.value)} className={inputCls} />
                </div>

                <div>
                  <label className={labelCls}>সাপোর্ট হেল্পলাইন ফোন *</label>
                  <input
                    type="text"
                    value={val("helplinePhone")}
                    onChange={(e) => handleChange("helplinePhone", e.target.value)}
                    className={`${inputCls} font-mono font-bold`}
                    placeholder="01XXXXXXXXX"
                  />
                </div>

                <div>
                  <label className={labelCls}>অফিসিয়াল সাপোর্ট ইমেইল *</label>
                  <input
                    type="email"
                    value={val("supportEmail")}
                    onChange={(e) => handleChange("supportEmail", e.target.value)}
                    className={inputCls}
                    placeholder="support@example.com"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelCls}>WhatsApp ডিরেক্ট সাপোর্ট লিঙ্ক (https://)</label>
                  <input
                    type="text"
                    value={val("whatsappSupport")}
                    onChange={(e) => handleChange("whatsappSupport", e.target.value)}
                    className={`${inputCls} font-mono`}
                    placeholder="https://wa.me/8801XXXXXXXXX"
                  />
                  <p className={hintCls}>ল্যান্ডিং পেজের ফ্লোটিং চ্যাট বাটনে এই লিঙ্কটি কাজ করবে।</p>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelCls}>WhatsApp ট্রেইনি কমিউনিটি গ্রুপ লিঙ্ক (https://)</label>
                  <input
                    type="text"
                    value={val("whatsappCommunityGroup")}
                    onChange={(e) => handleChange("whatsappCommunityGroup", e.target.value)}
                    className={`${inputCls} font-mono`}
                    placeholder="https://chat.whatsapp.com/..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelCls}>অ্যাকাডেমির প্রাতিষ্ঠানিক ঠিকানা</label>
                  <input
                    type="text"
                    value={val("officeAddress")}
                    onChange={(e) => handleChange("officeAddress", e.target.value)}
                    className={inputCls}
                    placeholder="ঢাকা, বাংলাদেশ"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ADMISSION LOCK & NOTIFICATIONS */}
          {activeTab === "security" && (
            <div className={panelCls}>
              <div className="border-b pb-4 border-slate-200 dark:border-slate-800">
                <h3 className={`text-base font-black flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                  <Lock className="w-5 h-5 text-purple-500" /> রেজিস্ট্রেশন নিয়ন্ত্রণ ও ইমেইল নোটিফিকেশন
                </h3>
                <p className={`text-xs mt-1 font-medium ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                  এই সেটিংসগুলো সার্ভারে সরাসরি প্রয়োগ হয় — চেকআউট ও পেমেন্ট ইমেইল এগুলো মেনে চলে
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                    isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                  }`}
                >
                  <div>
                    <span className={`font-bold block text-xs ${isLight ? "text-slate-900" : "text-white"}`}>
                      শিক্ষার্থী রেজিস্ট্রেশন চালু রাখুন (Allow Trainee Registration)
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      বন্ধ থাকলে রেজিস্ট্রেশন ফর্ম বন্ধ দেখাবে এবং চেকআউটে সার্ভার নতুন পেমেন্ট শুরু করতে দেবে না (ভর্তি স্ট্যাটাস Closed-এর মতো)।
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.registrationOpen !== false}
                    onChange={(e) => handleChange("registrationOpen", e.target.checked)}
                    className="w-5 h-5 rounded text-amber-500 focus:ring-amber-400 border-slate-300 cursor-pointer shrink-0"
                  />
                </div>

                <div
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                    isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                  }`}
                >
                  <div>
                    <span className={`font-bold block text-xs ${isLight ? "text-slate-900" : "text-white"}`}>
                      পেমেন্ট ইমেইল নোটিফিকেশন চালু রাখুন (System Email Alerts)
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      চালু থাকলে প্রতিটি পেমেন্ট যাচাইয়ের পর ট্রেইনিকে কনফার্মেশন ইমেইল এবং নিচের অ্যাডমিন ইমেইলে নতুন পেমেন্টের নোটিফিকেশন পাঠানো হয়।
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.emailNotificationEnabled !== false}
                    onChange={(e) => handleChange("emailNotificationEnabled", e.target.checked)}
                    className="w-5 h-5 rounded text-amber-500 focus:ring-amber-400 border-slate-300 cursor-pointer shrink-0"
                  />
                </div>

                <div>
                  <label className={labelCls}>অ্যাডমিন অ্যালার্ট ইমেইল (নতুন পেমেন্ট বা এনরোলমেন্টের জন্য)</label>
                  <input
                    type="email"
                    value={val("adminNotificationEmail")}
                    onChange={(e) => handleChange("adminNotificationEmail", e.target.value)}
                    className={inputCls}
                    placeholder="admin@example.com"
                  />
                  <p className={hintCls}>ইমেইল নোটিফিকেশন চালু থাকলে প্রতিটি যাচাইকৃত পেমেন্টের বিবরণ এই ঠিকানায় যায়। খালি রাখলে অ্যাডমিন ইমেইল পাঠানো হবে না।</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: THEME & DISPLAY */}
          {activeTab === "theme" && (
            <div className={panelCls}>
              <div className="border-b pb-4 border-slate-200 dark:border-slate-800">
                <h3 className={`text-base font-black flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                  <Sun className="w-5 h-5 text-amber-500" /> অ্যাডমিন থিম পছন্দ (Live Theme Switcher)
                </h3>
                <p className={`text-xs mt-1 font-medium ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                  হাই-কন্ট্রাস্ট এক্সিকিউটিভ লাইট মোড অথবা স্লিক রয়্যাল ডার্ক মোড নির্বাচন করুন। ডিফল্ট থিম সংরক্ষণ করতে &quot;সেটিংস সংরক্ষণ&quot; চাপুন।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTheme("light");
                    handleChange("defaultTheme", "light");
                  }}
                  className={`p-5 rounded-2xl border text-left flex items-start gap-4 transition-all cursor-pointer ${
                    theme === "light"
                      ? "border-amber-500 bg-amber-500/10 shadow-md ring-2 ring-amber-500/20"
                      : isLight
                      ? "border-slate-300 bg-white hover:border-slate-400 shadow-xs"
                      : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                  }`}
                >
                  <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-600 shrink-0">
                    <Sun className="w-6 h-6 fill-amber-500" />
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span>☀️ হাই-কন্ট্রাস্ট লাইট মোড</span>
                      {theme === "light" && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black">সক্রিয়</span>}
                      {settings.defaultTheme === "light" && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-amber-500 text-amber-600 font-black">ডিফল্ট</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed font-medium">
                      সফট স্লেট ব্যাকগ্রাউন্ড ও উন্নত কনট্রাস্টের সাদা কার্ড। দিনের আলোতে চোখের জন্য আরামদায়ক ও সর্বোচ্চ স্পষ্ট।
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTheme("dark");
                    handleChange("defaultTheme", "dark");
                  }}
                  className={`p-5 rounded-2xl border text-left flex items-start gap-4 transition-all cursor-pointer ${
                    theme === "dark"
                      ? "border-amber-500 bg-amber-500/10 shadow-md ring-2 ring-amber-500/20"
                      : isLight
                      ? "border-slate-300 bg-white hover:border-slate-400 shadow-xs"
                      : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                  }`}
                >
                  <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 shrink-0">
                    <Moon className="w-6 h-6 fill-amber-400" />
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span>🌙 স্লিক রয়্যাল ডার্ক মোড</span>
                      {theme === "dark" && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black">সক্রিয়</span>}
                      {settings.defaultTheme === "dark" && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-amber-500 text-amber-500 font-black">ডিফল্ট</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed font-medium">
                      গভীর স্লেট ও গোল্ডেন অ্যাকসেন্ট প্যালেট, দীর্ঘ কাজের সময় চোখের চাপ কমাতে আদর্শ।
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </fieldset>

        {/* Global Bottom Save Action */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500 font-medium hidden sm:block">
            * সমস্ত পরিবর্তন ডাটাবেসে <code className="font-mono text-amber-600">SettingModel</code> এ সংরক্ষিত হবে।
          </p>

          <button
            type="submit"
            disabled={disabled}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50 ml-auto"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> সংরক্ষণ হচ্ছে...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> সেটিংস সংরক্ষণ করুন
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
