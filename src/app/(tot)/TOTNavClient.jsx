'use client';

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Video,
  Receipt,
  Award,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Radio,
} from "lucide-react";
import TOTLogoutButton from "@/components/TOTLogoutButton";

// Staff who open the trainee pages get a shortcut back to their own panel; trainees don't.
const STAFF_PANEL = {
  admin: { href: "/admin", label: "অ্যাডমিন প্যানেল" },
"super-admin": { href: "/admin", label: "অ্যাডমিন প্যানেল" },
  instructor: { href: "/instructor", label: "ইনস্ট্রাক্টর প্যানেল" },
};

export default function TOTNavClient({ role = "" }) {
  const pathname = usePathname() || "";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const staffPanel = STAFF_PANEL[role] || null;

  const navItems = [
    {
      label: "ড্যাশবোর্ড",
      href: "/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "লাইভ ক্লাস",
      href: "/classes",
      icon: Video,
      badge: "LIVE",
    },
    {
      label: "স্টাডি বুকস",
      href: "/materials",
      icon: BookOpen,
    },
    {
      label: "ফলাফল ও সনদ",
      href: "/results",
      icon: Award,
    },
    {
      label: "পেমেন্ট ও রসিদ",
      href: "/payments",
      icon: Receipt,
    },
  ];

  const isActive = (item) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <>
      {/* Desktop Navigation Links */}
      <nav className="hidden xl:flex items-center gap-1 bg-slate-950 p-1.5 rounded-full border border-slate-800 shadow-inner">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                active
                  ? "bg-indigo-600 text-white font-black shadow-md shadow-indigo-900/20 border "
                  : "text-slate-300 hover:text-indigo-300 hover:bg-slate-800"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${active ? "text-white" : "text-indigo-300"}`} />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-1 text-[9px] font-black px-1.5 py-0.2 rounded-full bg-rose-500 text-white animate-pulse">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Hamburger Toggle Button for Mobile / Tablet */}
      <div className="flex xl:hidden items-center gap-2">
        <Link
          href="/classes"
          className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1 animate-pulse"
        >
          <Radio className="w-3.5 h-3.5 text-rose-400" /> লাইভ
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          className="p-2 rounded-xl bg-slate-950 text-indigo-300 hover:text-white border border-slate-800 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden no-print">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed top-0 right-0 bottom-0 w-4/5 max-w-sm bg-slate-950 border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-md">
                    F
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">FAJR TOT PORTAL</h3>
                    <p className="text-[10px] text-indigo-300 font-semibold">Trainee Teacher Hub</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Nav List */}
              <div className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                        active
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                          : "text-slate-300 hover:bg-slate-900 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${active ? "text-white" : "text-indigo-300"}`} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions in Drawer */}
            <div className="pt-6 border-t border-slate-800 space-y-3">
              {staffPanel && (
                <Link
                  href={staffPanel.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-indigo-300 text-xs font-semibold flex items-center justify-center gap-2"
                >
                  {staffPanel.label} <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" /> Better Teachers, Brighter Generations
              </div>
              <TOTLogoutButton variant="header" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
