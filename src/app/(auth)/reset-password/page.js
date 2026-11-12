import { Suspense } from "react";
import ResetPasswordForm from "../_component/ResetPasswordForm";

export const metadata = {
  title: "নতুন পাসওয়ার্ড সেট করুন | ফজর একাডেমি",
  robots: { index: false, follow: false },
  // Keep the one-time token in the URL out of Referer headers.
  referrer: "no-referrer",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-amber-400 text-xs font-bold animate-pulse">লোড হচ্ছে...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
