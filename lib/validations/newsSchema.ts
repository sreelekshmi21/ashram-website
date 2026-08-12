import { z } from "zod";

/**
 * Zod schema for creating/editing news items.
 *
 * Mirrors the Prisma `News` model fields that are user-editable.
 * `slug` is auto-generated from `title` on the server side if changed.
 */
export const newsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must not exceed 200 characters"),
  excerpt: z
    .string()
    .trim()
    .min(1, "Excerpt is required")
    .min(10, "Excerpt must be at least 10 characters")
    .max(1000, "Excerpt must not exceed 1000 characters"),
  content: z
    .string()
    .trim()
    .max(10000, "Content must not exceed 10000 characters")
    .optional()
    .or(z.literal("")),
  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .max(100, "Category must not exceed 100 characters")
    .default("General"),
  coverImage: z
    .string()
    .trim()
    .url("Cover image must be a valid URL")
    .optional()
    .or(z.literal("")),
  date: z
    .string()
    .min(1, "Date is required")
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
  status: z
    .enum(["Draft", "Published"])
    .default("Draft"),
});

export type NewsInput = z.infer<typeof newsSchema>;
