import { NextResponse } from "next/server";
import { querySSLCommerzTransactionByTrxId, querySSLCommerzTransactionBySessionId } from "@/lib/sslcommerz";
import { requireAuth, ADMIN_ROLES, serverError } from "@/lib/api-auth";

/** GET ?tran_id=… or ?sessionkey=… — raw gateway transaction lookup (admin only). */
export async function GET(request) {
  const auth = await requireAuth(request, ADMIN_ROLES);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const tran_id = searchParams.get("tran_id");
    const sessionkey = searchParams.get("sessionkey");
    if (!tran_id && !sessionkey) {
      return NextResponse.json({ success: false, message: "tran_id or sessionkey is required." }, { status: 400 });
    }
    const data = tran_id
      ? await querySSLCommerzTransactionByTrxId({ tran_id })
      : await querySSLCommerzTransactionBySessionId({ sessionkey });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return serverError(error, "Transaction query");
  }
}
