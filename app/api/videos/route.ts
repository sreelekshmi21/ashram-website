import { NextResponse } from "next/server";
import { getPublishedVideos } from "@/lib/data";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const limited = await applyRateLimit(request, RATE_LIMITS.publicApi);
  if (limited) return limited;

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;

    const videos = await getPublishedVideos(category);

    return NextResponse.json({ success: true, data: videos });
  } catch (error) {
    console.error("[Public Videos] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}

