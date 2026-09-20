import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import AdminSidebar from "./AdminSidebar";
import AdminLayoutClient from "./AdminLayoutClient";
import { AdminThemeProvider } from "./AdminThemeContext";
import "./admin-theme.css";

export const metadata = {
  title: "ফজর একাডেমি অ্যাডমিন প্যানেল | TOT Admin Portal",
  description: "Fajr Academy Training of Trainers (TOT) Full Management & Executive Control Panel.",
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }) {
  const session = await getSessionUser();

  let adminUser = null;

  if (session) {
    // Role Security Check: Strictly limit /admin to "admin" or "super-admin"
    const allowedRoles = ["admin", "super-admin"];
    if (!allowedRoles.includes(session.role)) {
      if (session.role === "instructor") {
        redirect("/instructor?error=admin_only");
      }
      redirect("/dashboard?error=admin_only");
    }

    adminUser = {
      id: session.id || session._id || "",
      fullName: session.fullName || "Administrator",
      email: session.email || "admin@fajracademy.io",
      role: session.role || "admin",
      track: session.track || "TOT-MEN",
    };
  } else {
    // Development / direct-access fallback: lookup active admin from UserModel
    try {
      const { dbConnect } = await import("@/service/mongo");
      const { UserModel } = await import("@/model/user-model");
      await dbConnect();
      const dbAdmin = await UserModel.findOne({ role: { $in: ["admin", "super-admin"] } }).lean();
      if (dbAdmin) {
        adminUser = {
          id: dbAdmin._id.toString(),
          fullName: dbAdmin.fullName || "System Administrator",
          email: dbAdmin.email || "admin@fajracademy.io",
          role: dbAdmin.role || "admin",
          track: dbAdmin.track || "TOT-MEN",
        };
      }
    } catch (e) {
      console.error("Admin layout fallback lookup error:", e);
    }

    if (!adminUser) {
      adminUser = {
        id: "admin-master-001",
        fullName: "Executive Admin",
        email: "admin@fajracademy.io",
        role: "admin",
        track: "TOT-MEN",
      };
    }
  }

  return (
    <AdminThemeProvider>
      <AdminLayoutClient
        adminUser={adminUser}
        sidebar={<AdminSidebar adminUser={adminUser} />}
      >
        {children}
      </AdminLayoutClient>
    </AdminThemeProvider>
  );
}
