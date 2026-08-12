import { NextRequest } from "next/server";
import Razorpay from "razorpay";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const limited = await applyRateLimit(request, RATE_LIMITS.razorpayCreateOrder);
  if (limited) return limited;

  try {
    const body = await request.json();
    const { amount, currency = "INR", receipt, notes } = body;

    if (!amount || amount < 1) {
      return Response.json(
        { error: "Amount must be at least ₹1" },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: receipt || `order_${Date.now()}`,
      notes: notes || {},
    });

    return Response.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: unknown) {
    console.error("Razorpay create-order error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create order";
    return Response.json({ error: message }, { status: 500 });
  }
}
