import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ── GET /api/admin/registrations/[id] ───────────────────────────────────────

/**
 * Fetch a single registration with full details, event info, and payments.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const registration = await prisma.eventRegistration.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            venue: true,
            startDate: true,
            endDate: true,
            registrationFee: true,
            status: true,
          },
        },
        payments: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            paymentGateway: true,
            gatewayOrderId: true,
            gatewayPaymentId: true,
            amount: true,
            currency: true,
            paymentStatus: true,
            paymentDate: true,
            createdAt: true,
          },
        },
      },
    });

    if (!registration) {
      return NextResponse.json(
        { success: false, error: "Registration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: registration });
  } catch (error) {
    console.error("[Admin Registrations] GET by ID error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch registration" },
      { status: 500 }
    );
  }
}

// ── PATCH /api/admin/registrations/[id] ─────────────────────────────────────

/**
 * Update the registration status of a registration.
 * Only registrationStatus is updatable; paymentStatus is controlled
 * by the payment flow and is not modified here.
 *
 * Accepts: { registrationStatus: "Pending" | "Confirmed" | "Cancelled" | "Completed" }
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { registrationStatus } = body;

    const validStatuses = ["Pending", "Confirmed", "Cancelled", "Completed"];
    if (!registrationStatus || !validStatuses.includes(registrationStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid registration status. Must be one of: ${validStatuses.join(", ")}.`,
        },
        { status: 400 }
      );
    }

    const existing = await prisma.eventRegistration.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Registration not found" },
        { status: 404 }
      );
    }

    const registration = await prisma.eventRegistration.update({
      where: { id },
      data: { registrationStatus },
    });

    return NextResponse.json({ success: true, data: registration });
  } catch (error) {
    console.error("[Admin Registrations] PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update registration status" },
      { status: 500 }
    );
  }
}
