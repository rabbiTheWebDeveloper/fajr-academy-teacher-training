import { getSessionUser } from "@/lib/auth";
import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { PaymentModel } from "@/model/payment-model";
import PaymentsClient from "./PaymentsClient";
import { redirect } from "next/navigation";

export const metadata = {
  title: "পেমেন্ট হিস্টোরি ও ইনভয়েস | ফজর একাডেমি TOT",
  description: "ফজর একাডেমি ট্রেনিং অফ ট্রেইনার্স (TOT) কোর্সের পেমেন্ট হিস্টোরি, ট্রানজেকশন বিবরণ ও ডাউনলোডযোগ্য অফিসিয়াল ইনভয়েস।",
};

export default async function TOTPaymentsPage({ searchParams }) {
  const session = await getSessionUser();
  const params = await searchParams;
  const tranIdParam = params?.tran_id || "";

  let user = null;
  let payments = [];

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
  } catch (error) {
    console.error("Payments page lookup error:", error);
  }

  // Format payments for client serialization
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

  const activeUser = {
    _id: user?._id?.toString() || "TOT-TR-014",
    fullName: user?.fullName || session?.fullName || "Candidate Teacher",
    email: user?.email || session?.email || "teacher@fajracademy.io",
    phone: user?.phone || "01410764581",
    track: user?.track || session?.track || "TOT-MEN",
    paymentStatus: user?.paymentStatus || "paid",
    paidAmount: user?.paidAmount || 1000,
    tranId: user?.tranId || tranIdParam || "TOT-PAID-" + (user?._id?.toString().slice(-6) || "2026"),
    enrolledAt: user?.enrolledAt ? new Date(user.enrolledAt).toISOString() : new Date().toISOString(),
  };

  return <PaymentsClient user={activeUser} payments={formattedPayments} />;
}
