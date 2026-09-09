import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (token) {
      const { invalidateDatabaseSession } = await import("@/queries/auth-queries");
      await invalidateDatabaseSession(token);
    }
  } catch (err) {
    console.error("Logout session error:", err);
  }

  const response = NextResponse.json({ success: true, message: "Logged out successfully" });
  response.cookies.delete("auth_token");
  return response;
}

export async function GET(request) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (token) {
      const { invalidateDatabaseSession } = await import("@/queries/auth-queries");
      await invalidateDatabaseSession(token);
    }
  } catch (err) {
    console.error("Logout session error:", err);
  }

  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete("auth_token");
  return response;
}
