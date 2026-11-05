'use client';

import { useEffect, useRef, useState } from "react";
import { Bell, BellOff, BellRing, Loader2, Send, Share, SquarePlus } from "lucide-react";
import { usePushNotifications } from "./usePushNotifications";

/**
 * Header bell: shows whether this device gets push notifications and lets the user turn them
 * on/off or send a test. `variant` "panel" = admin/instructor gradient header, "tot" = trainee header.
 * `topics` names what this account is notified about (shown in the explanation).
 */

const STYLES = {
  panel: {
    button: "panel-glass size-10 rounded-2xl lg:size-9 lg:rounded-xl",
    popover: "border border-border bg-popover text-popover-foreground",
    muted: "text-muted-foreground",
    secondary: "border border-border hover:bg-accent",
    top: "top-[calc(3.75rem+env(safe-area-inset-top))]",
  },
  tot: {
    button: "size-10 rounded-full border border-slate-800 bg-slate-900 text-slate-200 hover:text-white",
    popover: "border border-slate-700 bg-slate-900 text-slate-100",
    muted: "text-slate-400",
    secondary: "border border-slate-700 hover:bg-slate-800",
    top: "top-[calc(4.5rem+env(safe-area-inset-top))]",
  },
};

const DOT = { on: "bg-emerald-400", off: "bg-amber-400", denied: "bg-rose-400", "ios-install": "bg-amber-400" };

function describe(status, topics) {
  switch (status) {
    case "on":
      return ["নোটিফিকেশন চালু আছে", `${topics} — এই ডিভাইসে সাথে সাথে পাবেন, অ্যাপ বা ব্রাউজার বন্ধ থাকলেও।`];
    case "off":
      return ["নোটিফিকেশন চালু করুন", `চালু করলে ${topics} এই ফোন / কম্পিউটারে সাথে সাথে পৌঁছে যাবে।`];
    case "denied":
      return [
        "নোটিফিকেশন ব্লক করা আছে",
        "ব্রাউজারের অ্যাড্রেস বারের 🔒 আইকন → Notifications → “Allow” করুন (মোবাইলে: সাইট সেটিংস → Notifications), তারপর পেজটি রিফ্রেশ করুন।",
      ];
    case "ios-install":
      return [
        "iPhone / iPad-এ নোটিফিকেশন",
        "iPhone-এ শুধু হোম স্ক্রিনে যোগ করা অ্যাপে নোটিফিকেশন আসে। নিচের ধাপগুলো করে অ্যাপটি খুলুন, তারপর এখান থেকে চালু করুন।",
      ];
    case "unconfigured":
      return ["নোটিফিকেশন সার্ভিস বন্ধ", "সার্ভারে VAPID key সেট করা হয়নি, তাই এখনো নোটিফিকেশন পাঠানো যাচ্ছে না।"];
    default:
      return ["নোটিফিকেশন", "অবস্থা দেখা হচ্ছে…"];
  }
}

export default function PushBell({ variant = "panel", topics = "নতুন নোটিশ ও আপডেট", showWhenUnconfigured = false }) {
  const { status, busy, notice, enable, disable, sendTest } = usePushNotifications();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const s = STYLES[variant] || STYLES.panel;

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (status === "unsupported" || (status === "unconfigured" && !showWhenUnconfigured)) return null;

  const [title, text] = describe(status, topics);
  const Icon = status === "on" ? BellRing : status === "denied" ? BellOff : Bell;
  const label = status === "on" ? "নোটিফিকেশন চালু আছে" : "নোটিফিকেশন সেটিংস";

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={label}
        title={label}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`relative inline-flex cursor-pointer items-center justify-center transition-transform active:scale-95 ${s.button}`}
      >
        <Icon className="size-[18px]" />
        {DOT[status] && <span className={`absolute right-1.5 top-1.5 size-2 rounded-full ring-2 ring-white/70 ${DOT[status]}`} />}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="নোটিফিকেশন"
          className={`fixed inset-x-3 z-50 rounded-2xl p-4 text-left shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 ${s.top} ${s.popover}`}
        >
          <div className="flex items-start gap-3">
            <span
              className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                status === "on" ? "bg-emerald-500/15 text-emerald-500" : status === "denied" ? "bg-rose-500/15 text-rose-500" : "bg-violet-500/15 text-violet-500"
              }`}
            >
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold leading-snug">{title}</p>
              <p className={`mt-1 text-xs leading-relaxed ${s.muted}`}>{text}</p>
            </div>
          </div>

          {status === "ios-install" && (
            <ol className={`mt-3 space-y-1.5 text-xs ${s.muted}`}>
              <li className="flex items-center gap-2">
                <Share className="size-4 shrink-0 text-violet-500" /> ১. Safari-র নিচের Share বোতাম চাপুন
              </li>
              <li className="flex items-center gap-2">
                <SquarePlus className="size-4 shrink-0 text-violet-500" /> ২. “Add to Home Screen” বেছে নিন
              </li>
              <li className="flex items-center gap-2">
                <Bell className="size-4 shrink-0 text-violet-500" /> ৩. হোম স্ক্রিনের অ্যাপ খুলে লগইন করে নোটিফিকেশন চালু করুন
              </li>
            </ol>
          )}

          {notice && (
            <p
              role="status"
              className={`mt-3 rounded-xl px-3 py-2 text-xs font-semibold ${
                notice.type === "ok" ? "bg-emerald-500/15 text-emerald-600" : "bg-rose-500/15 text-rose-600"
              }`}
            >
              {notice.text}
            </p>
          )}

          {(status === "off" || status === "on") && (
            <div className="mt-4 grid gap-2">
              {status === "off" ? (
                <button
                  type="button"
                  onClick={enable}
                  disabled={busy}
                  className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 text-sm font-bold text-white shadow-md shadow-violet-600/30 disabled:opacity-60"
                >
                  {busy ? <Loader2 className="size-4 animate-spin" /> : <Bell className="size-4" />} নোটিফিকেশন চালু করুন
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={sendTest}
                    disabled={busy}
                    className={`flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-bold disabled:opacity-60 ${s.secondary}`}
                  >
                    {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} টেস্ট নোটিফিকেশন পাঠান
                  </button>
                  <button
                    type="button"
                    onClick={disable}
                    disabled={busy}
                    className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 disabled:opacity-60"
                  >
                    <BellOff className="size-4" /> এই ডিভাইসে বন্ধ করুন
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
