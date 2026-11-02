import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { InstructorModel } from "@/model/instructor-model";
import { TotModel } from "@/model/tot-model";
import { PaymentModel } from "@/model/payment-model";
import { EvaluationModel } from "@/model/evaluation-model";
import { NoticeModel } from "@/model/notice-model";
import { trackFilter, toPlain } from "@/lib/query-helpers";
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
 */
async function loadDashboard() {
  await dbConnect();

  const [
    totalTrainees,
    paidTrainees,
    pendingTrainees,
    menTrainees,
    womenTrainees,
    totalInstructors,
    totalAdmins,
    pendingPayments,
    revenue,
    totalEvaluated,
    hiredCount,
    certifiedCount,
    inReviewCount,
    retakeCount,
    recentPayments,
    recentUsers,
    recentInstructors,
    notices,
  ] = await Promise.all([
    TotModel.countDocuments({}),
    TotModel.countDocuments({ paymentStatus: "paid" }),
    TotModel.countDocuments({ paymentStatus: "pending" }),
    TotModel.countDocuments(trackFilter("men")),
    TotModel.countDocuments(trackFilter("women")),
    InstructorModel.countDocuments({}),
    UserModel.countDocuments({ role: { $in: ["admin", "super-admin"] } }),
    PaymentModel.countDocuments({ status: "PENDING" }),
    // Net verified revenue: VALID payments minus any partial refund already sent.
    PaymentModel.aggregate([
      { $match: { status: "VALID" } },
      {
        $group: {
          _id: null,
          total: { $sum: { $subtract: [{ $ifNull: ["$amount", 0] }, { $ifNull: ["$refund.amount", 0] }] } },
          count: { $sum: 1 },
        },
      },
    ]),
    EvaluationModel.countDocuments(),
    EvaluationModel.countDocuments({ qualificationStatus: "hired" }),
    EvaluationModel.countDocuments({ qualificationStatus: "certified" }),
    EvaluationModel.countDocuments({ qualificationStatus: "in-review" }),
    EvaluationModel.countDocuments({ qualificationStatus: "retake-needed" }),
    PaymentModel.find().sort({ createdAt: -1 }).limit(6).select(SAFE_PAYMENT).lean(),
    TotModel.find({}).sort({ createdAt: -1 }).limit(6).select(SAFE_USER).lean(),
    InstructorModel.find({}).sort({ createdAt: -1 }).limit(6).select(SAFE_USER).lean(),
    NoticeModel.find().sort({ isPinned: -1, createdAt: -1 }).limit(20).lean(),
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

export default async function AdminDashboardPage() {
  let stats = EMPTY_STATS;
  let loadError = null;

  try {
    stats = await loadDashboard();
  } catch (error) {
    console.error("Admin dashboard data fetch error:", error);
    loadError = "ডাটাবেজের সাথে সংযোগ করা যায়নি — ড্যাশবোর্ডের সংখ্যাগুলো লোড হয়নি। কিছুক্ষণ পর পেজটি রিফ্রেশ করুন।";
  }

  return <AdminDashboardClient stats={stats} loadError={loadError} />;
}
