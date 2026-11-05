import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { accountTypeForRole, homeForRole } from "@/lib/roles";

/** Start page of the installed app (see app/manifest.js): straight to your own portal, or to login. */
export const metadata = { robots: { index: false, follow: false } };

export default async function OpenAppPage() {
  const session = await getSessionUser();
  redirect(session?.id && accountTypeForRole(session.role) ? homeForRole(session.role) : "/login");
}
