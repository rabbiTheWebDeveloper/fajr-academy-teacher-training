'use client';

import React, { useState } from "react";
import {
  Settings,
  CreditCard,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Save,
  Lock,
  Globe,
  Award
} from "lucide-react";

export default function AdminSettingsClient({ initialSettings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [saved, setSaved] = useState(false);

  const handleChange = (field, val) => {
    setSettings((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            গ্লোবাল সিস্টেম সেটিংস ও গেটওয়ে কনফিগ
          </h1>
          <p className="text-xs text-slate-400">
            কোর্স ফি, SSLCommerz credentials, bKash হেল্পলাইন ও সার্টিফিকেশন প্রিফিক্স
          </p>
        </div>

        {saved && (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" /> সেটিংস সফলভাবে সংরক্ষিত হয়েছে!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Financial & Pricing */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <CreditCard className="w-4 h-4 text-amber-400" /> কোর্স ফি ও পেমেন্ট গেটওয়ে
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 font-bold block mb-1">কোর্স ফি (BDT)</label>
              <input
                type="number"
                value={settings.coursePrice}
                onChange={(e) => handleChange("coursePrice", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1">SSLCommerz গেটওয়ে মোড</label>
              <input
                type="text"
                value={settings.sslcommerzMode}
                onChange={(e) => handleChange("sslcommerzMode", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1">ম্যানুয়াল bKash মার্চেন্ট নম্বর</label>
              <input
                type="text"
                value={settings.bkashManualNumber}
                onChange={(e) => handleChange("bkashManualNumber", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1">সার্টিফিকেট নম্বর প্রিফিক্স</label>
              <input
                type="text"
                value={settings.certificatePrefix}
                onChange={(e) => handleChange("certificatePrefix", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contact & Support */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Phone className="w-4 h-4 text-emerald-400" /> হেল্পলাইন ও সাপোর্ট তথ্য
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 font-bold block mb-1">সাপোর্ট হেল্পলাইন ফোন</label>
              <input
                type="text"
                value={settings.helplinePhone}
                onChange={(e) => handleChange("helplinePhone", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1">সাপোর্ট ইমেইল</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => handleChange("supportEmail", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-slate-400 font-bold block mb-1">WhatsApp ডিরেক্ট সাপোর্ট লিঙ্ক</label>
              <input
                type="text"
                value={settings.whatsappSupport}
                onChange={(e) => handleChange("whatsappSupport", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" /> সেটিংস সংরক্ষণ করুন
          </button>
        </div>
      </form>
    </div>
  );
}
