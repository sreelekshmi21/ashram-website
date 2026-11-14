import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getObjectStream } from "@/lib/storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const video = await prisma.video.findUnique({
      where: { id },
      select: {
        thumbnailKey: true,
        thumbnailMimeType: true,
        updatedAt: true,
      },
    });

    if (!video || !video.thumbnailKey) {
      return new NextResponse("Thumbnail not found", { status: 404 });
    }

    const stream = await getObjectStream(video.thumbnailKey);

    return new NextResponse(stream, {
      status: 200,
      headers: {
        "Content-Type": video.thumbnailMimeType || "image/jpeg",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "Last-Modified": video.updatedAt.toUTCString(),
      },
    });
  } catch (error) {
    console.error("[Thumbnail Stream] Error:", error);
    return new NextResponse("Failed to load thumbnail", { status: 500 });
  }
}

