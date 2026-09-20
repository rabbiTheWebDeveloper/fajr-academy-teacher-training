import Link from "next/link";
import InstructorNavClient from "./InstructorNavClient";
import {
  Sparkles,
  ShieldCheck,
  Radio,
  GraduationCap
} from "lucide-react";

export const metadata = {
  title: "TOT ইনস্ট্রাক্টর পোর্টাল | ফজর একাডেমি",
  description: "ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) সিনিয়র ইনস্ট্রাক্টর ও মাস্টার ট্রেইনার সেন্ট্রাল কনসোল।",
};

export default function InstructorLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#070A12] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white antialiased">
      {/* Background ambient lighting effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-purple-600/8 blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-emerald-600/6 blur-[130px]" />
      </div>

      {/* Top Header Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0A0E1A]/85 backdrop-blur-xl border-b border-indigo-950/60 px-4 sm:px-6 lg:px-8 py-3 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo & Portal Title */}
          <div className="flex items-center gap-3">
            <Link href="/instructor" className="flex items-center gap-2.5 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/fajr-logo.png"
                alt="Fajr Academy"
                className="w-10 h-10 rounded-2xl object-cover shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-all border border-indigo-500/30"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                    FAJR ACADEMY
                  </span>
                  <span className="hidden sm:inline-block text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    TOT FACULTY
                  </span>
                </div>
                <span className="text-[10px] tracking-wider text-slate-400 font-medium hidden xs:inline-block">
                  Senior Trainer Central Hub
                </span>
              </div>
            </Link>
          </div>

          {/* Interactive Navigation links (Client Component with Path Detection) */}
          <InstructorNavClient />

          {/* Right Action Bar */}
          <div className="hidden sm:flex items-center gap-2.5">
            <Link
              href="/instructor/live"
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>লাইভ রুম</span>
            </Link>

            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> MASTER TRAINER
            </span>

            <Link
              href="/dashboard"
              className="text-xs font-medium text-slate-400 hover:text-white transition-colors bg-slate-900/90 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-full"
            >
              টিচার ভিউ →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Page Body */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900/80 bg-[#05070D]/90 py-8 px-4 text-center text-xs text-slate-500 mt-12 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            <p>© 2026 Fajr Academy — Training of Trainers (TOT) Senior Faculty Panel.</p>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Empowering Next-Gen Teachers
            </span>
            <span>•</span>
            <Link href="/api/auth/logout" className="hover:text-rose-400 font-semibold transition-colors">
              লগআউট
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
