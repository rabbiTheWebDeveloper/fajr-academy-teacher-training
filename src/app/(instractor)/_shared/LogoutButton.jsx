'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

/**
 * POSTs to /api/auth/logout (a GET link could be prefetched and silently log the user out).
 */
export default function LogoutButton({ className = "", wrapperClassName = "", showIcon = false, label = "লগআউট" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const handleLogout = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST", cache: "no-store" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || `লগআউট ব্যর্থ হয়েছে (HTTP ${res.status})`);
      }
      router.push("/login");
      router.refresh();
    } catch (err) {
      setError(err?.message || "লগআউট ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
      setBusy(false);
    }
  };

  return (
    <span className={wrapperClassName || "inline-flex flex-col items-center"}>
      <button type="button" onClick={handleLogout} disabled={busy} className={`${className} disabled:opacity-60`}>
        {showIcon && <LogOut className="w-3.5 h-3.5" />}
        {busy ? "লগআউট হচ্ছে..." : label}
      </button>
      {error && (
        <span role="alert" className="text-[10px] text-rose-400 mt-1">
          {error}
        </span>
      )}
    </span>
  );
}
