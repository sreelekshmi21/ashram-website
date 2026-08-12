import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ── GET /api/admin/registrations ────────────────────────────────────────────

/**
 * List all event registrations with optional search, filters, pagination,
 * and sort. Protected by proxy.ts session validation.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const eventId = searchParams.get("eventId") || "";
    const registrationStatus = searchParams.get("registrationStatus") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";
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
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { registrationNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    if (eventId) {
      where.eventId = eventId;
    }

    if (
      registrationStatus &&
      ["Pending", "Confirmed", "Cancelled", "Completed"].includes(
        registrationStatus
      )
    ) {
      where.registrationStatus = registrationStatus;
    }

    if (
      paymentStatus &&
      ["Pending", "Paid", "Failed", "Refunded"].includes(paymentStatus)
    ) {
      where.paymentStatus = paymentStatus;
    }

    // Allowed sort fields
    const allowedSortFields = ["createdAt", "fullName", "email"];
    const sortField = allowedSortFields.includes(sort) ? sort : "createdAt";

    const [registrations, total, events] = await Promise.all([
      prisma.eventRegistration.findMany({
        where,
        orderBy: { [sortField]: order },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          registrationNumber: true,
          fullName: true,
          email: true,
          mobileNumber: true,
          registrationStatus: true,
          paymentStatus: true,
          createdAt: true,
          event: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      }),
      prisma.eventRegistration.count({ where }),
      // Fetch all events for the filter dropdown
      prisma.event.findMany({
        orderBy: { title: "asc" },
        select: {
          id: true,
          title: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        registrations,
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
    console.error("[Admin Registrations] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
