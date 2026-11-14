import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/adminGuard";
import { uploadUrlSchema } from "@/lib/validations/videoSchema";
import { createPresignedUpload } from "@/lib/storage";

export async function POST(request: Request) {
  const guard = await requireAdminSession();
  if (guard.response) return guard.response;

  try {
    const body = await request.json();
    const parsed = uploadUrlSchema.safeParse(body);

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

    const { kind, contentType, size } = parsed.data;
    const presigned = await createPresignedUpload(kind, contentType, size);

    return NextResponse.json({
      success: true,
      data: presigned,
    });
  } catch (error) {
    console.error("[Admin Video Upload URL] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate upload URL",
      },
      { status: 500 }
    );
  }
}

