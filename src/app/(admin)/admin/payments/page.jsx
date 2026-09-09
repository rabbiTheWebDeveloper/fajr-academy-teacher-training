import { dbConnect } from "@/service/mongo";
import { PaymentModel } from "@/model/payment-model";
import AdminPaymentsClient from "./AdminPaymentsClient";

export const metadata = {
  title: "পেমেন্ট ভেরিফিকেশন ও লেজার | অ্যাডমিন প্যানেল",
  description: "Fajr Academy TOT Payment Verification & Financial Ledger.",
};

export default async function AdminPaymentsPage() {
  let initialPayments = [];
  try {
    await dbConnect();
    const data = await PaymentModel.find()
      .sort({ createdAt: -1 })
      .lean();

    initialPayments = data.map((p) => ({
      ...p,
      _id: p._id.toString(),
      createdAt: p.createdAt ? p.createdAt.toISOString() : "",
    }));
  } catch (error) {
    console.error("Error fetching payments:", error);
  }

  return <AdminPaymentsClient initialPayments={initialPayments} />;
}
