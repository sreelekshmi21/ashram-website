import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { eventSchema } from "@/lib/validations/eventSchema";
import { revalidateTag } from "next/cache";

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Generate a URL-friendly slug from a title.
 * Appends a short random suffix to avoid collisions.
 */
function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}

// ── GET /api/admin/events ────────────────────────────────────────────────────

/**
 * List all events with optional search, status filter, pagination, and sort.
 * Protected by proxy.ts session validation.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category")?.toUpperCase() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "10", 10))
    );
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") === "asc" ? "asc" : "desc";

    // Build Prisma where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { venue: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status && ["Draft", "Published", "Cancelled", "Completed"].includes(status)) {
      where.status = status;
    }

    if (category && ["MONTHLY", "YEARLY", "SPECIAL"].includes(category)) {
      where.category = category;
    }

    // Allowed sort fields
    const allowedSortFields = [
      "title",
      "startDate",
      "status",
      "category",
      "createdAt",
      "updatedAt",
    ];
    const sortField = allowedSortFields.includes(sort) ? sort : "createdAt";

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: { [sortField]: order },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          coverImage: true,
          venue: true,
          startDate: true,
          endDate: true,
          registrationRequired: true,
          registrationFee: true,
          registrationDeadline: true,
          status: true,
          category: true,
          gradient: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { registrations: true } },
        },
      }),
      prisma.event.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        events,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("[Admin Events] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// ── POST /api/admin/events ───────────────────────────────────────────────────

/**
 * Create a new event. Validates input with Zod schema.
 */
export async function POST(request: Request) {
  try {
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

    // Generate a unique slug
    let slug = generateSlug(data.title);
    const existingSlug = await prisma.event.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = generateSlug(data.title); // retry with new random suffix
    }

    const event = await prisma.event.create({
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

    return NextResponse.json(
      { success: true, data: event },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Admin Events] POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create event" },
      { status: 500 }
    );
  }
}
