'use client';

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Search,
  Plus,
  Trash2,
  X,
  RefreshCw,
  Undo2,
  ShieldCheck,
  RotateCcw,
  MessageCircle,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  ListFilter,
  Phone,
  Copy,
  Check,
} from "lucide-react";
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
import { convertBengaliToEnglishNumbers } from "@/lib/phone";

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

/** Normalize phone string to standard 11-digit local format: 01XXXXXXXXX */
export function normalizePhone(input) {
  if (!input) return "";
  const digits = convertBengaliToEnglishNumbers(String(input)).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("880") && digits.length >= 13) return digits.slice(2);
  if (digits.startsWith("88") && digits.length >= 12) return digits.slice(2);
  if (digits.length === 10 && digits.startsWith("1")) return "0" + digits;
  return digits;
}

const netAmount = (p) => (Number(p.amount) || 0) - (Number(p.refund?.amount) || 0);

function statusBadgeCls(status, isLight) {
  if (status === "VALID")
    return isLight
      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
  if (status === "PENDING" || status === "UNATTEMPTED")
    return isLight
      ? "bg-amber-50 text-amber-900 border-amber-300"
      : "bg-amber-500/20 text-amber-300 border-amber-500/30";
  if (status === "REFUNDED")
    return isLight
      ? "bg-slate-100 text-slate-700 border-slate-300"
      : "bg-slate-800 text-slate-300 border-slate-700";
  return isLight
    ? "bg-rose-50 text-rose-800 border-rose-300"
    : "bg-rose-500/20 text-rose-300 border-rose-500/30";
}

const PURPOSE_LABEL_EN = {
  registration: "New Registration",
  "course-purchase": "Course Purchase",
  manual: "Manual Entry",
};

/** Clean English date/time for PDF export (jsPDF built-in fonts are ASCII-only). */
function formatDatePdf(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  const datePart = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    numberingSystem: "latn",
  });
  const timePart = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    numberingSystem: "latn",
  });
  return `${datePart}\n${timePart}`;
}

/** Clean ASCII track label for PDF export. */
function trackLabelPdf(track) {
  if (!track) return "-";
  const clean = convertBengaliToEnglishNumbers(String(track).trim());
  const upper = clean.toUpperCase();
  if (upper.includes("WOMEN")) return clean;
  if (upper.includes("MEN")) return clean;
  return clean.replace(/[^\x20-\x7E]/g, "") || "-";
}

/** Normalize digits/punctuation to ASCII; returns string (may still contain non-ASCII letters like Bengali names). */
function sanitizePdfPunctuation(str) {
  if (str === null || str === undefined) return "-";
  const s = convertBengaliToEnglishNumbers(String(str).trim())
    .replace(/[\u2013\u2014\u2212]/g, "-")
    .replace(/[\u2022\u00B7]/g, "|")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"');
  return s || "-";
}

/**
 * Render non-ASCII text (e.g. Bengali trainee names) to a high-DPI PNG via HTML5 Canvas
 * so jsPDF can embed it with full browser-shaped Bengali ligatures instead of garbled bytes.
 */
function renderUnicodeTextToImage(text, maxWidthPt, fontSizePt = 8, color = "#0f172a") {
  if (typeof document === "undefined") return null;
  const scale = 3;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const fontPx = Math.round(fontSizePt * 1.333 * scale);
  const lineHeightPx = Math.round(fontPx * 1.35);
  const padPx = Math.round(2 * scale);
  const maxW = Math.max(Math.round(maxWidthPt * 1.333 * scale), 60 * scale);
  const fontStack = `600 ${fontPx}px "Hind Siliguri", "Noto Sans Bengali", "Nirmala UI", "Segoe UI", sans-serif`;

  ctx.font = fontStack;
  const words = String(text || "").trim().split(/\s+/);
  const lines = [];
  let current = "";
  for (const w of words) {
    const test = current ? `${current} ${w}` : w;
    if (ctx.measureText(test).width > maxW - padPx * 2 && current) {
      lines.push(current);
      current = w;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  if (!lines.length) lines.push("-");

  canvas.width = maxW;
  canvas.height = lines.length * lineHeightPx + padPx * 2;

  ctx.font = fontStack;
  ctx.fillStyle = color;
  ctx.textBaseline = "top";
  lines.forEach((line, i) => {
    ctx.fillText(line, padPx, padPx + i * lineHeightPx);
  });

  return {
    dataUrl: canvas.toDataURL("image/png"),
    widthPt: maxW / (1.333 * scale),
    heightPt: canvas.height / (1.333 * scale),
  };
}

const escapeXml = (unsafe) => {
  return String(unsafe ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

/** Normalize URL ?tab=... param into one of the 4 canonical tab keys. */
function normalizeTabParam(raw) {
  const v = String(raw || "").trim().toLowerCase();
  if (v === "pending") return "pending";
  if (v === "cancel" || v === "cancelled" || v === "canceled") return "cancelled";
  if (v === "valid" || v === "valide") return "valid";
  if (v === "all") return "all";
  return "pending";
}

function tabToStatus(tabKey) {
  if (tabKey === "pending") return "PENDING";
  if (tabKey === "cancelled") return "CANCELLED";
  if (tabKey === "valid") return "VALID";
  return "all";
}

export default function AdminPaymentsClient({
  initialPayments,
  loadError: initialLoadError,
  initialTab = "pending",
  initialPhoneFilter = "all",
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const resolvedInitialTab = normalizeTabParam(searchParams?.get("tab") || searchParams?.get("status") || initialTab);
  const resolvedInitialPhone = searchParams?.get("phone") || initialPhoneFilter || "all";

  const [payments, setPayments] = useState(initialPayments || []);
  const [loadError, setLoadError] = useState(initialLoadError);
  const [reloading, setReloading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(resolvedInitialTab); // "pending" | "cancelled" | "valid" | "all"
  const [statusFilter, setStatusFilter] = useState(tabToStatus(resolvedInitialTab));
  const [purposeFilter, setPurposeFilter] = useState("all");
  const [phoneFilter, setPhoneFilter] = useState(resolvedInitialPhone); // "all" | "duplicate" | "unique" | "missing"
  const [busyId, setBusyId] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const exportMenuRef = useRef(null);

  // Sync local state if URL searchParams change (e.g. browser back/forward navigation)
  useEffect(() => {
    const urlTab = searchParams?.get("tab") || searchParams?.get("status");
    if (urlTab) {
      const nextTab = normalizeTabParam(urlTab);
      setActiveTab(nextTab);
      setStatusFilter(tabToStatus(nextTab));
    }
    const urlPhone = searchParams?.get("phone");
    if (urlPhone && ["all", "duplicate", "unique", "missing"].includes(urlPhone)) {
      setPhoneFilter(urlPhone);
    }
  }, [searchParams]);

  const updateUrlParams = (updates) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    params.delete("status");
    Object.entries(updates).forEach(([k, v]) => {
      if (!v || (k === "phone" && v === "all")) {
        params.delete(k);
      } else {
        params.set(k, v);
      }
    });
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const handleTabChange = (nextTab) => {
    const cleanTab = normalizeTabParam(nextTab);
    setActiveTab(cleanTab);
    setStatusFilter(tabToStatus(cleanTab));
    updateUrlParams({ tab: cleanTab });
  };

  const handleStatusDropdownChange = (nextStatus) => {
    setStatusFilter(nextStatus);
    if (nextStatus === "PENDING") {
      setActiveTab("pending");
      updateUrlParams({ tab: "pending" });
    } else if (nextStatus === "CANCELLED") {
      setActiveTab("cancelled");
      updateUrlParams({ tab: "cancelled" });
    } else if (nextStatus === "VALID") {
      setActiveTab("valid");
      updateUrlParams({ tab: "valid" });
    } else {
      setActiveTab("all");
      updateUrlParams({ tab: "all" });
    }
  };

  const handlePhoneFilterChange = (nextPhoneFilter) => {
    setPhoneFilter(nextPhoneFilter);
    updateUrlParams({ tab: activeTab, phone: nextPhoneFilter });
  };

  const { isLight } = useAdminTheme();
  const { can, isSuper } = useAdminAccess();
  const mayCreate = can("payments", "create"); // manual payments
  const mayUpdate = can("payments", "update"); // verify, un-verify, refund, re-validate
  const { toast, showToast, hideToast } = useToast();
  const { confirm, confirmDialog } = useConfirm();

  // Manual payment modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [savingPayment, setSavingPayment] = useState(false);
  const [addError, setAddError] = useState("");
  const [addResult, setAddResult] = useState(null);

  // Refund modal
  const [refundTarget, setRefundTarget] = useState(null);
  const [refundForm, setRefundForm] = useState({ amount: "", remarks: "Course Fee Refund" });
  const [refunding, setRefunding] = useState(false);

  // Gateway re-validation tool
  const [valId, setValId] = useState("");
  const [validating, setValidating] = useState(false);

  // Close export menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute normalized phone frequency map across all payments
  const phoneCounts = useMemo(() => {
    const map = new Map();
    payments.forEach((p) => {
      const norm = normalizePhone(p.userPhone);
      if (norm) {
        map.set(norm, (map.get(norm) || 0) + 1);
      }
    });
    return map;
  }, [payments]);

  // Statistics for phone numbers
  const { duplicatePaymentsCount, uniquePaymentsCount, missingPhoneCount, distinctDuplicatePhonesCount } = useMemo(() => {
    let dupCount = 0;
    let uqCount = 0;
    let missCount = 0;

    payments.forEach((p) => {
      const norm = normalizePhone(p.userPhone);
      if (!norm) {
        missCount++;
      } else {
        const freq = phoneCounts.get(norm) || 0;
        if (freq > 1) dupCount++;
        else if (freq === 1) uqCount++;
      }
    });

    let distinctDup = 0;
    phoneCounts.forEach((freq) => {
      if (freq > 1) distinctDup++;
    });

    return {
      duplicatePaymentsCount: dupCount,
      uniquePaymentsCount: uqCount,
      missingPhoneCount: missCount,
      distinctDuplicatePhonesCount: distinctDup,
    };
  }, [payments, phoneCounts]);

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
    if (
      !(await confirm(text, {
        tone: p.status === "VALID" && nextStatus !== "VALID" ? "warning" : "primary",
        title: nextStatus === "VALID" ? "পেমেন্ট যাচাই করবেন?" : "স্ট্যাটাস পরিবর্তন করবেন?",
        confirmLabel: nextStatus === "VALID" ? "হ্যাঁ, যাচাই করুন" : "হ্যাঁ, পরিবর্তন করুন",
      }))
    )
      return;

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
    if (
      !(await confirm(`TrxID ${p.tranId} পেমেন্ট রেকর্ডটি স্থায়ীভাবে মুছে ফেলবেন?${extra}`, {
        tone: "danger",
        title: "পেমেন্ট রেকর্ড মুছে ফেলবেন?",
      }))
    )
      return;

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
    const text = `${refundTarget.userName || refundTarget.userEmail}-কে ${formatMoney(
      amount || refundTarget.amount,
      refundTarget.currency
    )} রিফান্ড করবেন?\n\nঅনুরোধটি সরাসরি SSLCommerz গেটওয়েতে যাবে এবং ফেরত নেওয়া যাবে না।${
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

  // Main Filter Logic (Search + Status + Purpose + Duplicate/Unique Phone)
  const q = search.trim().toLowerCase();
  const filtered = useMemo(() => {
    return payments.filter((p) => {
      const matchesSearch =
        !q ||
        [p.tranId, p.userEmail, p.userName, p.userPhone, p.valId, p.bankTranId, p.courseId].some((v) =>
          String(v || "").toLowerCase().includes(q)
        );

      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      const matchesPurpose = purposeFilter === "all" || p.purpose === purposeFilter;

      const norm = normalizePhone(p.userPhone);
      const freq = norm ? phoneCounts.get(norm) || 0 : 0;

      let matchesPhone = true;
      if (phoneFilter === "duplicate") {
        matchesPhone = Boolean(norm && freq > 1);
      } else if (phoneFilter === "unique") {
        matchesPhone = Boolean(norm && freq === 1);
      } else if (phoneFilter === "missing") {
        matchesPhone = !norm;
      }

      return matchesSearch && matchesStatus && matchesPurpose && matchesPhone;
    });
  }, [payments, q, statusFilter, purposeFilter, phoneFilter, phoneCounts]);

  const pendingPayments = payments.filter((p) => p.status === "PENDING");
  const cancelledPayments = payments.filter((p) => p.status === "CANCELLED");
  const validPayments = payments.filter((p) => p.status === "VALID");

  const pendingCount = pendingPayments.length;
  const pendingAmount = pendingPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  const cancelledCount = cancelledPayments.length;
  const cancelledAmount = cancelledPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  const validCount = validPayments.length;
  const totalCollected = validPayments.reduce((acc, p) => acc + netAmount(p), 0);

  const allCount = payments.length;
  const allGrossAmount = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  const filteredTotalNet = filtered.reduce((acc, p) => acc + netAmount(p), 0);

  const getExportTag = () => {
    const tabPart =
      activeTab === "pending"
        ? "_Pending"
        : activeTab === "cancelled"
        ? "_Cancelled"
        : activeTab === "valid"
        ? "_Valid"
        : "_All";
    const phonePart = phoneFilter === "duplicate" ? "_Duplicates" : phoneFilter === "unique" ? "_Uniques" : "";
    return `${tabPart}${phonePart}`;
  };

  // Filter description for exports
  const getFilterDescription = () => {
    const parts = [];
    if (statusFilter !== "all") parts.push(`স্ট্যাটাস: ${statusFilter}`);
    if (purposeFilter !== "all") parts.push(`ধরন: ${PURPOSE_LABEL[purposeFilter] || purposeFilter}`);
    if (phoneFilter === "duplicate") parts.push("ডুপ্লিকেট ফোন নম্বর");
    else if (phoneFilter === "unique") parts.push("ইউনিক ফোন নম্বর");
    else if (phoneFilter === "missing") parts.push("ফোন নম্বর বিহীন");
    if (search.trim()) parts.push(`সার্চ: "${search.trim()}"`);
    return parts.length ? parts.join(" • ") : "সকল পেমেন্ট রেকর্ড";
  };

  // -----------------------------------------------------------------
  // EXPORT HANDLERS (Excel .xls, CSV .csv, PDF .pdf, Print)
  // -----------------------------------------------------------------

  // 1. Export Excel (.xls formatted HTML workbook)
  const handleExportExcel = () => {
    if (filtered.length === 0) {
      showToast("এক্সপোর্ট করার মতো কোনো পেমেন্ট রেকর্ড নেই", "error");
      return;
    }

    const dateStr = new Date().toLocaleDateString("bn-BD");
    const timeStr = new Date().toLocaleTimeString("bn-BD");

    const tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Payment Ledger</x:Name>
                <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheet>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; }
          table { border-collapse: collapse; width: 100%; margin-top: 10px; }
          th { background-color: #071328; color: #F59E0B; font-weight: bold; border: 1px solid #CBD5E1; padding: 10px 12px; text-align: left; }
          td { border: 1px solid #CBD5E1; padding: 7px 10px; vertical-align: middle; }
          .valid { background-color: #DCFCE7; color: #166534; font-weight: bold; }
          .pending { background-color: #FEF3C7; color: #92400E; font-weight: bold; }
          .failed { background-color: #FEE2E2; color: #991B1B; font-weight: bold; }
          .refunded { background-color: #F1F5F9; color: #475569; font-weight: bold; }
          .duplicate { background-color: #FEF08A; color: #854D0E; font-weight: bold; }
          .unique { color: #15803D; font-weight: bold; }
          .num { text-align: right; mso-number-format: "#,##0.00"; }
          .txt { mso-number-format: "\\@"; }
          .hdr-title { font-size: 16pt; font-weight: bold; color: #071328; }
          .hdr-sub { font-size: 10pt; color: #64748B; margin-bottom: 8px; }
        </style>
      </head>
      <body>
        <div class="hdr-title">FAJR ACADEMY — TOT PAYMENT AUDIT & FINANCIAL LEDGER</div>
        <div class="hdr-sub">
          রিপোর্ট তৈরির তারিখ: ${dateStr} (${timeStr}) | মোট রেকর্ড: ${filtered.length} টি | মোট নেট রেভিনিউ: ৳ ${filteredTotalNet.toLocaleString("en-US")} BDT | ফিল্টার: ${getFilterDescription()}
        </div>
        <table>
          <thead>
            <tr>
              <th>ক্রমিক</th>
              <th>ট্রানজেকশন আইডি (TrxID)</th>
              <th>ট্রেইনির নাম</th>
              <th>মোবাইল নম্বর</th>
              <th>ফোন স্ট্যাটাস</th>
              <th>ইমেইল</th>
              <th>কোর্স ও ট্র্যাক</th>
              <th>পেমেন্ট মাধ্যম</th>
              <th>পরিমাণ (BDT)</th>
              <th>রিফান্ড (BDT)</th>
              <th>নেট পরিমাণ (BDT)</th>
              <th>স্ট্যাটাস</th>
              <th>উদ্দেশ্য</th>
              <th>পেমেন্টের তারিখ</th>
              <th>যাচাইয়ের তারিখ</th>
              <th>যাচাইকারী</th>
              <th>নোট</th>
            </tr>
          </thead>
          <tbody>
            ${filtered
              .map((p, idx) => {
                const norm = normalizePhone(p.userPhone);
                const count = norm ? phoneCounts.get(norm) || 0 : 0;
                const dupLabel = count > 1 ? `ডুপ্লিকেট (${count} বার)` : count === 1 ? "ইউনিক" : "ফোন নেই";
                const dupClass = count > 1 ? "duplicate" : count === 1 ? "unique" : "";
                const stClass =
                  p.status === "VALID"
                    ? "valid"
                    : p.status === "PENDING"
                    ? "pending"
                    : p.status === "REFUNDED"
                    ? "refunded"
                    : "failed";

                return `
                <tr>
                  <td>${idx + 1}</td>
                  <td class="txt" style="font-family: monospace; font-weight: bold;">${escapeXml(p.tranId)}</td>
                  <td>${escapeXml(p.userName || "—")}</td>
                  <td class="txt">${escapeXml(p.userPhone || "—")}</td>
                  <td class="${dupClass}">${dupLabel}</td>
                  <td>${escapeXml(p.userEmail || "—")}</td>
                  <td>${escapeXml(p.courseId || "—")} (${escapeXml(trackLabel(p.track))})</td>
                  <td>${escapeXml(p.cardType || p.paymentMethod || "—")} (${escapeXml(p.paymentGateway || "—")})</td>
                  <td class="num">${Number(p.amount) || 0}</td>
                  <td class="num">${Number(p.refund?.amount) || 0}</td>
                  <td class="num">${netAmount(p)}</td>
                  <td class="${stClass}">${p.status || "—"}</td>
                  <td>${escapeXml(PURPOSE_LABEL[p.purpose] || p.purpose || "—")}</td>
                  <td>${formatDate(p.createdAt, true)}</td>
                  <td>${p.finalizedAt ? formatDate(p.finalizedAt, true) : "—"}</td>
                  <td>${escapeXml(p.verifiedBy || "—")}</td>
                  <td>${escapeXml(p.notes || "")}</td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
          <tfoot>
            <tr style="font-weight: bold; background-color: #F8FAFC;">
              <td colspan="8" style="text-align: right;">সর্বমোট:</td>
              <td class="num">${filtered.reduce((a, b) => a + (Number(b.amount) || 0), 0)}</td>
              <td class="num">${filtered.reduce((a, b) => a + (Number(b.refund?.amount) || 0), 0)}</td>
              <td class="num">${filteredTotalNet}</td>
              <td colspan="6"></td>
            </tr>
          </tfoot>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(["\uFEFF" + tableHtml], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Fajr_Academy_Payments${getExportTag()}_${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
    showToast(`${filtered.length} টি পেমেন্ট রেকর্ড Excel (.xls) ফাইলে ডাউনলোড হয়েছে!`);
  };

  // 2. Export CSV (.csv with UTF-8 BOM)
  const handleExportCSV = () => {
    if (filtered.length === 0) {
      showToast("এক্সপোর্ট করার মতো কোনো ডাটা নেই", "error");
      return;
    }

    const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

    const headers = [
      "SL",
      "Transaction ID",
      "Trainee Name",
      "Phone Number",
      "Phone Status",
      "Duplicate Count",
      "Email",
      "Track",
      "Course ID",
      "Method",
      "Gateway",
      "Amount (BDT)",
      "Refund (BDT)",
      "Net Amount (BDT)",
      "Status",
      "Purpose",
      "Created Date",
      "Verified Date",
      "Verified By",
      "Notes",
    ];

    const rows = filtered.map((p, idx) => {
      const norm = normalizePhone(p.userPhone);
      const count = norm ? phoneCounts.get(norm) || 0 : 0;
      const phoneStatus = count > 1 ? `Duplicate (${count}x)` : count === 1 ? "Unique" : "No Phone";

      return [
        idx + 1,
        csvCell(p.tranId),
        csvCell(p.userName),
        csvCell(p.userPhone),
        csvCell(phoneStatus),
        count,
        csvCell(p.userEmail),
        csvCell(trackLabel(p.track)),
        csvCell(p.courseId),
        csvCell(p.cardType || p.paymentMethod),
        csvCell(p.paymentGateway),
        Number(p.amount) || 0,
        Number(p.refund?.amount) || 0,
        netAmount(p),
        csvCell(p.status),
        csvCell(PURPOSE_LABEL[p.purpose] || p.purpose),
        csvCell(formatDate(p.createdAt, true)),
        csvCell(p.finalizedAt ? formatDate(p.finalizedAt, true) : ""),
        csvCell(p.verifiedBy),
        csvCell(p.notes),
      ];
    });

    const csv = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Fajr_Academy_Payments${getExportTag()}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
    showToast(`${filtered.length} টি পেমেন্ট রেকর্ড CSV ফাইলে ডাউনলোড হয়েছে!`);
  };

  // 3. Export PDF (.pdf) via jsPDF + autoTable (with ASCII formatting + Canvas fallback for Unicode/Bengali names)
  const handleExportPDF = async () => {
    if (filtered.length === 0) {
      showToast("এক্সপোর্ট করার মতো কোনো ডাটা নেই", "error");
      return;
    }

    setExportingPdf(true);
    setShowExportMenu(false);
    showToast("PDF ফাইল প্রস্তুত হচ্ছে...", "info");

    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const totalGrossVal = filtered.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
      const totalNetVal = filtered.reduce((acc, p) => acc + netAmount(p), 0);

      // Clean English Filter Description for PDF Header
      const filterParts = [];
      if (statusFilter !== "all") filterParts.push(`Status: ${statusFilter}`);
      if (purposeFilter !== "all") filterParts.push(`Purpose: ${PURPOSE_LABEL_EN[purposeFilter] || purposeFilter}`);
      if (phoneFilter === "duplicate") filterParts.push("Phone: Duplicate Numbers Only");
      else if (phoneFilter === "unique") filterParts.push("Phone: Unique Numbers Only");
      else if (phoneFilter === "missing") filterParts.push("Phone: Without Phone Number");
      if (search.trim()) {
        const cleanSearch = sanitizePdfPunctuation(search.trim());
        filterParts.push(/[^\x20-\x7E]/.test(cleanSearch) ? "Search: Custom Query" : `Search: "${cleanSearch}"`);
      }
      const filterSummaryEn = filterParts.length ? filterParts.join("  |  ") : "All Payment Records";

      // Header Banner (100% ASCII)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(7, 19, 40);
      doc.text("FAJR ACADEMY - TOT PAYMENT AUDIT & FINANCIAL LEDGER", 28, 36);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      const now = new Date();
      const genDate = `${now.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        numberingSystem: "latn",
      })}, ${now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        numberingSystem: "latn",
      })}`;

      doc.text(
        `Generated: ${genDate}   |   Records: ${filtered.length}   |   Gross: BDT ${totalGrossVal.toLocaleString(
          "en-US"
        )}   |   Net Total: BDT ${totalNetVal.toLocaleString("en-US")}`,
        28,
        51
      );
      doc.text(`Filter: ${filterSummaryEn}`, 28, 64);

      // Columns
      const head = [
        [
          "#",
          "TrxID",
          "Trainee Name",
          "Phone Number",
          "Phone Status",
          "Email",
          "Track",
          "Method",
          "Amount (BDT)",
          "Net (BDT)",
          "Status",
          "Date & Time",
        ],
      ];

      const body = filtered.map((p, idx) => {
        const norm = normalizePhone(p.userPhone);
        const count = norm ? phoneCounts.get(norm) || 0 : 0;
        const phoneStatus = count > 1 ? `DUPLICATE (${count}x)` : count === 1 ? "UNIQUE" : "NO PHONE";

        return [
          String(idx + 1),
          sanitizePdfPunctuation(p.tranId || "-"),
          sanitizePdfPunctuation(p.userName || "-"),
          sanitizePdfPunctuation(p.userPhone || "-"),
          phoneStatus,
          sanitizePdfPunctuation(p.userEmail || "-"),
          trackLabelPdf(p.track),
          sanitizePdfPunctuation(p.cardType || p.paymentMethod || p.paymentGateway || "-"),
          (Number(p.amount) || 0).toLocaleString("en-US"),
          netAmount(p).toLocaleString("en-US"),
          sanitizePdfPunctuation(p.status || "-"),
          formatDatePdf(p.createdAt),
        ];
      });

      const colWidths = {
        0: 24,
        1: 82,
        2: 92,
        3: 72,
        4: 68,
        5: 102,
        6: 62,
        7: 52,
        8: 52,
        9: 50,
        10: 62,
        11: 67,
      };

      autoTable(doc, {
        startY: 76,
        margin: { left: 28, right: 28 },
        head: head,
        body: body,
        theme: "grid",
        styles: {
          font: "helvetica",
          fontSize: 8,
          cellPadding: 4,
          overflow: "linebreak",
          valign: "middle",
          textColor: [15, 23, 42],
          lineColor: [203, 213, 225],
          lineWidth: 0.5,
        },
        headStyles: {
          fillColor: [7, 19, 40],
          textColor: [245, 158, 11],
          fontStyle: "bold",
          halign: "left",
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: colWidths[0], halign: "center" },
          1: { cellWidth: colWidths[1], fontStyle: "bold" },
          2: { cellWidth: colWidths[2] },
          3: { cellWidth: colWidths[3] },
          4: { cellWidth: colWidths[4], halign: "center" },
          5: { cellWidth: colWidths[5] },
          6: { cellWidth: colWidths[6] },
          7: { cellWidth: colWidths[7] },
          8: { cellWidth: colWidths[8], halign: "right" },
          9: { cellWidth: colWidths[9], halign: "right", fontStyle: "bold" },
          10: { cellWidth: colWidths[10], halign: "center" },
          11: { cellWidth: colWidths[11] },
        },
        didParseCell: (data) => {
          if (data.section === "body") {
            // Status styling
            if (data.column.index === 10) {
              const val = String(data.cell.raw || "");
              if (val === "VALID") {
                data.cell.styles.textColor = [22, 101, 52];
                data.cell.styles.fillColor = [220, 252, 231];
              } else if (val === "PENDING" || val === "UNATTEMPTED") {
                data.cell.styles.textColor = [146, 64, 14];
                data.cell.styles.fillColor = [254, 243, 199];
              } else if (val === "REFUNDED") {
                data.cell.styles.textColor = [71, 85, 105];
                data.cell.styles.fillColor = [241, 245, 249];
              } else {
                data.cell.styles.textColor = [153, 27, 27];
                data.cell.styles.fillColor = [254, 226, 226];
              }
              data.cell.styles.fontStyle = "bold";
            }

            // Phone duplicate / unique highlight
            if (data.column.index === 4) {
              const val = String(data.cell.raw || "");
              if (val.startsWith("DUPLICATE")) {
                data.cell.styles.fillColor = [254, 243, 199];
                data.cell.styles.textColor = [146, 64, 14];
                data.cell.styles.fontStyle = "bold";
              } else if (val === "UNIQUE") {
                data.cell.styles.textColor = [21, 128, 61];
                data.cell.styles.fontStyle = "bold";
              }
            }

            // If any cell contains non-ASCII characters (e.g. Bengali Trainee Name),
            // render via high-DPI HTML5 Canvas so jsPDF never prints mojibake bytes.
            const rawStr = String(data.cell.raw ?? "");
            if (/[^\x00-\x7F]/.test(rawStr)) {
              const cw = (colWidths[data.column.index] || 80) - 8;
              const img = renderUnicodeTextToImage(rawStr, cw, 8, "#0f172a");
              if (img) {
                data.cell._unicodeImg = img;
                data.cell.text = [""];
                if (img.heightPt + 8 > (data.cell.styles.minCellHeight || 0)) {
                  data.cell.styles.minCellHeight = img.heightPt + 8;
                }
              } else {
                data.cell.text = [rawStr.replace(/[^\x20-\x7E]/g, "") || "-"];
              }
            }
          }
        },
        didDrawCell: (data) => {
          if (data.section === "body" && data.cell._unicodeImg) {
            const img = data.cell._unicodeImg;
            const x = data.cell.x + 4;
            const y = data.cell.y + Math.max(2, (data.cell.height - img.heightPt) / 2);
            doc.addImage(img.dataUrl, "PNG", x, y, img.widthPt, img.heightPt);
          }
        },
        foot: [
          [
            "",
            "",
            "TOTAL",
            "",
            "",
            "",
            "",
            "",
            totalGrossVal.toLocaleString("en-US"),
            totalNetVal.toLocaleString("en-US"),
            "",
            "",
          ],
        ],
        footStyles: {
          fillColor: [241, 245, 249],
          textColor: [15, 23, 42],
          fontStyle: "bold",
          halign: "right",
        },
      });

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Page ${i} of ${pageCount}  |  Fajr Academy Teacher Training Division`,
          28,
          doc.internal.pageSize.height - 16
        );
      }

      doc.save(`Fajr_Academy_Payments${getExportTag()}_${new Date().toISOString().slice(0, 10)}.pdf`);
      showToast(`${filtered.length} টি পেমেন্ট রেকর্ড PDF ফাইলে ডাউনলোড হয়েছে!`);
    } catch (err) {
      console.error("PDF export error:", err);
      showToast("PDF তৈরিতে সমস্যা হয়েছে: " + (err?.message || err), "error");
    } finally {
      setExportingPdf(false);
    }
  };

  // 4. Print / Save as PDF
  const handlePrint = () => {
    setShowExportMenu(false);
    window.print();
  };

  const darkInput =
    "w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-[#D4AF37] focus:outline-hidden";
  const filterSelectCls = `rounded-2xl px-4 py-3 text-xs font-bold border shadow-xs outline-hidden transition-all w-full sm:w-auto cursor-pointer ${
    isLight
      ? "bg-white border-slate-300 text-slate-800 focus:border-amber-500"
      : "bg-slate-900 border-slate-800 text-white focus:border-amber-500"
  }`;
  const smallBtn = `px-2.5 py-1.5 max-sm:px-3.5 max-sm:py-2.5 max-sm:rounded-xl rounded-lg text-[11px] font-bold border transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1`;

  const emptyText = payments.length === 0 ? "কোনো পেমেন্ট রেকর্ড নেই" : "ফিল্টারের সাথে মেলে এমন কোনো পেমেন্ট পাওয়া যায়নি";
  const subtle = isLight ? "text-slate-500" : "text-slate-400";

  // Cell renderers shared by the desktop table and the phone cards.
  const payerBlock = (p) => {
    const norm = normalizePhone(p.userPhone);
    const count = norm ? phoneCounts.get(norm) || 0 : 0;
    const isDup = count > 1;

    return (
      <>
        <div className={`font-bold wrap-break-word ${isLight ? "text-slate-900" : "text-white"}`}>{p.userName || "—"}</div>
        <div className={`text-[11px] font-mono break-all ${subtle}`}>{p.userEmail}</div>
        {p.userPhone ? (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <a href={`tel:${p.userPhone}`} title="কল করুন" className={`text-[11px] font-mono font-bold hover:underline ${subtle}`}>
              {p.userPhone}
            </a>

            {/* Duplicate / Unique Number Badge with One-Click Filter */}
            {isDup ? (
              <button
                type="button"
                onClick={() => {
                  setSearch(p.userPhone);
                  setPhoneFilter("all");
                  showToast(`নম্বর "${p.userPhone}"-এর ${count} টি পেমেন্ট ফিল্টার করা হয়েছে।`);
                }}
                title={`⚠ এই নম্বরটি ${count} টি পেমেন্টে ব্যবহৃত হয়েছে। ক্লিক করে সবগুলো দেখুন।`}
                className="inline-flex items-center gap-0.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30 transition-all cursor-pointer"
              >
                <AlertTriangle className="w-2.5 h-2.5" /> ডুপ্লিকেট ({count}x)
              </button>
            ) : (
              <span
                title="এই নম্বরটি কেবল এই একটি পেমেন্টেই ব্যবহৃত হয়েছে"
                className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
              >
                <CheckCircle className="w-2.5 h-2.5" /> ইউনিক
              </span>
            )}

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
        ) : (
          <span className="text-[10px] text-slate-500 italic block pt-0.5">ফোন নম্বর নেই</span>
        )}
      </>
    );
  };

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
      <div className={`font-bold font-mono text-sm ${isLight ? "text-emerald-700" : "text-emerald-400"}`}>
        {formatMoney(p.amount, p.currency)}
      </div>
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
      <span className={`inline-block text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${statusBadgeCls(p.status, isLight)}`}>
        {p.status}
      </span>
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
              isLight
                ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
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
              isLight
                ? "bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-300"
                : "bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border-rose-500/30"
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
              isLight
                ? "bg-white hover:bg-slate-100 text-slate-700 border-slate-300"
                : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700"
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
            SSLCommerz ও ম্যানুয়াল বিকাশ/নগদ পেমেন্ট অডিট • {validPayments.length} টি যাচাইকৃত • {pendingCount} টি পেন্ডিং •{" "}
            <span className="text-amber-400 font-bold">{distinctDuplicatePhonesCount} টি ডুপ্লিকেট নম্বর গ্রুপ</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Revenue Badge */}
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

          {/* Reload Button */}
          <button
            type="button"
            onClick={() => reload()}
            disabled={reloading}
            title="ডাটাবেজ থেকে আবার লোড করুন"
            className={`flex-1 sm:flex-none justify-center px-3 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60 ${
              isLight
                ? "bg-white border-slate-300 text-slate-800 hover:bg-slate-50"
                : "bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800"
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${reloading ? "animate-spin" : ""}`} /> রিফ্রেশ
          </button>

          {/* Export Dropdown Menu */}
          <div className="relative flex-1 sm:flex-none" ref={exportMenuRef}>
            <button
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={exportingPdf}
              className={`w-full sm:w-auto justify-center px-4 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all ${
                isLight
                  ? "bg-white border-amber-300 text-amber-900 hover:bg-amber-50"
                  : "bg-slate-900 border-amber-500/40 text-amber-400 hover:bg-slate-800"
              }`}
            >
              <Download className="w-4 h-4 text-amber-500" />
              <span>এক্সপোর্ট ({filtered.length})</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showExportMenu ? "rotate-180" : ""}`} />
            </button>

            {showExportMenu && (
              <div
                className={`absolute right-0 mt-2 w-56 rounded-2xl border shadow-2xl p-2 z-50 animate-fadeIn ${
                  isLight ? "bg-white border-slate-200 text-slate-900" : "bg-slate-900 border-slate-800 text-slate-100"
                }`}
              >
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-700/40 mb-1">
                  ফিল্টারকৃত ডাটা এক্সপোর্ট
                </div>

                {/* Excel Option */}
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-left transition-colors cursor-pointer ${
                    isLight ? "hover:bg-emerald-50 text-emerald-800" : "hover:bg-emerald-950/40 text-emerald-300"
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <div>Excel (.xls) স্প্রেডশিট</div>
                    <div className="text-[10px] font-normal text-slate-400">রঙিন ফরম্যাট ও মোট হিসাব</div>
                  </div>
                </button>

                {/* CSV Option */}
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-left transition-colors cursor-pointer ${
                    isLight ? "hover:bg-blue-50 text-blue-800" : "hover:bg-blue-950/40 text-blue-300"
                  }`}
                >
                  <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                  <div>
                    <div>CSV (.csv) ফাইল</div>
                    <div className="text-[10px] font-normal text-slate-400">Google Sheets ও Excel রেডি</div>
                  </div>
                </button>

                {/* PDF Option */}
                <button
                  type="button"
                  onClick={handleExportPDF}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-left transition-colors cursor-pointer ${
                    isLight ? "hover:bg-rose-50 text-rose-800" : "hover:bg-rose-950/40 text-rose-300"
                  }`}
                >
                  <Download className="w-4 h-4 text-rose-500 shrink-0" />
                  <div>
                    <div>PDF (.pdf) ডাউনলোড</div>
                    <div className="text-[10px] font-normal text-slate-400">লেজার অডিট রিপোর্ট</div>
                  </div>
                </button>

                {/* Print Option */}
                <button
                  type="button"
                  onClick={handlePrint}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-left transition-colors cursor-pointer ${
                    isLight ? "hover:bg-amber-50 text-amber-800" : "hover:bg-amber-950/40 text-amber-300"
                  }`}
                >
                  <Printer className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <div>প্রিন্ট / সেভ অ্যাজ PDF</div>
                    <div className="text-[10px] font-normal text-slate-400">ব্রাউজার প্রিন্ট প্রিভিউ</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Add Manual Payment Button */}
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

      {/* 4-Tab Navigation Bar with URL Router Search Params (?tab=pending | cancelled | valid | all) */}
      <div
        role="tablist"
        aria-label="পেমেন্ট স্ট্যাটাস ট্যাব"
        className={`grid grid-cols-2 lg:grid-cols-4 gap-2.5 p-2 rounded-3xl border ${
          isLight ? "bg-slate-100/90 border-slate-200/90" : "bg-slate-900/90 border-slate-800"
        }`}
      >
        {/* Tab 1: Pending Payment */}
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "pending"}
          onClick={() => handleTabChange("pending")}
          className={`flex items-center justify-between gap-2.5 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === "pending"
              ? isLight
                ? "bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-500/25"
                : "bg-gradient-to-br from-amber-500/25 to-amber-600/10 text-amber-300 border-amber-500/60 shadow-lg shadow-amber-500/10"
              : isLight
              ? "bg-white hover:bg-amber-50/60 text-slate-700 border-slate-200/80"
              : "bg-slate-950/60 hover:bg-slate-800/70 text-slate-300 border-slate-800/80"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                activeTab === "pending"
                  ? isLight
                    ? "bg-white/20 text-white"
                    : "bg-amber-500/25 text-amber-300"
                  : isLight
                  ? "bg-amber-100 text-amber-700"
                  : "bg-amber-500/10 text-amber-400"
              }`}
            >
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-black truncate">পেন্ডিং পেমেন্ট</div>
              <div
                className={`text-[10px] font-mono font-bold truncate ${
                  activeTab === "pending" ? (isLight ? "text-amber-50" : "text-amber-300/80") : "text-slate-400"
                }`}
              >
                Pending • ৳ {pendingAmount.toLocaleString("en-US")}
              </div>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-black font-mono shrink-0 ${
              activeTab === "pending"
                ? isLight
                  ? "bg-white text-amber-700"
                  : "bg-amber-500 text-slate-950"
                : isLight
                ? "bg-amber-100 text-amber-800"
                : "bg-amber-500/15 text-amber-300"
            }`}
          >
            {pendingCount}
          </span>
        </button>

        {/* Tab 2: Cancel Payment */}
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "cancelled"}
          onClick={() => handleTabChange("cancelled")}
          className={`flex items-center justify-between gap-2.5 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === "cancelled"
              ? isLight
                ? "bg-rose-600 text-white border-rose-700 shadow-lg shadow-rose-600/25"
                : "bg-gradient-to-br from-rose-500/25 to-rose-600/10 text-rose-300 border-rose-500/60 shadow-lg shadow-rose-500/10"
              : isLight
              ? "bg-white hover:bg-rose-50/60 text-slate-700 border-slate-200/80"
              : "bg-slate-950/60 hover:bg-slate-800/70 text-slate-300 border-slate-800/80"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                activeTab === "cancelled"
                  ? isLight
                    ? "bg-white/20 text-white"
                    : "bg-rose-500/25 text-rose-300"
                  : isLight
                  ? "bg-rose-100 text-rose-700"
                  : "bg-rose-500/10 text-rose-400"
              }`}
            >
              <XCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-black truncate">বাতিল পেমেন্ট</div>
              <div
                className={`text-[10px] font-mono font-bold truncate ${
                  activeTab === "cancelled" ? (isLight ? "text-rose-50" : "text-rose-300/80") : "text-slate-400"
                }`}
              >
                Cancel • ৳ {cancelledAmount.toLocaleString("en-US")}
              </div>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-black font-mono shrink-0 ${
              activeTab === "cancelled"
                ? isLight
                  ? "bg-white text-rose-700"
                  : "bg-rose-500 text-white"
                : isLight
                ? "bg-rose-100 text-rose-800"
                : "bg-rose-500/15 text-rose-300"
            }`}
          >
            {cancelledCount}
          </span>
        </button>

        {/* Tab 3: Valid Payment */}
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "valid"}
          onClick={() => handleTabChange("valid")}
          className={`flex items-center justify-between gap-2.5 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === "valid"
              ? isLight
                ? "bg-emerald-600 text-white border-emerald-700 shadow-lg shadow-emerald-600/25"
                : "bg-gradient-to-br from-emerald-500/25 to-emerald-600/10 text-emerald-300 border-emerald-500/60 shadow-lg shadow-emerald-500/10"
              : isLight
              ? "bg-white hover:bg-emerald-50/60 text-slate-700 border-slate-200/80"
              : "bg-slate-950/60 hover:bg-slate-800/70 text-slate-300 border-slate-800/80"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                activeTab === "valid"
                  ? isLight
                    ? "bg-white/20 text-white"
                    : "bg-emerald-500/25 text-emerald-300"
                  : isLight
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-emerald-500/10 text-emerald-400"
              }`}
            >
              <CheckCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-black truncate">ভ্যালিড পেমেন্ট</div>
              <div
                className={`text-[10px] font-mono font-bold truncate ${
                  activeTab === "valid" ? (isLight ? "text-emerald-50" : "text-emerald-300/80") : "text-slate-400"
                }`}
              >
                Valid • ৳ {totalCollected.toLocaleString("en-US")}
              </div>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-black font-mono shrink-0 ${
              activeTab === "valid"
                ? isLight
                  ? "bg-white text-emerald-700"
                  : "bg-emerald-500 text-slate-950"
                : isLight
                ? "bg-emerald-100 text-emerald-800"
                : "bg-emerald-500/15 text-emerald-300"
            }`}
          >
            {validCount}
          </span>
        </button>

        {/* Tab 4 (Last Part): All Payment List */}
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "all"}
          onClick={() => handleTabChange("all")}
          className={`flex items-center justify-between gap-2.5 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === "all"
              ? isLight
                ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                : "bg-gradient-to-br from-[#D4AF37]/25 to-[#C59B27]/10 text-[#D4AF37] border-[#D4AF37]/60 shadow-lg shadow-[#D4AF37]/10"
              : isLight
              ? "bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80"
              : "bg-slate-950/60 hover:bg-slate-800/70 text-slate-300 border-slate-800/80"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                activeTab === "all"
                  ? isLight
                    ? "bg-white/20 text-white"
                    : "bg-[#D4AF37]/25 text-[#D4AF37]"
                  : isLight
                  ? "bg-slate-100 text-slate-700"
                  : "bg-slate-800 text-slate-300"
              }`}
            >
              <ListFilter className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-black truncate">সকল পেমেন্ট তালিকা</div>
              <div
                className={`text-[10px] font-mono font-bold truncate ${
                  activeTab === "all" ? (isLight ? "text-slate-200" : "text-[#D4AF37]/80") : "text-slate-400"
                }`}
              >
                All List • ৳ {allGrossAmount.toLocaleString("en-US")}
              </div>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-black font-mono shrink-0 ${
              activeTab === "all"
                ? isLight
                  ? "bg-white text-slate-900"
                  : "bg-[#D4AF37] text-[#051329]"
                : isLight
                ? "bg-slate-200 text-slate-800"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            {allCount}
          </span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:items-center sm:gap-3">
        {/* Search Field */}
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
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <select value={statusFilter} onChange={(e) => handleStatusDropdownChange(e.target.value)} className={filterSelectCls}>
          <option value="all">সকল স্ট্যাটাস</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>

        {/* Purpose Filter */}
        <select value={purposeFilter} onChange={(e) => setPurposeFilter(e.target.value)} className={filterSelectCls}>
          <option value="all">সকল ধরন</option>
          {Object.entries(PURPOSE_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        {/* Duplicate / Unique Phone Number Filter */}
        <select
          value={phoneFilter}
          onChange={(e) => handlePhoneFilterChange(e.target.value)}
          className={`${filterSelectCls} ${
            phoneFilter === "duplicate"
              ? isLight
                ? "border-amber-500 text-amber-900 bg-amber-50 font-black"
                : "border-amber-500 text-amber-300 bg-amber-950/40 font-black"
              : phoneFilter === "unique"
              ? isLight
                ? "border-emerald-500 text-emerald-900 bg-emerald-50 font-black"
                : "border-emerald-500 text-emerald-300 bg-emerald-950/40 font-black"
              : ""
          }`}
        >
          <option value="all">সকল ফোন নম্বর ({payments.length})</option>
          <option value="duplicate">⚠ ডুপ্লিকেট নম্বর ({duplicatePaymentsCount})</option>
          <option value="unique">✓ ইউনিক নম্বর ({uniquePaymentsCount})</option>
          <option value="missing">✕ নম্বর বিহীন ({missingPhoneCount})</option>
        </select>
      </div>

      {/* Quick Filter Status Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        <span className="text-[11px] font-bold text-slate-400">কুইক ফোন ফিল্টার:</span>

        {/* All Chip */}
        <button
          type="button"
          onClick={() => handlePhoneFilterChange("all")}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
            phoneFilter === "all"
              ? isLight
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-900 border-white"
              : isLight
              ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
              : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
          }`}
        >
          সকল ({payments.length})
        </button>

        {/* Unique Chip */}
        <button
          type="button"
          onClick={() => handlePhoneFilterChange("unique")}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
            phoneFilter === "unique"
              ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
              : isLight
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
              : "bg-emerald-950/40 text-emerald-400 border-emerald-800/40 hover:bg-emerald-900/40"
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" /> ইউনিক নম্বর ({uniquePaymentsCount})
        </button>

        {/* Duplicate Chip */}
        <button
          type="button"
          onClick={() => handlePhoneFilterChange("duplicate")}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
            phoneFilter === "duplicate"
              ? "bg-amber-600 text-white border-amber-600 shadow-md"
              : isLight
              ? "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
              : "bg-amber-950/50 text-amber-300 border-amber-600/40 hover:bg-amber-900/50"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" /> ⚠ ডুপ্লিকেট নম্বর ({duplicatePaymentsCount} টি পেমেন্ট)
        </button>

        {/* Reset Filter Button if active */}
        {(statusFilter !== "all" || purposeFilter !== "all" || phoneFilter !== "all" || search) && (
          <button
            type="button"
            onClick={() => {
              setActiveTab("all");
              setStatusFilter("all");
              setPurposeFilter("all");
              setPhoneFilter("all");
              setSearch("");
              updateUrlParams({ tab: "all", phone: "all" });
            }}
            className="text-[11px] text-rose-400 hover:text-rose-300 font-bold ml-auto flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" /> ফিল্টার রিসেট
          </button>
        )}
      </div>

      {/* Duplicate Phone Notice Banner when Duplicate filter is active */}
      {phoneFilter === "duplicate" && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-3 animate-fadeIn">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-amber-300 block text-sm font-bold">ডুপ্লিকেট ফোন নম্বর ফিল্টার সক্রিয়</strong>
            <p className="text-slate-300 leading-relaxed">
              মোট <strong className="text-amber-300">{distinctDuplicatePhonesCount}</strong> টি মোবাইল নম্বরে{" "}
              <strong className="text-amber-300">{duplicatePaymentsCount}</strong> টি পেমেন্ট রেকর্ড পাওয়া গেছে। একাধিকবার
              পেমেন্ট করা ট্রানজেকশন যাচাই করতে বা একই নম্বরে একাধিক ট্রেইনির নিবন্ধন নিরীক্ষা করতে এই তালিকাটি ব্যবহার করুন।
            </p>
          </div>
        </div>
      )}

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
              isLight
                ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500"
                : "bg-slate-950 border-slate-800 text-white focus:border-emerald-500"
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

      {/* Printable Report Header (visible only during window.print) */}
      <div className="hidden print:block mb-4">
        <h2 className="text-xl font-bold text-black">FAJR ACADEMY — TOT PAYMENT AUDIT & FINANCIAL LEDGER</h2>
        <p className="text-xs text-gray-600">
          তারিখ: {new Date().toLocaleDateString("bn-BD")} | মোট রেকর্ড: {filtered.length} টি | মোট রেভিনিউ: ৳{" "}
          {filteredTotalNet.toLocaleString("en-US")} BDT | ফিল্টার: {getFilterDescription()}
        </p>
      </div>

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
                <th className="p-4">ট্রেইনি বিবরণ ও ফোন</th>
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
