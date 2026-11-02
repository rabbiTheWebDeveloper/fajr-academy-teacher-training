import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { EvaluationModel } from "@/model/evaluation-model";
import { requireAuth, INSTRUCTOR_ROLES, serverError } from "@/lib/api-auth";
import {
  TRAINEE_ROLE_LIST,
  isObjectId,
  pagination,
  pick,
  searchFilter,
  trackFilter,
} from "@/lib/query-helpers";

const LIST_FIELDS =
  "fullName email phone emergencyContactNumber track gender designation bloodGroup paymentStatus paidAmount tranId hasLaptop quranSkill englishSkill education bio avatar createdAt";

// Instructors may correct a trainee's profile/academic details — never role, email,
// payment or account status (those belong to admins).
const EDITABLE_FIELDS = [
  "fullName",
  "phone",
  "emergencyContactNumber",
  "designation",
  "bloodGroup",
  "gender",
  "hasLaptop",
  "quranSkill",
  "englishSkill",
  "education",
  "bio",
];

export async function GET(request) {
  const auth = await requireAuth(request, INSTRUCTOR_ROLES);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const { limit, page, skip } = pagination(searchParams, { defaultLimit: 50 });
    const paymentStatus = searchParams.get("paymentStatus") || "all";

    const filters = [{ role: { $in: TRAINEE_ROLE_LIST } }];
    const byTrack = trackFilter(searchParams.get("track"));
    if (byTrack) filters.push(byTrack);
    if (paymentStatus !== "all") filters.push({ paymentStatus });
    const bySearch = searchFilter(searchParams.get("search"), ["fullName", "email", "phone", "tranId"]);
    if (bySearch) filters.push(bySearch);
    // ?evaluated=yes|no — filter on whether the trainee has any evaluation.
    const evaluated = searchParams.get("evaluated");
    if (evaluated === "yes" || evaluated === "no") {
      const evaluatedIds = await EvaluationModel.distinct("traineeId");
      filters.push({ _id: evaluated === "yes" ? { $in: evaluatedIds } : { $nin: evaluatedIds } });
    }
    const query = { $and: filters };

    const [total, trainees] = await Promise.all([
      UserModel.countDocuments(query),
      UserModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).select(LIST_FIELDS).lean(),
    ]);

    const evaluations = await EvaluationModel.find({ traineeId: { $in: trainees.map((t) => t._id) } })
      .sort({ evaluatedAt: -1 })
      .select("traineeId totalScore grade qualificationStatus evaluatedAt scores remarks instructorName")
      .lean();
    const evalMap = new Map();
    for (const e of evaluations) {
      const key = e.traineeId.toString();
      if (!evalMap.has(key)) evalMap.set(key, e);
    }

    const result = trainees.map((t) => {
      const e = evalMap.get(t._id.toString());
      return {
        ...t,
        _id: t._id.toString(),
        createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : "",
        evaluation: e
          ? {
              totalScore: e.totalScore,
              grade: e.grade,
              qualificationStatus: e.qualificationStatus,
              scores: e.scores,
              remarks: e.remarks || "",
              instructorName: e.instructorName || "",
              evaluatedAt: e.evaluatedAt ? new Date(e.evaluatedAt).toISOString() : "",
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      count: result.length,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      trainees: result,
    });
  } catch (error) {
    return serverError(error, "Instructor trainees GET");
  }
}

export async function PATCH(request) {
  const auth = await requireAuth(request, INSTRUCTOR_ROLES);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const body = await request.json();
    const { traineeId } = body;

    if (!isObjectId(traineeId)) {
      return NextResponse.json({ success: false, message: "সঠিক ট্রেইনি ID আবশ্যক।" }, { status: 400 });
    }

    const updateFields = pick(body, EDITABLE_FIELDS);
    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ success: false, message: "পরিবর্তনের মতো কোনো তথ্য পাওয়া যায়নি।" }, { status: 400 });
    }

    // Only trainee accounts can be edited here — never instructors or admins.
    const updated = await UserModel.findOneAndUpdate(
      { _id: traineeId, role: { $in: TRAINEE_ROLE_LIST } },
      { $set: updateFields },
      { returnDocument: "after", runValidators: true }
    )
      .select(LIST_FIELDS)
      .lean();

    if (!updated) {
      return NextResponse.json({ success: false, message: "ট্রেইনি পাওয়া যায়নি।" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "ট্রেইনি তথ্য সফলভাবে আপডেট করা হয়েছে!",
      trainee: { ...updated, _id: updated._id.toString() },
    });
  } catch (error) {
    return serverError(error, "Instructor trainees PATCH");
  }
}
