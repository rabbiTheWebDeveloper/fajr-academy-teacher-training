import { NextResponse } from "next/server";
import cloudinary, { isCloudinaryConfigured } from "@/utlis/cloudinary";
import { requireAuth, INSTRUCTOR_ROLES } from "@/lib/api-auth";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/** Image upload for staff (instructor avatars etc.). Admins and instructors only. */
export async function POST(request) {
  const auth = await requireAuth(request, INSTRUCTOR_ROLES);
  if (auth.error) return auth.error;
  if (!isCloudinaryConfigured()) {
    return NextResponse.json({ success: false, message: "ছবি আপলোড সার্ভিস কনফিগার করা নেই।" }, { status: 503 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") || formData.get("image");

    if (!file || typeof file === "string") {
      return NextResponse.json({ success: false, message: "কোনো ছবি বা ফাইল পাওয়া যায়নি।" }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type || "")) {
      return NextResponse.json(
        { success: false, message: "শুধুমাত্র ছবি (JPG, PNG, WEBP, GIF) আপলোড করা যাবে।" },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ success: false, message: "ছবির সাইজ সর্বোচ্চ ৫ MB হতে পারবে।" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "fajr-instructors",
          resource_type: "image",
          transformation: [{ width: 800, height: 800, crop: "limit" }, { quality: "auto" }, { fetch_format: "auto" }],
        },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
    });
  } catch (error) {
    console.error("Cloudinary upload API error:", error);
    return NextResponse.json({ success: false, message: "Cloudinary-তে ছবি আপলোড ব্যর্থ হয়েছে।" }, { status: 500 });
  }
}
