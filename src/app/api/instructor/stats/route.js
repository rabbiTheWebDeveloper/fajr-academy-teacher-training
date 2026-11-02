import { NextResponse } from "next/server";
import { requireAuth, INSTRUCTOR_ROLES, serverError } from "@/lib/api-auth";
import { getInstructorStats } from "@/service/instructor-service";

export async function GET(request) {
  const auth = await requireAuth(request, INSTRUCTOR_ROLES);
  if (auth.error) return auth.error;

  try {
    const stats = await getInstructorStats();
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    return serverError(error, "Instructor stats GET");
  }
}
