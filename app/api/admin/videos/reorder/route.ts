import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/adminGuard";
import { reorderSchema } from "@/lib/validations/videoSchema";
import { revalidateTag } from "next/cache";

export async function PATCH(request: Request) {
  const guard = await requireAdminSession();
  if (guard.response) return guard.response;

  try {
    const body = await request.json();
    const parsed = reorderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { items } = parsed.data;

    await prisma.$transaction(
      items.map((item) =>
        prisma.video.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        })
      )
    );

    try {
      revalidateTag("videos", "content");
      revalidateTag("homepage", "content");
    } catch (e) {
      console.warn("[Admin Video Reorder] Cache invalidation warning:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Display orders updated successfully",
    });
  } catch (error) {
    console.error("[Admin Video Reorder] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update display orders" },
      { status: 500 }
    );
  }
}

