import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { EvaluationModel, calculateGradeAndStatus } from "@/model/evaluation-model";
import { TotModel } from "@/model/tot-model";
import { ParticipantModel } from "@/model/participant-model";
import { requireAuth, INSTRUCTOR_ROLES, deleteScope, MSG_DELETE_DENIED, serverError } from "@/lib/api-auth";
import { courseIdForTrack, isObjectId, trackFilter } from "@/lib/query-helpers";
import { notifyEvaluationSaved } from "@/service/push-service";

const SCORE_KEYS = ["makhrajTajweed", "childPsychologyPedagogy", "digitalClassroomTools", "microTeachingDemo"];
const clampScore = (v) => Math.min(Math.max(Math.round(Number(v) || 0), 0), 25);

const serialize = (e) => ({
  ...e,
  _id: e._id.toString(),
  traineeId: e.traineeId ? e.traineeId.toString() : "",
  createdAt: e.createdAt ? new Date(e.createdAt).toISOString() : "",
  updatedAt: e.updatedAt ? new Date(e.updatedAt).toISOString() : "",
  evaluatedAt: e.evaluatedAt ? new Date(e.evaluatedAt).toISOString() : "",
});

export async function GET(request) {
  const auth = await requireAuth(request, INSTRUCTOR_ROLES);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const query = { ...(trackFilter(searchParams.get("track")) || {}) };
    const traineeId = searchParams.get("traineeId");
    const grade = searchParams.get("grade");
    const status = searchParams.get("status");
    if (isObjectId(traineeId)) query.traineeId = traineeId;
    if (grade && grade !== "all") query.grade = grade;
    if (status && status !== "all") query.qualificationStatus = status;

    const evaluations = await EvaluationModel.find(query).sort({ evaluatedAt: -1 }).lean();
    return NextResponse.json({ success: true, count: evaluations.length, evaluations: evaluations.map(serialize) });
  } catch (error) {
    return serverError(error, "Instructor evaluations GET");
  }
}

export async function POST(request) {
  const auth = await requireAuth(request, INSTRUCTOR_ROLES);
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    await dbConnect();
    const { traineeId, scores = {}, remarks = "" } = await request.json();

    if (!isObjectId(traineeId)) {
      return NextResponse.json({ success: false, message: "ট্রেইনি নির্বাচন আবশ্যক।" }, { status: 400 });
    }

    const trainee = await TotModel.findById(traineeId)
      .select("fullName email phone track")
      .lean();
    if (!trainee) {
      return NextResponse.json({ success: false, message: "নির্বাচিত ট্রেইনি খুঁজে পাওয়া যায়নি।" }, { status: 404 });
    }

    const clean = Object.fromEntries(SCORE_KEYS.map((k) => [k, clampScore(scores[k])]));
    const totalScore = SCORE_KEYS.reduce((sum, k) => sum + clean[k], 0);
    const { grade, status: qualificationStatus } = calculateGradeAndStatus(totalScore);
    const track = trainee.track || "TOT-MEN";
    const courseId = courseIdForTrack(track);

    // Evaluator identity always comes from the signed session, never the request body.
    const evaluation = await EvaluationModel.findOneAndUpdate(
      { traineeId: trainee._id, courseId },
      {
        $set: {
          traineeName: trainee.fullName,
          traineeEmail: trainee.email,
          traineePhone: trainee.phone || "",
          track,
          courseId,
          instructorId: session.id,
          instructorName: session.fullName || "ফজর একাডেমি ফ্যাকাল্টি",
          instructorEmail: session.email || "",
          scores: clean,
          totalScore,
          grade,
          qualificationStatus,
          remarks: String(remarks).trim().slice(0, 2000),
          evaluatedAt: new Date(),
        },
      },
      { returnDocument: "after", upsert: true, runValidators: true }
    ).lean();

    // Keep the enrolment record's score/grade in step (shown on the trainee's results page).
    await ParticipantModel.updateOne(
      { user: trainee._id, courseId },
      {
        $set: {
          evaluationScore: totalScore,
          grade,
          ...(qualificationStatus === "hired" || qualificationStatus === "certified"
            ? { status: "completed", completedAt: new Date() }
            : {}),
        },
      }
    ).catch((err) => console.warn("Participant grade sync warning:", err.message));

    notifyEvaluationSaved(evaluation); // push "your result is out" to the trainee, after the response
    return NextResponse.json({
      success: true,
      message: `মূল্যায়ন সফলভাবে সংরক্ষিত হয়েছে! মোট স্কোর: ${totalScore}/১০০, গ্রেড: ${grade}`,
      evaluation: serialize(evaluation),
    });
  } catch (error) {
    return serverError(error, "Instructor evaluations POST");
  }
}

export async function DELETE(request) {
  const auth = await requireAuth(request, INSTRUCTOR_ROLES);
  if (auth.error) return auth.error;
  const { session } = auth;

  // Instructors may delete only their own grades; among admins only a super-admin may delete.
  // Checked before touching the database, so a refused admin learns nothing about the record.
  const scope = await deleteScope(session);
  if (scope === "none") {
    return NextResponse.json({ success: false, message: MSG_DELETE_DENIED }, { status: 403 });
  }

  try {
    await dbConnect();
    const id = new URL(request.url).searchParams.get("id");
    if (!isObjectId(id)) {
      return NextResponse.json({ success: false, message: "মূল্যায়ন ID আবশ্যক।" }, { status: 400 });
    }

    const evaluation = await EvaluationModel.findById(id).select("instructorId instructorEmail").lean();
    if (!evaluation) {
      return NextResponse.json({ success: false, message: "মূল্যায়নটি পাওয়া যায়নি।" }, { status: 404 });
    }

    const isOwner =
      (evaluation.instructorId && evaluation.instructorId === session.id) ||
      (evaluation.instructorEmail && evaluation.instructorEmail === session.email);
    if (scope === "own" && !isOwner) {
      return NextResponse.json(
        { success: false, message: "শুধুমাত্র যিনি মূল্যায়ন করেছেন তিনি বা সুপার-অ্যাডমিন এটি মুছতে পারবেন।" },
        { status: 403 }
      );
    }

    await EvaluationModel.deleteOne({ _id: id });
    return NextResponse.json({ success: true, message: "মূল্যায়ন সফলভাবে মুছে ফেলা হয়েছে।" });
  } catch (error) {
    return serverError(error, "Instructor evaluations DELETE");
  }
}
