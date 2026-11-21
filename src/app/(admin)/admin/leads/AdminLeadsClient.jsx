'use client';

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  History,
  Lock,
  Mail,
  MessageCircle,
  MessageSquarePlus,
  Phone,
  PhoneCall,
  PieChart,
  RefreshCw,
  Search,
  Send,
  StickyNote,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useAdminTheme } from "../../AdminThemeContext";
import { useAdminAccess } from "../../AdminAccessContext";
import {
  AdminToast,
  DbErrorBanner,
  callApi,
  formatDate,
  formatMoney,
  trackLabel,
  useConfirm,
  useToast,
  whatsappHref,
} from "../../_shared/admin-ui";
import {
  LEAD_PAYMENT_STATUSES,
  LEAD_STATUSES,
  LEAD_STATUS_META,
  NOTE_KIND_META,
  PAYMENT_STATUS_META,
} from "@/lib/lead-helpers";

const NOTE_KIND_OPTIONS = [
  { value: "note", label: "সাধারণ নোট", Icon: StickyNote },
  { value: "call", label: "ফোন কল লগ", Icon: PhoneCall },
  { value: "whatsapp", label: "WhatsApp লগ", Icon: MessageCircle },
];

const PAYMENT_TABS = [
  { key: "all", label: "সব লিড" },
  { key: "PENDING", label: "পেন্ডিং" },
  { key: "CANCELLED", label: "বাতিল" },
  { key: "FAILED", label: "ব্যর্থ" },
  { key: "UNATTEMPTED", label: "অসম্পূর্ণ" },
  { key: "EXPIRED", label: "মেয়াদোত্তীর্ণ" },
];

function toneBadgeCls(tone, isLight) {
  switch (tone) {
    case "emerald":
    case "teal":
      return isLight
        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
        : "bg-emerald-500/20 text-emerald-300 border-emerald-500/35";
    case "amber":
      return isLight
        ? "bg-amber-50 text-amber-900 border-amber-300"
        : "bg-amber-500/20 text-amber-300 border-amber-500/35";
    case "rose":
      return isLight
        ? "bg-rose-50 text-rose-800 border-rose-300"
        : "bg-rose-500/20 text-rose-300 border-rose-500/35";
    case "indigo":
      return isLight
        ? "bg-indigo-50 text-indigo-800 border-indigo-300"
        : "bg-indigo-500/20 text-indigo-300 border-indigo-500/35";
    case "sky":
      return isLight
        ? "bg-sky-50 text-sky-800 border-sky-300"
        : "bg-sky-500/20 text-sky-300 border-sky-500/35";
    case "purple":
      return isLight
        ? "bg-purple-50 text-purple-800 border-purple-300"
        : "bg-purple-500/20 text-purple-300 border-purple-500/35";
    default:
      return isLight
        ? "bg-slate-100 text-slate-700 border-slate-300"
        : "bg-slate-800 text-slate-300 border-slate-700";
  }
}

function toLocalDateTimeInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  // Format in Bangladesh time UTC+6
  const local = new Date(d.getTime() + 6 * 60 * 60 * 1000);
  const y = local.getUTCFullYear();
  const mo = String(local.getUTCMonth() + 1).padStart(2, "0");
  const day = String(local.getUTCDate()).padStart(2, "0");
  const h = String(local.getUTCHours()).padStart(2, "0");
  const mi = String(local.getUTCMinutes()).padStart(2, "0");
  return `${y}-${mo}-${day}T${h}:${mi}`;
}

function fromDhakaDateTimeInput(val) {
  if (!val) return "";
  return `${val}:00+06:00`;
}

export default function AdminLeadsClient({
  initialLeads = [],
  staff: initialStaff = [],
  currentAdminId = "",
  loadError: initialLoadError = null,
}) {
  const { isLight } = useAdminTheme();
  const { can, isSuper } = useAdminAccess();
  const mayCreateNote = can("leads", "create") || can("leads", "update");
  const mayUpdate = can("leads", "update");
  const canPayments = can("payments", "read");
  const { toast, showToast, hideToast } = useToast();
  const { confirm, confirmDialog } = useConfirm();

  const [leads, setLeads] = useState(initialLeads);
  const [staff, setStaff] = useState(initialStaff);
  const [loadError, setLoadError] = useState(initialLoadError);
  const [reloading, setReloading] = useState(false);

  // Filters
  const [paymentTab, setPaymentTab] = useState("all");
  const [leadStatusFilter, setLeadStatusFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [trackFilter, setTrackFilter] = useState("all");
  const [hidePaid, setHidePaid] = useState(true);
  const [search, setSearch] = useState("");

  // Selection & bulk actions
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAssignee, setBulkAssignee] = useState("");
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkSaving, setBulkSaving] = useState(false);

  // Per-row busy, quick inline note drafts & clipboard
  const [busyId, setBusyId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [quickNotes, setQuickNotes] = useState({});
  const [quickNoteKinds, setQuickNoteKinds] = useState({});
  const [quickNoteBusyId, setQuickNoteBusyId] = useState(null);
  const [hoveredSlice, setHoveredSlice] = useState(null);

  // Detail & Note History Modal
  const [activeLeadId, setActiveLeadId] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [noteKind, setNoteKind] = useState("note");
  const [followUpInput, setFollowUpInput] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const activeLead = useMemo(
    () => (activeLeadId ? leads.find((l) => l._id === activeLeadId) || null : null),
    [leads, activeLeadId]
  );

  const reload = async () => {
    setReloading(true);
    const { ok, data, message } = await callApi("/api/admin/leads");
    setReloading(false);
    if (!ok) {
      showToast(message, "error");
      return;
    }
    setLeads(data.leads || []);
    if (Array.isArray(data.staff)) setStaff(data.staff);
    setLoadError(null);
    showToast("সর্বশেষ লিড তালিকা লোড হয়েছে।");
  };

  const replaceLead = (updated) => {
    if (!updated?._id) return;
    setLeads((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));
  };

  const replaceLeads = (updatedList) => {
    const byId = new Map((updatedList || []).map((l) => [l._id, l]));
    setLeads((prev) => prev.map((l) => byId.get(l._id) || l));
  };

  // Pool respecting hidePaid for KPI counts
  const baseLeads = useMemo(
    () => (hidePaid ? leads.filter((l) => !l.alreadyPaid) : leads),
    [leads, hidePaid]
  );

  const stats = useMemo(() => {
    const s = {
      total: baseLeads.length,
      pending: 0,
      cancelled: 0,
      failed: 0,
      unassigned: 0,
      myAssigned: 0,
      followUp: 0,
      alreadyPaidHidden: leads.filter((l) => l.alreadyPaid).length,
      byPayment: { all: baseLeads.length },
    };
    for (const st of LEAD_PAYMENT_STATUSES) s.byPayment[st] = 0;

    for (const l of baseLeads) {
      s.byPayment[l.paymentStatus] = (s.byPayment[l.paymentStatus] || 0) + 1;
      if (l.paymentStatus === "PENDING") s.pending += 1;
      else if (l.paymentStatus === "CANCELLED") s.cancelled += 1;
      else s.failed += 1;
      if (!l.leadAssignedTo) s.unassigned += 1;
      if (currentAdminId && l.leadAssignedTo === currentAdminId) s.myAssigned += 1;
      if (l.leadStatus === "follow_up" || l.leadStatus === "interested") s.followUp += 1;
    }
    return s;
  }, [baseLeads, leads, currentAdminId]);

  // Assigned-user distribution for the User-Wise Pie Chart & per-user assign count list
  const assigneeChartData = useMemo(() => {
    const PALETTE = [
      "#f59e0b", // amber
      "#6366f1", // indigo
      "#10b981", // emerald
      "#ec4899", // pink
      "#0ea5e9", // sky
      "#8b5cf6", // violet
      "#f97316", // orange
      "#14b8a6", // teal
      "#ef4444", // red
      "#84cc16", // lime
    ];
    const staffById = new Map(staff.map((u) => [u._id, u]));
    const buckets = new Map();

    // Seed every active staff member so 0-count staff are visible in the breakdown
    for (const u of staff) {
      buckets.set(u._id, {
        key: u._id,
        name: u.fullName || u.email,
        email: u.email || "",
        avatar: u.avatar || "",
        designation: u.designation || "",
        count: 0,
        followUp: 0,
        converted: 0,
        isUnassigned: false,
      });
    }

    const unassigned = {
      key: "unassigned",
      name: "অনির্ধারিত (Unassigned)",
      shortName: "অনির্ধারিত",
      email: "",
      avatar: "",
      designation: "এখনো কাউকে দায়িত্ব দেওয়া হয়নি",
      count: 0,
      followUp: 0,
      converted: 0,
      isUnassigned: true,
    };

    for (const l of baseLeads) {
      if (!l.leadAssignedTo) {
        unassigned.count += 1;
        if (l.leadStatus === "follow_up" || l.leadStatus === "interested") unassigned.followUp += 1;
        if (l.leadStatus === "converted") unassigned.converted += 1;
        continue;
      }
      if (!buckets.has(l.leadAssignedTo)) {
        const s = staffById.get(l.leadAssignedTo);
        buckets.set(l.leadAssignedTo, {
          key: l.leadAssignedTo,
          name: l.leadAssignedName || s?.fullName || l.leadAssignedEmail || "Admin",
          email: l.leadAssignedEmail || s?.email || "",
          avatar: s?.avatar || "",
          designation: s?.designation || "",
          count: 0,
          followUp: 0,
          converted: 0,
          isUnassigned: false,
        });
      }
      const b = buckets.get(l.leadAssignedTo);
      b.count += 1;
      if (l.leadStatus === "follow_up" || l.leadStatus === "interested") b.followUp += 1;
      if (l.leadStatus === "converted") b.converted += 1;
    }

    const total = baseLeads.length;
    const assignedTotal = total - unassigned.count;
    const sortedAssigned = [...buckets.values()].sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name)
    );

    const assignedRows = sortedAssigned.map((row, idx) => {
      const firstWord = String(row.name || "User").trim().split(/\s+/)[0];
      return {
        ...row,
        shortName: firstWord.length > 10 ? `${firstWord.slice(0, 9)}…` : firstWord,
        color: PALETTE[idx % PALETTE.length],
        percent: assignedTotal > 0 ? Math.round((row.count / assignedTotal) * 1000) / 10 : 0,
        totalPercent: total > 0 ? Math.round((row.count / total) * 1000) / 10 : 0,
      };
    });

    const unassignedRow = {
      ...unassigned,
      color: "#64748b",
      percent: total > 0 ? Math.round((unassigned.count / total) * 1000) / 10 : 0,
      totalPercent: total > 0 ? Math.round((unassigned.count / total) * 1000) / 10 : 0,
    };

    const activeAssigneeCount = assignedRows.filter((r) => r.count > 0).length;

    return {
      total,
      assignedTotal,
      activeAssigneeCount,
      assignedRows,
      unassignedRow,
    };
  }, [baseLeads, staff]);

  const handleQuickAddNote = async (e, lead) => {
    e.preventDefault();
    const text = String(quickNotes[lead._id] || "").trim();
    if (!text) return;
    const kind = quickNoteKinds[lead._id] || "note";

    setQuickNoteBusyId(lead._id);
    const { ok, data, message } = await callApi("/api/admin/leads", {
      method: "POST",
      body: { leadId: lead._id, text, kind },
    });
    setQuickNoteBusyId(null);
    if (!ok) {
      showToast(message, "error");
      return;
    }
    if (data.lead) replaceLead(data.lead);
    setQuickNotes((prev) => ({ ...prev, [lead._id]: "" }));
    showToast(message || "নোট হিস্ট্রিতে যুক্ত হয়েছে!");
  };

  const visibleLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    return baseLeads.filter((l) => {
      if (paymentTab !== "all" && l.paymentStatus !== paymentTab) return false;
      if (leadStatusFilter !== "all" && l.leadStatus !== leadStatusFilter) return false;
      if (assigneeFilter === "unassigned" && l.leadAssignedTo) return false;
      if (assigneeFilter === "me" && l.leadAssignedTo !== currentAdminId) return false;
      if (
        assigneeFilter !== "all" &&
        assigneeFilter !== "unassigned" &&
        assigneeFilter !== "me" &&
        l.leadAssignedTo !== assigneeFilter
      ) {
        return false;
      }
      if (trackFilter !== "all") {
        if (trackFilter === "TOT-WOMEN-014" && !/WOMEN/i.test(l.track || "")) return false;
        if (trackFilter === "TOT-MEN" && /WOMEN/i.test(l.track || "")) return false;
      }
      if (
        q &&
        ![
          l.userName,
          l.userEmail,
          l.userPhone,
          l.tranId,
          l.leadAssignedName,
          l.latestNote?.text,
        ].some((v) => String(v || "").toLowerCase().includes(q))
      ) {
        return false;
      }
      return true;
    });
  }, [baseLeads, paymentTab, leadStatusFilter, assigneeFilter, trackFilter, search, currentAdminId]);

  const handlePatchLead = async (leadId, body, successMsg) => {
    setBusyId(leadId);
    const { ok, data, message } = await callApi("/api/admin/leads", {
      method: "PATCH",
      body: { leadId, ...body },
    });
    setBusyId(null);
    if (!ok) {
      showToast(message, "error");
      return null;
    }
    if (data.lead) replaceLead(data.lead);
    showToast(successMsg || message || "লিড আপডেট হয়েছে।");
    return data.lead;
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!activeLead) return;
    if (!noteText.trim()) {
      showToast("নোটের বিবরণ লিখুন।", "error");
      return;
    }
    setSavingNote(true);
    const payload = {
      leadId: activeLead._id,
      text: noteText.trim(),
      kind: noteKind,
    };
    if (followUpInput) payload.followUpAt = fromDhakaDateTimeInput(followUpInput);

    const { ok, data, message } = await callApi("/api/admin/leads", {
      method: "POST",
      body: payload,
    });
    setSavingNote(false);
    if (!ok) {
      showToast(message, "error");
      return;
    }
    if (data.lead) replaceLead(data.lead);
    setNoteText("");
    showToast(message || "নোট হিস্ট্রিতে যুক্ত হয়েছে!");
  };

  const handleDeleteNote = async (leadId, noteId) => {
    if (
      !(await confirm("এই নোটটি হিস্ট্রি থেকে স্থায়ীভাবে মুছে ফেলবেন?", {
        tone: "danger",
        title: "নোট মুছে ফেলবেন?",
      }))
    ) {
      return;
    }
    setSavingNote(true);
    const { ok, data, message } = await callApi(
      `/api/admin/leads?leadId=${encodeURIComponent(leadId)}&noteId=${encodeURIComponent(noteId)}`,
      { method: "DELETE" }
    );
    setSavingNote(false);
    if (!ok) {
      showToast(message, "error");
      return;
    }
    if (data.lead) replaceLead(data.lead);
    showToast(message || "নোটটি মুছে ফেলা হয়েছে।");
  };

  const handleBulkApply = async () => {
    if (selectedIds.length === 0) return;
    if (!bulkAssignee && !bulkStatus) {
      showToast("অ্যাসাইন স্টাফ অথবা লিড স্ট্যাটাস নির্বাচন করুন।", "error");
      return;
    }
    const body = { leadIds: selectedIds };
    if (bulkAssignee) body.assignedTo = bulkAssignee === "__unassign__" ? "" : bulkAssignee;
    if (bulkStatus) body.leadStatus = bulkStatus;

    setBulkSaving(true);
    const { ok, data, message } = await callApi("/api/admin/leads", { method: "PATCH", body });
    setBulkSaving(false);
    if (!ok) {
      showToast(message, "error");
      return;
    }
    if (Array.isArray(data.leads)) replaceLeads(data.leads);
    setSelectedIds([]);
    setBulkAssignee("");
    setBulkStatus("");
    showToast(message || "নির্বাচিত লিডগুলো আপডেট হয়েছে।");
  };

  const isLockedByOther = (lead) =>
    !isSuper && Boolean(lead?.leadAssignedTo) && lead.leadAssignedTo !== currentAdminId;

  const toggleSelect = (id) => {
    const target = leads.find((l) => l._id === id);
    if (target && isLockedByOther(target)) return;
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    const selectableIds = visibleLeads.filter((l) => !isLockedByOther(l)).map((l) => l._id);
    const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : selectableIds);
  };

  const handleCopy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(key);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      showToast("কপি করা যায়নি।", "error");
    }
  };

  const openLeadDetail = (lead) => {
    setActiveLeadId(lead._id);
    setNoteText("");
    setNoteKind("note");
    setFollowUpInput(toLocalDateTimeInput(lead.leadFollowUpAt));
  };

  const cardCls = isLight
    ? "bg-white border-slate-200 shadow-sm"
    : "bg-slate-900 border-slate-800 shadow-xl";
  const inputCls = `px-3 py-2 rounded-xl border text-xs font-medium outline-hidden ${
    isLight
      ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500"
      : "bg-slate-950 border-slate-800 text-white focus:border-amber-500"
  }`;

  return (
    <div className="space-y-6">
      {confirmDialog}
      <AdminToast toast={toast} onClose={hideToast} />
      <DbErrorBanner message={loadError} isLight={isLight} onRetry={reload} retrying={reloading} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 border ${
              isLight
                ? "bg-amber-100 text-amber-900 border-amber-300"
                : "bg-amber-500/10 border-amber-500/30 text-amber-300"
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5 text-amber-500" />
            Pending &amp; Cancelled Payment Leads CRM
          </div>
          <h1 className={`text-xl sm:text-3xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
            লিড ম্যানেজমেন্ট
          </h1>
          <p className={`text-xs sm:text-sm mt-1 font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
            পেন্ডিং, বাতিল বা ব্যর্থ পেমেন্ট আবেদনকারীদের ফলো-আপ, স্টাফ অ্যাসাইন, স্ট্যাটাস ও সম্পূর্ণ নোট হিস্ট্রি
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
          {canPayments && (
            <Link
              href="/admin/payments"
              className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                isLight
                  ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                  : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <CreditCard className="w-4 h-4" /> পেমেন্ট লেজার
            </Link>
          )}
          <button
            type="button"
            onClick={reload}
            disabled={reloading}
            className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60 ${
              isLight
                ? "bg-white border-slate-300 text-slate-800 hover:bg-slate-50"
                : "bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800"
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${reloading ? "animate-spin" : ""}`} /> রিফ্রেশ
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <KpiCard
          title="মোট সক্রিয় লিড"
          value={stats.total}
          sub={`পেন্ডিং ${stats.pending} · বাতিল ${stats.cancelled}`}
          icon={Users}
          tone="indigo"
          isLight={isLight}
        />
        <KpiCard
          title="পেন্ডিং পেমেন্ট"
          value={stats.pending}
          sub="ভেরিফিকেশন বা কল বাকি"
          icon={Clock}
          tone="amber"
          isLight={isLight}
          onClick={() => setPaymentTab("PENDING")}
        />
        <KpiCard
          title="বাতিল / ব্যর্থ"
          value={stats.cancelled + stats.failed}
          sub={`বাতিল ${stats.cancelled} · ব্যর্থ ${stats.failed}`}
          icon={PhoneCall}
          tone="rose"
          isLight={isLight}
          onClick={() => setPaymentTab("CANCELLED")}
        />
        <KpiCard
          title="অনির্ধারিত (Unassigned)"
          value={stats.unassigned}
          sub="এখনো কাউকে দায়িত্ব দেওয়া হয়নি"
          icon={UserPlus}
          tone="purple"
          isLight={isLight}
          onClick={() => setAssigneeFilter("unassigned")}
        />
        <KpiCard
          title="আমার লিড / ফলো-আপ"
          value={stats.myAssigned}
          sub={`আগ্রহী ও ফলো-আপ: ${stats.followUp}`}
          icon={UserCheck}
          tone="emerald"
          isLight={isLight}
          onClick={() => setAssigneeFilter("me")}
        />
      </div>

      {/* Assigned User Pie Chart & Per-User Lead Count */}
      <AssigneePieChartCard
        data={assigneeChartData}
        activeFilter={assigneeFilter}
        onSelectFilter={(key) => setAssigneeFilter((prev) => (prev === key ? "all" : key))}
        hoveredKey={hoveredSlice}
        onHover={setHoveredSlice}
        isLight={isLight}
        cardCls={cardCls}
      />

      {/* Filters Toolbar */}
      <div className={`rounded-2xl border p-4 space-y-3 ${cardCls}`}>
        {/* Payment status tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div
            role="tablist"
            aria-label="পেমেন্ট স্ট্যাটাস ফিল্টার"
            className={`flex items-center gap-1 p-1 rounded-xl border overflow-x-auto max-w-full ${
              isLight ? "bg-slate-100 border-slate-300" : "bg-slate-950 border-slate-800"
            }`}
          >
            {PAYMENT_TABS.map((t) => {
              const active = paymentTab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setPaymentTab(t.key)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
                    active
                      ? "bg-amber-500 text-slate-950 font-black"
                      : isLight
                        ? "text-slate-700 hover:bg-white"
                        : "text-slate-400 hover:text-white"
                  }`}
                >
                  {t.label}
                  <span
                    className={`px-1.5 py-0.5 rounded-full font-mono text-[10px] ${
                      active
                        ? "bg-slate-950/15 text-slate-950"
                        : isLight
                          ? "bg-white text-slate-600"
                          : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {stats.byPayment[t.key] || 0}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="নাম, ফোন, ইমেইল, ট্রানজেকশন বা নোট..."
              className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs outline-hidden ${
                isLight
                  ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500"
                  : "bg-slate-950 border-slate-800 text-white focus:border-amber-500"
              }`}
            />
          </div>
        </div>

        {/* Secondary filters row */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <select
            value={leadStatusFilter}
            onChange={(e) => setLeadStatusFilter(e.target.value)}
            aria-label="লিড স্ট্যাটাস"
            className={inputCls}
          >
            <option value="all">সব লিড স্ট্যাটাস</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {LEAD_STATUS_META[s].label} ({LEAD_STATUS_META[s].en})
              </option>
            ))}
          </select>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            aria-label="দায়িত্বপ্রাপ্ত স্টাফ"
            className={inputCls}
          >
            <option value="all">সব দায়িত্বপ্রাপ্ত</option>
            <option value="me">আমার লিড ({stats.myAssigned})</option>
            <option value="unassigned">অনির্ধারিত ({stats.unassigned})</option>
            {staff.map((u) => (
              <option key={u._id} value={u._id}>
                {u.fullName}
              </option>
            ))}
          </select>

          <select
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value)}
            aria-label="ব্যাচ ফিল্টার"
            className={inputCls}
          >
            <option value="all">সব ব্যাচ</option>
            <option value="TOT-MEN">পুরুষ ব্যাচ (TOT-MEN)</option>
            <option value="TOT-WOMEN-014">মহিলা ব্যাচ (TOT-WOMEN)</option>
          </select>

          <label className="inline-flex items-center gap-2 ml-auto text-[11px] font-semibold cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hidePaid}
              onChange={(e) => setHidePaid(e.target.checked)}
              className="rounded border-slate-400 text-amber-500 cursor-pointer"
            />
            <span className={isLight ? "text-slate-700" : "text-slate-300"}>
              পরবর্তীতে পেমেন্ট সম্পন্ন ({stats.alreadyPaidHidden}) লুকান
            </span>
          </label>
        </div>

        {/* Bulk action bar */}
        {mayUpdate && selectedIds.length > 0 && (
          <div
            className={`pt-3 border-t flex flex-wrap items-center gap-2.5 text-xs ${
              isLight ? "border-slate-200" : "border-slate-800"
            }`}
          >
            <span className="font-black text-amber-500">{selectedIds.length}টি লিড নির্বাচিত</span>

            <select
              value={bulkAssignee}
              onChange={(e) => setBulkAssignee(e.target.value)}
              className={inputCls}
            >
              <option value="">— একসাথে অ্যাসাইন করুন —</option>
              <option value="__unassign__">দায়িত্ব সরান (Unassign)</option>
              {staff.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.fullName}
                </option>
              ))}
            </select>

            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className={inputCls}
            >
              <option value="">— একসাথে স্ট্যাটাস পরিবর্তন —</option>
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {LEAD_STATUS_META[s].label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleBulkApply}
              disabled={bulkSaving || (!bulkAssignee && !bulkStatus)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer disabled:opacity-50"
            >
              {bulkSaving ? "আপডেট হচ্ছে..." : "প্রয়োগ করুন"}
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-xs font-bold text-slate-400 hover:text-rose-500 cursor-pointer ml-auto"
            >
              নির্বাচন বাতিল
            </button>
          </div>
        )}
      </div>

      {/* Leads List */}
      {visibleLeads.length === 0 ? (
        <div className={`rounded-3xl border p-12 text-center space-y-2 ${cardCls}`}>
          <PhoneCall className="w-10 h-10 mx-auto text-slate-500" />
          <p className={`text-sm font-bold ${isLight ? "text-slate-800" : "text-slate-200"}`}>
            এই ফিল্টারে কোনো লিড পাওয়া যায়নি
          </p>
          <p className="text-xs text-slate-500">
            পেন্ডিং, বাতিল বা ব্যর্থ পেমেন্টের আবেদন এলে এখানে স্বয়ংক্রিয়ভাবে তালিকাভুক্ত হবে।
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {mayUpdate && (
            <div className="flex items-center justify-between px-1 text-xs">
              <label className="inline-flex items-center gap-2 font-bold cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={
                    visibleLeads.some((l) => !isLockedByOther(l)) &&
                    visibleLeads.filter((l) => !isLockedByOther(l)).every((l) => selectedIds.includes(l._id))
                  }
                  onChange={toggleSelectAll}
                  className="rounded border-slate-400 text-amber-500 cursor-pointer"
                />
                <span className={isLight ? "text-slate-600" : "text-slate-400"}>
                  সবগুলো নির্বাচন করুন ({visibleLeads.length}টি লিড)
                </span>
              </label>
            </div>
          )}

          {visibleLeads.map((lead) => {
            const payMeta = PAYMENT_STATUS_META[lead.paymentStatus] || { label: lead.paymentStatus, tone: "slate" };
            const leadMeta = LEAD_STATUS_META[lead.leadStatus] || LEAD_STATUS_META.new;
            const waUrl = whatsappHref(
              lead.userPhone,
              `আসসালামু আলাইকুম ${lead.userName || ""}। ফজর একাডেমি TOT কোর্সে আপনার রেজিস্ট্রেশন (${lead.tranId}) অসম্পূর্ণ রয়েছে। ভর্তিতে কোনো সহায়তার প্রয়োজন হলে জানাতে পারেন।`
            );
            const working = busyId === lead._id;
            const locked = isLockedByOther(lead);
            const canEditLead = mayUpdate && !locked;
            const selected = selectedIds.includes(lead._id);

            return (
              <div
                key={lead._id}
                className={`rounded-2xl border p-4 sm:p-5 transition-all ${cardCls} ${
                  selected ? "ring-2 ring-amber-500/60" : ""
                }`}
              >
                <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
                  {/* Left: Lead Identity + Payment Info + Latest Note */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {mayUpdate && (
                      <input
                        type="checkbox"
                        checked={selected}
                        disabled={locked}
                        title={locked ? `${lead.leadAssignedName || "অন্য স্টাফ"}-এর দায়িত্বে লক করা আছে` : undefined}
                        onChange={() => toggleSelect(lead._id)}
                        aria-label={`${lead.userName || lead.userEmail} নির্বাচন`}
                        className="mt-1 rounded border-slate-400 text-amber-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                      />
                    )}

                    <div className="min-w-0 flex-1 space-y-2">
                      {/* Top badges */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${toneBadgeCls(
                            payMeta.tone,
                            isLight
                          )}`}
                        >
                          {payMeta.label}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${toneBadgeCls(
                            leadMeta.tone,
                            isLight
                          )}`}
                        >
                          {leadMeta.label}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                            isLight
                              ? "bg-slate-100 border-slate-200 text-slate-700"
                              : "bg-slate-950 border-slate-800 text-slate-300"
                          }`}
                        >
                          {trackLabel(lead.track)} · {formatMoney(lead.amount, lead.currency)}
                        </span>
                        {lead.alreadyPaid && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/35">
                            <CheckCircle2 className="w-3 h-3" /> পরবর্তীতে পেমেন্ট সম্পন্ন
                          </span>
                        )}
                        {locked && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-500/15 text-slate-400 border border-slate-500/30">
                            <Lock className="w-3 h-3" /> {lead.leadAssignedName || "অন্য স্টাফ"}-এর দায়িত্বে লক
                          </span>
                        )}
                      </div>

                      {/* Name & Contact */}
                      <div>
                        <h3 className={`text-sm sm:text-base font-black ${isLight ? "text-slate-900" : "text-white"}`}>
                          {lead.userName || "নাম নেই"}
                        </h3>
                        <div className={`mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs ${isLight ? "text-slate-600" : "text-slate-300"}`}>
                          {lead.userPhone && (
                            <span className="inline-flex items-center gap-1.5 font-mono font-semibold">
                              <Phone className="w-3.5 h-3.5 text-amber-500" />
                              <a href={`tel:${lead.userPhone}`} className="hover:underline">
                                {lead.userPhone}
                              </a>
                              <button
                                type="button"
                                onClick={() => handleCopy(lead.userPhone, `ph-${lead._id}`)}
                                title="ফোন নম্বর কপি করুন"
                                className="opacity-60 hover:opacity-100 cursor-pointer"
                              >
                                {copiedId === `ph-${lead._id}` ? (
                                  <Check className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 break-all">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {lead.userEmail}
                          </span>
                        </div>
                      </div>

                      {/* Meta line */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                        <span className="font-mono">Trx: {lead.tranId}</span>
                        <span>· তৈরি: {formatDate(lead.createdAt, true)}</span>
                        {lead.leadFollowUpAt && (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-500">
                            <Calendar className="w-3 h-3" /> ফলো-আপ: {formatDate(lead.leadFollowUpAt, true)}
                          </span>
                        )}
                      </div>

                      {/* Latest Note Preview */}
                      {lead.latestNote && (
                        <div
                          className={`rounded-xl border px-3 py-2 text-xs flex items-start gap-2 ${
                            isLight
                              ? "bg-slate-50 border-slate-200 text-slate-700"
                              : "bg-slate-950/70 border-slate-800 text-slate-300"
                          }`}
                        >
                          <StickyNote className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 leading-snug">{lead.latestNote.text}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {lead.latestNote.byName || "Admin"} · {formatDate(lead.latestNote.createdAt, true)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Quick Inline Note Input */}
                      {mayCreateNote && !locked && (
                        <form
                          onSubmit={(e) => handleQuickAddNote(e, lead)}
                          className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 pt-0.5"
                        >
                          <select
                            value={quickNoteKinds[lead._id] || "note"}
                            onChange={(e) =>
                              setQuickNoteKinds((prev) => ({ ...prev, [lead._id]: e.target.value }))
                            }
                            aria-label="নোটের ধরন"
                            className={`px-2 py-1.5 rounded-xl border text-[11px] font-bold outline-hidden shrink-0 ${
                              isLight
                                ? "bg-slate-50 border-slate-300 text-slate-800"
                                : "bg-slate-950 border-slate-800 text-slate-200"
                            }`}
                          >
                            <option value="note">নোট</option>
                            <option value="call">কল</option>
                            <option value="whatsapp">WhatsApp</option>
                          </select>
                          <input
                            type="text"
                            value={quickNotes[lead._id] || ""}
                            disabled={quickNoteBusyId === lead._id}
                            onChange={(e) =>
                              setQuickNotes((prev) => ({ ...prev, [lead._id]: e.target.value }))
                            }
                            placeholder="দ্রুত নোট লিখুন এবং Enter চাপুন..."
                            className={`flex-1 min-w-[160px] px-3 py-1.5 rounded-xl border text-xs outline-hidden ${
                              isLight
                                ? "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-amber-500"
                                : "bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-amber-500"
                            }`}
                          />
                          <button
                            type="submit"
                            disabled={quickNoteBusyId === lead._id || !String(quickNotes[lead._id] || "").trim()}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] inline-flex items-center gap-1 cursor-pointer disabled:opacity-40 shrink-0"
                          >
                            <Send className="w-3 h-3" />
                            {quickNoteBusyId === lead._id ? "..." : "যোগ করুন"}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>

                  {/* Right: Inline Status, Assign, Contact & Note History Button */}
                  <div className="flex flex-col gap-2.5 xl:w-80 shrink-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">লিড স্ট্যাটাস</label>
                        <select
                          value={lead.leadStatus}
                          disabled={!canEditLead || working}
                          title={locked ? "অন্য স্টাফের দায়িত্বে থাকা লিড পরিবর্তন করা যাবে না" : undefined}
                          onChange={(e) => handlePatchLead(lead._id, { leadStatus: e.target.value })}
                          className={`w-full ${inputCls} cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {LEAD_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {LEAD_STATUS_META[s].label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">দায়িত্বপ্রাপ্ত (Assign)</label>
                        <select
                          value={lead.leadAssignedTo || ""}
                          disabled={!canEditLead || working}
                          title={locked ? `${lead.leadAssignedName || "অন্য স্টাফ"}-এর দায়িত্বে লক করা আছে` : undefined}
                          onChange={(e) => handlePatchLead(lead._id, { assignedTo: e.target.value })}
                          className={`w-full ${inputCls} cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <option value="">— অনির্ধারিত —</option>
                          {staff.map((u) => (
                            <option key={u._id} value={u._id}>
                              {u.fullName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {canEditLead && currentAdminId && !lead.leadAssignedTo && (
                        <button
                          type="button"
                          disabled={working}
                          onClick={() =>
                            handlePatchLead(lead._id, { assignedTo: currentAdminId }, "লিডটি আপনার দায়িত্বে নেওয়া হয়েছে।")
                          }
                          className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50 ${
                            isLight
                              ? "bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-800"
                              : "bg-indigo-500/15 hover:bg-indigo-500/25 border-indigo-500/35 text-indigo-300"
                          }`}
                        >
                          <UserCheck className="w-3.5 h-3.5" /> নিজেকে দিন
                        </button>
                      )}

                      {waUrl && (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 ${
                            isLight
                              ? "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800"
                              : "bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/35 text-emerald-300"
                          }`}
                        >
                          <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => openLeadDetail(lead)}
                        className="ml-auto px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] flex items-center gap-1.5 cursor-pointer"
                      >
                        <History className="w-3.5 h-3.5" />
                        নোট ও হিস্ট্রি ({lead.notesCount})
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LEAD DETAIL & NOTE HISTORY MODAL */}
      {activeLead && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onMouseDown={(e) => e.target === e.currentTarget && setActiveLeadId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className={`rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl space-y-5 my-8 border max-h-[90vh] flex flex-col ${
              isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
            }`}
          >
            {/* Modal Header */}
            <div className={`flex items-start justify-between gap-3 border-b pb-4 ${isLight ? "border-slate-200" : "border-slate-800"}`}>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className={`text-lg font-black ${isLight ? "text-slate-900" : "text-white"}`}>
                    {activeLead.userName || "লিড বিবরণ"}
                  </h2>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${toneBadgeCls(
                      (PAYMENT_STATUS_META[activeLead.paymentStatus] || {}).tone,
                      isLight
                    )}`}
                  >
                    {(PAYMENT_STATUS_META[activeLead.paymentStatus] || {}).label || activeLead.paymentStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 break-all">
                  {activeLead.userPhone ? `${activeLead.userPhone} · ` : ""}
                  {activeLead.userEmail} · <span className="font-mono">{activeLead.tranId}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveLeadId(null)}
                aria-label="বন্ধ করুন"
                className="p-1.5 rounded-xl text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-5 pr-1 flex-1">
              {/* Applicant extra details (if captured during registration) */}
              {activeLead.applicantInfo && (
                <div
                  className={`grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl border text-[11px] ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-slate-950/70 border-slate-800 text-slate-300"
                  }`}
                >
                  <div>
                    <span className="text-slate-500 block">ব্যাচ ও ফি</span>
                    <strong>
                      {trackLabel(activeLead.track)} · {formatMoney(activeLead.amount, activeLead.currency)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">শিক্ষাগত যোগ্যতা</span>
                    <strong>{activeLead.applicantInfo.education || "—"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">কুরআন দক্ষতা</span>
                    <strong>{activeLead.applicantInfo.quranSkill || "—"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">ইংরেজি / ল্যাপটপ</span>
                    <strong>
                      {activeLead.applicantInfo.englishSkill || "—"} / {activeLead.applicantInfo.hasLaptop === "yes" ? "আছে" : "নেই"}
                    </strong>
                  </div>
                </div>
              )}

              {/* Locked notice if assigned to another user */}
              {isLockedByOther(activeLead) && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
                    isLight
                      ? "bg-amber-50 border-amber-200 text-amber-900"
                      : "bg-amber-500/10 border-amber-500/35 text-amber-200"
                  }`}
                >
                  <Lock className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>
                    এই লিডটি ইতোমধ্যে <strong>{activeLead.leadAssignedName || "অন্য একজনের"}</strong> দায়িত্বে আছে — আপনি শুধু হিস্ট্রি দেখতে পারবেন, পরিবর্তন করতে পারবেন না।
                  </span>
                </div>
              )}

              {/* Quick Status, Assign & Follow-up controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">লিড স্ট্যাটাস</label>
                  <select
                    value={activeLead.leadStatus}
                    disabled={!mayUpdate || isLockedByOther(activeLead) || busyId === activeLead._id}
                    onChange={(e) => handlePatchLead(activeLead._id, { leadStatus: e.target.value })}
                    className={`w-full ${inputCls} cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {LEAD_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {LEAD_STATUS_META[s].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">দায়িত্বপ্রাপ্ত (Assign)</label>
                  <select
                    value={activeLead.leadAssignedTo || ""}
                    disabled={!mayUpdate || isLockedByOther(activeLead) || busyId === activeLead._id}
                    onChange={(e) => handlePatchLead(activeLead._id, { assignedTo: e.target.value })}
                    className={`w-full ${inputCls} cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <option value="">— অনির্ধারিত —</option>
                    {staff.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">পরবর্তী ফলো-আপ সময়</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="datetime-local"
                      value={followUpInput}
                      disabled={!mayUpdate || isLockedByOther(activeLead)}
                      onChange={(e) => setFollowUpInput(e.target.value)}
                      className={`w-full ${inputCls} font-mono disabled:opacity-50`}
                    />
                    {mayUpdate && !isLockedByOther(activeLead) && (
                      <button
                        type="button"
                        onClick={() =>
                          handlePatchLead(
                            activeLead._id,
                            { followUpAt: followUpInput ? fromDhakaDateTimeInput(followUpInput) : "" },
                            "ফলো-আপ সময় সংরক্ষিত হয়েছে।"
                          )
                        }
                        title="ফলো-আপ সময় সেভ করুন"
                        className="px-2.5 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs cursor-pointer shrink-0"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Add Note Form */}
              {mayCreateNote && !isLockedByOther(activeLead) && (
                <form
                  onSubmit={handleAddNote}
                  className={`rounded-2xl border p-4 space-y-3 ${
                    isLight ? "bg-amber-50/50 border-amber-200" : "bg-slate-950/70 border-slate-800"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={`text-xs font-black flex items-center gap-1.5 ${isLight ? "text-slate-900" : "text-white"}`}>
                      <MessageSquarePlus className="w-4 h-4 text-amber-500" />
                      নতুন নোট / কল লগ যোগ করুন
                    </span>
                    <div className="flex items-center gap-1.5">
                      {NOTE_KIND_OPTIONS.map(({ value, label, Icon }) => {
                        const active = noteKind === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setNoteKind(value)}
                            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                              active
                                ? "bg-amber-500 text-slate-950 border-amber-500"
                                : isLight
                                  ? "bg-white border-slate-300 text-slate-600"
                                  : "bg-slate-900 border-slate-700 text-slate-300"
                            }`}
                          >
                            <Icon className="w-3 h-3" /> {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="কথোপকথনের সারসংক্ষেপ, শিক্ষার্থীর আগ্রহ, পেমেন্ট সমস্যা বা পরবর্তী করণীয় লিখুন..."
                    className={`w-full ${inputCls} resize-none`}
                    required
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={savingNote || !noteText.trim()}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {savingNote ? "সংরক্ষণ হচ্ছে..." : "নোট হিস্ট্রিতে যোগ করুন"}
                    </button>
                  </div>
                </form>
              )}

              {/* Full Note & Activity History Timeline */}
              <div className="space-y-3">
                <h3 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                  <History className="w-4 h-4 text-amber-500" />
                  নোট ও অ্যাক্টিভিটি হিস্ট্রি ({activeLead.leadNotes.length})
                </h3>

                {activeLead.leadNotes.length === 0 ? (
                  <div
                    className={`rounded-2xl border p-6 text-center text-xs ${
                      isLight ? "bg-slate-50 border-slate-200 text-slate-500" : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    এখনো কোনো নোট বা অ্যাক্টিভিটি রেকর্ড নেই। উপরে থেকে প্রথম নোট যুক্ত করুন।
                  </div>
                ) : (
                  <ol className="space-y-2.5">
                    {activeLead.leadNotes.map((n) => {
                      const kindMeta = NOTE_KIND_META[n.kind] || NOTE_KIND_META.note;
                      return (
                        <li
                          key={n._id || `${n.createdAt}-${n.text.slice(0, 12)}`}
                          className={`rounded-2xl border p-3.5 text-xs space-y-1.5 ${
                            isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/70 border-slate-800"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${toneBadgeCls(
                                  kindMeta.tone,
                                  isLight
                                )}`}
                              >
                                {kindMeta.label}
                              </span>
                              <span className={`font-bold ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                                {n.byName || n.byEmail || "System"}
                              </span>
                              <span className="text-[10px] text-slate-500">{formatDate(n.createdAt, true)}</span>
                            </div>

                            {isSuper && n._id && (
                              <button
                                type="button"
                                disabled={savingNote}
                                onClick={() => handleDeleteNote(activeLead._id, n._id)}
                                title="নোট মুছুন"
                                className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer disabled:opacity-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <p className={`whitespace-pre-line leading-relaxed ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                            {n.text}
                          </p>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AssigneePieChartCard({
  data,
  activeFilter,
  onSelectFilter,
  hoveredKey,
  onHover,
  isLight,
  cardCls,
}) {
  const [includeUnassigned, setIncludeUnassigned] = useState(false);
  const { total, assignedTotal, activeAssigneeCount, assignedRows, unassignedRow } = data;

  // By default show strictly Assigned (দায়িত্বপ্রাপ্ত) users on the pie chart;
  // user can toggle to include Unassigned as well.
  const showUnassignedSlice = includeUnassigned && unassignedRow.count > 0;
  const chartTotal = showUnassignedSlice ? total : assignedTotal;
  const rawRows = showUnassignedSlice
    ? [...assignedRows, unassignedRow]
    : assignedRows;

  const displayRows = rawRows.map((r) => ({
    ...r,
    share: chartTotal > 0 ? Math.round((r.count / chartTotal) * 1000) / 10 : 0,
  }));

  const slices = displayRows.filter((r) => r.count > 0);

  // Build SVG pie wedge geometry purely (no outer mutable state)
  const cx = 120;
  const cy = 120;
  const radius = 96;

  const segments = slices.reduce(
    (acc, s) => {
      const ratio = chartTotal > 0 ? s.count / chartTotal : 0;
      const angle = ratio * Math.PI * 2;
      const startAngle = acc.angle;
      const endAngle = startAngle + angle;
      const midAngle = startAngle + angle / 2;

      const x1 = cx + radius * Math.cos(startAngle);
      const y1 = cy + radius * Math.sin(startAngle);
      const x2 = cx + radius * Math.cos(endAngle);
      const y2 = cy + radius * Math.sin(endAngle);
      const largeArc = angle > Math.PI ? 1 : 0;

      const path = `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;

      // Place count + short name inside each slice
      const labelRadius = slices.length === 1 ? 0 : radius * 0.62;
      const lx = cx + labelRadius * Math.cos(midAngle);
      const ly = cy + labelRadius * Math.sin(midAngle);

      // Subtle pop-out offset on hover/selected
      const popX = slices.length === 1 ? 0 : Math.cos(midAngle) * 5;
      const popY = slices.length === 1 ? 0 : Math.sin(midAngle) * 5;

      acc.items.push({
        ...s,
        ratio,
        path,
        lx,
        ly,
        popX,
        popY,
        isFullCircle: slices.length === 1,
      });
      acc.angle = endAngle;
      return acc;
    },
    { items: [], angle: -Math.PI / 2 }
  ).items;

  // All rows shown in the right-side user breakdown (always include unassigned at the bottom if > 0)
  const breakdownRows =
    unassignedRow.count > 0 && !showUnassignedSlice
      ? [...displayRows, { ...unassignedRow, share: unassignedRow.totalPercent }]
      : displayRows;

  const focused =
    breakdownRows.find((r) => r.key === hoveredKey) ||
    breakdownRows.find((r) => r.key === activeFilter) ||
    null;

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 ${cardCls}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className={`text-sm sm:text-base font-black flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
            <PieChart className="w-4 h-4 text-amber-500" />
            দায়িত্বপ্রাপ্ত (Assign) ইউজার ভিত্তিক পাই চার্ট ও সংখ্যা
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            প্রতিটি স্লাইসে অ্যাসাইন সংখ্যা ও ইউজার দেখাচ্ছে — যেকোনো স্লাইস বা ইউজারে ক্লিক করে তার লিড ফিল্টার করুন
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
              isLight
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-amber-500/15 text-amber-300 border-amber-500/30"
            }`}
          >
            মোট অ্যাসাইন: <span className="font-mono font-black">{assignedTotal}</span>
          </span>
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
              isLight
                ? "bg-indigo-50 text-indigo-800 border-indigo-200"
                : "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
            }`}
          >
            দায়িত্বপ্রাপ্ত ইউজার: <span className="font-mono font-black">{activeAssigneeCount}</span> জন
          </span>
          {unassignedRow.count > 0 && (
            <button
              type="button"
              onClick={() => setIncludeUnassigned((v) => !v)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border cursor-pointer transition-colors ${
                showUnassignedSlice
                  ? "bg-slate-700 text-white border-slate-600"
                  : isLight
                    ? "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                    : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
              }`}
            >
              {showUnassignedSlice
                ? `অনির্ধারিত (${unassignedRow.count}) চার্টে যুক্ত ✓`
                : `অনির্ধারিত (${unassignedRow.count}) চার্টে দেখান`}
            </button>
          )}
          {activeFilter !== "all" && (
            <button
              type="button"
              onClick={() => onSelectFilter("all")}
              className="text-[11px] font-bold text-amber-500 hover:underline cursor-pointer"
            >
              ফিল্টার রিসেট
            </button>
          )}
        </div>
      </div>

      {total === 0 ? (
        <div className="py-6 text-center text-xs text-slate-500">চার্ট দেখানোর মতো কোনো লিড এখনো নেই।</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6 items-center">
          {/* Interactive SVG Pie Chart with User & Assign Count on Slices */}
          <div className="flex flex-col items-center gap-2.5 mx-auto w-full max-w-[260px]">
            {segments.length === 0 ? (
              <div
                className={`w-52 h-52 rounded-full border-2 border-dashed flex flex-col items-center justify-center text-center p-5 ${
                  isLight ? "border-slate-300 bg-slate-50 text-slate-500" : "border-slate-700 bg-slate-950/60 text-slate-400"
                }`}
              >
                <span className="text-2xl font-black font-mono">0</span>
                <span className="text-xs font-bold mt-1">এখনো কোনো লিড কাউকে অ্যাসাইন করা হয়নি</span>
                {unassignedRow.count > 0 && (
                  <button
                    type="button"
                    onClick={() => onSelectFilter("unassigned")}
                    className="mt-2 text-[11px] font-bold text-amber-500 hover:underline cursor-pointer"
                  >
                    অনির্ধারিত ({unassignedRow.count}) দেখুন
                  </button>
                )}
              </div>
            ) : (
              <div className="relative w-56 h-56 flex items-center justify-center shrink-0">
                <svg
                  viewBox="0 0 240 240"
                  className="w-full h-full overflow-visible drop-shadow-sm"
                  role="img"
                  aria-label="দায়িত্বপ্রাপ্ত ইউজার ভিত্তিক পাই চার্ট"
                >
                  {segments.map((seg) => {
                    const isActive = activeFilter === seg.key || hoveredKey === seg.key;
                    const strokeColor = isLight ? "#ffffff" : "#0f172a";
                    const showNameOnSlice = seg.isFullCircle || seg.share >= 11;
                    const showCountOnSlice = seg.isFullCircle || seg.share >= 5;

                    return (
                      <g
                        key={seg.key}
                        transform={isActive ? `translate(${seg.popX.toFixed(2)}, ${seg.popY.toFixed(2)})` : undefined}
                        className="cursor-pointer transition-transform duration-200"
                        onMouseEnter={() => onHover(seg.key)}
                        onMouseLeave={() => onHover(null)}
                        onClick={() => onSelectFilter(seg.key)}
                      >
                        <title>
                          {seg.name}: {seg.count} টি লিড ({seg.share}%)
                        </title>
                        {seg.isFullCircle ? (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={radius}
                            fill={seg.color}
                            stroke={strokeColor}
                            strokeWidth="2.5"
                            opacity={hoveredKey && !isActive ? 0.72 : 1}
                          />
                        ) : (
                          <path
                            d={seg.path}
                            fill={seg.color}
                            stroke={strokeColor}
                            strokeWidth={isActive ? "3" : "2"}
                            strokeLinejoin="round"
                            opacity={hoveredKey && !isActive ? 0.72 : 1}
                          />
                        )}

                        {showCountOnSlice && (
                          <g className="pointer-events-none select-none">
                            <text
                              x={seg.lx}
                              y={showNameOnSlice ? seg.ly - 4 : seg.ly + 4}
                              textAnchor="middle"
                              fill="#ffffff"
                              fontSize={seg.isFullCircle ? "26" : seg.share >= 16 ? "15" : "12"}
                              fontWeight="900"
                              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.65)" }}
                            >
                              {seg.count}
                            </text>
                            {showNameOnSlice && (
                              <text
                                x={seg.lx}
                                y={seg.isFullCircle ? seg.ly + 18 : seg.ly + 10}
                                textAnchor="middle"
                                fill="#ffffff"
                                fontSize={seg.isFullCircle ? "12" : "9.5"}
                                fontWeight="700"
                                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.75)" }}
                              >
                                {seg.shortName} ({seg.share}%)
                              </text>
                            )}
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}

            {/* Active / Hovered User Summary Strip below the Pie Chart */}
            <div
              className={`w-full rounded-xl border px-3 py-2 text-center text-xs ${
                isLight ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-slate-950/70 border-slate-800 text-slate-200"
              }`}
            >
              {focused ? (
                <div className="flex items-center justify-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: focused.color }}
                  />
                  <span className="font-bold truncate">{focused.name}</span>
                  <span className="font-mono font-black text-amber-500 shrink-0">
                    {focused.count} টি ({focused.share}%)
                  </span>
                </div>
              ) : (
                <span className="text-[11px] font-bold text-slate-500">
                  {showUnassignedSlice
                    ? `মোট লিড: ${total} টি (${activeAssigneeCount} জন ইউজার + অনির্ধারিত)`
                    : `মোট অ্যাসাইন লিড: ${assignedTotal} টি · ${activeAssigneeCount} জন দায়িত্বপ্রাপ্ত ইউজার`}
                </span>
              )}
            </div>
          </div>

          {/* Assigned User Pic + Assign Count Breakdown List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {breakdownRows.map((row) => {
              const selected = activeFilter === row.key;
              const initial = (row.name || "?").trim().charAt(0).toUpperCase();
              return (
                <button
                  key={row.key}
                  type="button"
                  onMouseEnter={() => onHover(row.key)}
                  onMouseLeave={() => onHover(null)}
                  onClick={() => onSelectFilter(row.key)}
                  className={`text-left p-3 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    selected
                      ? "border-amber-500 ring-1 ring-amber-500/40 bg-amber-500/10"
                      : isLight
                        ? "bg-slate-50/80 border-slate-200 hover:border-amber-300"
                        : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* User Avatar / Initial Pic with Slice Color Ring */}
                      <div
                        className="w-9 h-9 rounded-full shrink-0 overflow-hidden flex items-center justify-center text-xs font-black text-white border-2"
                        style={{ borderColor: row.color, backgroundColor: row.avatar ? "transparent" : row.color }}
                      >
                        {row.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={row.avatar} alt={row.name} className="w-full h-full object-cover" />
                        ) : (
                          initial
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className={`text-xs font-bold truncate flex items-center gap-1.5 ${isLight ? "text-slate-900" : "text-white"}`}>
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: row.color }}
                          />
                          <span className="truncate">{row.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate mt-0.5">
                          ফলো-আপ/আগ্রহী: {row.followUp} · ভর্তি: {row.converted}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`text-base font-black font-mono leading-none ${isLight ? "text-slate-900" : "text-white"}`}>
                        {row.count}
                        <span className="text-[10px] font-sans font-bold text-slate-500 ml-0.5">টি</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">{row.share}%</div>
                    </div>
                  </div>

                  {/* Proportional bar */}
                  <div className={`h-1.5 w-full rounded-full overflow-hidden ${isLight ? "bg-slate-200" : "bg-slate-800"}`}>
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, row.share)}%`, backgroundColor: row.color }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ title, value, sub, icon: Icon, tone, isLight, onClick }) {
  const iconCls = {
    indigo: isLight ? "bg-indigo-100 text-indigo-700" : "bg-indigo-500/20 text-indigo-400",
    amber: isLight ? "bg-amber-100 text-amber-700" : "bg-amber-500/20 text-amber-400",
    rose: isLight ? "bg-rose-100 text-rose-700" : "bg-rose-500/20 text-rose-400",
    purple: isLight ? "bg-purple-100 text-purple-700" : "bg-purple-500/20 text-purple-400",
    emerald: isLight ? "bg-emerald-100 text-emerald-700" : "bg-emerald-500/20 text-emerald-400",
  }[tone];

  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`text-left rounded-2xl border p-4 transition-all ${
        isLight
          ? "bg-white border-slate-200 shadow-sm hover:border-amber-300"
          : "bg-slate-900 border-slate-800 shadow-lg hover:border-slate-700"
      } ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className={`text-[11px] font-bold ${isLight ? "text-slate-600" : "text-slate-400"}`}>{title}</span>
        <span className={`p-1.5 rounded-xl ${iconCls}`}>
          <Icon className="w-3.5 h-3.5" />
        </span>
      </div>
      <div className={`text-2xl font-black font-mono ${isLight ? "text-slate-900" : "text-white"}`}>{value}</div>
      <p className="text-[10px] text-slate-500 mt-1 truncate">{sub}</p>
    </Tag>
  );
}
