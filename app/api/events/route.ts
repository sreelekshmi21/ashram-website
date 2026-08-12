import { getPublishedEvents } from "@/lib/data";
import { NextResponse } from "next/server";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const limited = await applyRateLimit(request, RATE_LIMITS.publicApi);
  if (limited) return limited;

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const events = await getPublishedEvents(category);

    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

