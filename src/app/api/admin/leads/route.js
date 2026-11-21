import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { PaymentModel } from "@/model/payment-model";
import { UserModel } from "@/model/user-model";
import { requirePermission, serverError } from "@/lib/api-auth";
import { isObjectId, searchFilter, toPlain } from "@/lib/query-helpers";
import {
  LEAD_PAYMENT_STATUSES,
  LEAD_STATUSES,
  LEAD_STATUS_META,
  shapeLeadRow,
} from "@/lib/lead-helpers";

/**
 * Admin Lead Management API
 *   GET    ?paymentStatus=&leadStatus=&assignedTo=&track=&hidePaid=&search=
 *   PATCH  { leadId | leadIds, leadStatus?, assignedTo?, followUpAt?, note?, noteKind? }
 *   POST   { leadId, text, kind? }  — append a note / call / WhatsApp log entry
 *   DELETE ?leadId=&noteId=         — delete a note from history (super-admin only)
 */

const SAFE_SELECT = "-registrationData.passwordHash -registrationData.password -rawResponse -loginIssuedAt";
const USER_NOTE_KINDS = ["note", "call", "whatsapp"];
const bad = (message, status = 400) => NextResponse.json({ success: false, message }, { status });

async function getPaidEmailSet() {
  const emails = await PaymentModel.distinct("userEmail", { status: "VALID" });
  return new Set(emails.map((e) => String(e || "").toLowerCase().trim()).filter(Boolean));
}

async function getAssignableStaff() {
  const users = await UserModel.find({
    role: { $in: ["admin", "super-admin"] },
    isActive: { $ne: false },
  })
    .select("_id fullName email role designation avatar")
    .sort({ fullName: 1 })
    .lean();
  return toPlain(
    users.map((u) => ({
      _id: String(u._id),
      fullName: u.fullName || u.email,
      email: u.email,
      role: u.role,
      designation: u.designation || "",
      avatar: u.avatar || "",
    }))
  );
}

function summarize(leads, currentAdminId) {
  const s = {
    total: leads.length,
    pending: 0,
    cancelled: 0,
    failed: 0,
    unassigned: 0,
    myAssigned: 0,
    newCount: 0,
    followUp: 0,
    interested: 0,
    converted: 0,
    alreadyPaidCount: 0,
  };
  for (const l of leads) {
    if (l.paymentStatus === "PENDING") s.pending += 1;
    else if (l.paymentStatus === "CANCELLED") s.cancelled += 1;
    else if (["FAILED", "INVALID", "EXPIRED", "UNATTEMPTED"].includes(l.paymentStatus)) s.failed += 1;
    if (!l.leadAssignedTo) s.unassigned += 1;
    if (currentAdminId && l.leadAssignedTo === String(currentAdminId)) s.myAssigned += 1;
    if (l.leadStatus === "new") s.newCount += 1;
    if (l.leadStatus === "follow_up") s.followUp += 1;
    if (l.leadStatus === "interested") s.interested += 1;
    if (l.leadStatus === "converted") s.converted += 1;
    if (l.alreadyPaid) s.alreadyPaidCount += 1;
  }
  return s;
}

export async function GET(request) {
  const auth = await requirePermission(request, "leads", "read");
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const paymentStatus = searchParams.get("paymentStatus") || "all";
    const leadStatus = searchParams.get("leadStatus") || "all";
    const assignedTo = searchParams.get("assignedTo") || "all";
    const track = searchParams.get("track") || "all";
    const hidePaid = searchParams.get("hidePaid") === "true";
    const search = String(searchParams.get("search") || "").trim();

    const filters = [{ status: { $in: LEAD_PAYMENT_STATUSES } }];

    if (paymentStatus && paymentStatus !== "all") {
      if (!LEAD_PAYMENT_STATUSES.includes(paymentStatus)) return bad("পেমেন্ট স্ট্যাটাস ফিল্টার সঠিক নয়।");
      filters.push({ status: paymentStatus });
    }
    if (leadStatus && leadStatus !== "all") {
      if (!LEAD_STATUSES.includes(leadStatus)) return bad("লিড স্ট্যাটাস ফিল্টার সঠিক নয়।");
      if (leadStatus === "new") {
        filters.push({ $or: [{ leadStatus: "new" }, { leadStatus: { $exists: false } }] });
      } else {
        filters.push({ leadStatus });
      }
    }
    if (assignedTo === "unassigned") {
      filters.push({ $or: [{ leadAssignedTo: null }, { leadAssignedTo: { $exists: false } }] });
    } else if (assignedTo === "me") {
      filters.push({ leadAssignedTo: auth.session.id });
    } else if (assignedTo && assignedTo !== "all") {
      if (!isObjectId(assignedTo)) return bad("অ্যাসাইন ইউজার ID সঠিক নয়।");
      filters.push({ leadAssignedTo: assignedTo });
    }
    if (track && track !== "all") {
      if (track === "TOT-WOMEN-014") filters.push({ track: { $regex: /WOMEN/i } });
      else filters.push({ track });
    }
    if (search) {
      const rxFilter = searchFilter(search, [
        "userName",
        "userEmail",
        "userPhone",
        "tranId",
        "leadAssignedName",
        "leadNotes.text",
      ]);
      if (rxFilter) filters.push(rxFilter);
    }

    const [docs, paidEmails, staff] = await Promise.all([
      PaymentModel.find({ $and: filters }).select(SAFE_SELECT).sort({ createdAt: -1 }).limit(1000).lean(),
      getPaidEmailSet(),
      getAssignableStaff(),
    ]);

    let leads = docs.map((doc) => shapeLeadRow(doc, { paidEmails }));
    if (hidePaid) leads = leads.filter((l) => !l.alreadyPaid);

    return NextResponse.json({
      success: true,
      count: leads.length,
      summary: summarize(leads, auth.session.id),
      leads: toPlain(leads),
      staff,
    });
  } catch (error) {
    return serverError(error, "Admin leads GET");
  }
}

export async function PATCH(request) {
  const auth = await requirePermission(request, "leads", "update");
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const body = await request.json();

    const ids = Array.isArray(body.leadIds)
      ? body.leadIds.filter((id) => isObjectId(String(id)))
      : isObjectId(String(body.leadId || ""))
        ? [String(body.leadId)]
        : [];
    if (ids.length === 0) return bad("সঠিক লিড ID প্রদান করুন।");

    const hasStatus = body.leadStatus !== undefined;
    const hasAssign = body.assignedTo !== undefined;
    const hasFollowUp = body.followUpAt !== undefined;
    const noteText = typeof body.note === "string" ? body.note.trim().slice(0, 2000) : "";
    const noteKind = USER_NOTE_KINDS.includes(body.noteKind) ? body.noteKind : "note";

    if (!hasStatus && !hasAssign && !hasFollowUp && !noteText) {
      return bad("আপডেট করার মতো কোনো তথ্য পাওয়া যায়নি।");
    }

    if (hasStatus && !LEAD_STATUSES.includes(body.leadStatus)) {
      return bad("লিড স্ট্যাটাস সঠিক নয়।");
    }

    let assignee = null;
    if (hasAssign && body.assignedTo) {
      if (!isObjectId(String(body.assignedTo))) return bad("সঠিক অ্যাডমিন/স্টাফ ID নির্বাচন করুন।");
      assignee = await UserModel.findOne({
        _id: body.assignedTo,
        role: { $in: ["admin", "super-admin"] },
        isActive: { $ne: false },
      })
        .select("_id fullName email")
        .lean();
      if (!assignee) return bad("নির্বাচিত স্টাফ অ্যাকাউন্টটি সক্রিয় নেই বা খুঁজে পাওয়া যায়নি।", 404);
    }

    let followUpDate = undefined;
    if (hasFollowUp) {
      if (!body.followUpAt) {
        followUpDate = null;
      } else {
        const parsed = new Date(body.followUpAt);
        if (Number.isNaN(parsed.getTime())) return bad("ফলো-আপ তারিখ সঠিক নয়।");
        followUpDate = parsed;
      }
    }

    const actor = {
      byId: isObjectId(String(auth.session.id)) ? auth.session.id : null,
      byName: auth.access?.fullName || auth.session.fullName || auth.session.email || "Admin",
      byEmail: auth.session.email || "",
    };

    const existingDocs = await PaymentModel.find({
      _id: { $in: ids },
      status: { $in: LEAD_PAYMENT_STATUSES },
    });

    if (existingDocs.length === 0) return bad("লিড রেকর্ড খুঁজে পাওয়া যায়নি।", 404);

    const now = new Date();
    const currentUserId = String(auth.access?.id || auth.session.id || "");
    const isSuper = Boolean(auth.access?.isSuper);

    // Ownership lock: once a lead is assigned to one user, another non-super-admin cannot change it.
    if (!isSuper) {
      const locked = existingDocs.find(
        (doc) => doc.leadAssignedTo && String(doc.leadAssignedTo) !== currentUserId
      );
      if (locked) {
        return bad(
          `এই লিডটি ইতোমধ্যে ${locked.leadAssignedName || "অন্য একজনের"} দায়িত্বে আছে — অন্য কেউ পরিবর্তন করতে পারবেন না।`,
          403
        );
      }
    }

    const updatedDocs = [];

    for (const doc of existingDocs) {
      const wasUnassigned = !doc.leadAssignedTo;
      const historyToAdd = [];

      if (hasStatus && (doc.leadStatus || "new") !== body.leadStatus) {
        const fromLabel = LEAD_STATUS_META[doc.leadStatus || "new"]?.label || doc.leadStatus || "নতুন লিড";
        const toLabel = LEAD_STATUS_META[body.leadStatus]?.label || body.leadStatus;
        doc.leadStatus = body.leadStatus;
        historyToAdd.push({
          ...actor,
          kind: "status",
          text: `স্ট্যাটাস পরিবর্তন: ${fromLabel} → ${toLabel}`,
          createdAt: now,
        });
        if (["contacted", "interested", "follow_up", "converted"].includes(body.leadStatus)) {
          doc.leadLastContactedAt = now;
        }
      }

      if (hasAssign) {
        const prevId = doc.leadAssignedTo ? String(doc.leadAssignedTo) : "";
        const nextId = assignee ? String(assignee._id) : "";
        if (prevId !== nextId) {
          doc.leadAssignedTo = assignee ? assignee._id : null;
          doc.leadAssignedName = assignee ? assignee.fullName || assignee.email : "";
          doc.leadAssignedEmail = assignee ? assignee.email : "";
          historyToAdd.push({
            ...actor,
            kind: "assign",
            text: assignee
              ? `দায়িত্ব প্রদান করা হয়েছে: ${assignee.fullName || assignee.email}`
              : "দায়িত্ব সরানো হয়েছে (Unassigned)",
            createdAt: now,
          });
        }
      }

      if (hasFollowUp) {
        doc.leadFollowUpAt = followUpDate;
      }

      if (noteText) {
        historyToAdd.push({
          ...actor,
          kind: noteKind,
          text: noteText,
          createdAt: now,
        });
        if (noteKind === "call" || noteKind === "whatsapp") {
          doc.leadLastContactedAt = now;
        }
      }

      // Guard against two admins claiming the same unassigned lead simultaneously.
      if (!isSuper && wasUnassigned && hasAssign && assignee) {
        const claimed = await PaymentModel.findOneAndUpdate(
          {
            _id: doc._id,
            $or: [{ leadAssignedTo: null }, { leadAssignedTo: { $exists: false } }],
          },
          {
            $set: {
              leadStatus: doc.leadStatus,
              leadAssignedTo: doc.leadAssignedTo,
              leadAssignedName: doc.leadAssignedName,
              leadAssignedEmail: doc.leadAssignedEmail,
              leadFollowUpAt: doc.leadFollowUpAt,
              leadLastContactedAt: doc.leadLastContactedAt,
            },
            ...(historyToAdd.length > 0 ? { $push: { leadNotes: { $each: historyToAdd } } } : {}),
          },
          { returnDocument: "after" }
        )
          .select(SAFE_SELECT)
          .lean();

        if (!claimed) {
          return bad("এই লিডটি এইমাত্র অন্য কেউ নিয়ে নিয়েছেন — পেজ রিফ্রেশ করুন।", 409);
        }
        updatedDocs.push(claimed);
      } else {
        if (historyToAdd.length > 0) {
          doc.leadNotes = [...(doc.leadNotes || []), ...historyToAdd];
        }
        await doc.save();
        updatedDocs.push(doc.toObject());
      }
    }

    const paidEmails = await getPaidEmailSet();
    const shaped = updatedDocs.map((d) => shapeLeadRow(d, { paidEmails }));

    return NextResponse.json({
      success: true,
      message:
        shaped.length > 1
          ? `${shaped.length}টি লিড সফলভাবে আপডেট হয়েছে।`
          : "লিডের তথ্য সফলভাবে আপডেট হয়েছে।",
      lead: toPlain(shaped[0]),
      leads: toPlain(shaped),
    });
  } catch (error) {
    return serverError(error, "Admin leads PATCH");
  }
}

export async function POST(request) {
  let auth = await requirePermission(request, "leads", "create");
  if (auth.error) auth = await requirePermission(request, "leads", "update");
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const body = await request.json();
    const leadId = String(body.leadId || "").trim();
    const text = String(body.text || body.note || "").trim().slice(0, 2000);
    const kind = USER_NOTE_KINDS.includes(body.kind) ? body.kind : "note";

    if (!isObjectId(leadId)) return bad("সঠিক লিড ID প্রদান করুন।");
    if (!text) return bad("নোটের বিবরণ লিখুন।");

    const doc = await PaymentModel.findOne({ _id: leadId, status: { $in: LEAD_PAYMENT_STATUSES } });
    if (!doc) return bad("লিড রেকর্ড খুঁজে পাওয়া যায়নি।", 404);

    const currentUserId = String(auth.access?.id || auth.session.id || "");
    if (!auth.access?.isSuper && doc.leadAssignedTo && String(doc.leadAssignedTo) !== currentUserId) {
      return bad(
        `এই লিডটি ইতোমধ্যে ${doc.leadAssignedName || "অন্য একজনের"} দায়িত্বে আছে — আপনি নোট যোগ করতে পারবেন না।`,
        403
      );
    }

    const now = new Date();
    doc.leadNotes.push({
      text,
      kind,
      byId: isObjectId(String(auth.session.id)) ? auth.session.id : null,
      byName: auth.access?.fullName || auth.session.fullName || auth.session.email || "Admin",
      byEmail: auth.session.email || "",
      createdAt: now,
    });
    if (kind === "call" || kind === "whatsapp") {
      doc.leadLastContactedAt = now;
      if ((doc.leadStatus || "new") === "new") {
        doc.leadStatus = "contacted";
      }
    }
    if (body.followUpAt !== undefined) {
      if (!body.followUpAt) {
        doc.leadFollowUpAt = null;
      } else {
        const d = new Date(body.followUpAt);
        if (!Number.isNaN(d.getTime())) doc.leadFollowUpAt = d;
      }
    }

    await doc.save();
    const paidEmails = await getPaidEmailSet();
    return NextResponse.json(
      {
        success: true,
        message: "নোট হিস্ট্রিতে সফলভাবে যুক্ত হয়েছে!",
        lead: toPlain(shapeLeadRow(doc.toObject(), { paidEmails })),
      },
      { status: 201 }
    );
  } catch (error) {
    return serverError(error, "Admin leads POST");
  }
}

export async function DELETE(request) {
  const auth = await requirePermission(request, "leads", "delete");
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("leadId");
    const noteId = searchParams.get("noteId");

    if (!isObjectId(String(leadId || "")) || !isObjectId(String(noteId || ""))) {
      return bad("সঠিক leadId এবং noteId প্রদান করুন।");
    }

    const updated = await PaymentModel.findOneAndUpdate(
      { _id: leadId, status: { $in: LEAD_PAYMENT_STATUSES } },
      { $pull: { leadNotes: { _id: noteId } } },
      { returnDocument: "after" }
    )
      .select(SAFE_SELECT)
      .lean();

    if (!updated) return bad("লিড রেকর্ড খুঁজে পাওয়া যায়নি।", 404);

    const paidEmails = await getPaidEmailSet();
    return NextResponse.json({
      success: true,
      message: "নোটটি হিস্ট্রি থেকে মুছে ফেলা হয়েছে।",
      lead: toPlain(shapeLeadRow(updated, { paidEmails })),
    });
  } catch (error) {
    return serverError(error, "Admin leads DELETE");
  }
}
