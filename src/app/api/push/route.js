import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { PushSubscriptionModel } from "@/model/push-subscription-model";
import { requireAuth, serverError } from "@/lib/api-auth";
import { accountTypeForRole } from "@/lib/roles";
import { isObjectId } from "@/lib/query-helpers";
import { pushConfigured, pushPublicKey } from "@/service/push-service";

/**
 * This device's push subscription, for any signed-in account (admin, instructor or trainee).
 *   GET     → { enabled, publicKey }               is push set up on the server?
 *   POST    { subscription, replaces? }            turn notifications on for this device
 *   PUT     { endpoint }  → { subscribed }         is this device linked to MY account?
 *   DELETE  { endpoint }                           turn them off (also called on logout)
 * Knowing the endpoint URL proves you hold that device's subscription; only the browser has it.
 */

const MAX_DEVICES_PER_ACCOUNT = 10;
const MSG_OFF = "সার্ভারে পুশ নোটিফিকেশন এখনো চালু করা হয়নি।";

function readEndpoint(value) {
  if (typeof value !== "string" || value.length > 1000) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}

const okKey = (v) => typeof v === "string" && v.length > 0 && v.length <= 200;

async function sessionAccount(request) {
  const auth = await requireAuth(request);
  if (auth.error) return auth;
  const accountType = accountTypeForRole(auth.session.role);
  if (!accountType || !isObjectId(auth.session.id)) {
    return { error: NextResponse.json({ success: false, message: "এই অ্যাকাউন্টে নোটিফিকেশন চালু করা যায় না।" }, { status: 403 }) };
  }
  return { session: auth.session, accountType };
}

export async function GET(request) {
  const auth = await sessionAccount(request);
  if (auth.error) return auth.error;
  return NextResponse.json({ success: true, enabled: pushConfigured(), publicKey: pushPublicKey() });
}

export async function POST(request) {
  const auth = await sessionAccount(request);
  if (auth.error) return auth.error;
  if (!pushConfigured()) return NextResponse.json({ success: false, message: MSG_OFF }, { status: 503 });

  try {
    const body = await request.json().catch(() => ({}));
    const sub = body?.subscription || {};
    const endpoint = readEndpoint(sub.endpoint);
    if (!endpoint || !okKey(sub.keys?.p256dh) || !okKey(sub.keys?.auth)) {
      return NextResponse.json({ success: false, message: "সাবস্ক্রিপশনের তথ্য সঠিক নয়।" }, { status: 400 });
    }

    await dbConnect();
    const owner = { accountId: auth.session.id, accountType: auth.accountType };

    // The browser rotated its subscription (service worker `pushsubscriptionchange`).
    const replaced = readEndpoint(body.replaces);
    if (replaced && replaced !== endpoint) await PushSubscriptionModel.deleteOne({ endpoint: replaced, ...owner });

    // A device belongs to whoever enabled notifications on it last.
    await PushSubscriptionModel.findOneAndUpdate(
      { endpoint },
      {
        $set: {
          keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
          ...owner,
          userAgent: String(request.headers.get("user-agent") || "").slice(0, 300),
        },
      },
      { upsert: true, runValidators: true }
    );

    // Keep only the newest devices per account.
    const stale = await PushSubscriptionModel.find(owner).sort({ updatedAt: -1 }).skip(MAX_DEVICES_PER_ACCOUNT).select("_id").lean();
    if (stale.length) await PushSubscriptionModel.deleteMany({ _id: { $in: stale.map((s) => s._id) } });

    return NextResponse.json({ success: true, message: "এই ডিভাইসে নোটিফিকেশন চালু হয়েছে।" });
  } catch (error) {
    return serverError(error, "Push subscribe");
  }
}

export async function PUT(request) {
  const auth = await sessionAccount(request);
  if (auth.error) return auth.error;

  try {
    const { endpoint: raw } = await request.json().catch(() => ({}));
    const endpoint = readEndpoint(raw);
    if (!endpoint) return NextResponse.json({ success: true, subscribed: false });

    await dbConnect();
    const record = await PushSubscriptionModel.findOne({ endpoint }).select("accountId accountType").lean();
    const mine = Boolean(record) && String(record.accountId) === String(auth.session.id) && record.accountType === auth.accountType;
    // Someone else's notifications must not keep arriving on a device another person now uses.
    if (record && !mine) await PushSubscriptionModel.deleteOne({ _id: record._id });
    return NextResponse.json({ success: true, subscribed: mine });
  } catch (error) {
    return serverError(error, "Push status");
  }
}

export async function DELETE(request) {
  const auth = await sessionAccount(request);
  if (auth.error) return auth.error;

  try {
    const { endpoint: raw } = await request.json().catch(() => ({}));
    const endpoint = readEndpoint(raw);
    if (!endpoint) return NextResponse.json({ success: false, message: "এন্ডপয়েন্ট সঠিক নয়।" }, { status: 400 });
    await dbConnect();
    await PushSubscriptionModel.deleteOne({ endpoint });
    return NextResponse.json({ success: true, message: "এই ডিভাইসে নোটিফিকেশন বন্ধ হয়েছে।" });
  } catch (error) {
    return serverError(error, "Push unsubscribe");
  }
}
