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
  X
} from "lucide-react";

export default function AdminSidebar({ adminUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

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
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center">
            ف
          </div>
          <span className="font-extrabold text-sm text-white">FAJR ADMIN</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-900 flex flex-col justify-between p-4 transition-transform duration-300 md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6">
          {/* Brand Logo Header */}
          <Link href="/admin" className="flex items-center gap-2.5 px-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              ف
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-white">
                FAJR ACADEMY
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
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
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {active && <ChevronRight className="w-3.5 h-3.5" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Shortcuts & Logout */}
        <div className="space-y-3 pt-4 border-t border-slate-900">
          <div className="space-y-1 text-xs">
            <Link
              href="/dashboard"
              target="_blank"
              className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
            >
              <span>টিচার পোর্টাল</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/instructor"
              target="_blank"
              className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
            >
              <span>ইনস্ট্রাক্টর পোর্টাল</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-400 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> লগআউট
          </button>
        </div>
      </aside>
    </>
  );
}
