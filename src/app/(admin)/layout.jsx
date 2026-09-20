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

  // 1. Authentication Barrier: redirect unauthenticated users to login
  if (!session) {
    redirect("/login?redirect=/admin&reason=auth_required");
  }

  // 2. Role Security Check: Strictly limit /admin to "admin" or "super-admin"
  const allowedRoles = ["admin", "super-admin"];
  if (!allowedRoles.includes(session.role)) {
    if (session.role === "instructor") {
      redirect("/instructor?error=admin_only");
    }
    redirect("/dashboard?error=admin_only");
  }

  // 3. Authentic User Identity extracted from verified session cookie
  const adminUser = {
    id: session.id || session._id || "",
    fullName: session.fullName || "Administrator",
    email: session.email || "admin@fajracademy.io",
    role: session.role || "admin",
    track: session.track || "TOT-MEN",
  };

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
