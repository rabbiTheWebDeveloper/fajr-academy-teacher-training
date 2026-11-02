"use client";

import { useState } from "react";
import { Check, Copy, AlertCircle } from "lucide-react";

/** Copy-to-clipboard button with visible success and failure feedback. */
export default function CopyButton({
  text,
  label = "কপি",
  copiedLabel = "কপি হয়েছে!",
  className = "",
  iconOnly = false,
  title,
}) {
  const [state, setState] = useState("idle"); // idle | copied | error

  const handleCopy = async () => {
    try {
      if (!text) throw new Error("nothing to copy");
      if (!navigator.clipboard?.writeText) throw new Error("clipboard unavailable");
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("error");
    }
    setTimeout(() => setState("idle"), 2500);
  };

  const Icon = state === "copied" ? Check : state === "error" ? AlertCircle : Copy;
  const iconClass = state === "copied" ? "text-emerald-400" : state === "error" ? "text-rose-400" : "";
  const text_ = state === "copied" ? copiedLabel : state === "error" ? "কপি করা যায়নি" : label;

  return (
    <button type="button" onClick={handleCopy} title={title || text_} aria-label={title || label} className={className}>
      <Icon className={`w-3.5 h-3.5 ${iconClass}`} />
      {!iconOnly && <span>{text_}</span>}
    </button>
  );
}
