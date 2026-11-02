import { dbConnect } from "@/service/mongo";
import { PaymentModel } from "@/model/payment-model";
import { toPlain } from "@/lib/query-helpers";
import AdminPaymentsClient from "./AdminPaymentsClient";

export const metadata = {
  title: "পেমেন্ট ভেরিফিকেশন ও লেজার | অ্যাডমিন প্যানেল",
  description: "Fajr Academy TOT Payment Verification & Financial Ledger.",
};

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  let initialPayments = [];
  let loadError = null;

  try {
    await dbConnect();
    // Never ship password hashes (registrationData), raw gateway dumps or login markers to the browser.
    const data = await PaymentModel.find()
      .sort({ createdAt: -1 })
      .select("-registrationData -rawResponse -loginIssuedAt")
      .lean();
    initialPayments = toPlain(data);
  } catch (error) {
    console.error("Error fetching payments:", error);
    loadError = "ডাটাবেজের সাথে সংযোগ করা যায়নি — পেমেন্ট লেজার লোড হয়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।";
  }

  return <AdminPaymentsClient initialPayments={initialPayments} loadError={loadError} />;
}
