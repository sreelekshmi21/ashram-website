import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { eventSchema } from "@/lib/validations/eventSchema";
import { revalidateTag } from "next/cache";

// ── GET /api/admin/events/[id] ──────────────────────────────────────────────

/**
 * Fetch a single event by ID.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        _count: { select: { registrations: true } },
      },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    console.error("[Admin Events] GET by ID error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

// ── PUT /api/admin/events/[id] ──────────────────────────────────────────────

/**
 * Update an existing event. Validates input with Zod schema.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check event exists
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = eventSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten();
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          fieldErrors: errors.fieldErrors,
          formErrors: errors.formErrors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // If title changed, regenerate slug
    let slug = existing.slug;
    if (data.title !== existing.title) {
      const base = data.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 80);
      const suffix = Math.random().toString(36).slice(2, 7);
      slug = `${base}-${suffix}`;
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        title: data.title,
        slug,
        description: data.description,
        venue: data.venue || null,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        registrationRequired: data.registrationRequired,
        registrationFee: data.registrationFee,
        registrationDeadline: data.registrationDeadline
          ? new Date(data.registrationDeadline)
          : null,
        status: data.status,
        category: data.category,
        coverImage: data.coverImage || null,
        gradient: data.gradient || null,
      },
    });

    // Invalidate cached event data
    revalidateTag("events", "content");
    revalidateTag(`event:${existing.slug}`, "content");
    if (slug !== existing.slug) {
      revalidateTag(`event:${slug}`, "content");
    }

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    console.error("[Admin Events] PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update event" },
      { status: 500 }
    );
  }
}

// ── DELETE /api/admin/events/[id] ───────────────────────────────────────────

/**
 * Delete an event. Cascade-deletes registrations per Prisma schema.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    await prisma.event.delete({ where: { id } });

    // Invalidate cached event data
    revalidateTag("events", "content");
    revalidateTag(`event:${existing.slug}`, "content");

    return NextResponse.json({ success: true, message: "Event deleted" });
  } catch (error) {
    console.error("[Admin Events] DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
