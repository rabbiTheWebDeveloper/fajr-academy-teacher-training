import { dbConnect } from "@/service/mongo";
import { PaymentModel } from "@/model/payment-model";
import { UserModel } from "@/model/user-model";
import { toPlain } from "@/lib/query-helpers";
import { LEAD_PAYMENT_STATUSES, shapeLeadRow } from "@/lib/lead-helpers";
import { requireAdminPage } from "../../_shared/server";
import AdminLeadsClient from "./AdminLeadsClient";

export const metadata = {
  title: "লিড ম্যানেজমেন্ট | অ্যাডমিন প্যানেল",
  description: "Fajr Academy TOT Pending & Cancelled Payment Lead Management, Assignment & Note History.",
};

export const dynamic = "force-dynamic";

const SAFE_SELECT = "-registrationData.passwordHash -registrationData.password -rawResponse -loginIssuedAt";

export default async function AdminLeadsPage() {
  const access = await requireAdminPage("leads");

  let initialLeads = [];
  let staff = [];
  let loadError = null;

  try {
    await dbConnect();
    const [docs, validEmails, staffDocs] = await Promise.all([
      PaymentModel.find({ status: { $in: LEAD_PAYMENT_STATUSES } })
        .select(SAFE_SELECT)
        .sort({ createdAt: -1 })
        .limit(1000)
        .lean(),
      PaymentModel.distinct("userEmail", { status: "VALID" }),
      UserModel.find({
        role: { $in: ["admin", "super-admin"] },
        isActive: { $ne: false },
      })
        .select("_id fullName email role designation avatar")
        .sort({ fullName: 1 })
        .lean(),
    ]);

    const paidEmails = new Set(
      validEmails.map((e) => String(e || "").toLowerCase().trim()).filter(Boolean)
    );
    initialLeads = toPlain(docs.map((doc) => shapeLeadRow(doc, { paidEmails })));
    staff = toPlain(
      staffDocs.map((u) => ({
        _id: String(u._id),
        fullName: u.fullName || u.email,
        email: u.email,
        role: u.role,
        designation: u.designation || "",
        avatar: u.avatar || "",
      }))
    );
  } catch (err) {
    console.error("Error loading leads for admin page:", err);
    loadError = "ডাটাবেজের সাথে সংযোগ করা যায়নি — লিড তালিকা লোড হয়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।";
  }

  return (
    <AdminLeadsClient
      initialLeads={initialLeads}
      staff={staff}
      currentAdminId={access.id}
      loadError={loadError}
    />
  );
}
