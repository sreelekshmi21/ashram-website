import { z } from "zod";

/**
 * Zod schema for creating/editing events.
 *
 * Mirrors the Prisma `Event` model fields that are user-editable.
 * `slug` is auto-generated from `title` on the server side.
 */
export const eventSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .min(3, "Title must be at least 3 characters")
      .max(200, "Title must not exceed 200 characters"),
    description: z
      .string()
      .trim()
      .min(1, "Description is required")
      .min(10, "Description must be at least 10 characters")
      .max(5000, "Description must not exceed 5000 characters"),
    venue: z
      .string()
      .trim()
      .max(300, "Venue must not exceed 300 characters")
      .optional()
      .or(z.literal("")),
    startDate: z
      .string()
      .min(1, "Start date is required")
      .refine((val) => !isNaN(Date.parse(val)), "Invalid start date"),
    endDate: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine(
        (val) => !val || !isNaN(Date.parse(val)),
        "Invalid end date"
      ),
    registrationRequired: z.boolean().default(true),
    registrationFee: z
      .number()
      .min(0, "Registration fee cannot be negative")
      .default(0),
    registrationDeadline: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine(
        (val) => !val || !isNaN(Date.parse(val)),
        "Invalid registration deadline"
      ),
    status: z
      .enum(["Draft", "Published", "Cancelled", "Completed"])
      .default("Draft"),
    category: z
      .enum(["MONTHLY", "YEARLY", "SPECIAL"])
      .default("SPECIAL"),
    coverImage: z
      .string()
      .trim()
      .url("Cover image must be a valid URL")
      .optional()
      .or(z.literal("")),
    gradient: z
      .string()
      .trim()
      .max(500, "Gradient must not exceed 500 characters")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.endDate && data.startDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: "End date must be on or after start date",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      if (data.registrationDeadline && data.startDate) {
        return (
          new Date(data.registrationDeadline) <= new Date(data.startDate)
        );
      }
      return true;
    },
    {
      message: "Registration deadline must be on or before start date",
      path: ["registrationDeadline"],
    }
  );

export type EventInput = z.infer<typeof eventSchema>;

/**
 * Partial schema for updates — all fields optional except at least one must
 * be provided (handled at the API level).
 */
export const eventUpdateSchema = eventSchema;

export type EventUpdateInput = z.infer<typeof eventUpdateSchema>;
