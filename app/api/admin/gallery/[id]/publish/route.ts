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

    const existing = await prisma.imageGallery.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Image not found" },
        { status: 404 }
      );
    }

    const img = await prisma.imageGallery.update({
      where: { id },
      data: { status },
    });

    try {
      revalidateTag("gallery", "content");
      revalidateTag("homepage", "content");
    } catch (e) {
      console.warn("[Admin Gallery Publish] Cache invalidation warning:", e);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...img,
        size: Number(img.size),
      },
    });
  } catch (error) {
    console.error("[Admin Gallery Publish] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update image publication status" },
      { status: 500 }
    );
  }
}

