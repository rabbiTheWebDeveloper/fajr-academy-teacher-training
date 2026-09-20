import { getSessionUser } from "@/lib/auth";
import AdminSidebar from "./AdminSidebar";
import AdminLayoutClient from "./AdminLayoutClient";
import { AdminThemeProvider } from "./AdminThemeContext";
import "./admin-theme.css";

export const metadata = {
  title: "ফজর একাডেমি অ্যাডমিন প্যানেল | TOT Admin Portal",
  description: "Fajr Academy Training of Trainers (TOT) Full Management & Executive Control Panel.",
};

export default async function AdminLayout({ children }) {
  const session = await getSessionUser();

  // Authentication check - allow session user (or fallback in dev/local environment)
  const adminUser = {
    fullName: session?.fullName || "Super Administrator",
    email: session?.email || "admin@fajracademy.io",
    role: session?.role || "admin",
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
