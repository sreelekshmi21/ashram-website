/**
 * Shared Video Gallery configuration.
 *
 * Safe to import from both client and server code — contains NO secrets.
 * The server re-validates every value here; client checks are for UX only.
 */

export const VIDEO_CATEGORIES = [
  "Spiritual Discourses",
  "Meditation",
  "Documentaries",
  "Events & Celebrations",
  "Ayurveda & Health",
  "Bhajans & Music",
  "Other",
] as const;

export type VideoCategory = (typeof VIDEO_CATEGORIES)[number];

export type UploadKind = "video" | "thumbnail";

export interface UploadRule {
  /** Allowed MIME types → canonical file extension */
  mimeTypes: Record<string, string>;
  /** Maximum size in bytes */
  maxBytes: number;
  /** Human readable label for messages */
  label: string;
}

const MB = 1024 * 1024;

export const UPLOAD_RULES: Record<UploadKind, UploadRule> = {
  video: {
    mimeTypes: {
      "video/mp4": "mp4",
      "video/webm": "webm",
    },
    maxBytes: 2048 * MB, // 2 GB
    label: "MP4 or WebM video",
  },
  thumbnail: {
    mimeTypes: {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    },
    maxBytes: 5 * MB,
    label: "JPEG, PNG or WebP image",
  },
};

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatDuration(totalSeconds: number | null | undefined): string {
  if (totalSeconds == null || !Number.isFinite(totalSeconds) || totalSeconds <= 0) return "";
  const s = Math.round(totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

/** Public, same-origin URLs that stream media through the app (MinIO stays private). */
export function videoStreamUrl(id: string, version?: string | number): string {
  return `/api/media/videos/${id}/stream${version ? `?v=${encodeURIComponent(String(version))}` : ""}`;
}

export function videoThumbnailUrl(id: string, version?: string | number): string {
  return `/api/media/videos/${id}/thumbnail${version ? `?v=${encodeURIComponent(String(version))}` : ""}`;
}

