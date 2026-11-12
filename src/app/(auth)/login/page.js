import { Suspense } from "react";
import LoginForm from "../_component/LoginForm";

export const metadata = {
  title: "লগইন | ফজর একাডেমি",
  description: "ফজর একাডেমি টিচার ট্রেনিং পোর্টালে আপনার অ্যাকাউন্টে লগইন করুন।",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-amber-400 text-xs font-bold animate-pulse">লোড হচ্ছে...</div>}>
      <LoginForm />
    </Suspense>
  );
}
