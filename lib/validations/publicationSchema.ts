import { z } from "zod";

/**
 * Zod schema for creating/editing publications.
 *
 * Mirrors the Prisma `Publication` model fields that are user-editable.
 * `slug` is auto-generated from `title` on the server side unless customized.
 */
export const publicationSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must not exceed 200 characters"),
  author: z
    .string()
    .trim()
    .min(1, "Author is required")
    .max(200, "Author must not exceed 200 characters"),
  price: z
    .number()
    .min(0, "Price cannot be negative"),
  pages: z
    .number()
    .int("Pages must be an integer")
    .min(1, "Pages must be at least 1"),
  language: z
    .string()
    .trim()
    .min(1, "Language is required")
    .max(100, "Language must not exceed 100 characters"),
  isbn: z
    .string()
    .trim()
    .min(1, "ISBN is required")
    .max(100, "ISBN must not exceed 100 characters"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must not exceed 2000 characters"),
  longDescription: z
    .string()
    .trim()
    .min(1, "Long description is required")
    .min(10, "Long description must be at least 10 characters")
    .max(10000, "Long description must not exceed 10000 characters"),
  gradient: z
    .string()
    .trim()
    .max(500, "Gradient must not exceed 500 characters")
    .optional()
    .or(z.literal("")),
  coverImage: z
    .string()
    .trim()
    .url("Cover image must be a valid URL")
    .optional()
    .or(z.literal("")),
  status: z
    .enum(["Draft", "Published"])
    .default("Draft"),
  displayOrder: z
    .number()
    .int("Display order must be an integer")
    .min(0, "Display order must be non-negative")
    .default(0),
});

export type PublicationInput = z.infer<typeof publicationSchema>;
