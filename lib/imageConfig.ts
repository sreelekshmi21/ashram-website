/**
 * Shared Image Gallery configuration.
 *
 * Safe to import from both client and server code — contains NO secrets.
 * The server re-validates every value here; client checks are for UX only.
 */

export const IMAGE_CATEGORIES = [
  "General",
  "Ashram & Temple",
  "Celebrations & Festivals",
  "Meditation & Yoga",
  "Spiritual Discourses",
  "Community & Service",
  "Historical Moments",
] as const;

export type ImageCategory = (typeof IMAGE_CATEGORIES)[number];

const MB = 1024 * 1024;

export const IMAGE_UPLOAD_RULES = {
  mimeTypes: {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  } as Record<string, string>,
  maxBytes: 15 * MB, // 15 MB max image upload size
  label: "JPEG, PNG, or WebP image",
};

/** Public, same-origin URL that streams media through the app (MinIO remains private). */
export function imageDisplayUrl(id: string, version?: string | number): string {
  return `/api/media/images/${id}${version ? `?v=${encodeURIComponent(String(version))}` : ""}`;
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}
