import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";

/**
 * PATCH /api/admin/publications/[id]/publish
 *
 * Toggle publication status between Published and Draft.
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

    const existing = await prisma.publication.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Publication not found" },
        { status: 404 }
      );
    }

    const publication = await prisma.publication.update({
      where: { id },
      data: { status },
    });

    // Invalidate cached publication data
    revalidateTag("publications", "content");
    revalidateTag(`publication:${existing.slug}`, "content");
    revalidateTag("homepage", "content");

    return NextResponse.json({
      success: true,
      data: {
        ...publication,
        price: Number(publication.price),
      },
    });
  } catch (error) {
    console.error("[Admin Publications] PATCH publish error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update publication status" },
      { status: 500 }
    );
  }
}
