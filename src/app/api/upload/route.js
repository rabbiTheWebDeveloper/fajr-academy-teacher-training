import { NextResponse } from "next/server";
import cloudinary from "@/utlis/cloudinary";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") || formData.get("image");

    if (!file) {
      return NextResponse.json(
        { success: false, message: "কোনো ছবি বা ফাইল পাওয়া যায়নি।" },
        { status: 400 }
      );
    }

    // Validate mime type
    const mimeType = file.type || "";
    if (!mimeType.startsWith("image/")) {
      return NextResponse.json(
        { success: false, message: "শুধুমাত্র ছবি (JPG, PNG, WEBP ইত্যাদি) আপলোড করা যাবে।" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary using upload_stream
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "fajr-instructors",
          resource_type: "image",
          transformation: [
            { width: 800, height: 800, crop: "limit" },
            { quality: "auto" },
            { fetch_format: "auto" }
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
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
    return NextResponse.json(
      { success: false, message: error.message || "Cloudinary-তে ছবি আপলোড ব্যর্থ হয়েছে।" },
      { status: 500 }
    );
  }
}
