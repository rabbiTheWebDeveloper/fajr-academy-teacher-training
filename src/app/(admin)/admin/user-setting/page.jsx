import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { SessionModel } from "@/model/session-model";
import { SAFE_ACCOUNT_SELECT } from "@/model/account-schema";
import { toPlain } from "@/lib/query-helpers";
import { getAdminAccess } from "../../_shared/server";
import AdminUserSettingClient from "./AdminUserSettingClient";

export const metadata = {
  title: "ইউজার সেটিংস ও পাসওয়ার্ড | অ্যাডমিন প্যানেল",
  description: "Manage your logged-in admin account info, password reset, permissions, and active sessions.",
};

export const dynamic = "force-dynamic";

export default async function AdminUserSettingPage() {
  const { access } = await getAdminAccess();
  if (!access) redirect("/login?redirect=/admin/user-setting");

  let user = null;
  let sessions = [];
  let loadError = null;

  try {
    await dbConnect();
    const cookieStore = await cookies();
    const currentToken = cookieStore.get("auth_token")?.value || "";

    const [userDoc, sessionDocs] = await Promise.all([
      UserModel.findById(access.id).select(SAFE_ACCOUNT_SELECT).lean(),
      SessionModel.find({
        userId: access.id,
        isValid: true,
        expiresAt: { $gt: new Date() },
      })
        .sort({ lastActive: -1 })
        .limit(20)
        .lean(),
    ]);

    user = userDoc ? toPlain(userDoc) : null;
    sessions = toPlain(
      sessionDocs.map((s) => ({
        _id: String(s._id),
        deviceType: s.deviceType || "unknown",
        ipAddress: s.ipAddress || "",
        userAgent: s.userAgent || "",
        lastActive: s.lastActive ? new Date(s.lastActive).toISOString() : "",
        createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : "",
        isCurrent: Boolean(currentToken && s.token === currentToken),
      }))
    );
  } catch (error) {
    console.error("Error loading admin user settings:", error);
    loadError = "ডাটাবেজের সাথে সংযোগ করা যায়নি — আপনার অ্যাকাউন্ট তথ্য লোড হয়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।";
  }

  return (
    <AdminUserSettingClient
      initialUser={user}
      access={access}
      initialSessions={sessions}
      loadError={loadError}
    />
  );
}
