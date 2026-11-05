import { cookies } from "next/headers";
import InstructorLayoutClient from "./InstructorLayoutClient";
import { PanelThemeProvider } from "@/components/panel/PanelThemeContext";
import { getInstructorProfile } from "./_shared/server";
import { roleLabel } from "./_shared/utils";
import "@/components/panel/panel-theme.css";

export const metadata = {
  title: "TOT ইনস্ট্রাক্টর পোর্টাল | ফজর একাডেমি",
  description: "ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) ইনস্ট্রাক্টর পোর্টাল।",
};

// viewportFit "cover" lets the panel draw edge to edge and use the iPhone notch / home-bar insets
// (env(safe-area-inset-*)); themeColor tints the mobile browser bar to match the gradient header.
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#6d4ae8",
};

export default async function InstructorLayout({ children }) {
  // Real designation of the signed-in staff member (falls back to their role, never a made-up title).
  const { profile } = await getInstructorProfile();
  const user = {
    name: profile?.fullName || profile?.email || "ইনস্ট্রাক্টর",
    email: profile?.email || "",
    roleLabel: profile ? profile.designation || roleLabel(profile.role) : "",
    avatar: profile?.avatar || "",
  };
  const isAdmin = profile?.role === "admin" || profile?.role === "super-admin";

  // shadcn's sidebar remembers open/collapsed in a cookie; read it so the first paint matches.
  const defaultOpen = (await cookies()).get("sidebar_state")?.value !== "false";

  return (
    <PanelThemeProvider>
      <InstructorLayoutClient user={user} isAdmin={isAdmin} defaultOpen={defaultOpen}>
        {children}
      </InstructorLayoutClient>
    </PanelThemeProvider>
  );
}
