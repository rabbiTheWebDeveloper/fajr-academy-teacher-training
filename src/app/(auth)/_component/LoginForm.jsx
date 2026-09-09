'use client';

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  HelpCircle,
  CreditCard,
  CheckCircle2,
} from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultIdentifier = searchParams.get("email") || searchParams.get("phone") || "";

  const [identifier, setIdentifier] = useState(defaultIdentifier);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [unpaidInfo, setUnpaidInfo] = useState(null);
  const [useTrxMode, setUseTrxMode] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setUnpaidInfo(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push(data.redirectUrl || "/dashboard");
        router.refresh();
      } else {
        if (data.isUnpaid) {
          setUnpaidInfo({
            tranId: data.tranId,
            email: data.email,
            message: data.message,
          });
        } else {
          setErrorMsg(data.message || "লগইন ব্যর্থ হয়েছে। অনুগ্রহ করে তথ্য পুনরায় যাচাই করুন।");
        }
      }
    } catch (err) {
      setErrorMsg("নেটওয়ার্ক সংযোগ ত্রুটি। দয়া করে আপনার ইন্টারনেট চেক করে আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  const handleUseDefaultPassword = () => {
    setPassword("Fajr@Teacher2026");
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Form Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-2 mb-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            TOT Trainee Login
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            টিচার পোর্টালে লগইন
          </h2>
          <p className="text-xs text-slate-400">
            আপনার নিবন্ধিত ইমেইল/মোবাইল ও পাসওয়ার্ড দিয়ে প্রবেশ করুন
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5 mb-5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMsg}</div>
          </div>
        )}

        {/* Unpaid Alert with Direct Payment link */}
        {unpaidInfo && (
          <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs space-y-3 mb-5 animate-fadeIn">
            <div className="flex items-start gap-2">
              <CreditCard className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-300">পেমেন্ট পেন্ডিং রয়েছে!</p>
                <p className="text-slate-300 mt-1 leading-relaxed">{unpaidInfo.message}</p>
              </div>
            </div>

            <Link
              href={`/payment/ssl-checkout?tran_id=${unpaidInfo.tranId || "TOT-PENDING"}&amount=1000&email=${unpaidInfo.email || ""}`}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              ৳ ১,০০০ পেমেন্ট সম্পন্ন করুন <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Identifier Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              {useTrxMode ? "ট্রানজেকশন আইডি (TrxID)" : "ইমেইল অথবা মোবাইল নম্বর"}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={useTrxMode ? "TOT-17415..." : "01XXXXXXXXX অথবা example@mail.com"}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 pl-10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-sans"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                {useTrxMode ? <CreditCard className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
              </div>
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 block">
                {useTrxMode ? "পুনরায় TrxID অথবা পাসওয়ার্ড" : "পাসওয়ার্ড"}
              </label>
              <button
                type="button"
                onClick={handleUseDefaultPassword}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
              >
                ডিফল্ট পাসওয়ার্ড ব্যবহার করুন
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="আপনার পাসওয়ার্ড লিখুন"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 pl-10 pr-10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                লগইন হচ্ছে...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                ড্যাশবোর্ডে প্রবেশ করুন <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        {/* Quick Helper Notes */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-3">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-300">পাসওয়ার্ড ভুলে গেছেন?</strong>
              <p className="mt-0.5">
                রেজিস্ট্রেশনের সময় আলাদা পাসওয়ার্ড না দিয়ে থাকলে আপনার ডিফল্ট পাসওয়ার্ড:{" "}
                <code className="bg-slate-900 text-amber-400 px-1 py-0.5 rounded font-mono">
                  Fajr@Teacher2026
                </code>{" "}
                অথবা আপনার মোবাইল নম্বরের শেষ ৬ ডিজিট।
              </p>
            </div>
          </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <Link href="/#apply" className="text-emerald-400 hover:underline font-semibold">
              নতুন আবেদন করুন
            </Link>
            <a
              href="https://wa.me/8801410764581?text=Login%20Help%20Fajr%20TOT"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline"
            >
              সাপোর্ট হেল্পলাইন
            </a>
          </div>
        </div>

        {/* 1-Click Demo / Seed Login Panel */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              ১-ক্লিক ডেমো লগইন:
            </span>
            <button
              type="button"
              onClick={async () => {
                try {
                  const res = await fetch("/api/seed");
                  const d = await res.json();
                  alert(d.message || "সিড সম্পন্ন!");
                } catch {
                  alert("সিডিং কল ব্যর্থ");
                }
              }}
              className="text-[10px] font-bold text-amber-400 hover:underline cursor-pointer"
            >
              ⚡ ডাটাবেজ সিড করুন
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setIdentifier("admin@fajracademy.io");
                setPassword("Fajr@Admin2026");
              }}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-left transition-all"
            >
              <div className="font-bold text-amber-400">👑 অ্যাডমিন (Admin)</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">admin@fajracademy.io</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setIdentifier("instructor.men@fajracademy.io");
                setPassword("Fajr@Instructor2026");
              }}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-left transition-all"
            >
              <div className="font-bold text-indigo-400">👨 ইনস্ট্রাক্টর (Men)</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">instructor.men@...</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setIdentifier("teacher.men@fajracademy.io");
                setPassword("Fajr@Teacher2026");
              }}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 text-left transition-all"
            >
              <div className="font-bold text-blue-400">🎓 ট্রেইনি (Men Track)</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">teacher.men@...</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setIdentifier("teacher.women@fajracademy.io");
                setPassword("Fajr@Teacher2026");
              }}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-left transition-all"
            >
              <div className="font-bold text-emerald-400">🧕 ট্রেইনি (Women 014)</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">teacher.women@...</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
