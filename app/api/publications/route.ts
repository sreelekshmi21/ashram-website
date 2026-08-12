import { getPublications } from "@/lib/data";
import { NextResponse } from "next/server";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const limited = await applyRateLimit(request, RATE_LIMITS.publicApi);
  if (limited) return limited;

  try {
    const publications = await getPublications();

    return NextResponse.json({ success: true, data: publications });
  } catch (error) {
    console.error("Error fetching publications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch publications" },
      { status: 500 }
    );
  }
}
