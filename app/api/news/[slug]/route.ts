import { getNewsBySlug } from "@/lib/data";
import { NextResponse } from "next/server";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const limited = await applyRateLimit(request, RATE_LIMITS.publicApi);
  if (limited) return limited;

  try {
    const { slug } = await params;
    const item = await getNewsBySlug(slug);

    if (!item) {
      return NextResponse.json(
        { success: false, error: "News item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error("Error fetching news item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch news item" },
      { status: 500 }
    );
  }
}
