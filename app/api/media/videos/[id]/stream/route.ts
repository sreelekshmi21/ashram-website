import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getObjectStream } from "@/lib/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const video = await prisma.video.findUnique({
      where: { id },
      select: {
        id: true,
        videoKey: true,
        videoMimeType: true,
        videoSize: true,
        status: true,
        updatedAt: true,
      },
    });

    if (!video) {
      return new NextResponse("Video not found", { status: 404 });
    }

    // Check Range header for HTTP 206 Partial Content
    const rangeHeader = request.headers.get("range");
    const totalSize = Number(video.videoSize);

    if (rangeHeader) {
      const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
      if (match) {
        const start = parseInt(match[1], 10);
        const end = match[2] ? parseInt(match[2], 10) : totalSize - 1;

        if (start >= totalSize || end >= totalSize || start > end) {
          return new NextResponse("Requested range not satisfiable", {
            status: 416,
            headers: {
              "Content-Range": `bytes */${totalSize}`,
            },
          });
        }

        const chunkLength = end - start + 1;
        const stream = await getObjectStream(video.videoKey, { start, end });

        return new NextResponse(stream, {
          status: 206,
          headers: {
            "Content-Range": `bytes ${start}-${end}/${totalSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": String(chunkLength),
            "Content-Type": video.videoMimeType,
            "Cache-Control": "public, max-age=31536000, immutable",
            "Last-Modified": video.updatedAt.toUTCString(),
          },
        });
      }
    }

    // Full file stream
    const stream = await getObjectStream(video.videoKey);

    return new NextResponse(stream, {
      status: 200,
      headers: {
        "Accept-Ranges": "bytes",
        "Content-Length": String(totalSize),
        "Content-Type": video.videoMimeType,
        "Cache-Control": "public, max-age=86400",
        "Last-Modified": video.updatedAt.toUTCString(),
      },
    });
  } catch (error) {
    console.error("[Video Stream] Error:", error);
    return new NextResponse("Failed to stream video", { status: 500 });
  }
}

