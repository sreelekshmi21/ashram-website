import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publicationSchema } from "@/lib/validations/publicationSchema";
import { revalidateTag } from "next/cache";

/**
 * Generate a URL-friendly slug from a title.
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

// ── GET /api/admin/publications ──────────────────────────────────────────────

/**
 * List all publications with optional search, status filter, pagination, and sort.
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
    const sort = searchParams.get("sort") || "displayOrder";
    const order = searchParams.get("order") === "desc" ? "desc" : "asc";

    // Build Prisma where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { author: { contains: search, mode: "insensitive" } },
        { isbn: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status && ["Draft", "Published"].includes(status)) {
      where.status = status;
    }

    // Allowed sort fields
    const allowedSortFields = [
      "title",
      "author",
      "price",
      "displayOrder",
      "status",
      "createdAt",
      "updatedAt",
    ];
    const sortField = allowedSortFields.includes(sort) ? sort : "displayOrder";

    const [publications, total] = await Promise.all([
      prisma.publication.findMany({
        where,
        orderBy: { [sortField]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.publication.count({ where }),
    ]);

    const formattedPublications = publications.map((pub) => ({
      ...pub,
      price: Number(pub.price),
    }));

    return NextResponse.json({
      success: true,
      data: {
        publications: formattedPublications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("[Admin Publications] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch publications" },
      { status: 500 }
    );
  }
}

// ── POST /api/admin/publications ─────────────────────────────────────────────

/**
 * Create a new publication. Validates input with Zod schema and generates a unique slug.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = publicationSchema.safeParse(body);

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

    // Generate unique slug
    let slug = generateSlug(data.title);
    let existingSlug = await prisma.publication.findUnique({ where: { slug } });
    while (existingSlug) {
      slug = generateSlug(data.title);
      existingSlug = await prisma.publication.findUnique({ where: { slug } });
    }

    const publication = await prisma.publication.create({
      data: {
        title: data.title,
        slug,
        author: data.author,
        price: data.price,
        pages: data.pages,
        language: data.language,
        isbn: data.isbn,
        description: data.description,
        longDescription: data.longDescription,
        gradient: data.gradient || null,
        coverImage: data.coverImage || null,
        status: data.status,
        displayOrder: data.displayOrder,
      },
    });

    // Invalidate cached publication data
    revalidateTag("publications", "content");
    revalidateTag("homepage", "content");

    return NextResponse.json(
      {
        success: true,
        data: {
          ...publication,
          price: Number(publication.price),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Admin Publications] POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create publication" },
      { status: 500 }
    );
  }
}
