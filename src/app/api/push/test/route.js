import { NextResponse } from "next/server";
import { requireAuth, serverError } from "@/lib/api-auth";
import { accountTypeForRole, homeForRole } from "@/lib/roles";
import { isObjectId } from "@/lib/query-helpers";
import { pushConfigured, pushToAccounts } from "@/service/push-service";

/** POST → a test notification to every device of the signed-in account. */
export async function POST(request) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;
  const { session } = auth;
  const accountType = accountTypeForRole(session.role);
  if (!accountType || !isObjectId(session.id)) {
    return NextResponse.json({ success: false, message: "এই অ্যাকাউন্টে নোটিফিকেশন চালু করা যায় না।" }, { status: 403 });
  }
  if (!pushConfigured()) {
    return NextResponse.json({ success: false, message: "সার্ভারে পুশ নোটিফিকেশন এখনো চালু করা হয়নি।" }, { status: 503 });
  }

  try {
    const { sent } = await pushToAccounts(accountType, [session.id], {
      title: "🔔 টেস্ট নোটিফিকেশন",
      body: `আসসালামু আলাইকুম${session.fullName ? `, ${session.fullName}` : ""}! এই ডিভাইসে ফজর একাডেমির নোটিফিকেশন ঠিকমতো আসছে।`,
      url: homeForRole(session.role),
      tag: "push-test",
    });
    if (!sent) {
      return NextResponse.json(
        { success: false, message: "কোনো ডিভাইসে পাঠানো যায়নি। নোটিফিকেশন বন্ধ করে আবার চালু করুন।" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, sent, message: `${sent}টি ডিভাইসে টেস্ট নোটিফিকেশন পাঠানো হয়েছে।` });
  } catch (error) {
    return serverError(error, "Push test");
  }
}
