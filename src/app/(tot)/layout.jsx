import Link from "next/link";
import TOTNavClient, { TOTBottomNav } from "./TOTNavClient";
import TOTLogoutButton from "@/components/TOTLogoutButton";
import { getSessionUser } from "@/lib/auth";
import { TRAINEE_ROLES } from "@/lib/roles";
import PushBell from "@/components/push/PushBell";
import { ExternalLink, MessageCircle } from "lucide-react";

export const metadata = {
  title: "TOT লার্নিং পোর্টাল ও ড্যাশবোর্ড | ফজর একাডেমি",
  description: "ফজর একাডেমি ট্রেনিং অফ ট্রেইনার্স (TOT) অফিসিয়াল শিক্ষক প্রশিক্ষণ ও ক্যারিয়ার পোর্টাল।",
};

// Staff who open the trainee pages get a shortcut back to their own panel; trainees don't.
const STAFF_PANEL = {
  admin: { href: "/admin", label: "অ্যাডমিন প্যানেল" },
  "super-admin": { href: "/admin", label: "অ্যাডমিন প্যানেল" },
  instructor: { href: "/instructor", label: "ইনস্ট্রাক্টর প্যানেল" },
};

export default async function TOTLayout({ children }) {
  const session = await getSessionUser();
  const role = session?.role || "";
  // Push notifications here are trainee ones (notices, payment, results); staff manage theirs in their panel.
  const isTrainee = TRAINEE_ROLES.includes(role);
  const staffPanel = STAFF_PANEL[role] || null;

  return (
    // Bottom padding on phones keeps the footer clear of the fixed tab bar.
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-indigo-600 selection:text-white antialiased pb-[calc(4rem+env(safe-area-inset-bottom,0px))] lg:pb-0 print:pb-0">
      {/* Background ambient lighting effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-slate-900 blur-[130px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-500/15 blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[45vw] h-[45vw] rounded-full bg-emerald-900/10 blur-[140px]" />
      </div>

      {/* Header: brand · navigation (desktop) · notifications + account */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-3 no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Inside the portal the logo is "home" = the dashboard */}
          <Link href="/dashboard" aria-label="ড্যাশবোর্ড — Fajr Academy" className="flex min-w-0 items-center gap-3 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/fajr-logo.png"
              alt=""
              className="w-10 h-10 shrink-0 rounded-2xl object-cover border border-slate-800 group-hover:scale-105 transition-transform"
            />
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-black text-base sm:text-lg tracking-tight text-white leading-tight">
                FAJR ACADEMY
              </span>
              <span className="truncate text-[11px] font-medium text-slate-400 lg:hidden xl:block">
                টিচার ট্রেনিং পোর্টাল
              </span>
            </div>
          </Link>

          <TOTNavClient />

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {staffPanel && (
              <Link
                href={staffPanel.href}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-indigo-300 hover:text-white transition-colors"
              >
                {staffPanel.label} <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}

            {isTrainee && <PushBell variant="tot" topics="নতুন নোটিশ, পেমেন্ট যাচাই ও মূল্যায়নের ফলাফল" />}

            {/* Icon-only on phones, labelled from tablets up */}
            <div className="sm:hidden">
              <TOTLogoutButton variant="header" showText={false} className="!p-2.5" />
            </div>
            <div className="hidden sm:block">
              <TOTLogoutButton variant="header" className="!py-2" />
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">{children}</main>

      {/* Footer: help first — a trainee who scrolls this far is usually looking for it */}
      <footer className="relative z-10 mt-10 border-t border-slate-800 bg-slate-950 px-4 py-6 text-xs text-slate-400 no-print">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p>© {new Date().getFullYear()} Fajr Academy — Training of Trainers (TOT) Program</p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link href="/" className="hover:text-white transition-colors">
              ওয়েবসাইট হোমপেজ
            </Link>
            <a
              href="https://wa.me/8801857381244"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> হেল্পলাইন: +880 1857-381244
            </a>
          </div>
        </div>
      </footer>

      <TOTBottomNav />
    </div>
  );
}
