import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/adminGuard";
import { batchCreateImageSchema } from "@/lib/validations/imageSchema";
import {
  verifyPendingImageUpload,
  promotePendingUpload,
  deleteObjectsSafe,
} from "@/lib/storage";
import { imageDisplayUrl } from "@/lib/imageConfig";
import { revalidateTag } from "next/cache";

export async function POST(request: Request) {
  const guard = await requireAdminSession();
  if (guard.response) return guard.response;

  try {
    const body = await request.json();
    const parsed = batchCreateImageSchema.safeParse(body);

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

    const { images } = parsed.data;
    const promotedKeys: string[] = [];
    const recordsToCreate = [];

    try {
      for (const item of images) {
        const verified = await verifyPendingImageUpload(item.imageUploadKey);
        const finalKey = await promotePendingUpload(verified, "image");
        promotedKeys.push(finalKey);

        recordsToCreate.push({
          title: item.title,
          description: item.description || null,
          category: item.category,
          imageKey: finalKey,
          mimeType: verified.mimeType,
          size: BigInt(verified.size),
          width: item.width ?? null,
          height: item.height ?? null,
          status: item.status,
          displayOrder: item.displayOrder,
          isActive: true,
        });
      }

      const created = await prisma.$transaction(
        recordsToCreate.map((data) => prisma.imageGallery.create({ data }))
      );

      try {
        revalidateTag("gallery", "content");
        revalidateTag("homepage", "content");
      } catch (e) {
        console.warn("[Admin Gallery Batch] Cache invalidation warning:", e);
      }

      return NextResponse.json(
        {
          success: true,
          data: created.map((img) => ({
            ...img,
            size: Number(img.size),
            url: imageDisplayUrl(img.id),
          })),
        },
        { status: 201 }
      );
    } catch (error) {
      // Clean up promoted objects in MinIO if database operation fails
      await deleteObjectsSafe(promotedKeys);
      throw error;
    }
  } catch (error) {
    console.error("[Admin Gallery Batch POST] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to batch upload images",
      },
      { status: 500 }
    );
  }
}

