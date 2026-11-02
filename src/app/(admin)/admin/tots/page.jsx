import { dbConnect } from "@/service/mongo";
import { TotModel } from "@/model/tot-model";
import { SAFE_ACCOUNT_SELECT } from "@/model/account-schema";
import { toPlain } from "@/lib/query-helpers";
import AdminTotsClient from "./AdminTotsClient";

export const metadata = {
  title: "TOT ট্রেইনি ম্যানেজমেন্ট | অ্যাডমিন প্যানেল",
  description: "Fajr Academy TOT trainee (registered & paying candidates) database management.",
};

export const dynamic = "force-dynamic";

export default async function AdminTotsPage() {
  let initialTots = [];
  let loadError = null;

  try {
    await dbConnect();
    const data = await TotModel.find({}).sort({ createdAt: -1 }).select(SAFE_ACCOUNT_SELECT).lean();
    initialTots = toPlain(data);
  } catch (error) {
    console.error("Error fetching TOT trainees:", error);
    loadError = "ডাটাবেজের সাথে সংযোগ করা যায়নি — ট্রেইনি তালিকা লোড হয়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।";
  }

  return <AdminTotsClient initialTots={initialTots} loadError={loadError} />;
}
