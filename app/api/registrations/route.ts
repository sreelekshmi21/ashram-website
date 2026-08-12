import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fullRegistrationSchema } from "@/lib/validations/registrationSchema";
import { generateRegistrationNumber } from "@/lib/registrationNumber";
import { z } from "zod";
import Razorpay from "razorpay";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limited = await applyRateLimit(request, RATE_LIMITS.registration);
  if (limited) return limited;

  try {
    const body = await request.json();
    const { eventSlug, ...formData } = body;

    if (!eventSlug) {
      return NextResponse.json(
        { success: false, error: "Event slug is required" },
        { status: 400 }
      );
    }

    // Validate form data
    const validated = fullRegistrationSchema.parse(formData);

    // Look up the event
    const event = await prisma.event.findUnique({
      where: { slug: eventSlug },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    if (event.status !== "Published") {
      return NextResponse.json(
        { success: false, error: "Registration is not open for this event" },
        { status: 400 }
      );
    }

    // Check registration deadline
    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      return NextResponse.json(
        { success: false, error: "Registration deadline has passed" },
        { status: 400 }
      );
    }

    const registrationFee = Number(event.registrationFee);
    const donationAmount = validated.donationAmount
      ? Number(validated.donationAmount)
      : 0;
    const totalAmount = registrationFee + donationAmount;
    const isFreeEvent = totalAmount <= 0;

    // Create registration inside a transaction
    const result = await prisma.$transaction(async (tx) => {
      const registrationNumber = await generateRegistrationNumber(tx);

      const registration = await tx.eventRegistration.create({
        data: {
          registrationNumber,
          eventId: event.id,

          // Participant
          fullName: validated.fullName,
          gender: validated.gender || null,
          dateOfBirth: validated.dateOfBirth
            ? new Date(validated.dateOfBirth)
            : null,
          age: validated.age ? parseInt(validated.age, 10) : null,
          mobileNumber: validated.mobileNumber,
          email: validated.email,
          occupation: validated.occupation || null,
          organisation: validated.organization || null,

          // Address
          addressLine1: validated.addressLine1 || null,
          addressLine2: validated.addressLine2 || null,
          city: validated.city || null,
          district: validated.district || null,
          state: validated.state || null,
          country: validated.country || "India",
          pinCode: validated.pinCode || null,

          // Emergency Contact
          emergencyContactName: validated.emergencyName || null,
          emergencyRelationship: validated.emergencyRelationship || null,
          emergencyMobileNumber: validated.emergencyMobile || null,

          // Event Preferences
          numberOfParticipants: validated.numberOfParticipants
            ? parseInt(validated.numberOfParticipants, 10)
            : 1,
          preferredLanguage: validated.preferredLanguage || "English",
          accommodationRequired: validated.accommodationRequired === "Yes",
          foodPreference: validated.foodPreference || null,
          transportationRequired: validated.transportationRequired === "Yes",
          arrivalDate: validated.arrivalDate
            ? new Date(validated.arrivalDate)
            : null,
          departureDate: validated.departureDate
            ? new Date(validated.departureDate)
            : null,

          // Health Information
          medicalCondition: validated.medicalConditions || null,
          allergies: validated.allergies || null,
          currentMedication: validated.currentMedications || null,
          specialAssistance: validated.specialAssistance || null,

          // Donation
          donationAmount: donationAmount > 0 ? donationAmount : null,
          donationPurpose: validated.donationPurpose || null,

          // Status
          registrationStatus: isFreeEvent ? "Confirmed" : "Pending",
          paymentStatus: isFreeEvent ? "Paid" : "Pending",
        },
      });

      // If paid event, create Razorpay order and Payment record
      let razorpayOrderId: string | null = null;

      if (!isFreeEvent) {
        const razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID!,
          key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });

        const order = await razorpay.orders.create({
          amount: Math.round(totalAmount * 100), // paise
          currency: "INR",
          receipt: registration.registrationNumber,
          notes: {
            registrationId: registration.id,
            eventTitle: event.title,
            participantName: validated.fullName,
          },
        });

        razorpayOrderId = order.id;

        await tx.payment.create({
          data: {
            registrationId: registration.id,
            paymentGateway: "razorpay",
            gatewayOrderId: order.id,
            amount: totalAmount,
            currency: "INR",
            paymentStatus: "Pending",
          },
        });
      }

      return {
        registrationId: registration.id,
        registrationNumber: registration.registrationNumber,
        razorpayOrderId,
        totalAmount,
        isFreeEvent,
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 201 }
    );
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
        {
          success: false,
          error: "Validation failed",
          fieldErrors,
        },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create registration",
      },
      { status: 500 }
    );
  }
}
