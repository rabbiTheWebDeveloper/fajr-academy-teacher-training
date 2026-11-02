import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { DEFAULT_INSTRUCTORS } from "@/constant/instructor-defaults";

const PUBLIC_FIELDS = "fullName designation specialization bio experienceYears rating gender avatar track";

/** Public faculty list for marketing pages. Read-only: it never creates accounts. */
export async function GET(request) {
  const track = new URL(request.url).searchParams.get("track");
  // Display-only fallback (no emails / passwords) when the database has no instructors yet.
  const fallback = DEFAULT_INSTRUCTORS.filter((i) => !track || track === "all" || i.track === track).map((i) => ({
    fullName: i.fullName,
    designation: i.designation,
    specialization: i.specialization,
    bio: i.bio,
    experienceYears: i.experienceYears,
    rating: i.rating,
    gender: i.gender,
    avatar: i.avatar || "",
    track: i.track,
  }));

  try {
    await dbConnect();
    const query = { role: "instructor", isActive: { $ne: false } };
    if (track && track !== "all") query.track = track;
    const instructors = await UserModel.find(query).select(PUBLIC_FIELDS).sort({ rating: -1, experienceYears: -1 }).limit(12).lean();
    return NextResponse.json({
      success: true,
      instructors: instructors.length ? JSON.parse(JSON.stringify(instructors)) : fallback,
    });
  } catch (error) {
    console.error("Public instructors GET error:", error.message);
    return NextResponse.json({ success: true, instructors: fallback });
  }
}
