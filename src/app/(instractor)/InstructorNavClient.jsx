'use client';

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  BookOpen,
  FolderDown,
  Video,
  Menu,
  X,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Radio
} from "lucide-react";

export default function InstructorNavClient() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      label: "ওভারভিউ",
      href: "/instructor",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "ট্রেইনি শিক্ষক",
      href: "/instructor/trainees",
      icon: Users,
    },
    {
      label: "মূল্যায়ন ও গ্রেডিং",
      href: "/instructor/evaluations",
      icon: ClipboardCheck,
    },
    {
      label: "কারিকুলাম ও মডিউল",
      href: "/instructor/curriculum",
      icon: BookOpen,
    },
    {
      label: "স্টাডি রিসোর্স",
      href: "/instructor/resources",
      icon: FolderDown,
    },
    {
      label: "লাইভ ক্লাসরুম",
      href: "/instructor/live",
      icon: Video,
      badge: "LIVE",
    },
  ];

  const isActive = (item) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <>
      {/* Desktop Navigation Links */}
      <nav className="hidden xl:flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-full border border-indigo-500/20 shadow-inner">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                active
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/30 border border-indigo-400/40"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${active ? "text-white" : "text-indigo-400"}`} />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-1 text-[9px] font-black px-1.5 py-0.2 rounded-full bg-rose-500/90 text-white animate-pulse">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Hamburger Toggle Button for Tablet & Mobile */}
      <div className="flex xl:hidden items-center gap-2">
        <Link
          href="/instructor/live"
          className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 animate-pulse"
        >
          <Radio className="w-3.5 h-3.5 text-rose-400" /> লাইভ
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          className="p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:border-indigo-500/40 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Menu */}
          <div className="fixed top-0 right-0 bottom-0 w-4/5 max-w-sm bg-[#0A0E1A] border-l border-indigo-900/50 p-6 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                    F
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">TOT FACULTY HUB</h3>
                    <p className="text-[10px] text-indigo-400 font-semibold">Senior Trainer Console</p>
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
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                          : "text-slate-300 hover:bg-slate-900 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${active ? "text-white" : "text-indigo-400"}`} />
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
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2"
              >
                শিক্ষক / স্টুডেন্ট ভিউ <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </Link>
              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Authorized Trainer Access
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
