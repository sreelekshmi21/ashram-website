import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/adminGuard";
import { revalidateTag } from "next/cache";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminSession();
  if (guard.response) return guard.response;

  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !["Published", "Draft"].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Status must be "Published" or "Draft"' },
        { status: 400 }
      );
    }

    const existing = await prisma.video.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Video not found" },
        { status: 404 }
      );
    }

    const video = await prisma.video.update({
      where: { id },
      data: { status },
    });

    try {
      revalidateTag("videos", "content");
      revalidateTag("homepage", "content");
    } catch (e) {
      console.warn("[Admin Videos] Cache invalidation warning:", e);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...video,
        videoSize: Number(video.videoSize),
      },
    });
  } catch (error) {
    console.error("[Admin Video Publish] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update video status" },
      { status: 500 }
    );
  }
}

