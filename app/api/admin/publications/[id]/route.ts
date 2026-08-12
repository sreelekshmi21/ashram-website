import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publicationSchema } from "@/lib/validations/publicationSchema";
import { revalidateTag } from "next/cache";

// ── GET /api/admin/publications/[id] ────────────────────────────────────────

/**
 * Fetch a single publication by ID.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const publication = await prisma.publication.findUnique({
      where: { id },
    });

    if (!publication) {
      return NextResponse.json(
        { success: false, error: "Publication not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...publication,
        price: Number(publication.price),
      },
    });
  } catch (error) {
    console.error("[Admin Publications] GET by ID error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch publication" },
      { status: 500 }
    );
  }
}

// ── PUT /api/admin/publications/[id] ────────────────────────────────────────

/**
 * Update an existing publication. Validates input with Zod schema.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.publication.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Publication not found" },
        { status: 404 }
      );
    }

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

    // Regenerate slug if title changed significantly
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

      let slugConflict = await prisma.publication.findFirst({
        where: { slug, id: { not: id } },
      });
      while (slugConflict) {
        const newSuffix = Math.random().toString(36).slice(2, 7);
        slug = `${base}-${newSuffix}`;
        slugConflict = await prisma.publication.findFirst({
          where: { slug, id: { not: id } },
        });
      }
    }

    const updated = await prisma.publication.update({
      where: { id },
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
    revalidateTag(`publication:${existing.slug}`, "content");
    if (slug !== existing.slug) {
      revalidateTag(`publication:${slug}`, "content");
    }
    revalidateTag("homepage", "content");

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        price: Number(updated.price),
      },
    });
  } catch (error) {
    console.error("[Admin Publications] PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update publication" },
      { status: 500 }
    );
  }
}

// ── DELETE /api/admin/publications/[id] ────────────────────────────────────

/**
 * Delete a publication.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.publication.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Publication not found" },
        { status: 404 }
      );
    }

    await prisma.publication.delete({ where: { id } });

    // Invalidate cached publication data
    revalidateTag("publications", "content");
    revalidateTag(`publication:${existing.slug}`, "content");
    revalidateTag("homepage", "content");

    return NextResponse.json({
      success: true,
      message: "Publication deleted successfully",
    });
  } catch (error) {
    console.error("[Admin Publications] DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete publication" },
      { status: 500 }
    );
  }
}
