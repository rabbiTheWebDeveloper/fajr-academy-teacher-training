import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { accountTypeForRole } from "@/lib/roles";
import { findSessionAccount } from "@/service/account-service";

/** The signed-in account, read from its own collection (users / instructors / tots). */
export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session?.id) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const user = await findSessionAccount(session);
    if (!user) {
      return NextResponse.json({ success: false, user: null }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: { ...JSON.parse(JSON.stringify(user)), accountType: accountTypeForRole(user.role) },
    });
  } catch (error) {
    console.error("auth/me error:", error);
    return NextResponse.json({ success: false, user: null }, { status: 500 });
  }
}
