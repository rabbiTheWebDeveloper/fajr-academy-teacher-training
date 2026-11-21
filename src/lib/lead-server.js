import mongoose from "mongoose";
import { PaymentModel } from "@/model/payment-model";
import { UserModel } from "@/model/user-model";
import { isObjectId, searchFilter, toPlain } from "@/lib/query-helpers";
import { LEAD_PAYMENT_STATUSES, LEAD_STATUSES, shapeLeadRow } from "@/lib/lead-helpers";

export const LEAD_SAFE_SELECT =
  "-registrationData.passwordHash -registrationData.password -rawResponse -loginIssuedAt";

export const DEFAULT_LEAD_LIMIT = 20;
export const MAX_LEAD_LIMIT = 100;

export async function getPaidEmailSet() {
  const emails = await PaymentModel.distinct("userEmail", { status: "VALID" });
  return new Set(emails.map((e) => String(e || "").toLowerCase().trim()).filter(Boolean));
}

export async function getAssignableStaff() {
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

export function normalizeLeadPagination(pageRaw, limitRaw) {
  const parsedLimit = Number(limitRaw);
  const limit = Number.isFinite(parsedLimit) && parsedLimit >= 1
    ? Math.min(Math.floor(parsedLimit), MAX_LEAD_LIMIT)
    : DEFAULT_LEAD_LIMIT;

  const parsedPage = Number(pageRaw);
  const page = Number.isFinite(parsedPage) && parsedPage >= 1
    ? Math.floor(parsedPage)
    : 1;

  return { page, limit };
}

/**
 * Queries leads with true MongoDB-level pagination (skip/limit), full-dataset KPI summary,
 * and full-dataset assignee breakdown for the user-wise pie chart.
 */
export async function queryAdminLeads({
  page: rawPage = 1,
  limit: rawLimit = DEFAULT_LEAD_LIMIT,
  paymentStatus = "all",
  leadStatus = "all",
  assignedTo = "all",
  track = "all",
  hidePaid = false,
  search = "",
  currentAdminId = "",
} = {}) {
  const { page: requestedPage, limit } = normalizeLeadPagination(rawPage, rawLimit);

  // Validate filter inputs
  if (paymentStatus && paymentStatus !== "all" && !LEAD_PAYMENT_STATUSES.includes(paymentStatus)) {
    return { error: "পেমেন্ট স্ট্যাটাস ফিল্টার সঠিক নয়।", status: 400 };
  }
  if (leadStatus && leadStatus !== "all" && !LEAD_STATUSES.includes(leadStatus)) {
    return { error: "লিড স্ট্যাটাস ফিল্টার সঠিক নয়।", status: 400 };
  }
  if (
    assignedTo &&
    assignedTo !== "all" &&
    assignedTo !== "unassigned" &&
    assignedTo !== "me" &&
    !isObjectId(assignedTo)
  ) {
    return { error: "অ্যাসাইন ইউজার ID সঠিক নয়।", status: 400 };
  }

  const [paidEmails, staff] = await Promise.all([getPaidEmailSet(), getAssignableStaff()]);
  const paidEmailList = [...paidEmails];

  // Base match governs KPI cards, payment tab counts, and assignee pie chart (respects hidePaid)
  const baseFilters = [{ status: { $in: LEAD_PAYMENT_STATUSES } }];
  if (hidePaid && paidEmailList.length > 0) {
    baseFilters.push({ userEmail: { $nin: paidEmailList } });
  }
  const baseMatch = baseFilters.length === 1 ? baseFilters[0] : { $and: baseFilters };

  // List match adds active toolbar filters + search on top of baseMatch
  const listFilters = [...baseFilters];

  if (paymentStatus && paymentStatus !== "all") {
    listFilters.push({ status: paymentStatus });
  }
  if (leadStatus && leadStatus !== "all") {
    if (leadStatus === "new") {
      listFilters.push({ $or: [{ leadStatus: "new" }, { leadStatus: { $exists: false } }] });
    } else {
      listFilters.push({ leadStatus });
    }
  }
  if (assignedTo === "unassigned") {
    listFilters.push({ $or: [{ leadAssignedTo: null }, { leadAssignedTo: { $exists: false } }] });
  } else if (assignedTo === "me") {
    if (isObjectId(String(currentAdminId))) {
      listFilters.push({ leadAssignedTo: new mongoose.Types.ObjectId(String(currentAdminId)) });
    } else {
      listFilters.push({ _id: null });
    }
  } else if (assignedTo && assignedTo !== "all") {
    listFilters.push({ leadAssignedTo: new mongoose.Types.ObjectId(String(assignedTo)) });
  }
  if (track && track !== "all") {
    if (track === "TOT-WOMEN-014") {
      listFilters.push({ track: { $regex: /WOMEN/i } });
    } else if (track === "TOT-MEN") {
      listFilters.push({ track: { $not: /WOMEN/i } });
    } else {
      listFilters.push({ track });
    }
  }
  const cleanSearch = String(search || "").trim();
  if (cleanSearch) {
    const rxFilter = searchFilter(cleanSearch, [
      "userName",
      "userEmail",
      "userPhone",
      "tranId",
      "leadAssignedName",
      "leadNotes.text",
    ]);
    if (rxFilter) listFilters.push(rxFilter);
  }

  const listMatch = listFilters.length === 1 ? listFilters[0] : { $and: listFilters };
  const myAdminObjId = isObjectId(String(currentAdminId))
    ? new mongoose.Types.ObjectId(String(currentAdminId))
    : null;

  // Run count, paid-overlap count, and facet aggregation in parallel
  const [totalMatched, alreadyPaidHidden, facetRes] = await Promise.all([
    PaymentModel.countDocuments(listMatch),
    paidEmailList.length > 0
      ? PaymentModel.countDocuments({
          status: { $in: LEAD_PAYMENT_STATUSES },
          userEmail: { $in: paidEmailList },
        })
      : Promise.resolve(0),
    PaymentModel.aggregate([
      { $match: baseMatch },
      {
        $facet: {
          overall: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                pending: { $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] } },
                cancelled: { $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] } },
                failed: {
                  $sum: {
                    $cond: [{ $in: ["$status", ["FAILED", "INVALID", "EXPIRED", "UNATTEMPTED"]] }, 1, 0],
                  },
                },
                unassigned: {
                  $sum: { $cond: [{ $not: ["$leadAssignedTo"] }, 1, 0] },
                },
                myAssigned: myAdminObjId
                  ? { $sum: { $cond: [{ $eq: ["$leadAssignedTo", myAdminObjId] }, 1, 0] } }
                  : { $sum: 0 },
                newCount: {
                  $sum: {
                    $cond: [{ $in: [{ $ifNull: ["$leadStatus", "new"] }, ["new"]] }, 1, 0],
                  },
                },
                followUp: {
                  $sum: {
                    $cond: [{ $in: ["$leadStatus", ["follow_up", "interested"]] }, 1, 0],
                  },
                },
                interested: {
                  $sum: { $cond: [{ $eq: ["$leadStatus", "interested"] }, 1, 0] },
                },
                converted: {
                  $sum: { $cond: [{ $eq: ["$leadStatus", "converted"] }, 1, 0] },
                },
              },
            },
          ],
          byPayment: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ],
          byAssignee: [
            {
              $group: {
                _id: { $ifNull: ["$leadAssignedTo", "unassigned"] },
                name: { $first: "$leadAssignedName" },
                email: { $first: "$leadAssignedEmail" },
                count: { $sum: 1 },
                followUp: {
                  $sum: {
                    $cond: [{ $in: ["$leadStatus", ["follow_up", "interested"]] }, 1, 0],
                  },
                },
                converted: {
                  $sum: { $cond: [{ $eq: ["$leadStatus", "converted"] }, 1, 0] },
                },
              },
            },
          ],
        },
      },
    ]),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalMatched / limit));
  const page = Math.min(requestedPage, totalPages);
  const skip = (page - 1) * limit;

  const docs =
    totalMatched > 0
      ? await PaymentModel.find(listMatch)
          .select(LEAD_SAFE_SELECT)
          .sort({ createdAt: -1, _id: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
      : [];

  const leads = toPlain(docs.map((doc) => shapeLeadRow(doc, { paidEmails })));

  // Build summary object from aggregation facet
  const facet = facetRes?.[0] || {};
  const ov = facet.overall?.[0] || {};
  const byPayment = { all: ov.total || 0 };
  for (const st of LEAD_PAYMENT_STATUSES) byPayment[st] = 0;
  for (const row of facet.byPayment || []) {
    if (row._id) byPayment[row._id] = row.count || 0;
  }

  const summary = {
    total: ov.total || 0,
    pending: ov.pending || 0,
    cancelled: ov.cancelled || 0,
    failed: ov.failed || 0,
    unassigned: ov.unassigned || 0,
    myAssigned: ov.myAssigned || 0,
    newCount: ov.newCount || 0,
    followUp: ov.followUp || 0,
    interested: ov.interested || 0,
    converted: ov.converted || 0,
    alreadyPaidCount: alreadyPaidHidden,
    alreadyPaidHidden,
    byPayment,
  };

  const assigneeBreakdown = (facet.byAssignee || []).map((row) => ({
    key: row._id === "unassigned" ? "unassigned" : String(row._id),
    name: row.name || "",
    email: row.email || "",
    count: row.count || 0,
    followUp: row.followUp || 0,
    converted: row.converted || 0,
  }));

  const from = totalMatched === 0 ? 0 : skip + 1;
  const to = totalMatched === 0 ? 0 : Math.min(skip + leads.length, totalMatched);

  return {
    leads,
    staff,
    summary,
    assigneeBreakdown,
    pagination: {
      page,
      limit,
      total: totalMatched,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      from,
      to,
    },
  };
}
