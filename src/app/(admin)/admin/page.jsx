import { redirect } from "next/navigation";
import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { RoleModel } from "@/model/role-model";
import { InstructorModel } from "@/model/instructor-model";
import { TotModel } from "@/model/tot-model";
import { PaymentModel } from "@/model/payment-model";
import { EvaluationModel } from "@/model/evaluation-model";
import { NoticeModel } from "@/model/notice-model";
import { trackFilter, toPlain } from "@/lib/query-helpers";
import { hasPermission } from "@/lib/rbac";
import { getAdminAccess } from "../_shared/server";
import AdminDashboardClient from "./AdminDashboardClient";

export const metadata = {
  title: "অ্যাডমিন ড্যাশবোর্ড ওভারভিউ | ফজর একাডেমি",
  description: "Fajr Academy TOT Enterprise Management Dashboard.",
};

export const dynamic = "force-dynamic";

const SAFE_USER = "-password -resetPasswordToken -resetPasswordExpires";
const SAFE_PAYMENT = "-registrationData -rawResponse -loginIssuedAt";

const EMPTY_STATS = {
  totalTrainees: 0,
  paidTrainees: 0,
  pendingTrainees: 0,
  pendingPayments: 0,
  totalRevenue: 0,
  validPayments: 0,
  menTrainees: 0,
  womenTrainees: 0,
  totalInstructors: 0,
  totalAdmins: 0,
  totalRoles: 0,
  totalEvaluated: 0,
  hiredCount: 0,
  certifiedCount: 0,
  inReviewCount: 0,
  retakeCount: 0,
  recentPayments: [],
  recentUsers: [],
  recentInstructors: [],
  notices: [],
};

/**
 * Read-only: every number comes from the database, nothing is seeded or estimated.
 * Trainees = TotModel ("tots"), instructors = InstructorModel, admins = UserModel ("users").
 *
 * Role-wise: each group of queries runs only if the signed-in admin may read that module
 * (payments, tots, instructors, evaluations, announcements); the admin/role counts are
 * super-admin only. What a role may not read is never queried, so it never reaches the browser.
 */
async function loadDashboard(access) {
  await dbConnect();
  const can = (module) => hasPermission(access, module, "read");
  const zero = (v) => Promise.resolve(v);

  const [
    totalTrainees,
    paidTrainees,
    pendingTrainees,
    menTrainees,
    womenTrainees,
    recentUsers,
    totalInstructors,
    recentInstructors,
    pendingPayments,
    revenue,
    recentPayments,
    totalEvaluated,
    hiredCount,
    certifiedCount,
    inReviewCount,
    retakeCount,
    notices,
    totalAdmins,
    totalRoles,
  ] = await Promise.all([
    // --- TOT trainees ---
    can("tots") ? TotModel.countDocuments({}) : zero(0),
    // Same definitions as the instructor stats: paid = paid + free, pending = pending + failed.
    can("tots") ? TotModel.countDocuments({ paymentStatus: { $in: ["paid", "free"] } }) : zero(0),
    can("tots") ? TotModel.countDocuments({ paymentStatus: { $in: ["pending", "failed"] } }) : zero(0),
    can("tots") ? TotModel.countDocuments(trackFilter("men")) : zero(0),
    can("tots") ? TotModel.countDocuments(trackFilter("women")) : zero(0),
    can("tots") ? TotModel.find({}).sort({ createdAt: -1 }).limit(6).select(SAFE_USER).lean() : zero([]),
    // --- Instructors ---
    can("instructors") ? InstructorModel.countDocuments({}) : zero(0),
    can("instructors") ? InstructorModel.find({}).sort({ createdAt: -1 }).limit(6).select(SAFE_USER).lean() : zero([]),
    // --- Payments ---
    can("payments") ? PaymentModel.countDocuments({ status: "PENDING" }) : zero(0),
    // Net verified revenue: VALID payments minus any partial refund already sent.
    can("payments")
      ? PaymentModel.aggregate([
          { $match: { status: "VALID" } },
          {
            $group: {
              _id: null,
              total: { $sum: { $subtract: [{ $ifNull: ["$amount", 0] }, { $ifNull: ["$refund.amount", 0] }] } },
              count: { $sum: 1 },
            },
          },
        ])
      : zero([]),
    can("payments") ? PaymentModel.find().sort({ createdAt: -1 }).limit(6).select(SAFE_PAYMENT).lean() : zero([]),
    // --- Evaluations ---
    can("evaluations") ? EvaluationModel.countDocuments() : zero(0),
    can("evaluations") ? EvaluationModel.countDocuments({ qualificationStatus: "hired" }) : zero(0),
    can("evaluations") ? EvaluationModel.countDocuments({ qualificationStatus: "certified" }) : zero(0),
    can("evaluations") ? EvaluationModel.countDocuments({ qualificationStatus: "in-review" }) : zero(0),
    can("evaluations") ? EvaluationModel.countDocuments({ qualificationStatus: "retake-needed" }) : zero(0),
    // --- Notices ---
    can("announcements") ? NoticeModel.find().sort({ isPinned: -1, createdAt: -1 }).limit(20).lean() : zero([]),
    // --- Access control (super-admin only) ---
    access.isSuper ? UserModel.countDocuments({ role: { $in: ["admin", "super-admin"] } }) : zero(0),
    access.isSuper ? RoleModel.countDocuments({}) : zero(0),
  ]);

  return toPlain({
    totalTrainees,
    paidTrainees,
    pendingTrainees,
    pendingPayments,
    totalRevenue: revenue[0]?.total || 0,
    validPayments: revenue[0]?.count || 0,
    menTrainees,
    womenTrainees,
    totalInstructors,
    totalAdmins,
    totalRoles,
    totalEvaluated,
    hiredCount,
    certifiedCount,
    inReviewCount,
    retakeCount,
    recentPayments,
    recentUsers,
    recentInstructors,
    notices,
  });
}

export default async function AdminDashboardPage({ searchParams }) {
  const { access } = await getAdminAccess();
  if (!access) redirect("/login?redirect=/admin");

  // ?error=no_access is set when a role is sent back from a page it may not open.
  const { error } = (await searchParams) || {};

  let stats = EMPTY_STATS;
  let loadError = null;

  try {
    stats = await loadDashboard(access);
  } catch (err) {
    console.error("Admin dashboard data fetch error:", err);
    loadError = "ডাটাবেজের সাথে সংযোগ করা যায়নি — ড্যাশবোর্ডের সংখ্যাগুলো লোড হয়নি। কিছুক্ষণ পর পেজটি রিফ্রেশ করুন।";
  }

  return <AdminDashboardClient stats={stats} loadError={loadError} notice={error === "no_access" ? "no_access" : null} />;
}
