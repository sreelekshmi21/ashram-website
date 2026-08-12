"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { numberToWords } from "@/lib/numberToWords";
import type { RazorpayOptions, RazorpayResponse } from "@/lib/razorpay";
import "@/lib/razorpay"; // side-effect import for global Window type augmentation

// ===== Types =====
interface DonationData {
  amount: number;
  customAmount: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  panNumber: string;
}

const PRESET_AMOUNTS = [500, 1000, 2000, 5000];

const STEPS = [
  { id: 1, label: "Donation", icon: "💰" },
  { id: 2, label: "Personal Info", icon: "👤" },
  { id: 3, label: "Finish", icon: "✅" },
];

export default function DonatePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentId, setPaymentId] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [data, setData] = useState<DonationData>({
    amount: 0,
    customAmount: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    panNumber: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Derived selected amount
  const selectedAmount =
    data.amount > 0 ? data.amount : Number(data.customAmount) || 0;

  // ===== Validation =====
  function validateStep(step: number): boolean {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (selectedAmount <= 0) {
        newErrors.amount = "Please select or enter a donation amount";
      } else if (selectedAmount < 10) {
        newErrors.amount = "Minimum donation is ₹10";
      }
    }

    if (step === 2) {
      if (!data.fullName.trim()) newErrors.fullName = "Full name is required";
      if (!data.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        newErrors.email = "Please enter a valid email";
      }
      if (!data.phone.trim()) {
        newErrors.phone = "Phone number is required";
      } else if (!/^[6-9]\d{9}$/.test(data.phone.replace(/\s/g, ""))) {
        newErrors.phone = "Please enter a valid 10-digit Indian phone number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Open Razorpay Checkout
  async function initiatePayment() {
    try {
      // 1. Create order on the server
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: selectedAmount,
          currency: "INR",
          receipt: `donation_${Date.now()}`,
          notes: {
            donor: data.fullName,
            email: data.email,
            pan: data.panNumber || "N/A",
          },
        }),
      });

      const order = await res.json();

      if (!res.ok) {
        throw new Error(order.error || "Failed to create order");
      }

      // 2. Open Razorpay Checkout popup
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: order.amount,
        currency: order.currency,
        name: "Santhigiri Ashram",
        description: `Donation of ₹${selectedAmount.toLocaleString("en-IN")}`,
        order_id: order.id,
        prefill: {
          name: data.fullName,
          email: data.email,
          contact: `+91${data.phone}`,
        },
        theme: { color: "#E8913A" },
        notes: {
          donor_name: data.fullName,
          pan: data.panNumber || "",
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
              setCurrentStep(3);
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
          setIsProcessing(false);
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setPaymentError("Payment was cancelled. You can try again.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function () {
        setIsProcessing(false);
        setPaymentError(
          "Payment failed. Please try again or use a different method."
        );
      });
      rzp.open();
    } catch (error: unknown) {
      setIsProcessing(false);
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      setPaymentError(message);
    }
  }

  function handleContinue() {
    if (currentStep === 2) {
      // On step 2, validate then open Razorpay
      if (validateStep(currentStep)) {
        setIsProcessing(true);
        setPaymentError("");
        initiatePayment();
      }
    } else if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  }

  function handleBack() {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setPaymentError("");
  }

  function handleAmountSelect(amount: number) {
    setData((prev) => ({ ...prev, amount, customAmount: "" }));
    setErrors((prev) => ({ ...prev, amount: "" }));
  }

  function handleCustomAmount(value: string) {
    // Allow only digits
    const sanitized = value.replace(/[^0-9]/g, "");
    setData((prev) => ({ ...prev, customAmount: sanitized, amount: 0 }));
    setErrors((prev) => ({ ...prev, amount: "" }));
  }

  function handleChange(field: keyof DonationData, value: string) {
    setData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setPaymentError("");
  }

  return (
    <div className="min-h-screen bg-ivory">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-gold-light/30 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            aria-label="Santhigiri Ashram — Home"
          >
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
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* Page title */}
        <div className="text-center mb-10">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-forest-dark mb-3">
            Make a <span className="text-gradient-saffron">Donation</span>
          </h1>
          <p className="text-warm-gray text-lg max-w-xl mx-auto">
            Your generosity supports spiritual programs, healthcare, education,
            and community service.
          </p>
        </div>

        {/* Step indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            {/* Progress line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gold-light/40" aria-hidden="true" />
            <div
              className="absolute top-5 left-0 h-0.5 gradient-saffron transition-all duration-500 ease-out"
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
              aria-hidden="true"
            />

            {STEPS.map((step) => (
              <div key={step.id} className="relative flex flex-col items-center z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                    step.id < currentStep
                      ? "gradient-saffron text-white border-saffron shadow-md shadow-saffron/20"
                      : step.id === currentStep
                      ? "bg-white text-saffron border-saffron shadow-md shadow-saffron/20"
                      : "bg-white text-warm-gray-light border-gold-light/40"
                  }`}
                >
                  {step.id < currentStep ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span>{step.icon}</span>
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-semibold tracking-wide transition-colors duration-300 ${
                    step.id <= currentStep ? "text-forest-dark" : "text-warm-gray-light"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
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

        {/* Step content card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gold-light/20 overflow-hidden">
          {/* Step 1: Donation Amount */}
          {currentStep === 1 && (
            <div className="p-6 md:p-10 animate-fade-in">
              <h2 className="font-heading text-2xl font-bold text-forest-dark mb-2">
                Choose Your Contribution
              </h2>
              <p className="text-warm-gray text-sm mb-8">
                Select a preset amount or enter a custom donation.
              </p>

              {/* Preset amount cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {PRESET_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleAmountSelect(amount)}
                    className={`relative rounded-xl p-5 text-center border-2 transition-all duration-300 group ${
                      data.amount === amount
                        ? "border-saffron bg-saffron/5 shadow-md shadow-saffron/10"
                        : "border-gold-light/30 bg-cream/30 hover:border-saffron/50 hover:bg-cream"
                    }`}
                  >
                    {/* Selected indicator */}
                    {data.amount === amount && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full gradient-saffron flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <p
                      className={`text-2xl font-heading font-bold transition-colors duration-300 ${
                        data.amount === amount ? "text-saffron" : "text-forest-dark group-hover:text-saffron"
                      }`}
                    >
                      ₹{amount.toLocaleString("en-IN")}
                    </p>
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div className="mb-6">
                <label
                  htmlFor="custom-amount"
                  className="block text-sm font-semibold text-forest-dark mb-2"
                >
                  Or enter a custom amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-saffron">
                    ₹
                  </span>
                  <input
                    id="custom-amount"
                    type="text"
                    inputMode="numeric"
                    value={data.customAmount}
                    onChange={(e) => handleCustomAmount(e.target.value)}
                    placeholder="Enter amount"
                    className={`w-full pl-10 pr-4 py-3.5 rounded-xl border-2 bg-cream/30 text-forest-dark text-lg font-semibold placeholder-warm-gray-light focus:outline-none transition-all duration-300 ${
                      data.customAmount
                        ? "border-saffron focus:ring-2 focus:ring-saffron/20"
                        : "border-gold-light/30 focus:border-saffron focus:ring-2 focus:ring-saffron/20"
                    }`}
                  />
                </div>
              </div>

              {/* Amount in words */}
              {selectedAmount > 0 && (
                <div className="bg-cream/60 rounded-xl p-4 border border-gold-light/20 mb-6 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg gradient-saffron flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-warm-gray uppercase tracking-wider mb-1">
                        Contribution Amount
                      </p>
                      <p className="text-forest-dark font-heading text-lg font-bold">
                        ₹{selectedAmount.toLocaleString("en-IN")}
                      </p>
                      <p className="text-saffron-dark text-sm font-medium italic mt-0.5">
                        {numberToWords(selectedAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {errors.amount && (
                <p className="text-red-500 text-sm mb-4 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.amount}
                </p>
              )}
            </div>
          )}

          {/* Step 2: Personal Info */}
          {currentStep === 2 && (
            <div className="p-6 md:p-10 animate-fade-in">
              <h2 className="font-heading text-2xl font-bold text-forest-dark mb-2">
                Personal Information
              </h2>
              <p className="text-warm-gray text-sm mb-8">
                Please provide your details for the donation receipt. You&apos;ll pay{" "}
                <span className="font-bold text-saffron">
                  ₹{selectedAmount.toLocaleString("en-IN")}
                </span>{" "}
                via Razorpay after filling in your details.
              </p>

              <div className="space-y-5">
                {/* Full Name */}
                <div>
                  <label htmlFor="full-name" className="block text-sm font-semibold text-forest-dark mb-2">
                    Full Name <span className="text-saffron">*</span>
                  </label>
                  <input
                    id="full-name"
                    type="text"
                    value={data.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-3 rounded-xl border bg-cream/30 text-forest-dark placeholder-warm-gray-light focus:outline-none focus:ring-2 focus:ring-saffron/20 focus:border-saffron transition-all duration-300 ${
                      errors.fullName ? "border-red-400" : "border-gold-light/30"
                    }`}
                  />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1.5">{errors.fullName}</p>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-forest-dark mb-2">
                    Email Address <span className="text-saffron">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="your@email.com"
                    className={`w-full px-4 py-3 rounded-xl border bg-cream/30 text-forest-dark placeholder-warm-gray-light focus:outline-none focus:ring-2 focus:ring-saffron/20 focus:border-saffron transition-all duration-300 ${
                      errors.email ? "border-red-400" : "border-gold-light/30"
                    }`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-forest-dark mb-2">
                    Phone Number <span className="text-saffron">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-warm-gray">
                      +91
                    </span>
                    <input
                      id="phone"
                      type="tel"
                      value={data.phone}
                      onChange={(e) => handleChange("phone", e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                      placeholder="9876543210"
                      className={`w-full pl-14 pr-4 py-3 rounded-xl border bg-cream/30 text-forest-dark placeholder-warm-gray-light focus:outline-none focus:ring-2 focus:ring-saffron/20 focus:border-saffron transition-all duration-300 ${
                        errors.phone ? "border-red-400" : "border-gold-light/30"
                      }`}
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1.5">{errors.phone}</p>}
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-semibold text-forest-dark mb-2">
                    Address <span className="text-warm-gray-light text-xs font-normal">(Optional)</span>
                  </label>
                  <textarea
                    id="address"
                    rows={3}
                    value={data.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="Your address"
                    className="w-full px-4 py-3 rounded-xl border border-gold-light/30 bg-cream/30 text-forest-dark placeholder-warm-gray-light focus:outline-none focus:ring-2 focus:ring-saffron/20 focus:border-saffron transition-all duration-300 resize-none"
                  />
                </div>

                {/* PAN Number */}
                <div>
                  <label htmlFor="pan" className="block text-sm font-semibold text-forest-dark mb-2">
                    PAN Number <span className="text-warm-gray-light text-xs font-normal">(For tax receipt, optional)</span>
                  </label>
                  <input
                    id="pan"
                    type="text"
                    value={data.panNumber}
                    onChange={(e) => handleChange("panNumber", e.target.value.toUpperCase().slice(0, 10))}
                    placeholder="ABCDE1234F"
                    className="w-full px-4 py-3 rounded-xl border border-gold-light/30 bg-cream/30 text-forest-dark placeholder-warm-gray-light focus:outline-none focus:ring-2 focus:ring-saffron/20 focus:border-saffron transition-all duration-300"
                  />
                </div>
              </div>

              {/* Summary card */}
              <div className="mt-8 bg-cream/60 rounded-xl p-5 border border-gold-light/20">
                <h3 className="font-heading font-bold text-forest-dark text-sm mb-3 uppercase tracking-wider">
                  Donation Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-warm-gray">Amount</span>
                    <span className="font-bold text-forest-dark">
                      ₹{selectedAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  {data.fullName && (
                    <div className="flex justify-between">
                      <span className="text-warm-gray">Donor</span>
                      <span className="font-medium text-forest-dark">{data.fullName}</span>
                    </div>
                  )}
                  {data.email && (
                    <div className="flex justify-between">
                      <span className="text-warm-gray">Email</span>
                      <span className="font-medium text-forest-dark">{data.email}</span>
                    </div>
                  )}
                  <div className="border-t border-gold-light/20 my-2" />
                  <div className="flex justify-between">
                    <span className="text-warm-gray font-semibold">In Words</span>
                    <span className="font-medium text-saffron italic text-xs text-right max-w-[200px]">
                      {numberToWords(selectedAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Finish */}
          {currentStep === 3 && (
            <div className="p-6 md:p-10 text-center animate-fade-in">
              {/* Success animation */}
              <div className="w-24 h-24 rounded-full gradient-saffron flex items-center justify-center mx-auto mb-6 shadow-xl shadow-saffron/20 animate-fade-in-up">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h2 className="font-heading text-3xl font-bold text-forest-dark mb-3">
                Thank You! 🙏
              </h2>
              <p className="text-warm-gray text-lg mb-2 max-w-md mx-auto">
                Your generous donation of{" "}
                <span className="font-bold text-saffron">
                  ₹{selectedAmount.toLocaleString("en-IN")}
                </span>{" "}
                has been received.
              </p>
              <p className="text-warm-gray text-sm mb-8 max-w-md mx-auto">
                A confirmation receipt will be sent to{" "}
                <span className="font-medium text-forest-dark">{data.email}</span>.
                May divine blessings be upon you and your family.
              </p>

              {/* Transaction details */}
              <div className="bg-cream/60 rounded-xl p-6 border border-gold-light/20 max-w-md mx-auto mb-8 text-left">
                <h3 className="font-heading font-bold text-forest-dark text-sm mb-4 uppercase tracking-wider text-center">
                  Transaction Details
                </h3>
                <div className="space-y-2.5 text-sm">
                  {paymentId && (
                    <div className="flex justify-between">
                      <span className="text-warm-gray">Payment ID</span>
                      <span className="font-mono font-bold text-green-600 text-xs">
                        {paymentId}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-warm-gray">Amount</span>
                    <span className="font-bold text-saffron">
                      ₹{selectedAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-warm-gray">Donor</span>
                    <span className="font-medium text-forest-dark">{data.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-warm-gray">Payment</span>
                    <span className="font-medium text-forest-dark">
                      Razorpay
                    </span>
                  </div>
                  <div className="border-t border-gold-light/20 my-2" />
                  <div className="flex justify-between">
                    <span className="text-warm-gray">In Words</span>
                    <span className="font-medium text-saffron-dark italic text-xs text-right max-w-[200px]">
                      {numberToWords(selectedAmount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 gradient-saffron text-white font-semibold rounded-full shadow-lg shadow-saffron/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Return Home
                </Link>
                <button
                  onClick={() => {
                    setCurrentStep(1);
                    setPaymentId("");
                    setPaymentError("");
                    setData({
                      amount: 0, customAmount: "", fullName: "", email: "",
                      phone: "", address: "", panNumber: "",
                    });
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-saffron/30 text-saffron font-semibold rounded-full hover:bg-saffron/5 transition-all duration-300"
                >
                  Donate Again
                </button>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          {currentStep < 3 && (
            <div className="px-6 md:px-10 pb-6 md:pb-10 flex items-center justify-between gap-4">
              {currentStep > 1 ? (
                <button
                  onClick={handleBack}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-5 py-2.5 text-warm-gray font-medium rounded-xl hover:bg-cream transition-colors duration-200 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={handleContinue}
                disabled={isProcessing}
                className="group flex items-center gap-2 px-8 py-3 gradient-saffron text-white font-semibold rounded-full shadow-lg shadow-saffron/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isProcessing ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                      <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Opening Payment...
                  </>
                ) : currentStep === 2 ? (
                  <>
                    Confirm & Pay ₹{selectedAmount.toLocaleString("en-IN")}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </>
                ) : (
                  <>
                    Continue
                    <svg
                      className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Trust badges */}
        <div className="mt-8 flex items-center justify-center gap-6 text-warm-gray-light text-xs">
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
            Tax Deductible
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            80G Certificate
          </div>
        </div>
      </main>
    </div>
  );
}
