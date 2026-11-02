import { AlertTriangle } from "lucide-react";

/** Page-level load error (server or client). Rendered instead of silently showing zeros. */
export default function ErrorBanner({ title = "তথ্য লোড করা যায়নি", message, children }) {
  if (!message && !children) return null;
  return (
    <div
      role="alert"
      className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-3"
    >
      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
      <div className="space-y-1">
        <p className="font-black text-rose-300 text-sm">{title}</p>
        {message && <p className="leading-relaxed">{message}</p>}
        {children}
      </div>
    </div>
  );
}
