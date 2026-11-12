import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

/** Shared shell (background, header, footer) for /login, /forgot-password and /reset-password. */
export default function AuthLayout({ children }) {
  return (
    <div
      className="min-h-screen relative text-white selection:bg-amber-500 selection:text-white bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/login-bg.jpg')" }}
    >
      {/* Cinematic dark ambient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050D1E]/90 via-[#061228]/65 to-[#030914]/95 pointer-events-none" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="p-4 sm:p-6 lg:px-8 max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3 group min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/fajr-logo.png"
              alt="Fajr Academy"
              className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-xl object-cover shadow-lg border border-[#C59B27]/50 group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white font-serif">
                FAJR ACADEMY
              </span>
              <span className="text-[10px] sm:text-[11px] uppercase font-extrabold tracking-wider text-[#F59E0B] truncate">
                Teacher Training Portal
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="shrink-0 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white transition-colors flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> হোমপেজ
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-6 sm:p-6">{children}</main>

        <footer className="p-4 sm:p-6 max-w-7xl mx-auto w-full text-xs text-slate-400 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Fajr Academy. All rights reserved.</p>
          <span className="flex items-center gap-1.5 text-emerald-400/90 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> নিরাপদ ও এনক্রিপ্টেড সংযোগ
          </span>
        </footer>
      </div>
    </div>
  );
}
