import Link from "next/link";
import InstructorNavClient from "./InstructorNavClient";
import LogoutButton from "./_shared/LogoutButton";
import { getInstructorProfile } from "./_shared/server";
import { roleLabel } from "./_shared/utils";

export const metadata = {
  title: "TOT ইনস্ট্রাক্টর পোর্টাল | ফজর একাডেমি",
  description: "ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) ইনস্ট্রাক্টর পোর্টাল।",
};

export default async function InstructorLayout({ children }) {
  // Real designation of the signed-in staff member (falls back to their role, never a made-up title).
  const { profile } = await getInstructorProfile();
  const badgeText = profile ? profile.designation || roleLabel(profile.role) : "";

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans antialiased">
      <header className="sticky top-0 z-40 bg-slate-950 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/instructor" className="flex items-center gap-2.5 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/fajr-logo.png" alt="Fajr Academy" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-bold text-sm tracking-tight text-white">TOT ইনস্ট্রাক্টর</span>
          </Link>

          <div className="hidden sm:flex items-center gap-4 text-xs">
            {badgeText && <span className="text-slate-400">{badgeText}</span>}
            <Link href="/" className="text-slate-400 hover:text-white">
              ওয়েবসাইট
            </Link>
            <LogoutButton className="text-slate-400 hover:text-white font-medium" />
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <InstructorNavClient />
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</main>

      <footer className="border-t border-slate-800 py-5 px-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Fajr Academy</p>
          <div className="flex items-center gap-3 sm:hidden">
            {badgeText && <span>{badgeText}</span>}
            <LogoutButton className="hover:text-white font-medium" />
          </div>
        </div>
      </footer>
    </div>
  );
}
