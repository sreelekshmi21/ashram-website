import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validations/contactSchema";
import { z } from "zod";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limited = await applyRateLimit(request, RATE_LIMITS.contact);
  if (limited) return limited;

  try {
    const body = await request.json();

    // Map name to fullName if provided as name
    const payload = {
      fullName: body.fullName || body.name || "",
      email: body.email || "",
      subject: body.subject || "",
      message: body.message || "",
    };

    // Validate with Zod
    const validatedData = contactSchema.parse(payload);

    // Save to PostgreSQL via Prisma ORM (protects against SQL injection)
    const newMessage = await prisma.contactMessage.create({
      data: {
        fullName: validatedData.fullName,
        email: validatedData.email,
        subject: validatedData.subject,
        message: validatedData.message,
        status: "New",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Your message has been submitted successfully. We will get back to you soon.",
        data: { id: newMessage.id },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field) {
          // Map fullName to name if client sent 'name'
          const key = field === "fullName" ? "name" : String(field);
          fieldErrors[key] = issue.message;
        }
      });

      return NextResponse.json(
        {
          success: false,
          message: "Please correct the invalid fields.",
          errors: fieldErrors,
        },
        { status: 400 }
      );
    }

    console.error("Error creating contact message:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}
