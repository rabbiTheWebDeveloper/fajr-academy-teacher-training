'use client';

import { useCallback, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

/**
 * Success / error feedback line. Success auto-hides; errors stay until dismissed
 * or replaced, so a failure is never missed.
 */
export function useFlash(successMs = 4000) {
  const [flash, setFlash] = useState(null);
  const timer = useRef(null);

  const show = useCallback(
    (type, text) => {
      if (timer.current) clearTimeout(timer.current);
      setFlash({ type, text, at: Date.now() });
      if (type === "success") {
        timer.current = setTimeout(() => setFlash(null), successMs);
      }
    },
    [successMs]
  );

  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setFlash(null);
  }, []);

  return { flash, show, clear };
}

export function FlashMessage({ flash, onClose, className = "" }) {
  if (!flash) return null;
  const ok = flash.type === "success";
  return (
    <div
      role={ok ? "status" : "alert"}
      className={`p-3 rounded-xl border text-xs font-bold flex items-start gap-2 ${
        ok
          ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
          : "bg-rose-500/15 border-rose-500/30 text-rose-300"
      } ${className}`}
    >
      {ok ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-px" />
      ) : (
        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-px" />
      )}
      <span className="flex-1 leading-relaxed">{flash.text}</span>
      {onClose && (
        <button type="button" onClick={onClose} className="opacity-70 hover:opacity-100" aria-label="বন্ধ করুন">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
