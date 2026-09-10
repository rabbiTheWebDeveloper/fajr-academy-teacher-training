import { Suspense } from "react";
import Link from "next/link";
import LoginForm from "../_component/LoginForm";
import { Sparkles, ShieldCheck, CheckCircle2, Award, Users } from "lucide-react";

export const metadata = {
  title: "টিচার লগইন পোর্টাল | ফজর একাডেমি TOT",
  description: "ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) কোর্সের অফিসিয়াল টিচার লগইন পোর্টাল।",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-white">
      {/* Top Header */}
      <header className="p-4 sm:p-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/fajr-logo.png"
            alt="Fajr Academy"
            className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform border border-amber-500/40"
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-200 bg-clip-text text-transparent">
              FAJR ACADEMY
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
              Teacher Training Division
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          ← হোমপেজ
        </Link>
      </header>

      {/* Main Form Center Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <Suspense fallback={<div className="text-amber-400 text-xs font-bold animate-pulse">পোর্টাল লোড হচ্ছে...</div>}>
          <LoginForm />
        </Suspense>
      </main>

      {/* Bottom Footer Info */}
      <footer className="p-4 sm:p-6 max-w-7xl mx-auto w-full text-center text-xs text-slate-500 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© 2026 Fajr Academy — Authorized Teacher Training Portal.</p>
        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 256-Bit SSL Encrypted
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> TOT Men & Women Batch 014
          </span>
        </div>
      </footer>
    </div>
  );
}
