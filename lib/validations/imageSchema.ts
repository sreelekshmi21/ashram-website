import { z } from "zod";
import { IMAGE_CATEGORIES } from "@/lib/imageConfig";

const PENDING_IMAGE_KEY_REGEX =
  /^pending\/images\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/;

export const pendingImageKeySchema = z
  .string()
  .regex(PENDING_IMAGE_KEY_REGEX, "Invalid image upload reference");

const baseImageFields = {
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must not exceed 200 characters"),
  description: z
    .string()
    .trim()
    .max(5000, "Description must not exceed 5000 characters")
    .optional()
    .or(z.literal("")),
  category: z.enum(IMAGE_CATEGORIES, { message: "Please select a valid category" }),
  status: z.enum(["Draft", "Published"]).default("Draft"),
  isActive: z.boolean().default(true),
  displayOrder: z
    .number()
    .int("Display order must be an integer")
    .min(0, "Display order must be non-negative")
    .max(100000, "Display order is too large")
    .default(0),
};

/** POST /api/admin/gallery — creating a single image record */
export const createImageSchema = z.object({
  ...baseImageFields,
  imageUploadKey: pendingImageKeySchema,
  width: z.number().int().positive().optional().nullable(),
  height: z.number().int().positive().optional().nullable(),
});

/** POST /api/admin/gallery/batch — creating multiple image records */
export const batchCreateImageSchema = z.object({
  images: z
    .array(
      z.object({
        title: z.string().trim().min(1, "Title is required").max(200),
        description: z.string().trim().max(5000).optional().or(z.literal("")),
        category: z.enum(IMAGE_CATEGORIES),
        status: z.enum(["Draft", "Published"]).default("Published"),
        displayOrder: z.number().int().min(0).default(0),
        imageUploadKey: pendingImageKeySchema,
        width: z.number().int().positive().optional().nullable(),
        height: z.number().int().positive().optional().nullable(),
      })
    )
    .min(1, "At least one image is required")
    .max(50, "Maximum 50 images per batch upload"),
});

/** PUT /api/admin/gallery/[id] */
export const updateImageSchema = z.object({
  ...baseImageFields,
  imageUploadKey: pendingImageKeySchema.optional().nullable(),
  width: z.number().int().positive().optional().nullable(),
  height: z.number().int().positive().optional().nullable(),
});

/** POST /api/admin/gallery/upload-url */
export const imageUploadUrlSchema = z.object({
  contentType: z.string().trim().min(1).max(100),
  size: z.number().int().positive(),
  fileName: z.string().trim().max(255).optional(),
});

export type CreateImageInput = z.infer<typeof createImageSchema>;
export type UpdateImageInput = z.infer<typeof updateImageSchema>;
export type BatchCreateImageInput = z.infer<typeof batchCreateImageSchema>;

