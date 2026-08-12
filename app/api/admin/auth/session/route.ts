import { NextResponse } from "next/server";
import { validateSession } from "@/lib/auth";

export async function GET(_request: Request) {
  try {
    const session = await validateSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        userId: session.userId,
        email: session.email,
        name: session.name,
        role: session.role,
      },
    });
  } catch (error) {
    console.error("[Admin Session] Error:", error);
    return NextResponse.json(
      { success: false, error: "Session validation failed" },
      { status: 500 }
    );
  }
}
