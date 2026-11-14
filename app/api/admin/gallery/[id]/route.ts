import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/adminGuard";
import { updateImageSchema } from "@/lib/validations/imageSchema";
import {
  verifyPendingImageUpload,
  promotePendingUpload,
  deleteObjectsSafe,
} from "@/lib/storage";
import { imageDisplayUrl } from "@/lib/imageConfig";
import { revalidateTag } from "next/cache";

// ── GET /api/admin/gallery/[id] ─────────────────────────────────────────────

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminSession();
  if (guard.response) return guard.response;

  try {
    const { id } = await params;

    const img = await prisma.imageGallery.findUnique({
      where: { id },
    });

    if (!img) {
      return NextResponse.json(
        { success: false, error: "Image not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...img,
        size: Number(img.size),
        url: imageDisplayUrl(img.id),
      },
    });
  } catch (error) {
    console.error("[Admin Gallery] GET by ID error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch image" },
      { status: 500 }
    );
  }
}

// ── PUT /api/admin/gallery/[id] ─────────────────────────────────────────────

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminSession();
  if (guard.response) return guard.response;

  try {
    const { id } = await params;

    const existing = await prisma.imageGallery.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Image not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = updateImageSchema.safeParse(body);

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

    let finalImageKey = existing.imageKey;
    let mimeType = existing.mimeType;
    let size = existing.size;
    let oldKeyToDelete: string | null = null;

    if (data.imageUploadKey) {
      const verified = await verifyPendingImageUpload(data.imageUploadKey);
      finalImageKey = await promotePendingUpload(verified, "image");
      mimeType = verified.mimeType;
      size = BigInt(verified.size);
      oldKeyToDelete = existing.imageKey;
    }

    const updated = await prisma.imageGallery.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description || null,
        category: data.category,
        imageKey: finalImageKey,
        mimeType,
        size,
        width: data.width !== undefined ? data.width : existing.width,
        height: data.height !== undefined ? data.height : existing.height,
        status: data.status,
        isActive: data.isActive,
        displayOrder: data.displayOrder,
      },
    });

    await deleteObjectsSafe([oldKeyToDelete]);

    try {
      revalidateTag("gallery", "content");
      revalidateTag("homepage", "content");
    } catch (e) {
      console.warn("[Admin Gallery] Cache invalidation warning:", e);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        size: Number(updated.size),
        url: imageDisplayUrl(updated.id),
      },
    });
  } catch (error) {
    console.error("[Admin Gallery] PUT error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update image",
      },
      { status: 500 }
    );
  }
}

// ── DELETE /api/admin/gallery/[id] ──────────────────────────────────────────

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminSession();
  if (guard.response) return guard.response;

  try {
    const { id } = await params;

    const existing = await prisma.imageGallery.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Image not found" },
        { status: 404 }
      );
    }

    await prisma.imageGallery.delete({ where: { id } });
    await deleteObjectsSafe([existing.imageKey]);

    try {
      revalidateTag("gallery", "content");
      revalidateTag("homepage", "content");
    } catch (e) {
      console.warn("[Admin Gallery] Cache invalidation warning:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("[Admin Gallery] DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete image" },
      { status: 500 }
    );
  }
}

