import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { toPlain } from "@/lib/query-helpers";
import AdminInstructorsClient from "./AdminInstructorsClient";

export const metadata = {
  title: "ইনস্ট্রাক্টর ও ট্রেইনার প্যানেল | অ্যাডমিন প্যানেল",
  description: "Fajr Academy Senior Trainer Faculty, Profiles & Coordinator Management.",
};

export const dynamic = "force-dynamic";

export default async function AdminInstructorsPage() {
  let initialInstructors = [];
  let loadError = null;

  try {
    await dbConnect();
    // Instructors only (admins are managed on the Users screen). Nothing is seeded here.
    const data = await UserModel.find({ role: "instructor" })
      .sort({ createdAt: -1 })
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .lean();
    initialInstructors = toPlain(data);
  } catch (error) {
    console.error("Error fetching instructors:", error);
    loadError = "ডাটাবেজের সাথে সংযোগ করা যায়নি — ইনস্ট্রাক্টর তালিকা লোড হয়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।";
  }

  return <AdminInstructorsClient initialInstructors={initialInstructors} loadError={loadError} />;
}
