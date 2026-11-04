import Link from "next/link";
import TOTNavClient from "./TOTNavClient";
import TOTLogoutButton from "@/components/TOTLogoutButton";
import { getSessionUser } from "@/lib/auth";
import { Sparkles, MessageCircle } from "lucide-react";

export const metadata = {
  title: "TOT লার্নিং পোর্টাল ও ড্যাশবোর্ড | ফজর একাডেমি",
  description: "ফজর একাডেমি ট্রেনিং অফ ট্রেইনার্স (TOT) অফিসিয়াল শিক্ষক প্রশিক্ষণ ও ক্যারিয়ার পোর্টাল।",
};

export default async function TOTLayout({ children }) {
  // Only used to decide whether the staff-panel shortcut is shown in the menu.
  const session = await getSessionUser();
  const role = session?.role || "";

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-indigo-600 selection:text-white antialiased">
      {/* Background ambient lighting effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-slate-900 blur-[130px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-500/15 blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[45vw] h-[45vw] rounded-full bg-emerald-900/10 blur-[140px]" />
      </div>

      {/* Top Header Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950 backdrop-blur-xl border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-3.5 no-print shadow-2xl transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo & Portal Title */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/fajr-logo.png"
                alt="Fajr Academy"
                className="w-10 h-10 rounded-2xl object-cover shadow-lg shadow-indigo-900/20 group-hover:scale-105 transition-all border border-slate-800"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-base sm:text-lg tracking-tight text-white">
                    FAJR ACADEMY
                  </span>
                  <span className="hidden sm:inline-block text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-slate-800">
                    TOT TRAINEE
                  </span>
                </div>
                <span className="text-[10px] tracking-wider text-slate-400 font-medium hidden xs:inline-block">
                  Better Teachers, Brighter Generations
                </span>
              </div>
            </Link>
          </div>

          {/* Interactive Client Navigation with active route detection */}
          <TOTNavClient role={role} />

          {/* Right Action Bar */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/results"
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-slate-800 hover:bg-indigo-500/15 transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" /> ফলাফল ও সনদ
            </Link>

            <Link
              href="/"
              className="text-xs font-medium text-slate-400 hover:text-white transition-colors bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full"
            >
              হোমপেজ
            </Link>

            <TOTLogoutButton variant="header" />
          </div>
        </div>
      </header>

      {/* Main Page Body */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 bg-slate-950 py-10 px-4 text-center text-xs text-slate-400 no-print space-y-8 w-full mt-12 backdrop-blur-sm">
        {/* Integrated SSLCommerz Banner Card */}
        <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-xl flex flex-col items-center gap-4">
          <div className="flex items-center justify-between w-full flex-wrap gap-2 pb-3 border-b border-slate-800 text-[11px]">
            <span className="font-extrabold text-indigo-300 tracking-wider uppercase flex items-center gap-1.5">
              🔒 OFFICIAL PAYMENT GATEWAY PARTNER
            </span>
            <span className="text-emerald-400 font-bold bg-emerald-500/15 border border-emerald-500/30 px-3 py-0.5 rounded-full text-[10px]">
              256-BIT SSL ENCRYPTED
            </span>
          </div>

          <div className="w-full bg-white rounded-xl p-2.5 shadow-md flex justify-center items-center">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.sslcommerz.com/"
              title="SSLCommerz - Online Payment Gateway"
              className="block w-full text-center hover:opacity-95 transition-opacity"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://securepay.sslcommerz.com/public/image/SSLCommerz-Pay-With-logo-All-Size-01.png"
                alt="SSLCommerz Pay With - Visa, Mastercard, AMEX, bKash, Nagad, Rocket, MFS and Internet Banking"
                className="w-full max-w-3xl h-auto mx-auto object-contain block"
              />
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-[11px] text-slate-300">
            <span>✓ কার্ডস (Visa/Mastercard)</span>
            <span>•</span>
            <span>✓ মোবাইল ব্যাংকিং (bKash/Nagad/Rocket)</span>
            <span>•</span>
            <span>✓ ইন্টারনেট ব্যাংকিং</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <p>© 2026 Fajr Academy — Training of Trainers (TOT) Program.</p>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="text-indigo-300 italic font-serif tracking-wide">
              Better Teachers, Brighter Generations
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1 text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" /> Authorized Teacher Certification
            </span>
            <span>•</span>
            <a
              href="https://wa.me/8801857381244"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 flex items-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5" /> +880 1857-381244
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
