import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/dashboard
 *
 * Returns aggregated summary statistics and recent records for the
 * admin dashboard. Protected by the proxy (proxy.ts) which verifies
 * the admin session before reaching this handler.
 */
export async function GET() {
  try {
    const now = new Date();

    // ── Summary counts (parallel) ─────────────────────────────────────────
    const [
      totalEvents,
      publishedEvents,
      upcomingEvents,
      totalRegistrations,
      totalContactMessages,
      newContactMessages,
      successfulPayments,
      totalDonationAgg,
      totalPaymentAgg,
    ] = await Promise.all([
      prisma.event.count(),
      prisma.event.count({ where: { status: "Published" } }),
      prisma.event.count({
        where: { status: "Published", startDate: { gte: now } },
      }),
      prisma.eventRegistration.count(),
      prisma.contactMessage.count(),
      prisma.contactMessage.count({ where: { status: "New" } }),
      prisma.payment.count({ where: { paymentStatus: "Paid" } }),
      prisma.eventRegistration.aggregate({
        _sum: { donationAmount: true },
        where: { donationAmount: { not: null } },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { paymentStatus: "Paid" },
      }),
    ]);

    // ── Recent records (parallel) ─────────────────────────────────────────
    const [recentRegistrations, recentMessages, recentPayments] =
      await Promise.all([
        prisma.eventRegistration.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            registrationNumber: true,
            fullName: true,
            email: true,
            registrationStatus: true,
            paymentStatus: true,
            createdAt: true,
            event: { select: { title: true } },
          },
        }),
        prisma.contactMessage.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            fullName: true,
            email: true,
            subject: true,
            status: true,
            createdAt: true,
          },
        }),
        prisma.payment.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            amount: true,
            currency: true,
            paymentStatus: true,
            paymentDate: true,
            createdAt: true,
            registration: {
              select: {
                fullName: true,
                registrationNumber: true,
                event: { select: { title: true } },
              },
            },
          },
        }),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalEvents,
          publishedEvents,
          upcomingEvents,
          totalRegistrations,
          totalContactMessages,
          newContactMessages,
          successfulPayments,
          totalDonationAmount: totalDonationAgg._sum.donationAmount
            ? Number(totalDonationAgg._sum.donationAmount)
            : 0,
          totalPaymentAmount: totalPaymentAgg._sum.amount
            ? Number(totalPaymentAgg._sum.amount)
            : 0,
        },
        recentRegistrations,
        recentMessages,
        recentPayments,
      },
    });
  } catch (error) {
    console.error("[Admin Dashboard] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
