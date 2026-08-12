import { getNewsItems } from "@/lib/data";
import { NextResponse } from "next/server";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const limited = await applyRateLimit(request, RATE_LIMITS.publicApi);
  if (limited) return limited;

  try {
    const news = await getNewsItems();

    return NextResponse.json({ success: true, data: news });
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
