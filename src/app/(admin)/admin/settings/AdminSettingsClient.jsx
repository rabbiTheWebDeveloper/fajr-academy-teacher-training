'use client';

import React, { useState } from "react";
import {
  Settings,
  CreditCard,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  Lock,
  Globe,
  Award,
  Sun,
  Moon,
  RotateCcw,
  RefreshCw,
  Copy,
  Check,
  Eye,
  EyeOff,
  Bell,
  Sliders,
  Sparkles,
  Layers,
  Database
} from "lucide-react";
import { useAdminTheme } from "../../AdminThemeContext";

export default function AdminSettingsClient({ initialSettings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [activeTab, setActiveTab] = useState("pricing");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const { theme, setTheme, isLight } = useAdminTheme();

  const handleChange = (field, val) => {
    setSettings((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSaveSuccess(data.message || "সেটিংস ডাটাবেসে সফলভাবে আপডেট হয়েছে!");
        if (data.settings) setSettings(data.settings);
        setTimeout(() => setSaveSuccess(null), 4000);
      } else {
        setSaveError(data.message || "সংরক্ষণ ব্যর্থ হয়েছে");
        setTimeout(() => setSaveError(null), 5000);
      }
    } catch (err) {
      setSaveError("সার্ভার ত্রুটি: সেটিংস সংরক্ষণ করা যায়নি");
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm("আপনি কি নিশ্চিত যে সমস্ত সেটিংস ডিফল্ট মানে রিসেট করতে চান?")) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSettings(data.settings);
        setSaveSuccess("ডিফল্ট সেটিংস সফলভাবে পুনরুদ্ধার করা হয়েছে!");
        setTimeout(() => setSaveSuccess(null), 4000);
      }
    } catch (err) {
      setSaveError("রিসেট ব্যর্থ হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const tabs = [
    { id: "pricing", label: "কোর্স ও ভর্তি ফি", icon: CreditCard, count: "৩টি কনফিগ" },
    { id: "gateway", label: "পেমেন্ট গেটওয়ে", icon: ShieldCheck, count: "SSLCommerz" },
    { id: "support", label: "যোগাযোগ ও সাপোর্ট", icon: Phone, count: "হেল্পলাইন" },
    { id: "security", label: "সিস্টেম ও নিরাপত্তা", icon: Lock, count: "অ্যালার্ট" },
    { id: "theme", label: "থিম ও ডিসপ্লে", icon: Sun, count: isLight ? "লাইট মোড" : "ডার্ক মোড" },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 border ${
              isLight
                ? "bg-amber-100 text-amber-900 border-amber-300"
                : "bg-amber-500/10 border-amber-500/30 text-amber-300"
            }`}
          >
            <Database className="w-3.5 h-3.5 text-amber-500" />
            MongoDB Persisted Config System
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-black tracking-tight ${
              isLight ? "text-slate-900" : "text-white"
            }`}
          >
            গ্লোবাল সিস্টেম সেটিংস ও মডেল কনফিগারেশন
          </h1>
          <p className={`text-xs sm:text-sm mt-1 font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
            কোর্স ফি, SSLCommerz গেটওয়ে, হেল্পলাইন, নোটিফিকেশন ও থিম লাইভ নিয়ন্ত্রণ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={saving}
            className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              isLight
                ? "bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-xs"
                : "bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300"
            }`}
            title="ডিফল্ট সেটিংসে ফিরিয়ে নিন"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">রিসেট</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
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

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {saveError && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Tabs Bar */}
      <div
        className={`flex items-center gap-1.5 p-1.5 rounded-2xl border overflow-x-auto ${
          isLight ? "bg-white border-slate-200 shadow-xs" : "bg-slate-900 border-slate-800"
        }`}
      >
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
        {/* TAB 1: PRICING & ADMISSION */}
        {activeTab === "pricing" && (
          <div
            className={`p-6 sm:p-8 rounded-3xl border space-y-6 transition-all ${
              isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900 border-slate-800 shadow-xl"
            }`}
          >
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
                {settings.admissionStatus === "open" ? "● ভর্তি চলছে (OPEN)" : "● ভর্তি স্থগিত"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
              <div>
                <label className={`block font-bold mb-1.5 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                  অফার কোর্স ফি (BDT) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={settings.coursePrice}
                    onChange={(e) => handleChange("coursePrice", e.target.value)}
                    className="w-full font-mono font-bold px-3 py-2.5 rounded-xl border text-sm"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    ৳
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">পেমেন্ট গেটওয়েতে এই পরিমাণটি চার্জ করা হবে।</p>
              </div>

              <div>
                <label className={`block font-bold mb-1.5 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                  রেগুলার ফি (স্ট্রাইকথ্রু মূল্য)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={settings.regularCoursePrice}
                    onChange={(e) => handleChange("regularCoursePrice", e.target.value)}
                    className="w-full font-mono px-3 py-2.5 rounded-xl border text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    ৳
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">মার্কেটিং পৃষ্ঠায় ডিসকাউন্ট হিসেবে দৃশ্যমান হবে।</p>
              </div>

              <div>
                <label className={`block font-bold mb-1.5 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                  ভর্তি স্ট্যাটাস
                </label>
                <select
                  value={settings.admissionStatus}
                  onChange={(e) => handleChange("admissionStatus", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold"
                >
                  <option value="open">Open (ভর্তি চালু রয়েছে)</option>
                  <option value="closed">Closed (ভর্তি বন্ধ)</option>
                  <option value="waitlist">Waitlist (ওয়েটিং লিস্ট)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={`block font-bold mb-1.5 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                  বর্তমান ব্যাচের নাম ও ট্র্যাক
                </label>
                <input
                  type="text"
                  value={settings.currentBatch}
                  onChange={(e) => handleChange("currentBatch", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border text-xs font-medium"
                  placeholder="যেমন: TOT Batch 014 (September 2026)"
                />
              </div>

              <div>
                <label className={`block font-bold mb-1.5 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                  সর্বোচ্চ শিক্ষার্থী কোটা
                </label>
                <input
                  type="number"
                  value={settings.maxSeatsPerBatch}
                  onChange={(e) => handleChange("maxSeatsPerBatch", e.target.value)}
                  className="w-full font-mono px-3 py-2.5 rounded-xl border text-xs"
                />
              </div>

              <div>
                <label className={`block font-bold mb-1.5 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                  সার্টিফিকেট নম্বর প্রিফিক্স
                </label>
                <input
                  type="text"
                  value={settings.certificatePrefix}
                  onChange={(e) => handleChange("certificatePrefix", e.target.value)}
                  className="w-full font-mono px-3 py-2.5 rounded-xl border text-xs"
                  placeholder="FJR-TOT-2026"
                />
              </div>

              <div>
                <label className={`block font-bold mb-1.5 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                  ওরিয়েন্টেশন তারিখ
                </label>
                <input
                  type="text"
                  value={settings.orientationDate}
                  onChange={(e) => handleChange("orientationDate", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border text-xs"
                  placeholder="২০ সেপ্টেম্বর ২০২৬"
                />
              </div>

              <div>
                <label className={`block font-bold mb-1.5 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                  ক্লাস / ওরিয়েন্টেশন সময়
                </label>
                <input
                  type="text"
                  value={settings.orientationTime}
                  onChange={(e) => handleChange("orientationTime", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border text-xs"
                  placeholder="রাত ৮:০০ টা – ৯:৩০ টা"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PAYMENT GATEWAY (SSLCOMMERZ) */}
        {activeTab === "gateway" && (
          <div
            className={`p-6 sm:p-8 rounded-3xl border space-y-6 transition-all ${
              isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900 border-slate-800 shadow-xl"
            }`}
          >
            <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
              <div>
                <h3 className={`text-base font-black flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                  <ShieldCheck className="w-5 h-5 text-emerald-500" /> SSLCommerz গেটওয়ে ও মোবাইল ব্যাংকিং
                </h3>
                <p className={`text-xs mt-1 font-medium ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                  SSLCommerz স্টোর ক্রেডেনশিয়াল, আইপিএন ওয়েবহুক ও অটো-ভেরিফিকেশন
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  settings.sslcommerzMode === "live"
                    ? isLight
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : isLight
                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}
              >
                {settings.sslcommerzMode === "live" ? "🟢 Live Gateway" : "🟡 Sandbox Mode"}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div>
                <label className={`block font-bold mb-1.5 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                  গেটওয়ে মোড (Gateway Mode)
                </label>
                <select
                  value={settings.sslcommerzMode}
                  onChange={(e) => handleChange("sslcommerzMode", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold"
                >
                  <option value="live">Live (প্রোডাকশন পেমেন্ট মোড)</option>
                  <option value="sandbox">Sandbox (টেস্টিং মোড)</option>
                </select>
              </div>

              <div>
                <label className={`block font-bold mb-1.5 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                  SSLCommerz Store ID
                </label>
                <input
                  type="text"
                  value={settings.sslStoreId}
                  onChange={(e) => handleChange("sslStoreId", e.target.value)}
                  className="w-full font-mono font-bold px-3 py-2.5 rounded-xl border text-xs"
                  placeholder="fajra6aa249a39ddb2"
                />
              </div>

              <div className="sm:col-span-2">
                <label className={`block font-bold mb-1.5 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                  SSLCommerz Store Password / Secret Key
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={settings.sslStorePassword}
                    onChange={(e) => handleChange("sslStorePassword", e.target.value)}
                    className="w-full font-mono px-3 py-2.5 pr-10 rounded-xl border text-xs"
                    placeholder="fajra6aa249a39ddb2@ssl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className={`block font-bold mb-1.5 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                  bKash মার্চেন্ট হেল্পলাইন / নাম্বার
                </label>
                <input
                  type="text"
                  value={settings.bkashMerchantNumber}
                  onChange={(e) => handleChange("bkashMerchantNumber", e.target.value)}
                  className="w-full font-mono px-3 py-2.5 rounded-xl border text-xs"
                />
              </div>

              <div>
                <label className={`block font-bold mb-1.5 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                  Nagad মার্চেন্ট নাম্বার
                </label>
                <input
                  type="text"
                  value={settings.nagadMerchantNumber}
                  onChange={(e) => handleChange("nagadMerchantNumber", e.target.value)}
                  className="w-full font-mono px-3 py-2.5 rounded-xl border text-xs"
                />
              </div>

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
                  <code className="text-[11px] text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">
                    /api/payment/sslcommerz/ipn
                  </code>
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
                  <span>{copiedField === "ipn" ? "কপি হয়েছে" : "URL কপি করুন"}</span>
                </button>
              </div>

              {/* Auto Approve Toggle */}
              <div className="sm:col-span-2 flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="autoApprovePayment"
                  checked={settings.autoApprovePayment}
                  onChange={(e) => handleChange("autoApprovePayment", e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300 cursor-pointer"
                />
                <label htmlFor="autoApprovePayment" className={`text-xs font-bold cursor-pointer ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                  ভ্যালিড SSLCommerz পেমেন্টে স্বয়ংক্রিয়ভাবে একাউন্ট সক্রিয় (Auto-Approve) করুন
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SUPPORT & CONTACT */}
        {activeTab === "support" && (
          <div
            className={`p-6 sm:p-8 rounded-3xl border space-y-6 transition-all ${
              isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900 border-slate-800 shadow-xl"
            }`}
          >
            <div className="border-b pb-4 border-slate-200 dark:border-slate-800">
              <h3 className={`text-base font-black flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                <Phone className="w-5 h-5 text-blue-500" /> হেল্পলাইন, সাপোর্ট ও কমিউনিটি তথ্য
              </h3>
              <p className={`text-xs mt-1 font-medium ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                শিক্ষার্থীদের জন্য ফ্লোটিং হোয়াটসঅ্যাপ বাটন, ফোন ও ইমেইল সহায়তা লিঙ্ক
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div>
                <label className={`block font-bold mb-1.5 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                  সাপোর্ট হেল্পলাইন ফোন *
                </label>
                <input
                  type="text"
                  value={settings.helplinePhone}
                  onChange={(e) => handleChange("helplinePhone", e.target.value)}
                  className="w-full font-mono px-3 py-2.5 rounded-xl border text-xs font-bold"
                  placeholder="01410764581"
                />
              </div>

              <div>
                <label className={`block font-bold mb-1.5 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                  অফিসিয়াল সাপোর্ট ইমেইল *
                </label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => handleChange("supportEmail", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border text-xs"
                  placeholder="support@fajracademy.io"
                />
              </div>

              <div className="sm:col-span-2">
                <label className={`block font-bold mb-1.5 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                  WhatsApp ডিরেক্ট সাপোর্ট লিঙ্ক
                </label>
                <input
                  type="text"
                  value={settings.whatsappSupport}
                  onChange={(e) => handleChange("whatsappSupport", e.target.value)}
                  className="w-full font-mono px-3 py-2.5 rounded-xl border text-xs"
                  placeholder="https://wa.me/8801410764581"
                />
                <p className="text-[11px] text-slate-400 mt-1">ল্যান্ডিং পেজের ফ্লোটিং চ্যাট বাটনে এই লিঙ্কটি কাজ করবে।</p>
              </div>

              <div className="sm:col-span-2">
                <label className={`block font-bold mb-1.5 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                  WhatsApp ট্রেইনি কমিউনিটি গ্রুপ লিঙ্ক
                </label>
                <input
                  type="text"
                  value={settings.whatsappCommunityGroup}
                  onChange={(e) => handleChange("whatsappCommunityGroup", e.target.value)}
                  className="w-full font-mono px-3 py-2.5 rounded-xl border text-xs"
                  placeholder="https://chat.whatsapp.com/tot-fajr-community"
                />
              </div>

              <div className="sm:col-span-2">
                <label className={`block font-bold mb-1.5 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                  অ্যাকাডেমির প্রাতিষ্ঠানিক ঠিকানা
                </label>
                <input
                  type="text"
                  value={settings.officeAddress}
                  onChange={(e) => handleChange("officeAddress", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border text-xs"
                  placeholder="ঢাকা, বাংলাদেশ"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SYSTEM & SECURITY */}
        {activeTab === "security" && (
          <div
            className={`p-6 sm:p-8 rounded-3xl border space-y-6 transition-all ${
              isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900 border-slate-800 shadow-xl"
            }`}
          >
            <div className="border-b pb-4 border-slate-200 dark:border-slate-800">
              <h3 className={`text-base font-black flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                <Lock className="w-5 h-5 text-purple-500" /> সিস্টেম সেটিংস ও নোটিফিকেশন নিরাপত্তা
              </h3>
              <p className={`text-xs mt-1 font-medium ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                অ্যাডমিন নোটিফিকেশন ইমেইল, রেজিস্ট্রেশন লক ও মেইনটেনেন্স মোড
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className={`block font-bold mb-1.5 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                  অ্যাডমিন অ্যালার্ট ইমেইল (নতুন পেমেন্ট বা এনরোলমেন্টের জন্য)
                </label>
                <input
                  type="email"
                  value={settings.adminNotificationEmail}
                  onChange={(e) => handleChange("adminNotificationEmail", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border text-xs"
                  placeholder="admin@fajracademy.io"
                />
              </div>

              <div
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                }`}
              >
                <div>
                  <span className={`font-bold block text-xs ${isLight ? "text-slate-900" : "text-white"}`}>
                    শিক্ষার্থী রেজিস্ট্রেশন চালু রাখুন (Allow Trainee Registration)
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    বন্ধ থাকলে নতুন প্রার্থীরা রেজিস্ট্রেশন ফর্ম সাবমিট করতে পারবেন না।
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.registrationOpen}
                  onChange={(e) => handleChange("registrationOpen", e.target.checked)}
                  className="w-5 h-5 rounded text-amber-500 focus:ring-amber-400 border-slate-300 cursor-pointer"
                />
              </div>

              <div
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                }`}
              >
                <div>
                  <span className={`font-bold block text-xs ${isLight ? "text-slate-900" : "text-white"}`}>
                    ইমেইল নোটিফিকেশন চালু রাখুন (System Email Alerts)
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    পেমেন্ট ভ্যালিডেশনের পর শিক্ষার্থীকে কনফার্মেশন ইমেইল পাঠানো হবে।
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotificationEnabled}
                  onChange={(e) => handleChange("emailNotificationEnabled", e.target.checked)}
                  className="w-5 h-5 rounded text-amber-500 focus:ring-amber-400 border-slate-300 cursor-pointer"
                />
              </div>

              <div
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  settings.maintenanceMode
                    ? "bg-rose-500/10 border-rose-500/40"
                    : isLight
                    ? "bg-slate-50 border-slate-200"
                    : "bg-slate-950 border-slate-800"
                }`}
              >
                <div>
                  <span
                    className={`font-bold block text-xs ${
                      settings.maintenanceMode
                        ? "text-rose-700 dark:text-rose-400"
                        : isLight
                        ? "text-slate-900"
                        : "text-white"
                    }`}
                  >
                    সিস্টেম মেইনটেনেন্স মোড (Maintenance Mode)
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    চালু থাকলে শুধুমাত্র অ্যাডমিন ছাড়া অন্য ব্যবহারকারীরা সাময়িক নোটিশ দেখতে পাবেন।
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleChange("maintenanceMode", e.target.checked)}
                  className="w-5 h-5 rounded text-rose-600 focus:ring-rose-500 border-slate-300 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: THEME & DISPLAY */}
        {activeTab === "theme" && (
          <div
            className={`p-6 sm:p-8 rounded-3xl border space-y-6 transition-all ${
              isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900 border-slate-800 shadow-xl"
            }`}
          >
            <div className="border-b pb-4 border-slate-200 dark:border-slate-800">
              <h3 className={`text-base font-black flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                <Sun className="w-5 h-5 text-amber-500" /> অ্যাডমিন থিম পছন্দ (Live Theme Switcher)
              </h3>
              <p className={`text-xs mt-1 font-medium ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                হাই-কন্ট্রাস্ট এক্সিকিউটিভ লাইট মোড অথবা স্লিক রয়্যাল ডার্ক মোড নির্বাচন করুন।
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
                    <span>☀️ হাই-কন্ট্রাস্ট লাইট মোড (Default)</span>
                    {theme === "light" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black">
                        সক্রিয়
                      </span>
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
                    {theme === "dark" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black">
                        সক্রিয়
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed font-medium">
                    গভীর স্লেট ও গোল্ডেন অ্যাকসেন্ট প্যালেট, দীর্ঘ কাজের সময় চোখের চাপ কমাতে আদর্শ।
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Global Bottom Save Action */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500 font-medium hidden sm:block">
            * সমস্ত পরিবর্তন ডাটাবেসে <code className="font-mono text-amber-600">SettingModel</code> এ সংরক্ষিত হবে।
          </p>

          <button
            type="submit"
            disabled={saving}
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
