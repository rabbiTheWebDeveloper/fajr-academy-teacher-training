import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { SAFE_ACCOUNT_SELECT } from "@/model/account-schema";
import { toPlain } from "@/lib/query-helpers";
import { listRolesWithCounts } from "@/service/role-service";
import { requireAdminPage } from "../../_shared/server";
import AdminUsersClient from "./AdminUsersClient";

export const metadata = {
  title: "অ্যাডমিন ইউজার ও রোল | অ্যাডমিন প্যানেল",
  description: "Fajr Academy admin accounts and role permissions (super-admin only).",
};

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  // Admin accounts and roles are managed by super-admins only.
  const access = await requireAdminPage("users");
  let initialUsers = [];
  let initialRoles = [];
  let loadError = null;

  try {
    await dbConnect();
    const [data, roles] = await Promise.all([
      UserModel.find({}).sort({ createdAt: -1 }).select(SAFE_ACCOUNT_SELECT).lean(),
      listRolesWithCounts(),
    ]);
    initialUsers = toPlain(data);
    initialRoles = roles;
  } catch (error) {
    console.error("Error fetching admin users:", error);
    loadError = "ডাটাবেজের সাথে সংযোগ করা যায়নি — অ্যাডমিন তালিকা লোড হয়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।";
  }

  return <AdminUsersClient initialUsers={initialUsers} initialRoles={initialRoles} loadError={loadError} currentUserId={access.id} />;
}
