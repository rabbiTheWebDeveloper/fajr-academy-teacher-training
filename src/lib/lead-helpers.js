/**
 * Shared Lead Management constants and shaping helpers (server + client safe).
 * A "lead" is any non-VALID, non-REFUNDED payment attempt (PENDING, CANCELLED,
 * FAILED, UNATTEMPTED, EXPIRED, INVALID) that needs follow-up.
 */

export const LEAD_PAYMENT_STATUSES = [
  "PENDING",
  "CANCELLED",
  "FAILED",
  "UNATTEMPTED",
  "EXPIRED",
  "INVALID",
];

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "interested",
  "follow_up",
  "converted",
  "not_interested",
  "lost",
];

export const LEAD_STATUS_META = {
  new: { label: "নতুন লিড", en: "New", tone: "sky" },
  contacted: { label: "যোগাযোগ করা হয়েছে", en: "Contacted", tone: "indigo" },
  interested: { label: "আগ্রহী", en: "Interested", tone: "emerald" },
  follow_up: { label: "ফলো-আপ দরকার", en: "Follow Up", tone: "amber" },
  converted: { label: "ভর্তি সম্পন্ন", en: "Converted", tone: "teal" },
  not_interested: { label: "আগ্রহী নয়", en: "Not Interested", tone: "slate" },
  lost: { label: "লস্ট / বাতিল", en: "Lost", tone: "rose" },
};

export const PAYMENT_STATUS_META = {
  PENDING: { label: "পেন্ডিং", tone: "amber" },
  CANCELLED: { label: "বাতিল (Cancelled)", tone: "rose" },
  FAILED: { label: "ব্যর্থ (Failed)", tone: "rose" },
  UNATTEMPTED: { label: "অসম্পূর্ণ", tone: "slate" },
  EXPIRED: { label: "মেয়াদোত্তীর্ণ", tone: "slate" },
  INVALID: { label: "অবৈধ", tone: "rose" },
};

export const NOTE_KINDS = ["note", "call", "whatsapp", "status", "assign", "system"];

export const NOTE_KIND_META = {
  note: { label: "নোট", tone: "slate" },
  call: { label: "ফোন কল", tone: "indigo" },
  whatsapp: { label: "WhatsApp", tone: "emerald" },
  status: { label: "স্ট্যাটাস", tone: "amber" },
  assign: { label: "অ্যাসাইন", tone: "purple" },
  system: { label: "সিস্টেম", tone: "slate" },
};

/**
 * Shapes a PaymentModel lean doc into a safe Lead object for the browser.
 * Never exposes password hashes or raw gateway responses.
 */
export function shapeLeadRow(payment, { paidEmails = new Set() } = {}) {
  const reg = payment?.registrationData && typeof payment.registrationData === "object" ? payment.registrationData : null;
  const email = String(payment?.userEmail || "").toLowerCase().trim();
  const notes = [...(payment?.leadNotes || [])]
    .map((n) => ({
      _id: String(n._id || ""),
      text: n.text || "",
      kind: n.kind || "note",
      byId: n.byId ? String(n.byId) : "",
      byName: n.byName || "",
      byEmail: n.byEmail || "",
      createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : "",
    }))
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  return {
    _id: String(payment._id),
    tranId: payment.tranId || "",
    amount: Number(payment.amount) || 0,
    currency: payment.currency || "BDT",
    paymentStatus: payment.status || "PENDING",
    purpose: payment.purpose || "registration",
    courseId: payment.courseId || "",
    track: payment.track || "TOT-MEN",
    userName: payment.userName || reg?.fullName || "",
    userEmail: email,
    userPhone: payment.userPhone || reg?.phone || "",
    paymentMethod: payment.cardType || payment.paymentMethod || "SSLCOMMERZ",
    paymentNotes: payment.notes || "",
    createdAt: payment.createdAt ? new Date(payment.createdAt).toISOString() : "",
    updatedAt: payment.updatedAt ? new Date(payment.updatedAt).toISOString() : "",
    alreadyPaid: Boolean(email && paidEmails.has(email)),
    applicantInfo: reg
      ? {
          education: reg.education || "",
          quranSkill: reg.quranSkill || "",
          englishSkill: reg.englishSkill || "",
          hasLaptop: reg.hasLaptop || "",
          gender: reg.gender || "",
        }
      : null,
    leadStatus: LEAD_STATUSES.includes(payment.leadStatus) ? payment.leadStatus : "new",
    leadAssignedTo: payment.leadAssignedTo ? String(payment.leadAssignedTo) : "",
    leadAssignedName: payment.leadAssignedName || "",
    leadAssignedEmail: payment.leadAssignedEmail || "",
    leadFollowUpAt: payment.leadFollowUpAt ? new Date(payment.leadFollowUpAt).toISOString() : "",
    leadLastContactedAt: payment.leadLastContactedAt ? new Date(payment.leadLastContactedAt).toISOString() : "",
    leadNotes: notes,
    notesCount: notes.length,
    latestNote: notes[0] || null,
  };
}
