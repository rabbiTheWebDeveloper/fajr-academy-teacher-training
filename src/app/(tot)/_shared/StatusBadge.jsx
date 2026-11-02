import { CheckCircle2, Clock, RotateCcw, XCircle, MinusCircle } from "lucide-react";
import { paymentStatusInfo, TONE_BADGE } from "./format";

const ICONS = {
  VALID: CheckCircle2,
  PENDING: Clock,
  REFUNDED: RotateCcw,
  FAILED: XCircle,
  CANCELLED: XCircle,
  INVALID: XCircle,
};

/** Truthful payment status pill — only VALID is green. */
export function PaymentStatusBadge({ status, className = "" }) {
  const info = paymentStatusInfo(status);
  const Icon = ICONS[String(status || "").toUpperCase()] || MinusCircle;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap ${TONE_BADGE[info.tone]} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {info.en} ({info.label})
    </span>
  );
}
