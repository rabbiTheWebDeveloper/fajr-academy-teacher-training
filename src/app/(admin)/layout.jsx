import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth";
import AdminLayoutClient from "./AdminLayoutClient";
import { AdminThemeProvider } from "./AdminThemeContext";
import { AdminAccessProvider } from "./AdminAccessContext";
import { getAdminAccess } from "./_shared/server";
import "@/components/panel/panel-theme.css";

export const metadata = {
  title: "ফজর একাডেমি অ্যাডমিন প্যানেল | TOT Admin Portal",
  description: "Fajr Academy Training of Trainers (TOT) Full Management & Executive Control Panel.",
};

// viewportFit "cover" lets the panel draw edge to edge and use the iPhone notch / home-bar insets
// (env(safe-area-inset-*)); themeColor tints the mobile browser bar to match the gradient header.
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#6d4ae8",
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

  // The token alone isn't trusted: the account and its role are re-read from the database,
  // so a deactivated, deleted or demoted admin loses access straight away.
  const { access, reason } = await getAdminAccess();
  if (!access) {
    redirect(`/login?redirect=/admin&reason=${reason === "unauthenticated" ? "session_expired" : "account_disabled"}`);
  }

  const adminUser = {
    id: access.id,
    fullName: access.fullName || session.fullName || session.email || "Administrator",
    email: access.email || session.email || "",
    role: access.role,
    roleLabel: access.roleLabel,
    isSuper: access.isSuper,
    track: session.track || "",
  };

  // shadcn's sidebar remembers open/collapsed in a cookie; read it so the first paint matches.
  const defaultOpen = (await cookies()).get("sidebar_state")?.value !== "false";

  return (
    <AdminThemeProvider>
      <AdminAccessProvider access={access}>
        <AdminLayoutClient adminUser={adminUser} defaultOpen={defaultOpen}>
          {children}
        </AdminLayoutClient>
      </AdminAccessProvider>
    </AdminThemeProvider>
  );
}
