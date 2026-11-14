import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/adminGuard";
import { updateVideoSchema } from "@/lib/validations/videoSchema";
import {
  verifyPendingUpload,
  promotePendingUpload,
  deleteObjectsSafe,
} from "@/lib/storage";
import { videoStreamUrl, videoThumbnailUrl } from "@/lib/videoConfig";
import { revalidateTag } from "next/cache";

// ── GET /api/admin/videos/[id] ──────────────────────────────────────────────

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminSession();
  if (guard.response) return guard.response;

  try {
    const { id } = await params;

    const video = await prisma.video.findUnique({
      where: { id },
    });

    if (!video) {
      return NextResponse.json(
        { success: false, error: "Video not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...video,
        videoSize: Number(video.videoSize),
        streamUrl: videoStreamUrl(video.id),
        thumbnailUrl: video.thumbnailKey ? videoThumbnailUrl(video.id) : null,
      },
    });
  } catch (error) {
    console.error("[Admin Videos] GET by ID error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch video" },
      { status: 500 }
    );
  }
}

// ── PUT /api/admin/videos/[id] ──────────────────────────────────────────────

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminSession();
  if (guard.response) return guard.response;

  try {
    const { id } = await params;

    const existing = await prisma.video.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Video not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = updateVideoSchema.safeParse(body);

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

    const data = parsed.data;

    let finalVideoKey = existing.videoKey;
    let videoMimeType = existing.videoMimeType;
    let videoSize = existing.videoSize;
    let oldVideoKeyToDelete: string | null = null;

    if (data.videoUploadKey) {
      const verified = await verifyPendingUpload(data.videoUploadKey, "video");
      finalVideoKey = await promotePendingUpload(verified, "video");
      videoMimeType = verified.mimeType;
      videoSize = BigInt(verified.size);
      oldVideoKeyToDelete = existing.videoKey;
    }

    let finalThumbKey = existing.thumbnailKey;
    let thumbMimeType = existing.thumbnailMimeType;
    let oldThumbKeyToDelete: string | null = null;

    if (data.thumbnailUploadKey) {
      const verified = await verifyPendingUpload(data.thumbnailUploadKey, "thumbnail");
      finalThumbKey = await promotePendingUpload(verified, "thumbnail");
      thumbMimeType = verified.mimeType;
      oldThumbKeyToDelete = existing.thumbnailKey;
    } else if (data.removeThumbnail) {
      finalThumbKey = null;
      thumbMimeType = null;
      oldThumbKeyToDelete = existing.thumbnailKey;
    }

    const updated = await prisma.video.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description || null,
        category: data.category,
        videoKey: finalVideoKey,
        videoMimeType,
        videoSize,
        thumbnailKey: finalThumbKey,
        thumbnailMimeType: thumbMimeType,
        durationSeconds:
          data.durationSeconds !== undefined ? data.durationSeconds : existing.durationSeconds,
        status: data.status,
        displayOrder: data.displayOrder,
      },
    });

    // Safely delete replaced storage objects
    await deleteObjectsSafe([oldVideoKeyToDelete, oldThumbKeyToDelete]);

    try {
      revalidateTag("videos", "content");
      revalidateTag("homepage", "content");
    } catch (e) {
      console.warn("[Admin Videos] Cache invalidation warning:", e);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        videoSize: Number(updated.videoSize),
        streamUrl: videoStreamUrl(updated.id),
        thumbnailUrl: updated.thumbnailKey ? videoThumbnailUrl(updated.id) : null,
      },
    });
  } catch (error) {
    console.error("[Admin Videos] PUT error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update video",
      },
      { status: 500 }
    );
  }
}

// ── DELETE /api/admin/videos/[id] ───────────────────────────────────────────

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminSession();
  if (guard.response) return guard.response;

  try {
    const { id } = await params;

    const existing = await prisma.video.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Video not found" },
        { status: 404 }
      );
    }

    await prisma.video.delete({ where: { id } });

    // Safely remove media objects from storage
    await deleteObjectsSafe([existing.videoKey, existing.thumbnailKey]);

    try {
      revalidateTag("videos", "content");
      revalidateTag("homepage", "content");
    } catch (e) {
      console.warn("[Admin Videos] Cache invalidation warning:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error) {
    console.error("[Admin Videos] DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete video" },
      { status: 500 }
    );
  }
}

