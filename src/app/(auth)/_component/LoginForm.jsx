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
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectParam = searchParams.get("redirect") || "";
  const reasonParam = searchParams.get("reason") || "";
  const paymentParam = searchParams.get("payment") || "";

  const [identifier, setIdentifier] = useState(
    searchParams.get("email") || searchParams.get("phone") || ""
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [unpaidInfo, setUnpaidInfo] = useState(null);
  const isDev = process.env.NODE_ENV !== "production";

  // Quick dev credential helper
  const fillDevCredentials = (type) => {
    setErrorMsg("");
    setUnpaidInfo(null);
    if (type === "instructor") {
      setIdentifier("instructor.men@fajracademy.io");
      setPassword("Fajr@Instructor2026");
    } else if (type === "admin") {
      setIdentifier("admin@fajracademy.io");
      setPassword("Fajr@Admin2026");
    } else {
      setIdentifier("teacher.men@fajracademy.io");
      setPassword("Fajr@Teacher2026");
    }
  };

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
        // Safe redirect check: ensure destination matches the user's role access
        const safeRedirect =
          redirectParam &&
          redirectParam.startsWith("/") &&
          !redirectParam.startsWith("//") &&
          !redirectParam.startsWith("/\\")
            ? redirectParam
            : null;

        let targetUrl = data.redirectUrl || "/dashboard";

        if (safeRedirect) {
          const isAdminPath = safeRedirect.startsWith("/admin");
          const isInstructorPath = safeRedirect.startsWith("/instructor");
          const isTraineePath = !isAdminPath && !isInstructorPath;

          const role = data.user?.role;
          const isUserAdmin = role === "admin" || role === "super-admin";
          const isUserInstructor = role === "instructor" || isUserAdmin;
          const isUserTrainee = ["teacher", "student", "participant"].includes(role);

          if (isAdminPath && isUserAdmin) {
            targetUrl = safeRedirect;
          } else if (isInstructorPath && isUserInstructor) {
            targetUrl = safeRedirect;
          } else if (isTraineePath && isUserTrainee) {
            targetUrl = safeRedirect;
          }
        }

        router.push(targetUrl);
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

  return (
    <div className="w-full max-w-[430px] mx-auto">
      {/* Card Container */}
      <div className="bg-[#071328]/90 border border-slate-700/60 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/70 relative overflow-hidden transition-all">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Content */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-amber-500/40 bg-amber-950/30 text-[#F59E0B] text-xs font-semibold shadow-inner">
            <span>🔐</span>
            <span>FAJR ACADEMY PORTAL</span>
          </div>

          <h1 className="text-2xl sm:text-[26px] font-black text-white tracking-tight mt-3 mb-1.5 font-serif">
            অ্যাকাউন্টে লগইন করুন
          </h1>

          <p className="text-xs text-slate-300/85 font-medium leading-relaxed">
            আপনার নির্ধারিত ইমেইল বা মোবাইল নম্বর এবং পাসওয়ার্ড দিয়ে প্রবেশ করুন
          </p>

          <div className="flex items-center justify-center gap-2 mt-3 text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1 text-emerald-400">🎓 ট্রেইনি</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-indigo-400">👨‍🏫 ইনস্ট্রাক্টর</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-amber-400">🛡️ অ্যাডমিন</span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5 mb-4 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMsg}</div>
          </div>
        )}

        {/* Redirect Notice Banners */}
        {redirectParam.startsWith("/admin") && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5 mb-4 animate-fadeIn">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">
              <strong className="text-amber-200 block mb-0.5">অ্যাডমিন এক্সেস সংরক্ষিত</strong>
              প্রশাসনিক প্যানেল দেখতে অনুগ্রহ করে আপনার অ্যাডমিন অ্যাকাউন্টে লগইন করুন।
            </div>
          </div>
        )}

        {redirectParam.startsWith("/instructor") && (
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-xs flex items-start gap-2.5 mb-4 animate-fadeIn">
            <UserCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">
              <strong className="text-indigo-200 block mb-0.5">ইনস্ট্রাক্টর কনসোল এক্সেস</strong>
              ক্লাস মূল্যায়ন ও ট্রেইনার কনসোল দেখতে ইনস্ট্রাক্টর অ্যাকাউন্টে লগইন করুন।
            </div>
          </div>
        )}

        {reasonParam === "session_expired" && (
          <div className="p-3 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2 mb-4 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>আপনার পূর্ববর্তী সেশনের মেয়াদ শেষ হয়েছে। পুনরায় লগইন করুন।</span>
          </div>
        )}

        {reasonParam === "account_disabled" && (
          <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2 mb-4 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>এই অ্যাডমিন অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে বা আর নেই। সুপার-অ্যাডমিনের সাথে যোগাযোগ করুন।</span>
          </div>
        )}

        {/* Returned from the gateway after a verified payment */}
        {paymentParam === "success" && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2.5 mb-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>পেমেন্ট সফলভাবে যাচাই হয়েছে! আপনার ইমেইল ও রেজিস্ট্রেশনের পাসওয়ার্ড দিয়ে লগইন করুন।</span>
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
              href={`/payment/ssl-checkout?email=${encodeURIComponent(unpaidInfo.email || "")}`}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              কোর্স ফি পরিশোধ করুন <ArrowRight className="w-3.5 h-3.5" />
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
                placeholder="017xxxxxxxx বা user@fajracademy.io"
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
              <span className="text-[11px] text-slate-400">
                আপনার অ্যাকাউন্টের পাসওয়ার্ড
              </span>
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
            className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#b45309] text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                যাচাই করা হচ্ছে...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                লগইন করুন <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </span>
            )}
          </button>
        </form>

        {/* Development Quick-Fill Helper */}
        {isDev && (
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1.5 flex items-center justify-between">
              <span>Quick Demo Fill (Dev):</span>
              <span className="text-[9px] text-slate-500">Local Seed Only</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => fillDevCredentials("tot")}
                className="py-1 px-1.5 rounded-md bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 hover:bg-emerald-900/60 font-semibold text-center transition-colors cursor-pointer"
              >
                🎓 Trainee
              </button>
              <button
                type="button"
                onClick={() => fillDevCredentials("instructor")}
                className="py-1 px-1.5 rounded-md bg-indigo-950/60 border border-indigo-800/40 text-indigo-300 hover:bg-indigo-900/60 font-semibold text-center transition-colors cursor-pointer"
              >
                👨‍🏫 Instructor
              </button>
              <button
                type="button"
                onClick={() => fillDevCredentials("admin")}
                className="py-1 px-1.5 rounded-md bg-amber-950/60 border border-amber-800/40 text-amber-300 hover:bg-amber-900/60 font-semibold text-center transition-colors cursor-pointer"
              >
                🛡️ Admin
              </button>
            </div>
          </div>
        )}

        {/* Bottom Links */}
        <div className="flex items-center justify-between text-xs pt-5 mt-4 border-t border-slate-700/50">
          <Link
            href="/#register"
            className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
          >
            নতুন আবেদন করুন
          </Link>
          <a
            href="https://wa.me/8801410764581?text=Login%20Help%20Fajr%20TOT"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:text-amber-300 hover:underline font-bold transition-colors"
          >
            সাপোর্ট হেল্পলাইন
          </a>
        </div>
      </div>
    </div>
  );
}
