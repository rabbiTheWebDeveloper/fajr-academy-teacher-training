import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Video,
  ClipboardCheck,
  FileSpreadsheet,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  MessageSquare
} from "lucide-react";

export const metadata = {
  title: "TOT ইনস্ট্রাক্টর পোর্টাল | ফজর একাডেমি",
  description: "ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) সিনিয়র ইনস্ট্রাক্টর ও ট্রেইনার ড্যাশবোর্ড।",
};

export default function InstructorLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#0B0F19]/90 backdrop-blur-md border-b border-indigo-950/80 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/instructor" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-400 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                ف
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  FAJR ACADEMY
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">
                  TOT Senior Instructor Hub
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Nav Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-full border border-indigo-900/40">
            <Link
              href="/instructor"
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> ওভারভিউ
            </Link>
            <Link
              href="/instructor/trainees"
              className="px-4 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" /> ট্রেইনি তালিকা
            </Link>
            <Link
              href="/instructor/evaluations"
              className="px-4 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <ClipboardCheck className="w-3.5 h-3.5" /> মূল্যায়ন ও গ্রেডিং
            </Link>
            <Link
              href="/classes"
              className="px-4 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Video className="w-3.5 h-3.5" /> লাইভ ক্লাস লিঙ্ক
            </Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> MASTER TRAINER
            </span>
            <Link
              href="/dashboard"
              className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              টিচার ভিউ →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Page Body */}
      <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#070A11] py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Fajr Academy — Training of Trainers (TOT) Faculty Panel.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Authorized Trainer Access
            </span>
            <span>•</span>
            <Link href="/api/auth/logout" className="hover:text-rose-400 font-semibold">
              লগআউট
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
