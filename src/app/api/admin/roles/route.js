import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { RoleModel } from "@/model/role-model";
import { UserModel } from "@/model/user-model";
import { requireSuperAdmin, serverError } from "@/lib/api-auth";
import { isObjectId } from "@/lib/query-helpers";
import { normalizePermissions } from "@/lib/rbac";
import { listRolesWithCounts, roleView } from "@/service/role-service";

/**
 * Admin → Roles & permissions (RoleModel, collection "roles").
 * SUPER-ADMIN ONLY — every method.
 *   GET
 *   POST   { name, description?, permissions: ["payments:read", "payments:update", …] }
 *   PATCH  { id, name?, description?, permissions? }
 *   DELETE ?id=      (refused while any admin account still holds the role)
 * A role never carries "delete": deleting stays with the super-admin (see lib/rbac.js).
 * Changes apply on the holder's next request — permissions are read from the database.
 */
const MAX_ROLES = 50;
const RESERVED_NAMES = ["admin", "super-admin", "super admin", "superadmin", "অ্যাডমিন", "সুপার অ্যাডমিন"];
const bad = (message, status = 400) => NextResponse.json({ success: false, message }, { status });
const plain = (v) => JSON.parse(JSON.stringify(v));
const nameKeyOf = (name) => name.toLowerCase().replace(/\s+/g, " ");

/** { name } / { error } — a usable role name. */
function readName(raw) {
  const name = String(raw ?? "").trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 40) return { error: "রোলের নাম ২ থেকে ৪০ অক্ষরের মধ্যে হতে হবে।" };
  if (RESERVED_NAMES.includes(nameKeyOf(name))) return { error: "এই নামটি সিস্টেমের নিজস্ব রোলের জন্য সংরক্ষিত — অন্য নাম দিন।" };
  return { name };
}

export async function GET(request) {
  const auth = await requireSuperAdmin(request);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    return NextResponse.json({ success: true, roles: await listRolesWithCounts() });
  } catch (error) {
    return serverError(error, "Admin roles GET");
  }
}

export async function POST(request) {
  const auth = await requireSuperAdmin(request);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const body = await request.json();
    const { name, error } = readName(body.name);
    if (error) return bad(error);
    if ((await RoleModel.countDocuments()) >= MAX_ROLES) return bad(`সর্বোচ্চ ${MAX_ROLES}টি রোল তৈরি করা যায়।`);

    const role = await RoleModel.create({
      name,
      nameKey: nameKeyOf(name),
      description: String(body.description || "").trim().slice(0, 200),
      permissions: normalizePermissions(body.permissions),
      createdBy: auth.session.email || "",
    });
    return NextResponse.json({ success: true, message: `“${name}” রোল তৈরি হয়েছে।`, role: plain(roleView(role.toObject(), 0)) });
  } catch (error) {
    if (error?.code === 11000) return bad("এই নামে আগেই একটি রোল আছে।", 409);
    return serverError(error, "Admin roles POST");
  }
}

export async function PATCH(request) {
  const auth = await requireSuperAdmin(request);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const body = await request.json();
    if (!isObjectId(body.id)) return bad("সঠিক রোল ID আবশ্যক।");

    const role = await RoleModel.findById(body.id);
    if (!role) return bad("রোলটি পাওয়া যায়নি — হয়তো আগেই মুছে ফেলা হয়েছে।", 404);

    if (body.name !== undefined) {
      const { name, error } = readName(body.name);
      if (error) return bad(error);
      role.name = name;
      role.nameKey = nameKeyOf(name);
    }
    if (body.description !== undefined) role.description = String(body.description).trim().slice(0, 200);
    if (body.permissions !== undefined) role.permissions = normalizePermissions(body.permissions);
    role.updatedBy = auth.session.email || "";
    await role.save();

    const userCount = await UserModel.countDocuments({ accessRole: role._id });
    return NextResponse.json({ success: true, message: "রোল আপডেট হয়েছে — পরিবর্তন সংশ্লিষ্ট অ্যাডমিনদের পরবর্তী রিকোয়েস্ট থেকেই কার্যকর হবে।", role: plain(roleView(role.toObject(), userCount)) });
  } catch (error) {
    if (error?.code === 11000) return bad("এই নামে আগেই একটি রোল আছে।", 409);
    return serverError(error, "Admin roles PATCH");
  }
}

export async function DELETE(request) {
  const auth = await requireSuperAdmin(request);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const id = new URL(request.url).searchParams.get("id");
    if (!isObjectId(id)) return bad("সঠিক রোল ID আবশ্যক।");

    const role = await RoleModel.findById(id).lean();
    if (!role) return bad("রোলটি পাওয়া যায়নি।", 404);

    const holders = await UserModel.countDocuments({ accessRole: id });
    if (holders > 0) {
      return bad(`এই রোলটি এখনো ${holders} জন অ্যাডমিনের আছে — আগে তাদের অন্য রোল দিন, তারপর মুছুন।`, 409);
    }
    await RoleModel.deleteOne({ _id: id });
    return NextResponse.json({ success: true, message: `“${role.name}” রোল মুছে ফেলা হয়েছে।` });
  } catch (error) {
    return serverError(error, "Admin roles DELETE");
  }
}
