import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/adminGuard";
import { createVideoSchema } from "@/lib/validations/videoSchema";
import {
  verifyPendingUpload,
  promotePendingUpload,
  deleteObjectsSafe,
} from "@/lib/storage";
import { videoStreamUrl, videoThumbnailUrl } from "@/lib/videoConfig";
import { revalidateTag } from "next/cache";

// ── GET /api/admin/videos ───────────────────────────────────────────────────

export async function GET(request: Request) {
  const guard = await requireAdminSession();
  if (guard.response) return guard.response;

  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "10", 10))
    );
    const sort = searchParams.get("sort") || "displayOrder";
    const order = searchParams.get("order") === "desc" ? "desc" : "asc";

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status && ["Draft", "Published"].includes(status)) {
      where.status = status;
    }

    if (category && category !== "All") {
      where.category = category;
    }

    const allowedSortFields = ["title", "category", "displayOrder", "status", "createdAt", "updatedAt"];
    const sortField = allowedSortFields.includes(sort) ? sort : "displayOrder";

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        orderBy: [{ [sortField]: order }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.video.count({ where }),
    ]);

    const formattedVideos = videos.map((v) => ({
      ...v,
      videoSize: Number(v.videoSize),
      streamUrl: videoStreamUrl(v.id),
      thumbnailUrl: v.thumbnailKey ? videoThumbnailUrl(v.id) : null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        videos: formattedVideos,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("[Admin Videos] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}

// ── POST /api/admin/videos ──────────────────────────────────────────────────

export async function POST(request: Request) {
  const guard = await requireAdminSession();
  if (guard.response) return guard.response;

  try {
    const body = await request.json();
    const parsed = createVideoSchema.safeParse(body);

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

    // Verify video object in MinIO (magic bytes + size check)
    const verifiedVideo = await verifyPendingUpload(data.videoUploadKey, "video");
    let verifiedThumb = null;
    if (data.thumbnailUploadKey) {
      verifiedThumb = await verifyPendingUpload(data.thumbnailUploadKey, "thumbnail");
    }

    // Promote objects to permanent locations
    const finalVideoKey = await promotePendingUpload(verifiedVideo, "video");
    let finalThumbKey: string | null = null;
    let thumbMimeType: string | null = null;

    if (verifiedThumb) {
      finalThumbKey = await promotePendingUpload(verifiedThumb, "thumbnail");
      thumbMimeType = verifiedThumb.mimeType;
    }

    try {
      const video = await prisma.video.create({
        data: {
          title: data.title,
          description: data.description || null,
          category: data.category,
          videoKey: finalVideoKey,
          videoMimeType: verifiedVideo.mimeType,
          videoSize: BigInt(verifiedVideo.size),
          thumbnailKey: finalThumbKey,
          thumbnailMimeType: thumbMimeType,
          durationSeconds: data.durationSeconds ?? null,
          status: data.status,
          displayOrder: data.displayOrder,
        },
      });

      // Invalidate Next.js cache tags
      try {
        revalidateTag("videos", "content");
        revalidateTag("homepage", "content");
      } catch (e) {
        console.warn("[Admin Videos] Cache invalidation warning:", e);
      }

      return NextResponse.json(
        {
          success: true,
          data: {
            ...video,
            videoSize: Number(video.videoSize),
            streamUrl: videoStreamUrl(video.id),
            thumbnailUrl: video.thumbnailKey ? videoThumbnailUrl(video.id) : null,
          },
        },
        { status: 201 }
      );
    } catch (dbError) {
      // Clean up orphaned permanent objects if database insert fails
      await deleteObjectsSafe([finalVideoKey, finalThumbKey]);
      throw dbError;
    }
  } catch (error) {
    console.error("[Admin Videos] POST error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create video",
      },
      { status: 500 }
    );
  }
}

