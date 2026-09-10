'use client';

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Sparkles,
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
  const [defaultPwdNotice, setDefaultPwdNotice] = useState(false);

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
      setErrorMsg("নেটওয়ার্ক সংযোগ ত্রুটি। দয়া করে আপনার ইন্টারনেট চেক করে আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  const handleUseDefaultPassword = () => {
    setPassword("Fajr@Teacher2026");
    setDefaultPwdNotice(true);
    setTimeout(() => setDefaultPwdNotice(false), 4000);
  };

  return (
    <div className="w-full max-w-[430px] mx-auto">
      {/* Card Container */}
      <div className="bg-[#071328]/85 border border-slate-700/50 rounded-3xl p-7 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/60 relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Content */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-amber-500/40 bg-amber-950/30 text-[#F59E0B] text-xs font-semibold shadow-inner">
            <span>🎓</span>
            <span>TOT Trainee Login</span>
          </div>

          <h1 className="text-2xl sm:text-[26px] font-black text-white tracking-tight mt-3 mb-1.5">
            টিচার ট্রেইনি লগইন
          </h1>

          <p className="text-xs text-slate-300/85 font-medium leading-relaxed">
            আপনার নির্ধারিত ইউজার (ইমেইল) ও পাসওয়ার্ড দিয়ে লগইন করুন
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5 mb-4 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMsg}</div>
          </div>
        )}

        {/* Default Password Copied Alert */}
        {defaultPwdNotice && (
          <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 mb-4 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>ডিফল্ট পাসওয়ার্ড <strong className="text-white font-mono">Fajr@Teacher2026</strong> বসানো হয়েছে!</span>
          </div>
        )}

        {/* Unpaid Alert */}
        {unpaidInfo && (
          <div className="p-4 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-200 text-xs space-y-3 mb-4 animate-fadeIn">
            <div className="flex items-start gap-2">
              <CreditCard className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-300">পেমেন্ট পেন্ডিং রয়েছে!</p>
                <p className="text-slate-300 mt-1 leading-relaxed">{unpaidInfo.message}</p>
              </div>
            </div>

            <Link
              href={`/payment/ssl-checkout?tran_id=${unpaidInfo.tranId || "TOT-PENDING"}&amount=1000&email=${unpaidInfo.email || ""}`}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              ৳ ১,০০০ পেমেন্ট সম্পন্ন করুন <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email / Mobile Field */}
          <div className="space-y-1.5">
            <label className="text-[11px] sm:text-xs font-bold text-slate-200 block">
              ইমেইল অথবা মোবাইল নম্বর
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin@fajracademy.io"
                className="w-full bg-white text-slate-900 placeholder-slate-400 rounded-xl px-4 py-3 pl-10 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all shadow-sm"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Mail className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] sm:text-xs font-bold text-slate-200 block">
                পাসওয়ার্ড
              </label>
              <button
                type="button"
                onClick={handleUseDefaultPassword}
                className="text-[11px] text-[#F59E0B] hover:text-amber-300 font-semibold transition-colors cursor-pointer"
              >
                ডিফল্ট পাসওয়ার্ড জানতে ক্লিক
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-white text-slate-900 placeholder-slate-400 rounded-xl px-4 py-3 pl-10 pr-10 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all shadow-sm"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#e67e00] via-[#f59e0b] to-[#d97706] hover:brightness-110 active:scale-[0.99] text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 transition-all disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                লগইন হচ্ছে...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                লগইন করুন <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </span>
            )}
          </button>
        </form>

        {/* Bottom Links */}
        <div className="flex items-center justify-between text-xs pt-6 mt-4 border-t border-slate-700/40">
          <Link
            href="/#apply"
            className="text-[#10B981] hover:underline font-bold transition-colors"
          >
            নতুন আবেদন করুন
          </Link>
          <a
            href="https://wa.me/8801410764581?text=Login%20Help%20Fajr%20TOT"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#F59E0B] hover:underline font-bold transition-colors"
          >
            সাপোর্ট হেল্পলাইন
          </a>
        </div>
      </div>
    </div>
  );
}

