import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/adminGuard";
import { createImageSchema } from "@/lib/validations/imageSchema";
import {
  verifyPendingImageUpload,
  promotePendingUpload,
  deleteObjectsSafe,
} from "@/lib/storage";
import { imageDisplayUrl } from "@/lib/imageConfig";
import { revalidateTag } from "next/cache";

// ── GET /api/admin/gallery ──────────────────────────────────────────────────

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
      Math.max(1, parseInt(searchParams.get("limit") || "12", 10))
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

    const [images, total] = await Promise.all([
      prisma.imageGallery.findMany({
        where,
        orderBy: [{ [sortField]: order }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.imageGallery.count({ where }),
    ]);

    const formattedImages = images.map((img) => ({
      ...img,
      size: Number(img.size),
      url: imageDisplayUrl(img.id),
    }));

    return NextResponse.json({
      success: true,
      data: {
        images: formattedImages,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("[Admin Gallery] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch gallery images" },
      { status: 500 }
    );
  }
}

// ── POST /api/admin/gallery ─────────────────────────────────────────────────

export async function POST(request: Request) {
  const guard = await requireAdminSession();
  if (guard.response) return guard.response;

  try {
    const body = await request.json();
    const parsed = createImageSchema.safeParse(body);

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

    // Verify image in MinIO
    const verified = await verifyPendingImageUpload(data.imageUploadKey);
    const finalImageKey = await promotePendingUpload(verified, "image");

    try {
      const imageRecord = await prisma.imageGallery.create({
        data: {
          title: data.title,
          description: data.description || null,
          category: data.category,
          imageKey: finalImageKey,
          mimeType: verified.mimeType,
          size: BigInt(verified.size),
          width: data.width ?? null,
          height: data.height ?? null,
          status: data.status,
          isActive: data.isActive,
          displayOrder: data.displayOrder,
        },
      });

      try {
        revalidateTag("gallery", "content");
        revalidateTag("homepage", "content");
      } catch (e) {
        console.warn("[Admin Gallery] Cache invalidation warning:", e);
      }

      return NextResponse.json(
        {
          success: true,
          data: {
            ...imageRecord,
            size: Number(imageRecord.size),
            url: imageDisplayUrl(imageRecord.id),
          },
        },
        { status: 201 }
      );
    } catch (dbError) {
      await deleteObjectsSafe([finalImageKey]);
      throw dbError;
    }
  } catch (error) {
    console.error("[Admin Gallery] POST error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create gallery image",
      },
      { status: 500 }
    );
  }
}

