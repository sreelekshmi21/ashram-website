import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";

/**
 * PATCH /api/admin/events/[id]/publish
 *
 * Toggle event status between Published and Draft.
 * Accepts: { status: "Published" | "Draft" }
 */
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

    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    const event = await prisma.event.update({
      where: { id },
      data: { status },
    });

    // Invalidate cached event data
    revalidateTag("events", "content");
    revalidateTag(`event:${existing.slug}`, "content");

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    console.error("[Admin Events] PATCH publish error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update event status" },
      { status: 500 }
    );
  }
}
