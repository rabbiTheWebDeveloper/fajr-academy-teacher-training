'use client';

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BookOpen,
  GraduationCap,
  Settings,
  LogOut,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon
} from "lucide-react";
import { useAdminTheme } from "./AdminThemeContext";

export default function AdminSidebar({ adminUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme, isLight } = useAdminTheme();

  const navItems = [
    { href: "/admin", label: "ড্যাশবোর্ড ওভারভিউ", icon: LayoutDashboard, exact: true },
    { href: "/admin/users", label: "টিচার ও ট্রেইনি", icon: Users },
    { href: "/admin/payments", label: "পেমেন্ট ভেরিফিকেশন", icon: CreditCard },
    { href: "/admin/courses", label: "কোর্স ও সেশন", icon: BookOpen },
    { href: "/admin/instructors", label: "ইনস্ট্রাক্টর প্যানেল", icon: GraduationCap },
    { href: "/admin/settings", label: "সিস্টেম সেটিংস", icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      router.push("/login");
    }
  };

  const isActive = (item) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <>
      {/* Mobile Top Bar Toggle */}
      <div className="md:hidden bg-[#070A11] border-b border-slate-800 p-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/fajr-logo.png"
            alt="Fajr Academy"
            className="w-8 h-8 rounded-lg object-cover border border-amber-500/40"
          />
          <span className="font-extrabold text-sm text-white">FAJR ADMIN</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isLight
                ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
                : "bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800"
            }`}
            title={`Switch to ${isLight ? "Dark" : "Light"} Mode`}
          >
            {isLight ? (
              <Sun className="w-4 h-4 text-amber-500 fill-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-amber-400 fill-amber-400" />
            )}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 border-r flex flex-col justify-between p-4 transition-transform duration-300 md:translate-x-0 ${
          isLight
            ? "bg-white border-slate-200 shadow-xs"
            : "bg-slate-950 border-slate-900"
        } ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6">
          {/* Brand Logo Header */}
          <Link href="/admin" className="flex items-center gap-2.5 px-2 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/fajr-logo.png"
              alt="Fajr Academy"
              className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform border border-amber-500/40 shrink-0"
            />
            <div className="flex flex-col">
              <span className={`font-extrabold text-base tracking-tight font-serif ${isLight ? "text-slate-900" : "text-white"}`}>
                FAJR ACADEMY
              </span>
              <span className={`text-[10px] uppercase font-bold tracking-widest ${isLight ? "text-amber-700" : "text-amber-400"}`}>
                Executive Admin
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20 font-extrabold"
                      : isLight
                      ? "text-slate-700 hover:text-slate-950 hover:bg-slate-100 font-semibold"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? "text-slate-950" : isLight ? "text-slate-500" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {active && <ChevronRight className="w-3.5 h-3.5" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Shortcuts & Logout */}
        <div className={`space-y-3 pt-4 border-t ${isLight ? "border-slate-200" : "border-slate-900"}`}>
          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              isLight
                ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 shadow-xs"
                : "bg-slate-900 hover:bg-slate-850 border-slate-800 text-amber-300 shadow-xs"
            }`}
          >
            <div className="flex items-center gap-2">
              {isLight ? (
                <Sun className="w-4 h-4 text-amber-600 fill-amber-500 shrink-0" />
              ) : (
                <Moon className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
              )}
              <span>{isLight ? "লাইট মোড চালু" : "ডার্ক মোড চালু"}</span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                isLight
                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                  : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
              }`}
            >
              {isLight ? "Light" : "Dark"}
            </span>
          </button>

          <div className="space-y-1 text-xs">
            <Link
              href="/dashboard"
              target="_blank"
              className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors font-medium ${
                isLight
                  ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <span>টিচার পোর্টাল</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/instructor"
              target="_blank"
              className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors font-medium ${
                isLight
                  ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <span>ইনস্ট্রাক্টর পোর্টাল</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              isLight
                ? "text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200"
                : "text-rose-400 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/40"
            }`}
          >
            <LogOut className="w-4 h-4" /> লগআউট
          </button>
        </div>
      </aside>
    </>
  );
}
