import Link from "next/link";
import TOTNavClient from "./TOTNavClient";
import TOTLogoutButton from "@/components/TOTLogoutButton";
import { Sparkles, MessageCircle, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "TOT লার্নিং পোর্টাল ও ড্যাশবোর্ড | ফজর একাডেমি",
  description: "ফজর একাডেমি ট্রেনিং অফ ট্রেইনার্স (TOT) অফিসিয়াল শিক্ষক প্রশিক্ষণ ও ক্যারিয়ার পোর্টাল।",
};

export default function TOTLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#051329] text-[#FDFBF7] font-sans selection:bg-[#C59B27] selection:text-slate-950 antialiased">
      {/* Background ambient lighting effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#081A3A]/40 blur-[130px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#C59B27]/8 blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[45vw] h-[45vw] rounded-full bg-emerald-900/10 blur-[140px]" />
      </div>

      {/* Top Header Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#051329]/90 backdrop-blur-xl border-b border-[#C59B27]/25 px-4 sm:px-6 lg:px-8 py-3.5 no-print shadow-2xl transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo & Portal Title */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/fajr-logo.png"
                alt="Fajr Academy"
                className="w-10 h-10 rounded-2xl object-cover shadow-lg shadow-[#C59B27]/20 group-hover:scale-105 transition-all border border-[#C59B27]/40"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-[#FDFBF7] to-[#D4AF37] bg-clip-text text-transparent">
                    FAJR ACADEMY
                  </span>
                  <span className="hidden sm:inline-block text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#C59B27]/20 text-[#D4AF37] border border-[#C59B27]/30">
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
          <TOTNavClient />

          {/* Right Action Bar */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/results"
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-[#C59B27]/15 text-[#D4AF37] border border-[#C59B27]/30 hover:bg-[#C59B27]/25 transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> ফলাফল ও সনদ
            </Link>

            <Link
              href="/"
              className="text-xs font-medium text-slate-400 hover:text-white transition-colors bg-[#081A3A] border border-[#C59B27]/30 px-3 py-1.5 rounded-full"
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
      <footer className="relative z-10 border-t border-[#C59B27]/30 bg-gradient-to-b from-[#030C19] via-[#051329] to-[#020813] py-10 px-4 text-center text-xs text-slate-400 no-print space-y-8 w-full mt-12 backdrop-blur-sm">
        {/* Integrated SSLCommerz Banner Card */}
        <div className="max-w-4xl mx-auto bg-[#081A3A]/80 border border-[#C59B27]/35 rounded-3xl p-5 shadow-2xl backdrop-blur-xl flex flex-col items-center gap-4">
          <div className="flex items-center justify-between w-full flex-wrap gap-2 pb-3 border-b border-[#C59B27]/20 text-[11px]">
            <span className="font-extrabold text-[#D4AF37] tracking-wider uppercase flex items-center gap-1.5">
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
            <span className="text-[#D4AF37] italic font-serif tracking-wide">
              Better Teachers, Brighter Generations
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1 text-[#D4AF37]">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> Authorized Teacher Certification
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
