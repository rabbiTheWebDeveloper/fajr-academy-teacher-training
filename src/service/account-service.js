import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { InstructorModel } from "@/model/instructor-model";
import { TotModel } from "@/model/tot-model";
import { SAFE_ACCOUNT_SELECT } from "@/model/account-schema";
import { accountTypeForRole } from "@/lib/roles";
import { isObjectId } from "@/lib/query-helpers";
import { phoneVariants } from "@/lib/phone";

/**
 * The three account collections and the helpers that span them.
 *
 *   type "admin"      → UserModel        (users)
 *   type "instructor" → InstructorModel  (instructors)
 *   type "tot"        → TotModel         (tots — paying trainees)
 *
 * MongoDB can only enforce a unique e-mail inside one collection, so every place that
 * creates an account or changes an e-mail/phone must call emailInUse / phoneInUse first.
 */
const MODELS = { admin: UserModel, instructor: InstructorModel, tot: TotModel };
export const ACCOUNT_TYPES = Object.keys(MODELS); // lookup priority: admin → instructor → tot

export const ACCOUNT_LABELS = { admin: "অ্যাডমিন", instructor: "ইনস্ট্রাক্টর", tot: "ট্রেইনি (TOT)" };

export const modelForType = (type) => MODELS[type] || null;
export const modelForRole = (role) => modelForType(accountTypeForRole(role));

/** The signed-in account (lean, without secrets) from the collection its role belongs to. */
export async function findSessionAccount(session, select = SAFE_ACCOUNT_SELECT) {
  const Model = modelForRole(session?.role);
  if (!Model || !isObjectId(session?.id)) return null;
  await dbConnect();
  return Model.findById(session.id).select(select).lean();
}

/** First account in any collection matching `filter` → { type, account } or null. */
export async function findAccount(filter, { select, exceptId } = {}) {
  await dbConnect();
  const query = exceptId ? { ...filter, _id: { $ne: exceptId } } : filter;
  const found = await Promise.all(
    ACCOUNT_TYPES.map((type) => {
      let q = MODELS[type].findOne(query);
      if (select) q = q.select(select);
      return q.lean();
    })
  );
  const i = found.findIndex(Boolean);
  return i === -1 ? null : { type: ACCOUNT_TYPES[i], account: found[i] };
}

export async function findAccountByEmail(email, opts) {
  const clean = String(email || "").toLowerCase().trim();
  return clean ? findAccount({ email: clean }, opts) : null;
}

/** Account type already using this e-mail (in ANY collection), or null. */
export async function emailInUse(email, { exceptId } = {}) {
  return (await findAccountByEmail(email, { select: "_id", exceptId }))?.type || null;
}

/** Account type already using this phone number (any spelling, any collection), or null. */
export async function phoneInUse(phone, { exceptId } = {}) {
  const phones = phoneVariants(phone);
  if (!phones.length) return null;
  return (await findAccount({ phone: { $in: phones } }, { select: "_id", exceptId }))?.type || null;
}

export const emailTakenMessage = (type) =>
  `এই ইমেইলে ইতোমধ্যে একটি ${ACCOUNT_LABELS[type] || ""} অ্যাকাউন্ট রয়েছে — একই ইমেইলে দুই ধরনের অ্যাকাউন্ট খোলা যায় না।`;
export const phoneTakenMessage = (type) => `এই মোবাইল নম্বরটি ইতোমধ্যে একটি ${ACCOUNT_LABELS[type] || ""} অ্যাকাউন্টে ব্যবহৃত হচ্ছে।`;
