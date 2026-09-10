import { getSessionUser } from "@/lib/auth";
import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { PaymentModel } from "@/model/payment-model";
import { CourseModel } from "@/model/course-model";
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
  let payments = [];
  let availableCourses = [];

  try {
    await dbConnect();
    if (session?.email) {
      user = await UserModel.findOne({ email: session.email }).lean();
    }
    if (!user && tranIdParam) {
      user = await UserModel.findOne({ tranId: tranIdParam }).lean();
    }

    if (user?.email) {
      payments = await PaymentModel.find({
        $or: [{ userEmail: user.email }, { tranId: user.tranId }],
      })
        .sort({ createdAt: -1 })
        .lean();
    } else if (tranIdParam) {
      payments = await PaymentModel.find({ tranId: tranIdParam })
        .sort({ createdAt: -1 })
        .lean();
    }

    const rawCourses = await CourseModel.find({ isPublished: true }).sort({ createdAt: 1 }).lean();
    availableCourses = JSON.parse(JSON.stringify(rawCourses || []));
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
    enrolledAt: user?.enrolledAt ? new Date(user.enrolledAt).toISOString() : new Date().toISOString(),
    _id: user?._id?.toString() || "TOT-TR-014",
  };

  const formattedPayments = payments.map((p) => ({
    _id: p._id?.toString(),
    tranId: p.tranId,
    valId: p.valId,
    amount: p.amount,
    currency: p.currency || "BDT",
    status: p.status,
    cardType: p.cardType || "SSLCommerz Direct",
    bankTranId: p.bankTranId,
    paymentMethod: p.paymentMethod || "SSLCOMMERZ",
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
  }));

  return (
    <DashboardClient
      trainee={initialTrainee}
      payments={formattedPayments}
      availableCourses={availableCourses}
      isNewlyEnrolled={params?.enrolled === "true"}
    />
  );
}
