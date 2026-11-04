'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "ওভারভিউ", href: "/instructor", exact: true },
  { label: "ট্রেইনি", href: "/instructor/trainees" },
  { label: "মূল্যায়ন", href: "/instructor/evaluations" },
  { label: "কারিকুলাম", href: "/instructor/curriculum" },
  { label: "রিসোর্স", href: "/instructor/resources" },
  { label: "লাইভ ক্লাস", href: "/instructor/live" },
];

export default function InstructorNavClient() {
  const pathname = usePathname() || "";

  const isActive = (item) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <nav className="flex items-center gap-6 overflow-x-auto -mb-px" aria-label="ইনস্ট্রাক্টর মেনু">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${
              active
                ? "border-indigo-500 text-white font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
