"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  deities,
  nakshatras,
  pushpanjaliTypes,
  timeSlots,
} from "@/lib/pushpanjaliData";
import type { RazorpayOptions, RazorpayResponse } from "@/lib/razorpay";
import "@/lib/razorpay"; // side-effect import for global Window type augmentation

// ===== Types =====
interface FamilyMember {
  id: string;
  name: string;
  nakshatra: string;
}

interface BookingData {
  pushpanjaliType: string;
  deity: string;
  preferredDate: string;
  timeSlot: string;
  devoteeName: string;
  email: string;
  phone: string;
  nakshatra: string;
  gothram: string;
  familyMembers: FamilyMember[];
  specialRequests: string;
}

export default function PushpanjaliPage() {
  const [data, setData] = useState<BookingData>({
    pushpanjaliType: "",
    deity: "guru",
    preferredDate: "",
    timeSlot: "",
    devoteeName: "",
    email: "",
    phone: "",
    nakshatra: "",
    gothram: "",
    familyMembers: [],
    specialRequests: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentId, setPaymentId] = useState("");
  const [paymentError, setPaymentError] = useState("");

  // Minimum date is tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  // Selected type details
  const selectedType = pushpanjaliTypes.find(
    (t) => t.id === data.pushpanjaliType
  );

  // Add family member
  function addFamilyMember() {
    setData((prev) => ({
      ...prev,
      familyMembers: [
        ...prev.familyMembers,
        { id: crypto.randomUUID(), name: "", nakshatra: "" },
      ],
    }));
  }

  // Remove family member
  function removeFamilyMember(id: string) {
    setData((prev) => ({
      ...prev,
      familyMembers: prev.familyMembers.filter((m) => m.id !== id),
    }));
  }

  // Update family member
  function updateFamilyMember(
    id: string,
    field: "name" | "nakshatra",
    value: string
  ) {
    setData((prev) => ({
      ...prev,
      familyMembers: prev.familyMembers.map((m) =>
        m.id === id ? { ...m, [field]: value } : m
      ),
    }));
  }

  // Field change handler
  function handleChange(field: keyof BookingData, value: string) {
    setData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setPaymentError("");
  }

  // Validate
  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!data.pushpanjaliType)
      newErrors.pushpanjaliType = "Please select a Pushpanjali type";
    if (!data.deity) newErrors.deity = "Please select a deity";
    if (!data.preferredDate)
      newErrors.preferredDate = "Please select a date";
    if (!data.timeSlot) newErrors.timeSlot = "Please select a time slot";
    if (!data.devoteeName.trim())
      newErrors.devoteeName = "Full name is required";
    if (!data.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!data.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(data.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }
    if (!data.nakshatra) newErrors.nakshatra = "Please select your Nakshatra";

    // Validate family members
    data.familyMembers.forEach((member, index) => {
      if (!member.name.trim()) {
        newErrors[`family_name_${index}`] = "Name is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Open Razorpay Checkout
  async function initiatePayment() {
    if (!selectedType) return;

    try {
      // 1. Create order on the server
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: selectedType.price,
          currency: "INR",
          receipt: `pushpanjali_${Date.now()}`,
          notes: {
            type: selectedType.name,
            deity: deities.find((d) => d.id === data.deity)?.name || "",
            devotee: data.devoteeName,
            date: data.preferredDate,
          },
        }),
      });

      const order = await res.json();

      if (!res.ok) {
        throw new Error(order.error || "Failed to create order");
      }

      // 2. Open Razorpay Checkout popup
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID! || "rzp_test_TEpvXqtkAOulWh",
        amount: order.amount,
        currency: order.currency,
        name: "Santhigiri Ashram",
        description: `${selectedType.name} — ${deities.find((d) => d.id === data.deity)?.name}`,
        order_id: order.id,
        prefill: {
          name: data.devoteeName,
          email: data.email,
          contact: `+91${data.phone}`,
        },
        theme: { color: "#E8913A" }, // saffron
        notes: {
          pushpanjali_type: selectedType.id,
          deity: data.deity,
          preferred_date: data.preferredDate,
          time_slot: data.timeSlot,
        },
        handler: async function (response: RazorpayResponse) {
          // 3. Verify payment on the server
          try {
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.verified) {
              setPaymentId(response.razorpay_payment_id);
              setSubmitted(true);
            } else {
              setPaymentError(
                "Payment verification failed. Please contact support if amount was deducted."
              );
            }
          } catch {
            setPaymentError(
              "Could not verify payment. Please contact support."
            );
          }
          setIsSubmitting(false);
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
            setPaymentError("Payment was cancelled. You can try again.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function () {
        setIsSubmitting(false);
        setPaymentError(
          "Payment failed. Please try again or use a different method."
        );
      });
      rzp.open();
    } catch (error: unknown) {
      setIsSubmitting(false);
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      setPaymentError(message);
    }
  }

  // Submit
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setPaymentError("");
    initiatePayment();
  }

  // ===== Success State =====
  if (submitted) {
    return (
      <div className="min-h-screen bg-ivory">
        {/* Header */}
        <header className="glass sticky top-0 z-50 border-b border-gold-light/30 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/lotus-emblem.jpg"
                alt="Santhigiri Ashram Lotus Emblem"
                width={32}
                height={32}
                className="w-8 h-8 object-contain rounded-full border border-gold-light/20 transition-transform duration-300 group-hover:scale-105"
              />
              <span className="font-heading text-lg font-bold text-forest-dark tracking-wide">
                Santhigiri
              </span>
            </Link>
            <Link
              href="/"
              className="text-sm text-warm-gray hover:text-saffron transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-2xl px-6 py-20 text-center">
          <div className="bg-white rounded-3xl p-10 md:p-14 shadow-xl border border-gold-light/20 animate-fade-in-up">
            {/* Success icon */}
            <div className="w-24 h-24 rounded-full gradient-saffron flex items-center justify-center mx-auto mb-8 shadow-xl shadow-saffron/20">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="font-heading text-3xl font-bold text-forest-dark mb-4">
              Payment Successful! 🌸
            </h1>
            <p className="text-warm-gray text-lg mb-3">
              Your <span className="font-semibold text-saffron">{selectedType?.name}</span> has
              been successfully booked and paid for.
            </p>
            <p className="text-warm-gray text-sm mb-8">
              A confirmation email will be sent to{" "}
              <span className="font-medium text-forest-dark">{data.email}</span> with your
              booking details and e-receipt.
            </p>

            {/* Summary */}
            <div className="bg-cream/60 rounded-2xl p-6 border border-gold-light/20 text-left mb-8">
              <h3 className="font-heading font-bold text-forest-dark text-sm uppercase tracking-wider mb-4 text-center">
                Booking Summary
              </h3>
              <div className="space-y-3 text-sm">
                {paymentId && (
                  <div className="flex justify-between">
                    <span className="text-warm-gray">Payment ID</span>
                    <span className="font-mono font-bold text-green-600 text-xs">
                      {paymentId}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-warm-gray">Booking ID</span>
                  <span className="font-mono font-bold text-forest-dark text-xs">
                    PSH{Date.now().toString(36).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-gray">Type</span>
                  <span className="font-medium text-forest-dark">{selectedType?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-gray">Deity</span>
                  <span className="font-medium text-forest-dark">
                    {deities.find((d) => d.id === data.deity)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-gray">Date</span>
                  <span className="font-medium text-forest-dark">
                    {new Date(data.preferredDate).toLocaleDateString("en-IN", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-gray">Time</span>
                  <span className="font-medium text-forest-dark">
                    {timeSlots.find((t) => t.id === data.timeSlot)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-gray">Devotee</span>
                  <span className="font-medium text-forest-dark">{data.devoteeName}</span>
                </div>
                {data.familyMembers.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-warm-gray">Family Members</span>
                    <span className="font-medium text-forest-dark">
                      {data.familyMembers.length}
                    </span>
                  </div>
                )}
                <div className="border-t border-gold-light/20 my-2" />
                <div className="flex justify-between">
                  <span className="text-warm-gray font-semibold">Amount Paid</span>
                  <span className="font-bold text-saffron text-lg">
                    ₹{selectedType?.price}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 gradient-saffron text-white font-semibold rounded-full shadow-lg shadow-saffron/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                Return Home
              </Link>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setPaymentId("");
                  setPaymentError("");
                  setData({
                    pushpanjaliType: "",
                    deity: "guru",
                    preferredDate: "",
                    timeSlot: "",
                    devoteeName: "",
                    email: "",
                    phone: "",
                    nakshatra: "",
                    gothram: "",
                    familyMembers: [],
                    specialRequests: "",
                  });
                }}
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-saffron/30 text-saffron font-semibold rounded-full hover:bg-saffron/5 transition-all duration-300"
              >
                Book Another
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ===== Main Form =====
  return (
    <div className="min-h-screen bg-ivory">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-gold-light/30 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/lotus-emblem.jpg"
              alt="Santhigiri Ashram Lotus Emblem"
              width={32}
              height={32}
              className="w-8 h-8 object-contain rounded-full border border-gold-light/20 transition-transform duration-300 group-hover:scale-105"
            />
            <span className="font-heading text-lg font-bold text-forest-dark tracking-wide">
              Santhigiri
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm text-warm-gray hover:text-saffron transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative h-[340px] sm:h-[400px] lg:h-[450px] overflow-hidden">
        <Image
          src="/images/home/hero-evening.png"
          alt="Santhigiri Ashram Lotus Parnasala"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-dark/60 via-forest-dark/40 to-forest-dark/80" />

        {/* Decorative overlay */}
        <div className="absolute inset-0 mandala-pattern opacity-30" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-6 max-w-3xl animate-fade-in-up">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="h-px w-10 bg-gold-light/60" />
              <span className="text-gold-light text-xs sm:text-sm tracking-[0.3em] uppercase font-medium">
                Sacred Offering
              </span>
              <span className="h-px w-10 bg-gold-light/60" />
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
              Online{" "}
              <span className="bg-gradient-to-r from-gold-light via-saffron-light to-gold bg-clip-text text-transparent">
                Pushpanjali
              </span>
            </h1>
            <p className="text-white/80 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
              Offer your prayers and flowers to the divine from the comfort of
              your home. Book your sacred Pushpanjali ceremony online.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* About Pushpanjali */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-gold-light/20 mb-10 animate-fade-in">
          <div className="flex flex-col md:flex-row items-start gap-5">
            <div className="w-14 h-14 rounded-xl gradient-saffron flex items-center justify-center text-2xl shrink-0 shadow-md shadow-saffron/20">
              🌸
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-forest-dark mb-3">
                What is Pushpanjali?
              </h2>
              <p className="text-warm-gray leading-relaxed text-sm mb-3">
                <span className="font-semibold text-forest-dark">Pushpanjali</span> (पुष्पांजलि)
                is a sacred Hindu ritual of offering flowers to the deity while
                chanting divine mantras. The word comes from{" "}
                <em>Pushpa</em> (flower) and <em>Anjali</em> (offering with
                joined palms). It is one of the most revered forms of worship,
                symbolizing devotion, gratitude, and surrender to the divine.
              </p>
              <p className="text-warm-gray leading-relaxed text-sm">
                At Santhigiri Ashram, Pushpanjali is performed with sacred
                flowers, traditional Vedic chanting, and deep spiritual
                intention. Devotees can now participate in this divine ceremony
                from anywhere in the world through our online booking service.
                Your prayers will be offered with the same sanctity and devotion
                as an in-person visit.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Error Banner */}
        {paymentError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-red-700 text-sm font-medium">{paymentError}</p>
              <button
                onClick={() => setPaymentError("")}
                className="text-red-500 text-xs mt-1 underline hover:text-red-700"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Booking Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* === Section 1: Pushpanjali Type === */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-gold-light/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg gradient-forest flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  1
                </div>
                <h2 className="font-heading text-xl font-bold text-forest-dark">
                  Select Pushpanjali Type
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {pushpanjaliTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleChange("pushpanjaliType", type.id)}
                    className={`relative rounded-xl p-5 text-left border-2 transition-all duration-300 group ${data.pushpanjaliType === type.id
                      ? "border-saffron bg-saffron/5 shadow-md shadow-saffron/10"
                      : "border-gold-light/30 hover:border-saffron/40 hover:bg-cream/50"
                      }`}
                  >
                    {data.pushpanjaliType === type.id && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full gradient-saffron flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <p className="text-2xl font-heading font-bold text-saffron mb-1">
                      ₹{type.price}
                    </p>
                    <p className="font-heading font-bold text-forest-dark text-sm mb-1">
                      {type.name}
                    </p>
                    <p className="text-warm-gray text-xs leading-relaxed">
                      {type.description}
                    </p>
                  </button>
                ))}
              </div>
              {errors.pushpanjaliType && (
                <p className="text-red-500 text-xs mt-3">{errors.pushpanjaliType}</p>
              )}
            </div>

            {/* === Section 2: Deity & Date === */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-gold-light/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg gradient-forest flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  2
                </div>
                <h2 className="font-heading text-xl font-bold text-forest-dark">
                  Deity & Schedule
                </h2>
              </div>

              {/* Deity selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-forest-dark mb-3">
                  Select Deity <span className="text-saffron">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {deities.map((deity) => (
                    <button
                      key={deity.id}
                      type="button"
                      onClick={() => handleChange("deity", deity.id)}
                      className={`flex items-center gap-3 rounded-xl p-3.5 border-2 transition-all duration-300 text-left ${data.deity === deity.id
                        ? "border-saffron bg-saffron/5"
                        : "border-gold-light/30 hover:border-saffron/40"
                        }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${data.deity === deity.id
                          ? "border-saffron"
                          : "border-gold-light/50"
                          }`}
                      >
                        {data.deity === deity.id && (
                          <div className="w-2 h-2 rounded-full gradient-saffron" />
                        )}
                      </div>
                      <div>
                        <p className="font-heading font-bold text-forest-dark text-sm leading-tight">
                          {deity.name}
                        </p>
                        <p className="text-warm-gray text-xs">{deity.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
                {errors.deity && (
                  <p className="text-red-500 text-xs mt-2">{errors.deity}</p>
                )}
              </div>

              {/* Date and time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="preferred-date"
                    className="block text-sm font-semibold text-forest-dark mb-2"
                  >
                    Preferred Date <span className="text-saffron">*</span>
                  </label>
                  <input
                    id="preferred-date"
                    type="date"
                    min={minDate}
                    value={data.preferredDate}
                    onChange={(e) => handleChange("preferredDate", e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border bg-cream/30 text-forest-dark focus:outline-none focus:ring-2 focus:ring-saffron/20 focus:border-saffron transition-all duration-300 ${errors.preferredDate ? "border-red-400" : "border-gold-light/30"
                      }`}
                  />
                  {errors.preferredDate && (
                    <p className="text-red-500 text-xs mt-1.5">{errors.preferredDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-forest-dark mb-2">
                    Preferred Time <span className="text-saffron">*</span>
                  </label>
                  <select
                    value={data.timeSlot}
                    onChange={(e) => handleChange("timeSlot", e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border bg-cream/30 text-forest-dark focus:outline-none focus:ring-2 focus:ring-saffron/20 focus:border-saffron transition-all duration-300 appearance-none ${errors.timeSlot ? "border-red-400" : "border-gold-light/30"
                      }`}
                  >
                    <option value="">Select a time slot</option>
                    {timeSlots.map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {slot.label} ({slot.period})
                      </option>
                    ))}
                  </select>
                  {errors.timeSlot && (
                    <p className="text-red-500 text-xs mt-1.5">{errors.timeSlot}</p>
                  )}
                </div>
              </div>
            </div>

            {/* === Section 3: Devotee Details === */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-gold-light/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg gradient-forest flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  3
                </div>
                <h2 className="font-heading text-xl font-bold text-forest-dark">
                  Devotee Details
                </h2>
              </div>

              <div className="space-y-5">
                {/* Name and Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="devotee-name" className="block text-sm font-semibold text-forest-dark mb-2">
                      Full Name <span className="text-saffron">*</span>
                    </label>
                    <input
                      id="devotee-name"
                      type="text"
                      value={data.devoteeName}
                      onChange={(e) => handleChange("devoteeName", e.target.value)}
                      placeholder="Enter your full name"
                      className={`w-full px-4 py-3 rounded-xl border bg-cream/30 text-forest-dark placeholder-warm-gray-light focus:outline-none focus:ring-2 focus:ring-saffron/20 focus:border-saffron transition-all duration-300 ${errors.devoteeName ? "border-red-400" : "border-gold-light/30"
                        }`}
                    />
                    {errors.devoteeName && (
                      <p className="text-red-500 text-xs mt-1.5">{errors.devoteeName}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="devotee-email" className="block text-sm font-semibold text-forest-dark mb-2">
                      Email <span className="text-saffron">*</span>
                    </label>
                    <input
                      id="devotee-email"
                      type="email"
                      value={data.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="your@email.com"
                      className={`w-full px-4 py-3 rounded-xl border bg-cream/30 text-forest-dark placeholder-warm-gray-light focus:outline-none focus:ring-2 focus:ring-saffron/20 focus:border-saffron transition-all duration-300 ${errors.email ? "border-red-400" : "border-gold-light/30"
                        }`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Phone and Nakshatra */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="devotee-phone" className="block text-sm font-semibold text-forest-dark mb-2">
                      Phone <span className="text-saffron">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-warm-gray">
                        +91
                      </span>
                      <input
                        id="devotee-phone"
                        type="tel"
                        value={data.phone}
                        onChange={(e) =>
                          handleChange(
                            "phone",
                            e.target.value.replace(/[^0-9]/g, "").slice(0, 10)
                          )
                        }
                        placeholder="9876543210"
                        className={`w-full pl-14 pr-4 py-3 rounded-xl border bg-cream/30 text-forest-dark placeholder-warm-gray-light focus:outline-none focus:ring-2 focus:ring-saffron/20 focus:border-saffron transition-all duration-300 ${errors.phone ? "border-red-400" : "border-gold-light/30"
                          }`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1.5">{errors.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-forest-dark mb-2">
                      Nakshatra (Birth Star) <span className="text-saffron">*</span>
                    </label>
                    <select
                      value={data.nakshatra}
                      onChange={(e) => handleChange("nakshatra", e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border bg-cream/30 text-forest-dark focus:outline-none focus:ring-2 focus:ring-saffron/20 focus:border-saffron transition-all duration-300 appearance-none ${errors.nakshatra ? "border-red-400" : "border-gold-light/30"
                        }`}
                    >
                      <option value="">Select your Nakshatra</option>
                      {nakshatras.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    {errors.nakshatra && (
                      <p className="text-red-500 text-xs mt-1.5">{errors.nakshatra}</p>
                    )}
                  </div>
                </div>

                {/* Gothram */}
                <div>
                  <label htmlFor="gothram" className="block text-sm font-semibold text-forest-dark mb-2">
                    Gothram{" "}
                    <span className="text-warm-gray-light text-xs font-normal">
                      (Optional)
                    </span>
                  </label>
                  <input
                    id="gothram"
                    type="text"
                    value={data.gothram}
                    onChange={(e) => handleChange("gothram", e.target.value)}
                    placeholder="Enter your Gothram"
                    className="w-full px-4 py-3 rounded-xl border border-gold-light/30 bg-cream/30 text-forest-dark placeholder-warm-gray-light focus:outline-none focus:ring-2 focus:ring-saffron/20 focus:border-saffron transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* === Section 4: Family Members === */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-gold-light/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg gradient-forest flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    4
                  </div>
                  <div>
                    <h2 className="font-heading text-xl font-bold text-forest-dark">
                      Family Members
                    </h2>
                    <p className="text-warm-gray text-xs mt-0.5">
                      Add family members to include in the Pushpanjali
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addFamilyMember}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-saffron border border-saffron/30 rounded-lg hover:bg-saffron/5 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add
                </button>
              </div>

              {data.familyMembers.length === 0 ? (
                <div className="text-center py-8 bg-cream/30 rounded-xl border border-dashed border-gold-light/30">
                  <p className="text-warm-gray-light text-sm">
                    No family members added yet.
                  </p>
                  <button
                    type="button"
                    onClick={addFamilyMember}
                    className="mt-3 text-saffron text-sm font-semibold hover:text-saffron-dark transition-colors"
                  >
                    + Add a family member
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.familyMembers.map((member, index) => (
                    <div
                      key={member.id}
                      className="flex flex-col sm:flex-row gap-3 p-4 bg-cream/30 rounded-xl border border-gold-light/20 animate-fade-in"
                    >
                      <div className="flex-1">
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) =>
                            updateFamilyMember(member.id, "name", e.target.value)
                          }
                          placeholder={`Family Member ${index + 1} — Name`}
                          className={`w-full px-4 py-2.5 rounded-lg border bg-white text-forest-dark placeholder-warm-gray-light text-sm focus:outline-none focus:ring-2 focus:ring-saffron/20 focus:border-saffron transition-all ${errors[`family_name_${index}`]
                            ? "border-red-400"
                            : "border-gold-light/30"
                            }`}
                        />
                        {errors[`family_name_${index}`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`family_name_${index}`]}
                          </p>
                        )}
                      </div>
                      <div className="sm:w-48">
                        <select
                          value={member.nakshatra}
                          onChange={(e) =>
                            updateFamilyMember(
                              member.id,
                              "nakshatra",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2.5 rounded-lg border border-gold-light/30 bg-white text-forest-dark text-sm focus:outline-none focus:ring-2 focus:ring-saffron/20 focus:border-saffron transition-all appearance-none"
                        >
                          <option value="">Nakshatra</option>
                          {nakshatras.map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFamilyMember(member.id)}
                        className="self-start sm:self-center p-2 text-warm-gray-light hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                        aria-label={`Remove family member ${index + 1}`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* === Section 5: Special Requests === */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-gold-light/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg gradient-forest flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  5
                </div>
                <h2 className="font-heading text-xl font-bold text-forest-dark">
                  Special Requests
                </h2>
              </div>
              <textarea
                rows={4}
                value={data.specialRequests}
                onChange={(e) => handleChange("specialRequests", e.target.value)}
                placeholder="Any special prayers, intentions, or requests you would like the priests to include..."
                className="w-full px-4 py-3 rounded-xl border border-gold-light/30 bg-cream/30 text-forest-dark placeholder-warm-gray-light focus:outline-none focus:ring-2 focus:ring-saffron/20 focus:border-saffron transition-all duration-300 resize-none text-sm"
              />
            </div>

            {/* === Summary & Submit === */}
            {selectedType && (
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-gold-light/20">
                <h3 className="font-heading font-bold text-forest-dark text-sm uppercase tracking-wider mb-4">
                  Order Summary
                </h3>
                <div className="space-y-2.5 text-sm mb-6">
                  <div className="flex justify-between">
                    <span className="text-warm-gray">{selectedType.name}</span>
                    <span className="font-bold text-forest-dark">
                      ₹{selectedType.price}
                    </span>
                  </div>
                  {data.deity && (
                    <div className="flex justify-between">
                      <span className="text-warm-gray">Deity</span>
                      <span className="text-forest-dark font-medium">
                        {deities.find((d) => d.id === data.deity)?.name}
                      </span>
                    </div>
                  )}
                  {data.familyMembers.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-warm-gray">Family Members</span>
                      <span className="text-forest-dark font-medium">
                        {data.familyMembers.length} included
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gold-light/20 my-3" />
                  <div className="flex justify-between">
                    <span className="font-semibold text-forest-dark">Total</span>
                    <span className="text-2xl font-heading font-bold text-saffron">
                      ₹{selectedType.price}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full group inline-flex items-center justify-center gap-2 px-8 py-4 gradient-saffron text-white font-semibold rounded-xl shadow-lg shadow-saffron/20 hover:shadow-xl hover:shadow-saffron/30 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                        <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Opening Payment...
                    </>
                  ) : (
                    <>
                      Pay & Book Pushpanjali — ₹{selectedType.price}
                      <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </form>

        {/* Trust badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-warm-gray-light text-xs">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Secure Payment via Razorpay
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            E-Receipt Provided
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Authentic Vedic Rituals
          </div>
        </div>
      </main>
    </div>
  );
}
