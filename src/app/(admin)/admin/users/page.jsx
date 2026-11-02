import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { SAFE_ACCOUNT_SELECT } from "@/model/account-schema";
import { getSessionUser } from "@/lib/auth";
import { toPlain } from "@/lib/query-helpers";
import AdminUsersClient from "./AdminUsersClient";

export const metadata = {
  title: "অ্যাডমিন ইউজার | অ্যাডমিন প্যানেল",
  description: "Fajr Academy admin accounts (User model).",
};

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getSessionUser();
  let initialUsers = [];
  let loadError = null;

  try {
    await dbConnect();
    const data = await UserModel.find({}).sort({ createdAt: -1 }).select(SAFE_ACCOUNT_SELECT).lean();
    initialUsers = toPlain(data);
  } catch (error) {
    console.error("Error fetching admin users:", error);
    loadError = "ডাটাবেজের সাথে সংযোগ করা যায়নি — অ্যাডমিন তালিকা লোড হয়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।";
  }

  return (
    <AdminUsersClient
      initialUsers={initialUsers}
      loadError={loadError}
      currentUserId={session?.id ? String(session.id) : ""}
      currentRole={session?.role || ""}
    />
  );
}
