import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ── GET /api/admin/contact-messages/[id] ────────────────────────────────────

/**
 * Fetch a single contact message by ID.
 * Also marks the message as "Read" if it is currently "New".
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const message = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message not found" },
        { status: 404 }
      );
    }

    // Auto-mark as Read when viewed (if currently New)
    if (message.status === "New") {
      const updated = await prisma.contactMessage.update({
        where: { id },
        data: { status: "Read" },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ success: true, data: message });
  } catch (error) {
    console.error("[Admin Contact Messages] GET by ID error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch message" },
      { status: 500 }
    );
  }
}

// ── PATCH /api/admin/contact-messages/[id] ──────────────────────────────────

/**
 * Update the status of a contact message.
 * Accepts: { status: "New" | "Read" | "Replied" | "Archived" }
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { status } = body;

    const validStatuses = ["New", "Read", "Replied", "Archived"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}.`,
        },
        { status: 400 }
      );
    }

    const existing = await prisma.contactMessage.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Message not found" },
        { status: 404 }
      );
    }

    const message = await prisma.contactMessage.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, data: message });
  } catch (error) {
    console.error("[Admin Contact Messages] PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update message status" },
      { status: 500 }
    );
  }
}

// ── DELETE /api/admin/contact-messages/[id] ─────────────────────────────────

/**
 * Delete a contact message permanently.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.contactMessage.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Message not found" },
        { status: 404 }
      );
    }

    await prisma.contactMessage.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Message deleted" });
  } catch (error) {
    console.error("[Admin Contact Messages] DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
