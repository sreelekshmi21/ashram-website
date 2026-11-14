import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/adminGuard";
import { imageUploadUrlSchema } from "@/lib/validations/imageSchema";
import { createPresignedImageUpload } from "@/lib/storage";

export async function POST(request: Request) {
  const guard = await requireAdminSession();
  if (guard.response) return guard.response;

  try {
    const body = await request.json();
    const parsed = imageUploadUrlSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { contentType, size } = parsed.data;
    const presigned = await createPresignedImageUpload(contentType, size);

    return NextResponse.json({
      success: true,
      data: presigned,
    });
  } catch (error) {
    console.error("[Admin Image Upload URL] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate image upload URL",
      },
      { status: 500 }
    );
  }
}

