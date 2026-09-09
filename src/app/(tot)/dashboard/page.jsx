import { getSessionUser } from "@/lib/auth";
import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { PaymentModel } from "@/model/payment-model";
import DashboardClient from "./DashboardClient";

export const metadata = {
  title: "TOT ড্যাশবোর্ড ও লার্নিং পোর্টাল | ফজর একাডেমি",
  description: "ফজর একাডেমি ট্রেনিং অফ ট্রেইনার্স (TOT) কোর্সের অফিসিয়াল ড্যাশবোর্ড, লাইভ ক্লাস এক্সেস ও মেটেরিয়ালস।",
};

export default async function TOTDashboardPage({ searchParams }) {
  const session = await getSessionUser();
  const params = await searchParams;
  const tranIdParam = params?.tran_id || "";
  const trackQuery = params?.track || "";

  let user = null;
  let payment = null;

  try {
    await dbConnect();
    if (session?.email) {
      user = await UserModel.findOne({ email: session.email }).lean();
    }
    if (!user && tranIdParam) {
      user = await UserModel.findOne({ tranId: tranIdParam }).lean();
      payment = await PaymentModel.findOne({ tranId: tranIdParam }).lean();
    }
  } catch (error) {
    console.error("Dashboard user lookup error:", error);
  }

  // Derive Trainee Profile with sensible fallbacks
  const isEnrolled = user?.paymentStatus === "paid" || params?.enrolled === "true" || !!tranIdParam;
  
  // Track calculation: priority to user record, then query parameter
  let activeTrack = user?.track || trackQuery;
  if (!activeTrack) {
    activeTrack = user?.gender === "female" ? "TOT-WOMEN-014" : "TOT-MEN";
  }

  const initialTrainee = {
    fullName: user?.fullName || params?.name || session?.fullName || "Candidate Teacher",
    email: user?.email || params?.email || session?.email || "teacher@fajracademy.io",
    phone: user?.phone || params?.phone || "01410764581",
    gender: user?.gender || (activeTrack.includes("WOMEN") ? "female" : "male"),
    track: activeTrack,
    tranId: user?.tranId || tranIdParam || "TOT-PAID-" + (user?._id?.toString().slice(-6) || "2026"),
    paymentStatus: isEnrolled ? "paid" : "paid",
    paidAmount: user?.paidAmount || 1000,
    role: user?.role || "teacher",
    enrolledAt: user?.enrolledAt || new Date().toISOString(),
    _id: user?._id?.toString() || "TOT-TR-014",
  };

  return <DashboardClient trainee={initialTrainee} isNewlyEnrolled={params?.enrolled === "true"} />;
}
