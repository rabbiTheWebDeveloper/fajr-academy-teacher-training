import Link from "next/link";
import { 
  LayoutDashboard, 
  BookOpen, 
  Video, 
  CreditCard, 
  GraduationCap,
  Sparkles,
  MessageCircle
} from "lucide-react";

export const metadata = {
  title: "TOT Trainee Portal | Fajr Academy",
  description: "Official Training of Trainers (TOT) Learning Management Portal & Dashboard.",
};

export default function TOTLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0F172A] text-slate-100 font-sans selection:bg-amber-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                ف
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-200 bg-clip-text text-transparent">
                  FAJR ACADEMY
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                  TOT Trainee Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Nav Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-full border border-slate-800">
            <Link
              href="/dashboard"
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> ড্যাশবোর্ড
            </Link>
            <Link
              href="/materials"
              className="px-4 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" /> মডিউল ও বুকস
            </Link>
            <Link
              href="/classes"
              className="px-4 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Video className="w-3.5 h-3.5" /> লাইভ ক্লাস
            </Link>
            <Link
              href="/id-card"
              className="px-4 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" /> আইডি কার্ড
            </Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/#apply"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3.5 py-1.5 rounded-lg shadow-md transition-all"
            >
              <GraduationCap className="w-4 h-4" /> নতুন ব্যাচ আবেদন
            </Link>
            <Link
              href="/"
              className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              হোমপেজ
            </Link>
          </div>
        </div>
      </header>

      {/* Main Page Body */}
      <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/80 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Fajr Academy — Training of Trainers (TOT) Program. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Authorized Teacher Certification
            </span>
            <span>•</span>
            <a href="https://wa.me/8801410764581" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" /> সাপোর্ট হেল্পলাইন
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
