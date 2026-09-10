import Link from "next/link";
import { 
  LayoutDashboard, 
  BookOpen, 
  Video, 
  CreditCard, 
  GraduationCap,
  Sparkles,
  MessageCircle,
  Receipt
} from "lucide-react";
import TOTLogoutButton from "@/components/TOTLogoutButton";

export const metadata = {
  title: "TOT Trainee Portal | Fajr Academy",
  description: "Official Training of Trainers (TOT) Learning Management Portal & Dashboard.",
};

export default function TOTLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#081A3A] text-[#FDFBF7] font-sans selection:bg-[#C59B27] selection:text-slate-950">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#051329]/95 backdrop-blur-md border-b border-[#C59B27]/25 px-4 lg:px-8 py-3.5 no-print shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#C59B27] via-[#D4AF37] to-[#E5B842] flex items-center justify-center text-[#051329] font-black text-xl shadow-lg shadow-[#C59B27]/30 group-hover:scale-105 transition-transform border border-[#FDFBF7]/30">
                ف
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-[#FDFBF7] to-[#D4AF37] bg-clip-text text-transparent">
                  FAJR ACADEMY
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37]">
                  TOT Trainee Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#081A3A]/80 p-1.5 rounded-full border border-[#C59B27]/30 shadow-inner">
            <Link
              href="/dashboard"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#C59B27]/20 text-[#D4AF37] border border-[#C59B27]/40 hover:bg-[#C59B27]/30 transition-colors flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#D4AF37]" /> ড্যাশবোর্ড
            </Link>
            <Link
              href="/materials"
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-[#0B2545] transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#C59B27]" /> মডিউল ও বুকস
            </Link>
            <Link
              href="/classes"
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-[#0B2545] transition-colors flex items-center gap-1.5"
            >
              <Video className="w-3.5 h-3.5 text-[#C59B27]" /> লাইভ ক্লাস
            </Link>
            <Link
              href="/id-card"
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-[#0B2545] transition-colors flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5 text-[#C59B27]" /> আইডি কার্ড
            </Link>
            <Link
              href="/payments"
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-[#0B2545] transition-colors flex items-center gap-1.5"
            >
              <Receipt className="w-3.5 h-3.5 text-[#C59B27]" /> পেমেন্ট ও ইনভয়েস
            </Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/payments"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold bg-[#0B2545] hover:bg-[#134074] text-[#D4AF37] px-3 py-1.5 rounded-lg border border-[#C59B27]/40 shadow-sm transition-all"
            >
              <Receipt className="w-3.5 h-3.5" /> ইনভয়েস
            </Link>

            <Link
              href="/"
              className="text-xs font-medium text-slate-400 hover:text-white transition-colors px-2 py-1"
            >
              হোমপেজ
            </Link>

            {/* Logout Button */}
            <TOTLogoutButton variant="header" />
          </div>
        </div>
      </header>

      {/* Main Page Body */}
      <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </div>

      {/* Footer */}
      <footer className="border-t border-[#C59B27]/30 bg-gradient-to-b from-[#030C19] via-[#051329] to-[#020813] py-10 px-4 text-center text-xs text-slate-400 no-print space-y-8 w-full">
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
            <a href="https://wa.me/8801857381244" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" /> +880 1857-381244
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
