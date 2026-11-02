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

const ADMIN_ROLES = ["admin", "super-admin"];

export default async function AdminLayout({ children }) {
  const session = await getSessionUser();

  // No (valid) session → login. Never render the panel as some other admin.
  if (!session?.id) {
    redirect("/login?redirect=/admin");
  }

  // Role check: /admin is strictly for admin / super-admin.
  if (!ADMIN_ROLES.includes(session.role)) {
    redirect(session.role === "instructor" ? "/instructor?error=admin_only" : "/dashboard?error=admin_only");
  }

  const adminUser = {
    id: String(session.id),
    fullName: session.fullName || session.email || "Administrator",
    email: session.email || "",
    role: session.role,
    track: session.track || "",
  };

  return (
    <AdminThemeProvider>
      <AdminLayoutClient adminUser={adminUser} sidebar={<AdminSidebar adminUser={adminUser} />}>
        {children}
      </AdminLayoutClient>
    </AdminThemeProvider>
  );
}
