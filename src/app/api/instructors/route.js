import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { DEFAULT_INSTRUCTORS } from "@/constant/instructor-defaults";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const track = searchParams.get("track");

    const query = {
      role: { $in: ["instructor", "admin"] },
      isActive: { $ne: false },
    };

    if (track && track !== "all") {
      query.track = track;
    }

    let instructors = await UserModel.find(query)
      .sort({ rating: -1, experienceYears: -1 })
      .select("fullName designation specialization bio experienceYears rating gender avatar track")
      .lean();

    // Auto-seed if empty
    if (!instructors || instructors.length === 0) {
      for (const inst of DEFAULT_INSTRUCTORS) {
        const exists = await UserModel.findOne({ email: inst.email });
        if (!exists) {
          await UserModel.create(inst);
        }
      }
      instructors = await UserModel.find(query)
        .sort({ rating: -1, experienceYears: -1 })
        .select("fullName designation specialization bio experienceYears rating gender avatar track")
        .lean();
    }

    const sanitized = (instructors || []).map((i) => ({
      ...i,
      _id: i._id.toString(),
    }));

    return NextResponse.json({
      success: true,
      instructors: sanitized,
    });
  } catch (error) {
    console.error("Public Instructors GET Error:", error);
    return NextResponse.json(
      {
        success: false,
        instructors: DEFAULT_INSTRUCTORS.map((i) => ({
          fullName: i.fullName,
          designation: i.designation,
          specialization: i.specialization,
          bio: i.bio,
          experienceYears: i.experienceYears,
          rating: i.rating,
          gender: i.gender,
          track: i.track,
        })),
      },
      { status: 500 }
    );
  }
}
