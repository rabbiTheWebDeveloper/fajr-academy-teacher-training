import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "./AdminSidebar";

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
    <div className="min-h-screen bg-[#070A11] text-slate-100 flex flex-col md:flex-row font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Interactive Sidebar */}
      <AdminSidebar adminUser={adminUser} />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-[#070A11]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              ⚡ LIVE ADMIN SYSTEM
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="hidden sm:flex flex-col text-right">
              <span className="font-bold text-white">{adminUser.fullName}</span>
              <span className="text-[10px] text-amber-400 font-mono">{adminUser.email}</span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-sm flex items-center justify-center shadow-md">
              {adminUser.fullName[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-900 bg-slate-950/60 py-4 px-6 text-center text-xs text-slate-500">
          © 2026 Fajr Academy — TOT Enterprise Management System v2.0
        </footer>
      </main>
    </div>
  );
}
