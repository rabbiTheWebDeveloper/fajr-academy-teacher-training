import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { PaymentModel } from "@/model/payment-model";
import AdminDashboardClient from "./AdminDashboardClient";

export const metadata = {
  title: "অ্যাডমিন ড্যাশবোর্ড ওভারভিউ | ফজর একাডেমি",
  description: "Fajr Academy TOT Enterprise Management Dashboard.",
};

export default async function AdminDashboardPage() {
  let stats = {
    totalTrainees: 0,
    paidTrainees: 0,
    pendingTrainees: 0,
    totalRevenue: 0,
    menTrainees: 0,
    womenTrainees: 0,
    totalInstructors: 0,
    recentPayments: [],
    recentUsers: [],
  };

  try {
    await dbConnect();

    const [
      totalUsers,
      paidUsers,
      pendingUsers,
      menCount,
      womenCount,
      instructorCount,
      recentPayData,
      recentUserData,
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
    ]);

    stats = {
      totalTrainees: totalUsers,
      paidTrainees: paidUsers,
      pendingTrainees: pendingUsers,
      totalRevenue: paidUsers * 1000,
      menTrainees: menCount,
      womenTrainees: womenCount,
      totalInstructors: instructorCount,
      recentPayments: recentPayData.map((p) => ({
        ...p,
        _id: p._id.toString(),
        createdAt: p.createdAt ? p.createdAt.toISOString() : "",
      })),
      recentUsers: recentUserData.map((u) => ({
        ...u,
        _id: u._id.toString(),
        createdAt: u.createdAt ? u.createdAt.toISOString() : "",
      })),
    };
  } catch (error) {
    console.error("Admin dashboard data fetch error:", error);
  }

  return <AdminDashboardClient initialStats={stats} />;
}
