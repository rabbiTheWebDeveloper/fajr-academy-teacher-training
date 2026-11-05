'use client';

import React, { useState } from "react";
import { Search, Plus, Trash2, X, RefreshCw, Undo2, ShieldCheck, RotateCcw, MessageCircle } from "lucide-react";
import { useAdminTheme } from "../../AdminThemeContext";
import { useAdminAccess } from "../../AdminAccessContext";
import {
  AdminToast,
  DbErrorBanner,
  GeneratedPasswordBox,
  callApi,
  formatDate,
  formatMoney,
  trackLabel,
  useConfirm,
  useToast,
  whatsappHref,
} from "../../_shared/admin-ui";

// Statuses an admin may set (REFUNDED is only reachable through the refund flow).
const SETTABLE_STATUSES = ["VALID", "PENDING", "FAILED", "CANCELLED", "UNATTEMPTED", "EXPIRED", "INVALID"];
const ALL_STATUSES = [...SETTABLE_STATUSES, "REFUNDED"];
const STATUS_LABEL = {
  VALID: "✓ VALID (যাচাইকৃত)",
  PENDING: "⏳ PENDING (পেন্ডিং)",
  FAILED: "✕ FAILED (ব্যর্থ)",
  CANCELLED: "CANCELLED (বাতিল)",
  UNATTEMPTED: "UNATTEMPTED (চেষ্টা হয়নি)",
  EXPIRED: "EXPIRED (মেয়াদোত্তীর্ণ)",
  INVALID: "INVALID (অবৈধ)",
  REFUNDED: "↩ REFUNDED (রিফান্ডকৃত)",
};
const PURPOSE_LABEL = {
  registration: "নতুন রেজিস্ট্রেশন",
  "course-purchase": "কোর্স ক্রয়",
  manual: "ম্যানুয়াল",
};
const METHODS = [
  { value: "BKASH", label: "বিকাশ (bKash)" },
  { value: "NAGAD", label: "নগদ (Nagad)" },
  { value: "ROCKET", label: "রকেট (Rocket)" },
  { value: "BANK", label: "ব্যাংক ডিপোজিট / ট্রান্সফার" },
  { value: "CASH", label: "ক্যাশ / সরাসরি প্রদান" },
  { value: "CARD", label: "কার্ড (POS)" },
  { value: "OTHER", label: "অন্যান্য" },
];
const EMPTY_FORM = {
  userName: "",
  userEmail: "",
  userPhone: "",
  amount: "",
  track: "TOT-MEN",
  cardType: "BKASH",
  tranId: "",
  status: "VALID",
  notes: "",
};

const netAmount = (p) => (Number(p.amount) || 0) - (Number(p.refund?.amount) || 0);

function statusBadgeCls(status, isLight) {
  if (status === "VALID") return isLight ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
  if (status === "PENDING" || status === "UNATTEMPTED")
    return isLight ? "bg-amber-50 text-amber-900 border-amber-300" : "bg-amber-500/20 text-amber-300 border-amber-500/30";
  if (status === "REFUNDED") return isLight ? "bg-slate-100 text-slate-700 border-slate-300" : "bg-slate-800 text-slate-300 border-slate-700";
  return isLight ? "bg-rose-50 text-rose-800 border-rose-300" : "bg-rose-500/20 text-rose-300 border-rose-500/30";
}

export default function AdminPaymentsClient({ initialPayments, loadError: initialLoadError }) {
  const [payments, setPayments] = useState(initialPayments || []);
  const [loadError, setLoadError] = useState(initialLoadError);
  const [reloading, setReloading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [purposeFilter, setPurposeFilter] = useState("all");
  const [busyId, setBusyId] = useState(null);
  const { isLight } = useAdminTheme();
  const { can, isSuper } = useAdminAccess();
  const mayCreate = can("payments", "create"); // manual payments
  const mayUpdate = can("payments", "update"); // verify, un-verify, refund, re-validate
  // Deleting a payment record is super-admin only (isSuper); the API enforces it too.
  const { toast, showToast, hideToast } = useToast();
  const { confirm, confirmDialog } = useConfirm();

  // Manual payment modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [savingPayment, setSavingPayment] = useState(false);
  const [addError, setAddError] = useState("");
  const [addResult, setAddResult] = useState(null); // { email, password }

  // Refund modal
  const [refundTarget, setRefundTarget] = useState(null);
  const [refundForm, setRefundForm] = useState({ amount: "", remarks: "Course Fee Refund" });
  const [refunding, setRefunding] = useState(false);

  // Gateway re-validation tool
  const [valId, setValId] = useState("");
  const [validating, setValidating] = useState(false);

  const replacePayment = (updated) => setPayments((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));

  const reload = async (silent = false) => {
    setReloading(true);
    const { ok, data, message } = await callApi("/api/admin/payments");
    setReloading(false);
    if (!ok) {
      showToast(message, "error");
      return false;
    }
    setPayments(data.payments || []);
    setLoadError(null);
    if (!silent) showToast(`${(data.payments || []).length} টি পেমেন্ট রেকর্ডের সর্বশেষ তথ্য লোড হয়েছে।`);
    return true;
  };

  const handleUpdateStatus = async (p, nextStatus) => {
    if (!nextStatus || nextStatus === p.status) return;
    const who = p.userName || p.userEmail;
    let text;
    if (nextStatus === "VALID") {
      text = `${who}-এর ${formatMoney(p.amount, p.currency)} পেমেন্টটি VALID হিসেবে যাচাই করবেন?\n\nট্রেইনির অ্যাকাউন্ট (না থাকলে তৈরি হবে) ও কোর্স এনরোলমেন্ট সক্রিয় হবে।`;
      if (!p.user) {
        text += `\n\n⚠ এই ট্রেইনির এখনো কোনো অ্যাকাউন্ট নেই। যাচাইয়ের সময় তৈরি হওয়া অ্যাকাউন্টের পাসওয়ার্ড এখানে দেখানো হবে না।`;
      }
    } else if (p.status === "VALID") {
      text = `${who}-এর যাচাইকৃত পেমেন্টটি ${nextStatus} করবেন?\n\n⚠ এটি পেমেন্টটি আন-ভেরিফাই করবে: এই পেমেন্ট থেকে পাওয়া কোর্স এনরোলমেন্ট বাতিল হবে এবং অন্য কোনো যাচাইকৃত পেমেন্ট না থাকলে ট্রেইনি আনপেইড হয়ে যাবেন।`;
    } else {
      text = `পেমেন্ট স্ট্যাটাস ${p.status} থেকে ${nextStatus} করবেন?`;
    }
    if (!(await confirm(text, { tone: p.status === "VALID" && nextStatus !== "VALID" ? "warning" : "primary", title: nextStatus === "VALID" ? "পেমেন্ট যাচাই করবেন?" : "স্ট্যাটাস পরিবর্তন করবেন?", confirmLabel: nextStatus === "VALID" ? "হ্যাঁ, যাচাই করুন" : "হ্যাঁ, পরিবর্তন করুন" }))) return;

    setBusyId(p._id);
    const { ok, data, message } = await callApi("/api/admin/payments", {
      method: "PATCH",
      body: { paymentId: p._id, status: nextStatus },
    });
    setBusyId(null);
    if (!ok) {
      showToast(message, "error");
      return;
    }
    if (data.payment) replacePayment(data.payment);
    showToast(message || "স্ট্যাটাস আপডেট সম্পন্ন হয়েছে।");
  };

  const handleDelete = async (p) => {
    const extra =
      p.status === "VALID"
        ? "\n\n⚠ এটি একটি যাচাইকৃত পেমেন্ট — মুছে ফেললে এই পেমেন্ট থেকে পাওয়া কোর্স এনরোলমেন্ট বাতিল হবে।"
        : "";
    if (!(await confirm(`TrxID ${p.tranId} পেমেন্ট রেকর্ডটি স্থায়ীভাবে মুছে ফেলবেন?${extra}`, { tone: "danger", title: "পেমেন্ট রেকর্ড মুছে ফেলবেন?" }))) return;

    setBusyId(p._id);
    const { ok, message } = await callApi(`/api/admin/payments?id=${encodeURIComponent(p._id)}`, { method: "DELETE" });
    setBusyId(null);
    if (!ok) {
      showToast(message, "error");
      return;
    }
    setPayments((prev) => prev.filter((x) => x._id !== p._id));
    showToast(message || "পেমেন্ট রেকর্ড মুছে ফেলা হয়েছে।");
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setFormData(EMPTY_FORM);
    setAddError("");
    setAddResult(null);
  };

  const handleCreateOfflinePayment = async (e) => {
    e.preventDefault();
    setSavingPayment(true);
    setAddError("");
    const body = { ...formData, amount: String(formData.amount).trim() };
    const { ok, data, message } = await callApi("/api/admin/payments", { method: "POST", body });
    setSavingPayment(false);
    if (!ok) {
      setAddError(message);
      showToast(message, "error");
      return;
    }
    if (data.payment) setPayments((prev) => [data.payment, ...prev.filter((p) => p._id !== data.payment._id)]);
    showToast(message || "ম্যানুয়াল পেমেন্ট রেকর্ড হয়েছে।");
    if (data.generatedPassword) {
      setAddResult({ email: data.user?.email || formData.userEmail, password: data.generatedPassword });
    } else {
      closeAddModal();
    }
  };

  const openRefund = (p) => {
    setRefundTarget(p);
    setRefundForm({ amount: String(p.amount ?? ""), remarks: "Course Fee Refund" });
  };

  const handleRefund = async (e) => {
    e.preventDefault();
    if (!refundTarget) return;
    const amount = Number(refundForm.amount);
    const full = !amount || amount >= Number(refundTarget.amount);
    const text = `${refundTarget.userName || refundTarget.userEmail}-কে ${formatMoney(amount || refundTarget.amount, refundTarget.currency)} রিফান্ড করবেন?\n\nঅনুরোধটি সরাসরি SSLCommerz গেটওয়েতে যাবে এবং ফেরত নেওয়া যাবে না।${
      full ? "\n⚠ সম্পূর্ণ রিফান্ড হলে পেমেন্টটি REFUNDED হবে এবং ট্রেইনির কোর্স এনরোলমেন্ট বাতিল হবে।" : ""
    }`;
    if (!(await confirm(text, { tone: "danger", title: "রিফান্ড করবেন?", confirmLabel: "হ্যাঁ, রিফান্ড করুন" }))) return;

    setRefunding(true);
    const { ok, message } = await callApi("/api/payment/sslcommerz/refund", {
      method: "POST",
      body: { tranId: refundTarget.tranId, amount: amount || undefined, remarks: refundForm.remarks },
    });
    setRefunding(false);
    if (!ok) {
      showToast(message, "error");
      return;
    }
    setRefundTarget(null);
    showToast(message || "রিফান্ড অনুরোধ পাঠানো হয়েছে।");
    await reload(true);
  };

  const handleRefundStatus = async (p) => {
    setBusyId(p._id);
    const { ok, data, message } = await callApi(
      `/api/payment/sslcommerz/refund?refund_ref_id=${encodeURIComponent(p.refund.refId)}`
    );
    setBusyId(null);
    if (!ok) {
      showToast(message, "error");
      return;
    }
    const status = data?.data?.status || "অজানা";
    showToast(`রিফান্ড স্ট্যাটাস (গেটওয়ে): ${status}`);
    await reload(true);
  };

  const handleValidate = async (e) => {
    e.preventDefault();
    if (!valId.trim()) return;
    setValidating(true);
    const { ok, message } = await callApi("/api/payment/sslcommerz/validate", {
      method: "POST",
      body: { val_id: valId.trim() },
    });
    setValidating(false);
    if (!ok) {
      showToast(message, "error");
      return;
    }
    setValId("");
    showToast(message || "পেমেন্ট যাচাই সম্পন্ন হয়েছে।");
    await reload(true);
  };

  const q = search.trim().toLowerCase();
  const filtered = payments.filter((p) => {
    const matchesSearch =
      !q ||
      [p.tranId, p.userEmail, p.userName, p.userPhone, p.valId, p.bankTranId, p.courseId].some((v) =>
        String(v || "").toLowerCase().includes(q)
      );
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesPurpose = purposeFilter === "all" || p.purpose === purposeFilter;
    return matchesSearch && matchesStatus && matchesPurpose;
  });

  const validPayments = payments.filter((p) => p.status === "VALID");
  const totalCollected = validPayments.reduce((acc, p) => acc + netAmount(p), 0);
  const pendingCount = payments.filter((p) => p.status === "PENDING").length;

  const darkInput =
    "w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-[#D4AF37] focus:outline-hidden";
  const filterSelectCls = `rounded-2xl px-4 py-3 text-xs font-bold border shadow-xs outline-hidden transition-all w-full sm:w-auto cursor-pointer ${
    isLight ? "bg-white border-slate-300 text-slate-800 focus:border-amber-500" : "bg-slate-900 border-slate-800 text-white focus:border-amber-500"
  }`;
  const smallBtn = `px-2.5 py-1.5 max-sm:px-3.5 max-sm:py-2.5 max-sm:rounded-xl rounded-lg text-[11px] font-bold border transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1`;

  const emptyText = payments.length === 0 ? "কোনো পেমেন্ট রেকর্ড নেই" : "ফিল্টারের সাথে মেলে এমন কোনো পেমেন্ট পাওয়া যায়নি";
  const subtle = isLight ? "text-slate-500" : "text-slate-400";

  // Cell renderers shared by the desktop table and the phone cards.
  const payerBlock = (p) => (
    <>
      <div className={`font-bold wrap-break-word ${isLight ? "text-slate-900" : "text-white"}`}>{p.userName || "—"}</div>
      <div className={`text-[11px] font-mono break-all ${subtle}`}>{p.userEmail}</div>
      {p.userPhone && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <a href={`tel:${p.userPhone}`} title="কল করুন" className={`text-[11px] font-mono hover:underline ${subtle}`}>
            {p.userPhone}
          </a>
          {whatsappHref(p.userPhone) && (
            <a
              href={whatsappHref(
                p.userPhone,
                `আসসালামু আলাইকুম${p.userName ? `, ${p.userName}` : ""}। ফজর একাডেমির পেমেন্ট (${p.tranId}) সম্পর্কে যোগাযোগ করছি।`
              )}
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp-এ মেসেজ করুন"
              aria-label={`${p.userName || p.userPhone}-কে WhatsApp-এ মেসেজ করুন`}
              className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border transition-colors ${
                isLight
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                  : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
              }`}
            >
              <MessageCircle className="w-3 h-3" /> WhatsApp
            </a>
          )}
        </div>
      )}
    </>
  );

  const txBlock = (p) => (
    <>
      <span className={`font-mono font-bold block break-all ${isLight ? "text-amber-700" : "text-[#D4AF37]"}`}>{p.tranId}</span>
      <div className="flex flex-wrap items-center gap-1">
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            isLight ? "bg-indigo-50 text-indigo-800 border-indigo-200" : "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
          }`}
        >
          {PURPOSE_LABEL[p.purpose] || p.purpose || "—"}
        </span>
        <span className={`text-[10px] font-mono font-bold ${isLight ? "text-slate-600" : "text-slate-400"}`}>
          {p.courseId || "—"} • {trackLabel(p.track)}
        </span>
      </div>
      {p.notes && (
        <div className="text-[10px] italic max-w-[220px] truncate text-slate-500" title={p.notes}>
          {p.notes}
        </div>
      )}
    </>
  );

  const methodBlock = (p) => (
    <>
      <span
        className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
          isLight ? "bg-slate-100 text-slate-700 border-slate-300" : "bg-slate-800 text-slate-300 border-slate-700"
        }`}
      >
        {p.cardType || p.paymentMethod || "—"}
      </span>
      <div className="text-[10px] font-mono mt-1 text-slate-500">{p.paymentGateway || "—"}</div>
    </>
  );

  const amountBlock = (p) => (
    <>
      <div className={`font-bold font-mono text-sm ${isLight ? "text-emerald-700" : "text-emerald-400"}`}>{formatMoney(p.amount, p.currency)}</div>
      {p.refund?.refId && (
        <div className={`text-[10px] font-bold mt-0.5 ${isLight ? "text-rose-700" : "text-rose-400"}`}>
          রিফান্ড {formatMoney(p.refund.amount, p.currency)} • {p.refund.status || "—"}
        </div>
      )}
    </>
  );

  const dateBlock = (p) => (
    <>
      <div>{formatDate(p.createdAt, true)}</div>
      {p.finalizedAt && <div className="text-[10px] mt-0.5">যাচাই: {formatDate(p.finalizedAt, true)}</div>}
    </>
  );

  const statusBlock = (p, busy) => (
    <>
      <span className={`inline-block text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${statusBadgeCls(p.status, isLight)}`}>{p.status}</span>
      {p.verifiedBy && (
        <div className="text-[10px] font-mono max-w-[180px] truncate text-slate-500" title={p.verifiedBy}>
          যাচাইকারী: {p.verifiedBy}
        </div>
      )}
      {p.status !== "REFUNDED" && mayUpdate && (
        <select
          value=""
          disabled={busy}
          onChange={(e) => handleUpdateStatus(p, e.target.value)}
          aria-label={`${p.tranId}-এর স্ট্যাটাস পরিবর্তন`}
          className={`block w-full sm:w-auto border rounded-lg px-2 py-1 text-[10px] font-bold cursor-pointer outline-hidden disabled:opacity-50 ${
            isLight ? "bg-white border-slate-300 text-slate-700" : "bg-slate-950 border-slate-800 text-slate-300"
          }`}
        >
          <option value="">স্ট্যাটাস পরিবর্তন…</option>
          {SETTABLE_STATUSES.filter((st) => st !== p.status).map((st) => (
            <option key={st} value={st}>
              {STATUS_LABEL[st]}
            </option>
          ))}
        </select>
      )}
    </>
  );

  const actionButtons = (p, busy) => {
    const canRefund = mayUpdate && p.status === "VALID" && p.paymentGateway === "sslcommerz" && !p.refund?.refId;
    return (
      <div className="flex items-center justify-end gap-1.5 flex-wrap">
        {mayUpdate && p.status !== "VALID" && p.status !== "REFUNDED" && (
          <button
            onClick={() => handleUpdateStatus(p, "VALID")}
            disabled={busy}
            className="px-3 py-1.5 max-sm:px-4 max-sm:py-2.5 max-sm:rounded-xl rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            ✓ অনুমোদন দিন
          </button>
        )}
        {mayUpdate && p.status === "VALID" && (
          <button
            onClick={() => handleUpdateStatus(p, "PENDING")}
            disabled={busy}
            title="আন-ভেরিফাই: এনরোলমেন্ট বাতিল হবে"
            className={`${smallBtn} ${
              isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300" : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
            }`}
          >
            <Undo2 className="w-3 h-3" /> আন-ভেরিফাই
          </button>
        )}
        {canRefund && (
          <button
            onClick={() => openRefund(p)}
            disabled={busy}
            className={`${smallBtn} ${
              isLight ? "bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-300" : "bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border-rose-500/30"
            }`}
          >
            <RotateCcw className="w-3 h-3" /> রিফান্ড
          </button>
        )}
        {p.refund?.refId && (
          <button
            onClick={() => handleRefundStatus(p)}
            disabled={busy}
            title={`Refund ref: ${p.refund.refId}`}
            className={`${smallBtn} ${
              isLight ? "bg-white hover:bg-slate-100 text-slate-700 border-slate-300" : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700"
            }`}
          >
            <RefreshCw className={`w-3 h-3 ${busy ? "animate-spin" : ""}`} /> রিফান্ড স্ট্যাটাস
          </button>
        )}
        {isSuper && (
          <button
            onClick={() => handleDelete(p)}
            disabled={busy}
            className="p-1.5 max-sm:p-2.5 max-sm:rounded-xl rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-500 transition-colors cursor-pointer disabled:opacity-50"
            title="রেকর্ড মুছুন"
            aria-label="রেকর্ড মুছুন"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {confirmDialog}
      <AdminToast toast={toast} onClose={hideToast} />
      <DbErrorBanner message={loadError} isLight={isLight} onRetry={() => reload()} retrying={reloading} />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
            পেমেন্ট ভেরিফিকেশন ও ট্রানজেকশন লেজার
          </h1>
          <p className={`text-xs mt-1 font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
            SSLCommerz ও ম্যানুয়াল বিকাশ/নগদ পেমেন্ট অডিট ও ভেরিফিকেশন কনসোল • {validPayments.length} টি যাচাইকৃত • {pendingCount} টি পেন্ডিং
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div
            className={`w-full sm:w-auto justify-between px-4 py-2.5 rounded-2xl flex items-center gap-3 border shadow-xs transition-all ${
              isLight ? "bg-emerald-50/90 border-emerald-200 text-emerald-950" : "bg-slate-900 border-slate-800 text-white shadow-xl"
            }`}
            title="VALID পেমেন্টের মোট পরিমাণ (আংশিক রিফান্ড বাদে)"
          >
            <span className={`text-xs font-bold ${isLight ? "text-emerald-800" : "text-slate-400"}`}>মোট রেভিনিউ:</span>
            <span className={`text-lg font-black font-mono ${isLight ? "text-emerald-700" : "text-emerald-400"}`}>
              ৳ {totalCollected.toLocaleString("en-US")} BDT
            </span>
          </div>

          <button
            type="button"
            onClick={() => reload()}
            disabled={reloading}
            title="ডাটাবেজ থেকে আবার লোড করুন"
            className={`flex-1 sm:flex-none justify-center px-3 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60 ${
              isLight ? "bg-white border-slate-300 text-slate-800 hover:bg-slate-50" : "bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800"
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${reloading ? "animate-spin" : ""}`} /> রিফ্রেশ
          </button>

          {mayCreate && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 sm:flex-none justify-center inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#051329] font-bold text-xs shadow-lg hover:shadow-[#D4AF37]/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> ম্যানুয়াল পেমেন্ট
            </button>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:items-center sm:gap-3">
        <div className="relative flex-1 w-full col-span-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="TrxID, ইমেইল, নাম, ফোন, val_id বা কোর্স আইডি দিয়ে খুঁজুন..."
            className={`w-full rounded-2xl px-4 py-3 pl-11 text-xs sm:text-sm font-medium border shadow-xs outline-hidden transition-all ${
              isLight
                ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-amber-500"
                : "bg-slate-900/90 border-slate-800 text-white placeholder-slate-500 focus:border-amber-500 shadow-xl"
            }`}
          />
          <Search className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 ${isLight ? "text-slate-400" : "text-slate-500"}`} />
        </div>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={filterSelectCls}>
          <option value="all">সকল স্ট্যাটাস</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>

        <select value={purposeFilter} onChange={(e) => setPurposeFilter(e.target.value)} className={filterSelectCls}>
          <option value="all">সকল ধরন</option>
          {Object.entries(PURPOSE_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Gateway re-validation tool */}
      {mayUpdate && (
      <form
        onSubmit={handleValidate}
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center gap-3 text-xs ${
          isLight ? "bg-white border-slate-200 shadow-xs" : "bg-slate-900 border-slate-800"
        }`}
      >
        <div className="flex items-center gap-2 font-bold shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span className={isLight ? "text-slate-800" : "text-slate-200"}>গেটওয়ে পেমেন্ট পুনঃযাচাই</span>
        </div>
        <input
          type="text"
          value={valId}
          onChange={(e) => setValId(e.target.value)}
          placeholder="SSLCommerz val_id দিন (IPN না আসলে পেমেন্ট যাচাই ও অ্যাকাউন্ট সক্রিয় করতে)"
          className={`flex-1 px-3 py-2 rounded-xl border font-mono outline-hidden ${
            isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500" : "bg-slate-950 border-slate-800 text-white focus:border-emerald-500"
          }`}
        />
        <button
          type="submit"
          disabled={validating || !valId.trim()}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer disabled:opacity-50 shrink-0"
        >
          {validating ? "যাচাই হচ্ছে..." : "যাচাই করুন"}
        </button>
      </form>
      )}

      {/* Payments table (≥ md) and cards (< md) */}
      <div
        className={`rounded-3xl border overflow-hidden transition-all ${
          isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900 border-slate-800 shadow-2xl"
        }`}
      >
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr
                className={`border-b text-[10px] uppercase font-black tracking-wider ${
                  isLight ? "bg-slate-50/80 text-slate-500 border-slate-200" : "bg-slate-950/50 text-slate-400 border-slate-800"
                }`}
              >
                <th className="p-4">ট্রেইনি বিবরণ</th>
                <th className="p-4">ট্রানজেকশন ও কোর্স</th>
                <th className="p-4">মাধ্যম / মেথড</th>
                <th className="p-4">পরিমাণ</th>
                <th className="p-4">তারিখ ও সময়</th>
                <th className="p-4">স্ট্যাটাস</th>
                <th className="p-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-medium ${isLight ? "divide-slate-100" : "divide-slate-800/60"}`}>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold">
                    {emptyText}
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const busy = busyId === p._id;
                  return (
                    <tr key={p._id} className={`transition-colors ${isLight ? "hover:bg-slate-50/80" : "hover:bg-slate-800/40"}`}>
                      <td className="p-4">{payerBlock(p)}</td>
                      <td className="p-4 space-y-1">{txBlock(p)}</td>
                      <td className="p-4">{methodBlock(p)}</td>
                      <td className="p-4">{amountBlock(p)}</td>
                      <td className={`p-4 text-[11px] ${isLight ? "text-slate-600" : "text-slate-400"}`}>{dateBlock(p)}</td>
                      <td className="p-4 space-y-1.5">{statusBlock(p, busy)}</td>
                      <td className="p-4 text-right">{actionButtons(p, busy)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Phone layout: one card per transaction */}
        <ul className={`md:hidden divide-y ${isLight ? "divide-slate-100" : "divide-slate-800/60"}`}>
          {filtered.length === 0 ? (
            <li className="p-8 text-center text-slate-400 font-semibold text-xs">{emptyText}</li>
          ) : (
            filtered.map((p) => {
              const busy = busyId === p._id;
              return (
                <li key={p._id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">{payerBlock(p)}</div>
                    <div className="text-right shrink-0">{amountBlock(p)}</div>
                  </div>
                  <div className="space-y-1">{txBlock(p)}</div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>{methodBlock(p)}</div>
                    <div className={`text-[11px] text-right ${isLight ? "text-slate-600" : "text-slate-400"}`}>{dateBlock(p)}</div>
                  </div>
                  <div className="space-y-1.5">{statusBlock(p, busy)}</div>
                  {actionButtons(p, busy)}
                </li>
              );
            })
          )}
        </ul>
      </div>

      {/* Manual Offline Payment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#051329] border border-[#C59B27]/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 relative my-8">
            <button
              onClick={closeAddModal}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Offline Payment Entry</span>
              <h3 className="text-xl font-black text-white">ম্যানুয়াল পেমেন্ট রেকর্ড যুক্ত করুন</h3>
              <p className="text-xs text-slate-400">বিকাশ/নগদ/ব্যাংক ট্রান্সফারের মাধ্যমে প্রাপ্ত কোর্স ফি এন্ট্রি ও ট্রেইনি অ্যাকাউন্ট অ্যাক্টিভেশন</p>
            </div>

            {addResult ? (
              <GeneratedPasswordBox password={addResult.password} email={addResult.email} isLight={false} onDone={closeAddModal} />
            ) : (
              <form onSubmit={handleCreateOfflinePayment} className="space-y-4 text-xs">
                {addError && (
                  <div role="alert" className="p-3 rounded-xl border text-xs font-bold bg-rose-500/20 text-rose-200 border-rose-500/40">
                    {addError}
                  </div>
                )}

                <div>
                  <label className="block text-slate-300 font-bold mb-1">ট্রেইনির পূর্ণ নাম:</label>
                  <input
                    type="text"
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                    placeholder="নতুন ট্রেইনির জন্য আবশ্যক (বিদ্যমান অ্যাকাউন্টে ঐচ্ছিক)"
                    className={darkInput}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">ইমেইল (লগইন ইউজারনেম) *</label>
                    <input
                      type="email"
                      required
                      value={formData.userEmail}
                      onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                      placeholder="trainee@example.com"
                      className={darkInput}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">ফোন / WhatsApp নম্বর:</label>
                    <input
                      type="text"
                      value={formData.userPhone}
                      onChange={(e) => setFormData({ ...formData, userPhone: e.target.value })}
                      placeholder="01XXXXXXXXX"
                      className={darkInput}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">ব্যাচ ট্র্যাক:</label>
                    <select value={formData.track} onChange={(e) => setFormData({ ...formData, track: e.target.value })} className={darkInput}>
                      <option value="TOT-MEN">TOT-MEN (পুরুষ ব্যাচ)</option>
                      <option value="TOT-WOMEN-014">TOT-WOMEN-014 (মহিলা ব্যাচ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">পেমেন্ট মাধ্যম:</label>
                    <select value={formData.cardType} onChange={(e) => setFormData({ ...formData, cardType: e.target.value })} className={darkInput}>
                      {METHODS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">পরিশোধের পরিমাণ (BDT):</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="খালি রাখলে কোর্স ফি"
                      className={darkInput}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">TrxID (ঐচ্ছিক):</label>
                    <input
                      type="text"
                      value={formData.tranId}
                      onChange={(e) => setFormData({ ...formData, tranId: e.target.value })}
                      placeholder="খালি রাখলে স্বয়ংক্রিয় আইডি"
                      className={darkInput}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">স্ট্যাটাস:</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={darkInput}>
                    <option value="VALID">✓ VALID — এখনই যাচাই ও অ্যাকাউন্ট সক্রিয়</option>
                    <option value="PENDING">⏳ PENDING — পরে যাচাই করা হবে</option>
                  </select>
                  {formData.status === "PENDING" && (
                    <p className="text-[11px] text-amber-300 mt-1 leading-relaxed">
                      ⚠ পেন্ডিং পেমেন্টে অ্যাকাউন্ট যাচাইয়ের সময় তৈরি হয় এবং নতুন ট্রেইনির পাসওয়ার্ড তখন দেখানো হয় না। নতুন ট্রেইনির টাকা
                      পেয়ে গেলে সরাসরি VALID হিসেবে রেকর্ড করুন।
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">নোট (ঐচ্ছিক):</label>
                  <textarea
                    rows={2}
                    maxLength={500}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="যেমন: বিকাশ নম্বর 01XXXXXXXXX থেকে প্রাপ্ত"
                    className={`${darkInput} resize-none`}
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeAddModal}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold cursor-pointer"
                  >
                    বাতিল
                  </button>

                  <button
                    type="submit"
                    disabled={savingPayment}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#051329] font-bold shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {savingPayment ? "সংরক্ষণ হচ্ছে..." : formData.status === "VALID" ? "পেমেন্ট নিশ্চিত ও অ্যাক্টিভ করুন" : "পেন্ডিং পেমেন্ট রেকর্ড করুন"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border ${
              isLight ? "bg-white border-slate-200 text-slate-900" : "bg-slate-900 border-slate-800 text-white"
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isLight ? "border-slate-200" : "border-slate-800"}`}>
              <h3 className="font-black text-sm flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-500" /> SSLCommerz রিফান্ড অনুরোধ
              </h3>
              <button onClick={() => setRefundTarget(null)} className="text-slate-400 hover:text-rose-500 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className={`text-xs space-y-1 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              <div>
                ট্রেইনি: <strong className={isLight ? "text-slate-900" : "text-white"}>{refundTarget.userName || refundTarget.userEmail}</strong>
              </div>
              <div>
                TrxID: <span className="font-mono font-bold">{refundTarget.tranId}</span> • পরিশোধিত:{" "}
                <strong>{formatMoney(refundTarget.amount, refundTarget.currency)}</strong>
              </div>
            </div>

            <form onSubmit={handleRefund} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">রিফান্ডের পরিমাণ (সর্বোচ্চ {formatMoney(refundTarget.amount, refundTarget.currency)})</label>
                <input
                  type="number"
                  min="1"
                  max={refundTarget.amount}
                  value={refundForm.amount}
                  onChange={(e) => setRefundForm({ ...refundForm, amount: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border font-mono ${
                    isLight ? "bg-slate-50 border-slate-300" : "bg-slate-950 border-slate-800 text-white"
                  }`}
                />
              </div>
              <div>
                <label className="block font-bold mb-1">কারণ / মন্তব্য</label>
                <input
                  type="text"
                  maxLength={200}
                  value={refundForm.remarks}
                  onChange={(e) => setRefundForm({ ...refundForm, remarks: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border ${isLight ? "bg-slate-50 border-slate-300" : "bg-slate-950 border-slate-800 text-white"}`}
                />
              </div>
              <p className={`text-[11px] leading-relaxed ${isLight ? "text-rose-700" : "text-rose-300"}`}>
                ⚠ রিফান্ড অনুরোধ সরাসরি গেটওয়েতে যায় এবং ফেরত নেওয়া যায় না। সম্পূর্ণ রিফান্ড হলে পেমেন্টটি REFUNDED হবে এবং ট্রেইনির কোর্স
                এনরোলমেন্ট বাতিল হবে।
              </p>
              <div className={`pt-2 flex justify-end gap-2 border-t ${isLight ? "border-slate-200" : "border-slate-800"}`}>
                <button type="button" onClick={() => setRefundTarget(null)} className="px-4 py-2 rounded-xl border font-bold cursor-pointer">
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={refunding}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black cursor-pointer disabled:opacity-50"
                >
                  {refunding ? "অনুরোধ পাঠানো হচ্ছে..." : "রিফান্ড অনুরোধ পাঠান"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
