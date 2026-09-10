import { Suspense } from "react";
import Link from "next/link";
import LoginForm from "../_component/LoginForm";
import { Sparkles, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "টিচার ট্রেইনি লগইন | ফজর একাডেমি TOT",
  description: "ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) কোর্সের অফিসিয়াল টিচার লগইন পোর্টাল।",
};

export default function LoginPage() {
  return (
    <div
      className="min-h-screen relative flex flex-col justify-between text-white selection:bg-amber-500 selection:text-white bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/login-bg.jpg')",
      }}
    >
      {/* Cinematic dark ambient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050D1E]/75 via-[#061228]/40 to-[#030914]/80 pointer-events-none" />

      <div className="relative z-10 flex flex-col justify-between min-h-screen">
        {/* Top Header */}
        <header className="p-4 sm:p-6 lg:px-8 max-w-7xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/fajr-logo.png"
              alt="Fajr Academy"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover shadow-lg border border-[#C59B27]/50 group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white font-serif">
                FAJR ACADEMY
              </span>
              <span className="text-[10px] sm:text-[11px] uppercase font-extrabold tracking-wider text-[#F59E0B]">
                TEACHER TRAINING DIVISION
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="text-xs sm:text-sm font-semibold text-blue-200/90 hover:text-white transition-colors flex items-center gap-1.5"
          >
            ← হোমপেজ
          </Link>
        </header>

        {/* Main Form Center Area */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
          <Suspense fallback={<div className="text-amber-400 text-xs font-bold animate-pulse">পোর্টাল লোড হচ্ছে...</div>}>
            <LoginForm />
          </Suspense>
        </main>

        {/* Bottom Footer Info */}
        <footer className="p-4 sm:p-6 max-w-7xl mx-auto w-full text-xs text-slate-300/80 border-t border-slate-700/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Fajr Academy — Authorized Teacher Training Portal.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 256-Bit SSL Encrypted
            </span>
            <span className="text-slate-500">•</span>
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> TOT Men &amp; Women Batch 014
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}

