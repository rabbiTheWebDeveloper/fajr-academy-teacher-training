import { getSessionUser } from "@/lib/auth";
import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { PaymentModel } from "@/model/payment-model";
import InstructorDashboardClient from "./InstructorDashboardClient";

export const metadata = {
  title: "ইনস্ট্রাক্টর ড্যাশবোর্ড | ফজর একাডেমি TOT",
  description: "ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) সিনিয়র ইনস্ট্রাক্টর কন্ট্রোল প্যানেল।",
};

export default async function InstructorPage({ searchParams }) {
  const session = await getSessionUser();
  const params = await searchParams;

  let totalTrainees = 0;
  let menTraineesCount = 0;
  let womenTraineesCount = 0;
  let recentTrainees = [];

  try {
    await dbConnect();

    const [total, men, women, recents] = await Promise.all([
      UserModel.countDocuments({ role: { $in: ["teacher", "student"] } }),
      UserModel.countDocuments({
        role: { $in: ["teacher", "student"] },
        $or: [{ track: "TOT-MEN" }, { gender: "male" }],
      }),
      UserModel.countDocuments({
        role: { $in: ["teacher", "student"] },
        $or: [{ track: { $regex: /WOMEN/i } }, { gender: "female" }],
      }),
      UserModel.find({ role: { $in: ["teacher", "student"] } })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("fullName email phone track gender paymentStatus tranId createdAt")
        .lean(),
    ]);

    totalTrainees = total;
    menTraineesCount = men;
    womenTraineesCount = women;
    recentTrainees = recents.map((r) => ({
      ...r,
      _id: r._id.toString(),
      createdAt: r.createdAt ? r.createdAt.toISOString() : "",
    }));
  } catch (error) {
    console.error("Instructor dashboard data fetch error:", error);
  }

  const instructorProfile = {
    fullName: session?.fullName || "উস্তাদ আব্দুল্লাহ আল-মাহমুদ",
    email: session?.email || "instructor@fajracademy.io",
    designation: "Lead Master Trainer (TOT)",
    role: "instructor",
  };

  return (
    <InstructorDashboardClient
      instructor={instructorProfile}
      stats={{
        totalTrainees,
        menTraineesCount,
        womenTraineesCount,
        recentTrainees,
      }}
    />
  );
}
