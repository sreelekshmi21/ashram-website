import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { status } = body;

    if (!status || !["Published", "Draft"].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid status. Must be "Published" or "Draft".',
        },
        { status: 400 }
      );
    }

    const existing = await prisma.news.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "News item not found" },
        { status: 404 }
      );
    }

    const newsItem = await prisma.news.update({
      where: { id },
      data: { status },
    });

    revalidateTag("news", "content");
    revalidateTag(`news:${existing.slug}`, "content");

    return NextResponse.json({ success: true, data: newsItem });
  } catch (error) {
    console.error("[Admin News] PATCH publish error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update news status" },
      { status: 500 }
    );
  }
}
