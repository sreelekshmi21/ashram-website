import { NextRequest } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const limited = await applyRateLimit(request, RATE_LIMITS.razorpayVerifyPayment);
  if (limited) return limited;

  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return Response.json(
        { error: "Missing required payment fields" },
        { status: 400 }
      );
    }

    // Verify signature using HMAC SHA256
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      // Signature mismatch — mark any linked payment as failed (if exists)
      await prisma.payment.updateMany({
        where: { gatewayOrderId: razorpay_order_id },
        data: { paymentStatus: "Failed" },
      });

      return Response.json(
        { verified: false, error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Signature verified — check if this order has a linked Payment record
    // (event registrations create Payment rows up front; donations/pushpanjali/shop do not)
    const payment = await prisma.payment.findFirst({
      where: { gatewayOrderId: razorpay_order_id },
    });

    if (payment) {
      // Event-registration flow: update Payment + EventRegistration in a transaction
      const result = await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            gatewayPaymentId: razorpay_payment_id,
            gatewaySignature: razorpay_signature,
            transactionReference: razorpay_payment_id,
            paymentStatus: "Paid",
            paymentDate: new Date(),
          },
        });

        const registration = await tx.eventRegistration.update({
          where: { id: payment.registrationId },
          data: {
            registrationStatus: "Confirmed",
            paymentStatus: "Paid",
          },
          select: {
            registrationNumber: true,
            fullName: true,
            email: true,
          },
        });

        return registration;
      });

      return Response.json({
        verified: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        registrationNumber: result.registrationNumber,
      });
    }

    // Standalone payment (donation, pushpanjali, shop) — signature is valid, no DB records to update
    return Response.json({
      verified: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (error: unknown) {
    console.error("Payment verification error:", error);
    const message =
      error instanceof Error ? error.message : "Verification failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
