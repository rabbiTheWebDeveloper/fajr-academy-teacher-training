'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Video, Receipt, Award } from "lucide-react";

/**
 * The trainee portal has exactly five places to be, so navigation is always visible:
 * a pill row in the header on desktop and an app-style tab bar at the bottom on
 * phones / tablets (one thumb away, no hidden drawer).
 */
const NAV_ITEMS = [
  { label: "ড্যাশবোর্ড", short: "হোম", href: "/dashboard", icon: LayoutDashboard },
  { label: "লাইভ ক্লাস", short: "ক্লাস", href: "/classes", icon: Video },
  { label: "স্টাডি বুকস", short: "বই", href: "/materials", icon: BookOpen },
  { label: "ফলাফল ও সনদ", short: "ফলাফল", href: "/results", icon: Award },
  { label: "পেমেন্ট", short: "পেমেন্ট", href: "/payments", icon: Receipt },
];

const isActive = (pathname, href) => pathname === href || pathname.startsWith(`${href}/`);

/** Desktop: pill navigation inside the header. */
export default function TOTNavClient() {
  const pathname = usePathname() || "";

  return (
    <nav
      aria-label="প্রধান মেনু"
      className="hidden lg:flex items-center gap-1 rounded-full border border-slate-800 bg-slate-900/60 p-1"
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-xs xl:px-4 xl:text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              active ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/30" : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Icon className={`h-4 w-4 ${active ? "text-white" : "text-indigo-300"}`} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Phones / tablets: fixed bottom tab bar. The layout reserves space for it. */
export function TOTBottomNav() {
  const pathname = usePathname() || "";

  return (
    <nav
      aria-label="প্রধান মেনু"
      className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="mx-auto grid max-w-xl grid-cols-5">
        {NAV_ITEMS.map(({ href, short, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={`relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors active:bg-slate-900 focus-visible:outline-none focus-visible:bg-slate-900 ${
                  active ? "text-indigo-300" : "text-slate-400"
                }`}
              >
                {active && <span className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-indigo-400" />}
                <span className={`flex h-7 w-12 items-center justify-center rounded-full ${active ? "bg-indigo-500/20" : ""}`}>
                  <Icon className="h-5 w-5" />
                </span>
                {short}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
