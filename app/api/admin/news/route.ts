import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { newsSchema } from "@/lib/validations/newsSchema";
import { revalidateTag } from "next/cache";

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "10", 10))
    );

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status && ["Draft", "Published"].includes(status)) {
      where.status = status;
    }

    if (category) {
      where.category = { contains: category, mode: "insensitive" };
    }

    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where,
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.news.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        news,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("[Admin News] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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

    let slug = generateSlug(data.title);
    const existingSlug = await prisma.news.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = generateSlug(data.title);
    }

    const newsItem = await prisma.news.create({
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

    return NextResponse.json(
      { success: true, data: newsItem },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Admin News] POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create news item" },
      { status: 500 }
    );
  }
}
