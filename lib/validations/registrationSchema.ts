import { z } from "zod";

// ===== Step 1 — Participant Information =====
export const participantSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must not exceed 100 characters"),
  gender: z.string().optional().default(""),
  dateOfBirth: z.string().optional().default(""),
  age: z.string().optional().default(""),
  mobileNumber: z
    .string()
    .trim()
    .min(1, "Mobile number is required")
    .regex(/^\+?[\d\s-]{10,15}$/, "Enter a valid mobile number"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  occupation: z.string().optional().default(""),
  organization: z.string().optional().default(""),
});

// ===== Step 2 — Address Details =====
export const addressSchema = z.object({
  addressLine1: z.string().optional().default(""),
  addressLine2: z.string().optional().default(""),
  city: z.string().optional().default(""),
  district: z.string().optional().default(""),
  state: z.string().optional().default(""),
  country: z.string().optional().default("India"),
  pinCode: z
    .string()
    .optional()
    .default("")
    .refine(
      (val) => val === "" || /^\d{6}$/.test(val),
      "PIN code must be exactly 6 digits"
    ),
});

// ===== Step 3 — Emergency Contact =====
export const emergencySchema = z.object({
  emergencyName: z.string().optional().default(""),
  emergencyRelationship: z.string().optional().default(""),
  emergencyMobile: z
    .string()
    .optional()
    .default("")
    .refine(
      (val) => val === "" || /^\+?[\d\s-]{10,15}$/.test(val),
      "Enter a valid mobile number"
    ),
});

// ===== Step 4 — Event Preferences =====
export const preferencesSchema = z.object({
  numberOfParticipants: z.string().optional().default("1"),
  preferredLanguage: z.string().optional().default("English"),
  accommodationRequired: z.string().optional().default(""),
  foodPreference: z.string().optional().default(""),
  transportationRequired: z.string().optional().default(""),
  arrivalDate: z.string().optional().default(""),
  departureDate: z.string().optional().default(""),
});

// ===== Step 5 — Health Information =====
export const healthSchema = z.object({
  medicalConditions: z.string().optional().default(""),
  allergies: z.string().optional().default(""),
  currentMedications: z.string().optional().default(""),
  specialAssistance: z.string().optional().default(""),
});

// ===== Step 6 — Donation =====
export const donationSchema = z.object({
  donationAmount: z
    .string()
    .optional()
    .default("")
    .refine(
      (val) => val === "" || (Number(val) >= 0 && !isNaN(Number(val))),
      "Enter a valid donation amount"
    ),
  donationPurpose: z.string().optional().default(""),
});

// ===== Step 8 — Consent =====
export const consentSchema = z.object({
  termsAccepted: z.literal(true, {
    error: "You must accept the Terms & Conditions",
  }),
  privacyAccepted: z.literal(true, {
    error: "You must accept the Privacy Policy",
  }),
  notificationsAccepted: z.boolean().optional().default(false),
});

// ===== Full Registration Schema (combines all steps) =====
export const fullRegistrationSchema = participantSchema
  .merge(addressSchema)
  .merge(emergencySchema)
  .merge(preferencesSchema)
  .merge(healthSchema)
  .merge(donationSchema)
  .merge(consentSchema);

export type RegistrationInput = z.infer<typeof fullRegistrationSchema>;

// Map step ID to its schema for per-step validation
export const stepSchemas: Record<number, z.ZodType> = {
  1: participantSchema,
  2: addressSchema,
  3: emergencySchema,
  4: preferencesSchema,
  5: healthSchema,
  6: donationSchema,
  // Step 7 (Payment) has no form fields to validate
  8: consentSchema,
};
