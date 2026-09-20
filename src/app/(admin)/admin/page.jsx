import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { PaymentModel } from "@/model/payment-model";
import { EvaluationModel } from "@/model/evaluation-model";
import { DEFAULT_INSTRUCTORS } from "@/constant/instructor-defaults";
import AdminDashboardClient from "./AdminDashboardClient";

export const metadata = {
  title: "অ্যাডমিন ড্যাশবোর্ড ওভারভিউ | ফজর একাডেমি",
  description: "Fajr Academy TOT Enterprise Management Dashboard.",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  let stats = {
    totalTrainees: 0,
    paidTrainees: 0,
    pendingTrainees: 0,
    totalRevenue: 0,
    menTrainees: 0,
    womenTrainees: 0,
    totalInstructors: 0,
    totalEvaluated: 0,
    certifiedHiredCount: 0,
    certifiedCount: 0,
    recentPayments: [],
    recentUsers: [],
    recentInstructors: [],
  };

  try {
    await dbConnect();

    // Check if instructors need initial seeding
    const instCountCheck = await UserModel.countDocuments({ role: { $in: ["instructor", "admin"] } });
    if (instCountCheck === 0) {
      for (const inst of DEFAULT_INSTRUCTORS) {
        const exists = await UserModel.findOne({ email: inst.email });
        if (!exists) {
          await UserModel.create(inst);
        }
      }
    }

    const [
      totalUsers,
      paidUsers,
      pendingUsers,
      menCount,
      womenCount,
      instructorCount,
      recentPayData,
      recentUserData,
      recentInstructorData,
      evalCount,
      hiredCount,
      certCount,
    ] = await Promise.all([
      UserModel.countDocuments({ role: "teacher" }),
      UserModel.countDocuments({ role: "teacher", paymentStatus: "paid" }),
      UserModel.countDocuments({ role: "teacher", paymentStatus: "pending" }),
      UserModel.countDocuments({
        role: "teacher",
        $or: [{ track: "TOT-MEN" }, { gender: "male" }],
      }),
      UserModel.countDocuments({
        role: "teacher",
        $or: [{ track: { $regex: /WOMEN/i } }, { gender: "female" }],
      }),
      UserModel.countDocuments({ role: { $in: ["instructor", "admin"] } }),
      PaymentModel.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      UserModel.find({ role: "teacher" })
        .sort({ createdAt: -1 })
        .limit(6)
        .select("-password")
        .lean(),
      UserModel.find({ role: { $in: ["instructor", "admin"] } })
        .sort({ createdAt: -1 })
        .limit(6)
        .select("-password")
        .lean(),
      EvaluationModel.countDocuments(),
      EvaluationModel.countDocuments({ qualificationStatus: "certified_and_hired" }),
      EvaluationModel.countDocuments({ qualificationStatus: "certified" }),
    ]);

    function formatIsoDate(val) {
      if (!val) return "";
      if (typeof val === "string") return val;
      try {
        const d = new Date(val);
        return isNaN(d.getTime()) ? "" : d.toISOString();
      } catch {
        return "";
      }
    }

    stats = {
      totalTrainees: totalUsers,
      paidTrainees: paidUsers,
      pendingTrainees: pendingUsers,
      totalRevenue: paidUsers * 1000,
      menTrainees: menCount,
      womenTrainees: womenCount,
      totalInstructors: instructorCount,
      totalEvaluated: evalCount,
      certifiedHiredCount: hiredCount,
      certifiedCount: certCount,
      recentPayments: recentPayData.map((p) => ({
        ...p,
        _id: p._id ? p._id.toString() : "",
        createdAt: formatIsoDate(p.createdAt),
      })),
      recentUsers: recentUserData.map((u) => ({
        ...u,
        _id: u._id ? u._id.toString() : "",
        createdAt: formatIsoDate(u.createdAt),
      })),
      recentInstructors: recentInstructorData.map((i) => ({
        ...i,
        _id: i._id ? i._id.toString() : "",
        createdAt: formatIsoDate(i.createdAt),
      })),
    };
  } catch (error) {
    console.error("Admin dashboard data fetch error:", error);
  }

  return <AdminDashboardClient initialStats={stats} />;
}
