import Link from "next/link";
import { AlertTriangle, RefreshCw, UserX } from "lucide-react";
import TOTLogoutButton from "@/components/TOTLogoutButton";

/**
 * Friendly full-page state when the trainee's data can't be loaded — instead of a 500
 * or (as before) somebody else's / made-up data.
 */
export default function TraineeLoadError({ error = "load_failed", retryHref = "/dashboard" }) {
  const notFound = error === "not_found";
  const Icon = notFound ? UserX : AlertTriangle;

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="bg-gradient-to-br from-[#051329] via-[#081A3A] to-[#0B2545] border border-rose-500/40 rounded-3xl p-8 sm:p-10 text-center shadow-2xl space-y-5">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center">
          <Icon className="w-8 h-8 text-rose-300" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {notFound ? "আপনার অ্যাকাউন্টের তথ্য পাওয়া যায়নি" : "তথ্য লোড করা যায়নি"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {notFound
              ? "এই সেশনের সাথে যুক্ত অ্যাকাউন্টটি খুঁজে পাওয়া যায়নি। অনুগ্রহ করে লগআউট করে আবার লগইন করুন। সমস্যা থাকলে হেল্পলাইনে যোগাযোগ করুন।"
              : "সার্ভারের সাথে সংযোগে সাময়িক সমস্যা হচ্ছে, তাই আপনার তথ্য দেখানো যাচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করুন। সমস্যা চলতে থাকলে হেল্পলাইনে যোগাযোগ করুন।"}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {!notFound && (
            <Link
              href={retryHref}
              prefetch={false}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C59B27] via-[#D4AF37] to-[#B8860B] text-[#051329] font-black text-xs shadow-lg border border-[#FDFBF7]/30"
            >
              <RefreshCw className="w-4 h-4" /> আবার চেষ্টা করুন
            </Link>
          )}
          <div className="w-44">
            <TOTLogoutButton variant="block" />
          </div>
        </div>
      </div>
    </div>
  );
}
