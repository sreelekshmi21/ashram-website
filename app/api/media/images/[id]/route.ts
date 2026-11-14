import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getObjectStream } from "@/lib/storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const img = await prisma.imageGallery.findUnique({
      where: { id },
      select: {
        imageKey: true,
        mimeType: true,
        updatedAt: true,
      },
    });

    if (!img) {
      return new NextResponse("Image not found", { status: 404 });
    }

    const stream = await getObjectStream(img.imageKey);

    return new NextResponse(stream, {
      status: 200,
      headers: {
        "Content-Type": img.mimeType || "image/jpeg",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "Last-Modified": img.updatedAt.toUTCString(),
      },
    });
  } catch (error) {
    console.error("[Image Stream] Error:", error);
    return new NextResponse("Failed to load image", { status: 500 });
  }
}

