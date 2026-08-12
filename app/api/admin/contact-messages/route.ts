import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ── GET /api/admin/contact-messages ─────────────────────────────────────────

/**
 * List all contact messages with optional search, status filter, pagination,
 * and sort. Protected by proxy.ts session validation.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "";
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
        { subject: { contains: search, mode: "insensitive" } },
      ];
    }

    if (
      status &&
      ["New", "Read", "Replied", "Archived"].includes(status)
    ) {
      where.status = status;
    }

    // Allowed sort fields
    const allowedSortFields = ["createdAt", "fullName", "email", "subject"];
    const sortField = allowedSortFields.includes(sort) ? sort : "createdAt";

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { [sortField]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contactMessage.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        messages,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("[Admin Contact Messages] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch contact messages" },
      { status: 500 }
    );
  }
}
