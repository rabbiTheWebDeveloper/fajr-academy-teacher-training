import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { getSessionUser } from "@/lib/auth";
import { toPlain } from "@/lib/query-helpers";
import AdminUsersClient from "./AdminUsersClient";

export const metadata = {
  title: "ইউজার ও ট্রেইনি ম্যানেজমেন্ট | অ্যাডমিন প্যানেল",
  description: "Fajr Academy TOT User and Teacher Candidate Database Management.",
};

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getSessionUser();
  let initialUsers = [];
  let loadError = null;

  try {
    await dbConnect();
    const data = await UserModel.find()
      .sort({ createdAt: -1 })
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .lean();
    initialUsers = toPlain(data);
  } catch (error) {
    console.error("Error fetching users:", error);
    loadError = "ডাটাবেজের সাথে সংযোগ করা যায়নি — ইউজার তালিকা লোড হয়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।";
  }

  return (
    <AdminUsersClient
      initialUsers={initialUsers}
      loadError={loadError}
      currentUserId={session?.id ? String(session.id) : ""}
    />
  );
}
