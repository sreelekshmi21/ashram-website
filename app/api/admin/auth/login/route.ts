import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validations/loginSchema";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { z } from "zod";

export async function POST(request: Request) {
  const limited = await applyRateLimit(request, RATE_LIMITS.adminLogin);
  if (limited) return limited;

  try {
    const body = await request.json();
    const validated = loginSchema.parse(body);

    // Look up the admin user
    const admin = await prisma.adminUser.findUnique({
      where: { email: validated.email.toLowerCase() },
    });

    if (!admin || !admin.isActive) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const passwordValid = await verifyPassword(
      admin.passwordHash,
      validated.password
    );

    if (!passwordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create session
    await createSession(
      {
        userId: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        createdAt: new Date().toISOString(),
      },
      validated.rememberMe
    );

    // Update last login timestamp
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      data: {
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field) {
          fieldErrors[String(field)] = issue.message;
        }
      });

      return NextResponse.json(
        { success: false, error: "Validation failed", fieldErrors },
        { status: 400 }
      );
    }

    console.error("[Admin Login] Error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
