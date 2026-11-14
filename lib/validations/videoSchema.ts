import { z } from "zod";
import { VIDEO_CATEGORIES } from "@/lib/videoConfig";

/**
 * Zod schemas for the Video Gallery admin APIs.
 *
 * Object keys submitted by the client are only accepted if they point to the
 * server-generated "pending upload" prefix; the server then verifies the real
 * object (size + magic bytes) in MinIO before it is attached to a record.
 */

const PENDING_KEY_REGEX =
  /^pending\/(videos|video-thumbnails)\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(mp4|webm|jpg|png|webp)$/;

export const pendingKeySchema = z
  .string()
  .regex(PENDING_KEY_REGEX, "Invalid upload reference");

const baseFields = {
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must not exceed 200 characters"),
  description: z
    .string()
    .trim()
    .max(5000, "Description must not exceed 5000 characters")
    .optional()
    .or(z.literal("")),
  category: z.enum(VIDEO_CATEGORIES, { message: "Please select a valid category" }),
  status: z.enum(["Draft", "Published"]).default("Draft"),
  displayOrder: z
    .number()
    .int("Display order must be an integer")
    .min(0, "Display order must be non-negative")
    .max(100000, "Display order is too large")
    .default(0),
  durationSeconds: z
    .number()
    .int()
    .min(0)
    .max(24 * 3600)
    .nullable()
    .optional(),
};

/** POST /api/admin/videos — video file is required, thumbnail optional. */
export const createVideoSchema = z.object({
  ...baseFields,
  videoUploadKey: pendingKeySchema,
  thumbnailUploadKey: pendingKeySchema.optional().nullable(),
});

/** PUT /api/admin/videos/[id] — replacements are optional. */
export const updateVideoSchema = z.object({
  ...baseFields,
  videoUploadKey: pendingKeySchema.optional().nullable(),
  thumbnailUploadKey: pendingKeySchema.optional().nullable(),
  removeThumbnail: z.boolean().optional(),
});

/** POST /api/admin/videos/upload-url */
export const uploadUrlSchema = z.object({
  kind: z.enum(["video", "thumbnail"]),
  contentType: z.string().trim().min(1).max(100),
  size: z.number().int().positive(),
  fileName: z.string().trim().max(255).optional(),
});

/** PATCH /api/admin/videos/reorder */
export const reorderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().uuid(),
        displayOrder: z.number().int().min(0).max(100000),
      })
    )
    .min(1)
    .max(200),
});

export type CreateVideoInput = z.infer<typeof createVideoSchema>;
export type UpdateVideoInput = z.infer<typeof updateVideoSchema>;

