import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { newsSchema } from "@/lib/validations/newsSchema";
import { revalidateTag } from "next/cache";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const newsItem = await prisma.news.findUnique({
      where: { id },
    });

    if (!newsItem) {
      return NextResponse.json(
        { success: false, error: "News item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: newsItem });
  } catch (error) {
    console.error("[Admin News] GET by ID error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch news item" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.news.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "News item not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = newsSchema.safeParse(body);

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

    const newsItem = await prisma.news.update({
      where: { id },
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content || null,
        category: data.category,
        coverImage: data.coverImage || null,
        date: new Date(data.date),
        status: data.status,
      },
    });

    revalidateTag("news", "content");
    revalidateTag(`news:${existing.slug}`, "content");
    if (slug !== existing.slug) {
      revalidateTag(`news:${slug}`, "content");
    }

    return NextResponse.json({ success: true, data: newsItem });
  } catch (error) {
    console.error("[Admin News] PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update news item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.news.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "News item not found" },
        { status: 404 }
      );
    }

    await prisma.news.delete({ where: { id } });

    revalidateTag("news", "content");
    revalidateTag(`news:${existing.slug}`, "content");

    return NextResponse.json({ success: true, message: "News item deleted" });
  } catch (error) {
    console.error("[Admin News] DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete news item" },
      { status: 500 }
    );
  }
}
