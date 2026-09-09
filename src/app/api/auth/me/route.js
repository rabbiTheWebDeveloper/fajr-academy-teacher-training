import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session?.email) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    await dbConnect();
    const user = await UserModel.findOne({ email: session.email })
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .lean();

    if (!user) {
      return NextResponse.json({ success: false, user: null }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
