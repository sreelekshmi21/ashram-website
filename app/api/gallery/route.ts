import { NextResponse } from "next/server";
import { getGalleryImages } from "@/lib/data";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const limited = await applyRateLimit(request, RATE_LIMITS.publicApi);
  if (limited) return limited;

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;

    const images = await getGalleryImages(category);

    return NextResponse.json({ success: true, data: images });
  } catch (error) {
    console.error("[Public Gallery API] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch gallery images" },
      { status: 500 }
    );
  }
}

