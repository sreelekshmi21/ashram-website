"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { events } from "@/lib/constants";

// ===== Types =====
interface RegistrationData {
  // Section 1 - Participant Information
  fullName: string;
  gender: string;
  dateOfBirth: string;
  age: string;
  mobileNumber: string;
  email: string;
  occupation: string;
  organization: string;

  // Section 2 - Address
  addressLine1: string;
  addressLine2: string;
  city: string;
  district: string;
  state: string;
  country: string;
  pinCode: string;

  // Section 3 - Emergency Contact
  emergencyName: string;
  emergencyRelationship: string;
  emergencyMobile: string;

  // Section 4 - Event Preferences
  numberOfParticipants: string;
  preferredLanguage: string;
  accommodationRequired: string;
  foodPreference: string;
  transportationRequired: string;
  arrivalDate: string;
  departureDate: string;

  // Section 5 - Health Information
  medicalConditions: string;
  allergies: string;
  currentMedications: string;
  specialAssistance: string;

  // Section 6 - Donation
  donationAmount: string;
  donationPurpose: string;

  // Section 8 - Consent
  termsAccepted: boolean;
  privacyAccepted: boolean;
  notificationsAccepted: boolean;
}

const INITIAL_DATA: RegistrationData = {
  fullName: "",
  gender: "",
  dateOfBirth: "",
  age: "",
  mobileNumber: "",
  email: "",
  occupation: "",
  organization: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  district: "",
  state: "",
  country: "India",
  pinCode: "",
  emergencyName: "",
  emergencyRelationship: "",
  emergencyMobile: "",
  numberOfParticipants: "1",
  preferredLanguage: "English",
  accommodationRequired: "",
  foodPreference: "",
  transportationRequired: "",
  arrivalDate: "",
  departureDate: "",
  medicalConditions: "",
  allergies: "",
  currentMedications: "",
  specialAssistance: "",
  donationAmount: "",
  donationPurpose: "",
  termsAccepted: false,
  privacyAccepted: false,
  notificationsAccepted: false,
};

const STEPS = [
  { id: 1, label: "Participant", icon: "👤" },
  { id: 2, label: "Address", icon: "📍" },
  { id: 3, label: "Emergency", icon: "🆘" },
  { id: 4, label: "Preferences", icon: "⚙️" },
  { id: 5, label: "Health", icon: "🏥" },
  { id: 6, label: "Donation", icon: "💝" },
  { id: 7, label: "Payment", icon: "💳" },
  { id: 8, label: "Consent", icon: "✅" },
];

export default function RegisterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const event = events.find((e) => e.slug === slug);

  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<RegistrationData>(INITIAL_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  // Compute steps to show — skip Payment (step 7) when event is free
  const hasFee = event ? event.fee > 0 : false;
  const visibleSteps = hasFee ? STEPS : STEPS.filter((s) => s.id !== 7);
  const totalSteps = visibleSteps.length;

  // Map visible index to step id
  const currentStepId = visibleSteps[currentStep - 1]?.id ?? 1;

  // Auto-calculate age from DOB
  useEffect(() => {
    if (data.dateOfBirth) {
      const dob = new Date(data.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      if (age >= 0 && age < 150) {
        setData((prev) => ({ ...prev, age: age.toString() }));
      }
    }
  }, [data.dateOfBirth]);

  // ===== Helpers =====
  function updateField(field: keyof RegistrationData, value: string | boolean) {
    setData((prev) => ({ ...prev, [field]: value }));
    // Clear error for field when user types
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  // ===== Validation =====
  function validateStep(stepId: number): boolean {
    const newErrors: Record<string, string> = {};

    if (stepId === 1) {
      if (!data.fullName.trim()) newErrors.fullName = "Full name is required";
      if (!data.mobileNumber.trim()) newErrors.mobileNumber = "Mobile number is required";
      else if (!/^\+?[\d\s-]{10,15}$/.test(data.mobileNumber.trim()))
        newErrors.mobileNumber = "Enter a valid mobile number";
      if (!data.email.trim()) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))
        newErrors.email = "Enter a valid email address";
    }

    if (stepId === 8) {
      if (!data.termsAccepted)
        newErrors.termsAccepted = "You must accept the Terms & Conditions";
      if (!data.privacyAccepted)
        newErrors.privacyAccepted = "You must accept the Privacy Policy";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleNext() {
    if (validateStep(currentStepId)) {
      setDirection("next");
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handlePrev() {
    setDirection("prev");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSubmit() {
    if (validateStep(currentStepId)) {
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleStepClick(visibleIndex: number) {
    // Only allow going to previous steps
    if (visibleIndex < currentStep) {
      setDirection(visibleIndex < currentStep ? "prev" : "next");
      setCurrentStep(visibleIndex);
    }
  }

  // Not found
  if (!event) {
    return (
      <div className="min-h-screen gradient-warm flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-12 shadow-xl text-center max-w-md">
          <span className="text-6xl mb-4 block">🔍</span>
          <h1 className="font-heading text-2xl font-bold text-forest-dark mb-3">
            Event Not Found
          </h1>
          <p className="text-warm-gray mb-6">
            The event you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/#events"
            className="inline-flex items-center gap-2 px-6 py-3 gradient-saffron text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            ← Back to Events
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen gradient-warm flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-12 shadow-xl text-center max-w-lg animate-fade-in-up">
          <div className="w-20 h-20 rounded-full gradient-saffron flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-heading text-3xl font-bold text-forest-dark mb-3">
            Registration Successful!
          </h1>
          <p className="text-warm-gray text-lg mb-2">
            Thank you for registering for
          </p>
          <p className="font-heading text-xl font-bold text-saffron mb-6">
            {event.title}
          </p>
          <div className="bg-cream rounded-2xl p-6 mb-8 text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-warm-gray text-sm">Name</span>
              <span className="font-semibold text-forest-dark text-sm">{data.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-warm-gray text-sm">Email</span>
              <span className="font-semibold text-forest-dark text-sm">{data.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-warm-gray text-sm">Event Date</span>
              <span className="font-semibold text-forest-dark text-sm">
                {event.day} {event.month}, {event.date.split("-")[0]}
              </span>
            </div>
            {hasFee && (
              <div className="flex justify-between">
                <span className="text-warm-gray text-sm">Fee Paid</span>
                <span className="font-semibold text-saffron text-sm">₹{event.fee.toLocaleString("en-IN")}</span>
              </div>
            )}
          </div>
          <p className="text-warm-gray text-sm mb-6">
            A confirmation email has been sent to <strong>{data.email}</strong>.
          </p>
          <Link
            href="/#events"
            className="inline-flex items-center gap-2 px-8 py-3.5 gradient-saffron text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-saffron/25"
          >
            ← Back to Events
          </Link>
        </div>
      </div>
    );
  }

  // ===== Render helpers =====
  function renderInput(
    label: string,
    field: keyof RegistrationData,
    type: string = "text",
    required: boolean = false,
    placeholder: string = ""
  ) {
    return (
      <div className="space-y-1.5">
        <label htmlFor={field} className="block text-sm font-semibold text-forest-dark">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          id={field}
          type={type}
          value={data[field] as string}
          onChange={(e) => updateField(field, e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 rounded-xl border-2 bg-white text-forest-dark placeholder:text-warm-gray-light/70 transition-all duration-300 focus:outline-none focus:ring-0 focus:border-saffron focus:shadow-[0_0_0_3px_rgba(232,117,26,0.1)] ${
            errors[field] ? "border-red-400 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]" : "border-gold-light/30 hover:border-saffron/40"
          }`}
        />
        {errors[field] && (
          <p className="text-red-500 text-xs font-medium flex items-center gap-1 mt-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            {errors[field]}
          </p>
        )}
      </div>
    );
  }

  function renderSelect(
    label: string,
    field: keyof RegistrationData,
    options: string[],
    required: boolean = false
  ) {
    return (
      <div className="space-y-1.5">
        <label htmlFor={field} className="block text-sm font-semibold text-forest-dark">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <select
          id={field}
          value={data[field] as string}
          onChange={(e) => updateField(field, e.target.value)}
          className={`w-full px-4 py-3 rounded-xl border-2 bg-white text-forest-dark transition-all duration-300 focus:outline-none focus:ring-0 focus:border-saffron focus:shadow-[0_0_0_3px_rgba(232,117,26,0.1)] appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236B5E50%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat ${
            errors[field] ? "border-red-400" : "border-gold-light/30 hover:border-saffron/40"
          }`}
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  }

  function renderTextarea(
    label: string,
    field: keyof RegistrationData,
    placeholder: string = "",
    rows: number = 3
  ) {
    return (
      <div className="space-y-1.5">
        <label htmlFor={field} className="block text-sm font-semibold text-forest-dark">
          {label}
        </label>
        <textarea
          id={field}
          rows={rows}
          value={data[field] as string}
          onChange={(e) => updateField(field, e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 rounded-xl border-2 border-gold-light/30 bg-white text-forest-dark placeholder:text-warm-gray-light/70 transition-all duration-300 focus:outline-none focus:ring-0 focus:border-saffron focus:shadow-[0_0_0_3px_rgba(232,117,26,0.1)] hover:border-saffron/40 resize-none"
        />
      </div>
    );
  }

  // ===== Step renderers =====
  function renderParticipantInfo() {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-saffron flex items-center justify-center text-white text-lg">
            👤
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-forest-dark">
              Participant Information
            </h3>
            <p className="text-warm-gray text-sm">Tell us about yourself</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {renderInput("Full Name", "fullName", "text", true, "Enter your full name")}
          {renderSelect("Gender", "gender", ["Male", "Female", "Other", "Prefer not to say"])}
          {renderInput("Date of Birth", "dateOfBirth", "date")}
          {renderInput("Age", "age", "number", false, "Auto-calculated")}
          {renderInput("Mobile Number", "mobileNumber", "tel", true, "+91 98765 43210")}
          {renderInput("Email Address", "email", "email", true, "your@email.com")}
          {renderInput("Occupation", "occupation", "text", false, "e.g., Teacher, Engineer")}
          {renderInput("Organization", "organization", "text", false, "Optional")}
        </div>
      </div>
    );
  }

  function renderAddress() {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-forest flex items-center justify-center text-white text-lg">
            📍
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-forest-dark">
              Address Details
            </h3>
            <p className="text-warm-gray text-sm">Where should we reach you?</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            {renderInput("Address Line 1", "addressLine1", "text", false, "House/Flat No., Street")}
          </div>
          <div className="md:col-span-2">
            {renderInput("Address Line 2", "addressLine2", "text", false, "Landmark, Area")}
          </div>
          {renderInput("City", "city", "text", false, "City / Town")}
          {renderInput("District", "district", "text", false, "District")}
          {renderSelect("State", "state", [
            "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
            "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
            "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
            "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
            "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
            "Uttar Pradesh", "Uttarakhand", "West Bengal",
            "Delhi", "Jammu & Kashmir", "Ladakh", "Puducherry",
            "Chandigarh", "Andaman & Nicobar Islands", "Dadra & Nagar Haveli and Daman & Diu", "Lakshadweep",
          ])}
          {renderSelect("Country", "country", ["India", "United States", "United Kingdom", "Canada", "Australia", "Other"])}
          {renderInput("PIN Code", "pinCode", "text", false, "6-digit PIN")}
        </div>
      </div>
    );
  }

  function renderEmergencyContact() {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center text-white text-lg">
            🆘
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-forest-dark">
              Emergency Contact
            </h3>
            <p className="text-warm-gray text-sm">
              Someone we can reach in case of emergency
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-amber-800 text-sm">
            Please provide someone who is <strong>not</strong> attending the event and can be reached easily.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {renderInput("Contact Person Name", "emergencyName", "text", false, "Full name of contact")}
          {renderSelect("Relationship", "emergencyRelationship", [
            "Parent", "Spouse", "Sibling", "Child", "Friend", "Relative", "Other",
          ])}
          <div className="md:col-span-2">
            {renderInput("Mobile Number", "emergencyMobile", "tel", false, "+91 98765 43210")}
          </div>
        </div>
      </div>
    );
  }

  function renderEventPreferences() {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center text-white text-lg">
            ⚙️
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-forest-dark">
              Event Preferences
            </h3>
            <p className="text-warm-gray text-sm">Help us plan for your stay</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {renderInput("Number of Participants", "numberOfParticipants", "number", false, "1")}
          {renderSelect("Preferred Language", "preferredLanguage", [
            "English", "Malayalam", "Hindi", "Tamil", "Telugu", "Kannada", "Other",
          ])}
          {renderSelect("Accommodation Required", "accommodationRequired", ["Yes", "No"])}
          {renderSelect("Food Preference", "foodPreference", [
            "Vegetarian", "Vegan", "No Preference",
          ])}
          {renderSelect("Transportation Required", "transportationRequired", ["Yes", "No"])}
          {renderInput("Arrival Date", "arrivalDate", "date")}
          {renderInput("Departure Date", "departureDate", "date")}
        </div>
      </div>
    );
  }

  function renderHealthInfo() {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-white text-lg">
            🏥
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-forest-dark">
              Health Information
            </h3>
            <p className="text-warm-gray text-sm">
              This helps us ensure your safety and comfort
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-blue-800 text-sm">
            All health information is kept <strong>strictly confidential</strong> and used only for event safety purposes.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {renderTextarea("Medical Conditions", "medicalConditions", "e.g., Diabetes, Hypertension, Asthma...")}
          {renderTextarea("Allergies", "allergies", "e.g., Peanuts, Penicillin, Pollen...")}
          {renderTextarea("Current Medications", "currentMedications", "List any medications you are currently taking")}
          {renderTextarea("Special Assistance Required", "specialAssistance", "e.g., Wheelchair access, hearing aid support...")}
        </div>
      </div>
    );
  }

  function renderDonation() {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-saffron-gold flex items-center justify-center text-white text-lg">
            💝
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-forest-dark">
              Donation (Optional)
            </h3>
            <p className="text-warm-gray text-sm">
              Your generosity helps us continue our mission
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-saffron/5 to-gold/5 border border-saffron/10 rounded-2xl p-6">
          <p className="text-warm-gray text-sm leading-relaxed mb-6">
            If you wish to contribute towards the ashram&apos;s charitable activities, you may make
            a voluntary donation. All donations are eligible for tax benefits under Section 80G.
          </p>

          {/* Quick amount buttons */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-forest-dark mb-3">Quick Select</p>
            <div className="flex flex-wrap gap-3">
              {[500, 1000, 2500, 5000, 10000].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => updateField("donationAmount", amount.toString())}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    data.donationAmount === amount.toString()
                      ? "gradient-saffron text-white shadow-lg shadow-saffron/25 scale-105"
                      : "bg-white border-2 border-gold-light/30 text-forest-dark hover:border-saffron/40 hover:shadow-md"
                  }`}
                >
                  ₹{amount.toLocaleString("en-IN")}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {renderInput("Donation Amount (₹)", "donationAmount", "number", false, "Enter amount")}
            {renderSelect("Donation Purpose", "donationPurpose", [
              "General Fund", "Education", "Ayurveda Centre", "Temple Maintenance",
              "Community Kitchen", "Charity Programs", "Infrastructure Development",
            ])}
          </div>
        </div>
      </div>
    );
  }

  function renderPayment() {
    const regFee = event?.fee ?? 0;
    const donationAmt = Number(data.donationAmount) || 0;
    const total = regFee + donationAmt;

    return (
      <div className="space-y-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white text-lg">
            💳
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-forest-dark">
              Payment Summary
            </h3>
            <p className="text-warm-gray text-sm">Review your payment details</p>
          </div>
        </div>

        {/* Payment summary card */}
        <div className="bg-gradient-to-br from-forest-dark to-forest rounded-2xl p-6 text-white">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-white/15">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📅</span>
                <div>
                  <p className="font-semibold">{event?.title}</p>
                  <p className="text-white/60 text-sm">
                    {event?.day} {event?.month}, {event?.date.split("-")[0]}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-white/70">Registration Fee</span>
              <span className="font-semibold">₹{regFee.toLocaleString("en-IN")}</span>
            </div>
            {donationAmt > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Donation</span>
                <span className="font-semibold">₹{donationAmt.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between pt-4 border-t border-white/15">
              <span className="font-semibold text-lg">Total</span>
              <span className="font-heading text-2xl font-bold text-saffron-light">
                ₹{total.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Payment gateway button */}
        <button
          type="button"
          className="w-full py-4 rounded-xl gradient-saffron text-white font-semibold text-lg shadow-lg shadow-saffron/25 hover:opacity-90 transition-all duration-300 hover:shadow-xl hover:shadow-saffron/30 flex items-center justify-center gap-3"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Pay ₹{total.toLocaleString("en-IN")} — Proceed to Payment Gateway
        </button>

        <p className="text-center text-warm-gray text-xs">
          🔒 Payments are secured with 256-bit SSL encryption
        </p>
      </div>
    );
  }

  function renderConsent() {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-forest flex items-center justify-center text-white text-lg">
            ✅
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-forest-dark">
              Consent & Agreement
            </h3>
            <p className="text-warm-gray text-sm">Almost done — please review and agree</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Terms */}
          <label
            htmlFor="termsAccepted"
            className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
              data.termsAccepted
                ? "border-saffron bg-saffron/5 shadow-[0_0_0_3px_rgba(232,117,26,0.08)]"
                : errors.termsAccepted
                ? "border-red-400 bg-red-50"
                : "border-gold-light/30 bg-white hover:border-saffron/40"
            }`}
          >
            <input
              type="checkbox"
              id="termsAccepted"
              checked={data.termsAccepted}
              onChange={(e) => updateField("termsAccepted", e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded border-2 border-gold accent-saffron shrink-0"
            />
            <div>
              <p className="text-sm font-semibold text-forest-dark">
                I agree to the Terms & Conditions
              </p>
              <p className="text-xs text-warm-gray mt-1">
                By checking this box, you agree to abide by the rules and regulations of the ashram during the event.
              </p>
              {errors.termsAccepted && (
                <p className="text-red-500 text-xs mt-1">{errors.termsAccepted}</p>
              )}
            </div>
          </label>

          {/* Privacy */}
          <label
            htmlFor="privacyAccepted"
            className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
              data.privacyAccepted
                ? "border-saffron bg-saffron/5 shadow-[0_0_0_3px_rgba(232,117,26,0.08)]"
                : errors.privacyAccepted
                ? "border-red-400 bg-red-50"
                : "border-gold-light/30 bg-white hover:border-saffron/40"
            }`}
          >
            <input
              type="checkbox"
              id="privacyAccepted"
              checked={data.privacyAccepted}
              onChange={(e) => updateField("privacyAccepted", e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded border-2 border-gold accent-saffron shrink-0"
            />
            <div>
              <p className="text-sm font-semibold text-forest-dark">
                I agree to the Privacy Policy
              </p>
              <p className="text-xs text-warm-gray mt-1">
                Your personal data will be collected and processed in accordance with our privacy policy. We will not share your information with third parties.
              </p>
              {errors.privacyAccepted && (
                <p className="text-red-500 text-xs mt-1">{errors.privacyAccepted}</p>
              )}
            </div>
          </label>

          {/* Notifications */}
          <label
            htmlFor="notificationsAccepted"
            className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
              data.notificationsAccepted
                ? "border-saffron bg-saffron/5 shadow-[0_0_0_3px_rgba(232,117,26,0.08)]"
                : "border-gold-light/30 bg-white hover:border-saffron/40"
            }`}
          >
            <input
              type="checkbox"
              id="notificationsAccepted"
              checked={data.notificationsAccepted}
              onChange={(e) => updateField("notificationsAccepted", e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded border-2 border-gold accent-saffron shrink-0"
            />
            <div>
              <p className="text-sm font-semibold text-forest-dark">
                I agree to receive notifications regarding this event
              </p>
              <p className="text-xs text-warm-gray mt-1">
                Receive important updates, schedule changes, and reminders via email and SMS.
              </p>
            </div>
          </label>
        </div>
      </div>
    );
  }

  // ===== Step content router =====
  function renderStepContent() {
    switch (currentStepId) {
      case 1: return renderParticipantInfo();
      case 2: return renderAddress();
      case 3: return renderEmergencyContact();
      case 4: return renderEventPreferences();
      case 5: return renderHealthInfo();
      case 6: return renderDonation();
      case 7: return renderPayment();
      case 8: return renderConsent();
      default: return null;
    }
  }

  const isLastStep = currentStep === totalSteps;

  return (
    <div className="min-h-screen gradient-warm">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 glass border-b border-gold-light/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            href="/#events"
            className="flex items-center gap-2 text-forest-dark font-semibold text-sm hover:text-saffron transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Events
          </Link>

          <div className="text-right">
            <p className="font-heading text-sm font-bold text-forest-dark truncate max-w-[200px] sm:max-w-none">
              {event.title}
            </p>
            <p className="text-xs text-warm-gray">
              {event.day} {event.month}, {event.date.split("-")[0]}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Page title */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="h-px w-8 bg-saffron" />
            <span className="text-saffron text-xs font-semibold tracking-[0.2em] uppercase">
              Event Registration
            </span>
            <span className="h-px w-8 bg-saffron" />
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-forest-dark">
            Register for {event.title}
          </h1>
        </div>

        {/* ===== Step Progress Indicator ===== */}
        <div className="mb-10">
          {/* Desktop: full stepper */}
          <div className="hidden lg:flex items-center justify-center gap-0">
            {visibleSteps.map((step, idx) => {
              const stepNum = idx + 1;
              const isActive = stepNum === currentStep;
              const isComplete = stepNum < currentStep;
              return (
                <div key={step.id} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => handleStepClick(stepNum)}
                    disabled={stepNum > currentStep}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "gradient-saffron text-white shadow-lg shadow-saffron/20 scale-105"
                        : isComplete
                        ? "bg-forest/10 text-forest-dark hover:bg-forest/20 cursor-pointer"
                        : "bg-white/50 text-warm-gray-light cursor-not-allowed"
                    }`}
                  >
                    <span className="text-base">{isComplete ? "✓" : step.icon}</span>
                    <span className="hidden xl:inline">{step.label}</span>
                  </button>
                  {idx < visibleSteps.length - 1 && (
                    <div
                      className={`w-8 h-0.5 mx-1 transition-colors duration-300 ${
                        stepNum < currentStep ? "bg-forest/30" : "bg-gold-light/30"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile: compact progress */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-forest-dark">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm font-semibold text-saffron">
                {visibleSteps[currentStep - 1]?.icon} {visibleSteps[currentStep - 1]?.label}
              </span>
            </div>
            <div className="w-full h-2 bg-gold-light/20 rounded-full overflow-hidden">
              <div
                className="h-full gradient-saffron rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
            {/* Step dots */}
            <div className="flex justify-between mt-2">
              {visibleSteps.map((step, idx) => {
                const stepNum = idx + 1;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => handleStepClick(stepNum)}
                    disabled={stepNum > currentStep}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${
                      stepNum === currentStep
                        ? "gradient-saffron text-white scale-110 shadow-md shadow-saffron/25"
                        : stepNum < currentStep
                        ? "bg-forest/20 text-forest-dark"
                        : "bg-gold-light/20 text-warm-gray-light"
                    }`}
                  >
                    {stepNum < currentStep ? "✓" : stepNum}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ===== Form Card ===== */}
        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-gold-light/10 overflow-hidden">
          <div
            key={currentStepId}
            className={`p-6 sm:p-8 lg:p-10 ${
              direction === "next" ? "animate-fade-in-left" : "animate-fade-in-right"
            }`}
          >
            {renderStepContent()}
          </div>

          {/* ===== Navigation Buttons ===== */}
          <div className="px-6 sm:px-8 lg:px-10 py-6 bg-ivory/50 border-t border-gold-light/10">
            <div className="flex items-center justify-between gap-4">
              {/* Previous */}
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  currentStep === 1
                    ? "opacity-0 pointer-events-none"
                    : "bg-white border-2 border-gold-light/30 text-forest-dark hover:border-saffron/40 hover:shadow-md"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              {/* Step counter */}
              <span className="text-sm text-warm-gray hidden sm:block">
                {currentStep} / {totalSteps}
              </span>

              {/* Next / Submit */}
              {isLastStep ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl gradient-saffron text-white font-semibold text-sm shadow-lg shadow-saffron/25 hover:opacity-90 hover:shadow-xl hover:shadow-saffron/30 transition-all duration-300"
                >
                  Submit Registration
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl gradient-saffron text-white font-semibold text-sm shadow-lg shadow-saffron/25 hover:opacity-90 hover:shadow-xl hover:shadow-saffron/30 transition-all duration-300"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-warm-gray text-xs mt-8">
          Fields marked with <span className="text-red-500">*</span> are mandatory.
          For assistance, contact us at{" "}
          <a href="mailto:info@santhigiriashram.org" className="text-saffron hover:underline">
            info@santhigiriashram.org
          </a>
        </p>
      </div>
    </div>
  );
}
