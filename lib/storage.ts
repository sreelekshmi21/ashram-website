/**
 * MinIO (S3-compatible) object storage utilities.
 *
 * SERVER-ONLY. Credentials are read from environment variables and never
 * leave the server. Browsers upload directly to MinIO using short-lived,
 * policy-restricted presigned POST forms, and download media through the
 * app's own streaming routes (/api/media/...), so MinIO itself never needs to
 * be publicly readable.
 *
 * Environment variables:
 *   MINIO_ENDPOINT     Host the server uses to reach MinIO (e.g. "minio" in Docker, "localhost" locally)
 *   MINIO_PORT         Default 9000
 *   MINIO_USE_SSL      "true" | "false" (default false)
 *   MINIO_ACCESS_KEY   Access key (required)
 *   MINIO_SECRET_KEY   Secret key (required)
 *   MINIO_BUCKET       Bucket name (default "ashram-media")
 *   MINIO_REGION       Default "us-east-1"
 *   MINIO_PUBLIC_URL   Browser-reachable MinIO URL used to sign uploads
 *                      (e.g. "http://localhost:9000"). Defaults to the internal endpoint.
 */

import crypto from "crypto";
import { Readable } from "stream";
import * as Minio from "minio";
import { UPLOAD_RULES, type UploadKind } from "@/lib/videoConfig";
import { IMAGE_UPLOAD_RULES } from "@/lib/imageConfig";

// ── Configuration ──────────────────────────────────────────────────────────

const BUCKET = process.env.MINIO_BUCKET || "ashram-media";
const REGION = process.env.MINIO_REGION || "us-east-1";

/** Prefixes */
export const PENDING_PREFIX = "pending/";
const FINAL_PREFIX: Record<UploadKind | "image", string> = {
  video: "videos/",
  thumbnail: "video-thumbnails/",
  image: "gallery-images/",
};
const PENDING_KIND_PREFIX: Record<UploadKind | "image", string> = {
  video: `${PENDING_PREFIX}videos/`,
  thumbnail: `${PENDING_PREFIX}video-thumbnails/`,
  image: `${PENDING_PREFIX}images/`,
};

/** Presigned upload validity */
const UPLOAD_URL_TTL_SECONDS = 60 * 30; // 30 minutes (large videos on slow links)

export class StorageError extends Error {
  constructor(
    message: string,
    public readonly status = 500
  ) {
    super(message);
    this.name = "StorageError";
  }
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new StorageError(`Storage is not configured (${name} missing)`, 503);
  return v;
}

function parseBool(v: string | undefined): boolean {
  return v === "true" || v === "1";
}

// ── Clients (internal + public signer) ─────────────────────────────────────

const globalForMinio = globalThis as unknown as {
  minioInternal?: Minio.Client;
  minioSigner?: Minio.Client;
  minioBucketReady?: Promise<void>;
};

function internalClient(): Minio.Client {
  if (!globalForMinio.minioInternal) {
    globalForMinio.minioInternal = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || "localhost",
      port: parseInt(process.env.MINIO_PORT || "9000", 10),
      useSSL: parseBool(process.env.MINIO_USE_SSL),
      accessKey: requireEnv("MINIO_ACCESS_KEY"),
      secretKey: requireEnv("MINIO_SECRET_KEY"),
      region: REGION,
    });
  }
  return globalForMinio.minioInternal;
}

/**
 * A client configured with the browser-facing host. Presigned signatures are
 * bound to the host, so uploads must be signed against the URL the browser
 * will actually call. Signing is purely local (region is fixed) — this client
 * never makes network requests itself.
 */
function signerClient(): Minio.Client {
  if (!globalForMinio.minioSigner) {
    const publicUrl = process.env.MINIO_PUBLIC_URL;
    if (!publicUrl) {
      globalForMinio.minioSigner = internalClient();
    } else {
      const u = new URL(publicUrl);
      const useSSL = u.protocol === "https:";
      globalForMinio.minioSigner = new Minio.Client({
        endPoint: u.hostname,
        port: u.port ? parseInt(u.port, 10) : useSSL ? 443 : 80,
        useSSL,
        accessKey: requireEnv("MINIO_ACCESS_KEY"),
        secretKey: requireEnv("MINIO_SECRET_KEY"),
        region: REGION,
        pathStyle: true,
      });
    }
  }
  return globalForMinio.minioSigner;
}

/**
 * Ensure the bucket exists (private — no anonymous policy is applied) and
 * that abandoned pending uploads are cleaned up automatically after 1 day.
 */
export async function ensureBucket(): Promise<void> {
  if (!globalForMinio.minioBucketReady) {
    globalForMinio.minioBucketReady = (async () => {
      const client = internalClient();
      const exists = await client.bucketExists(BUCKET);
      if (!exists) {
        await client.makeBucket(BUCKET, REGION);
      }
      try {
        await client.setBucketLifecycle(BUCKET, {
          Rule: [
            {
              ID: "expire-pending-uploads",
              Status: "Enabled",
              Filter: { Prefix: PENDING_PREFIX },
              Expiration: { Days: 1 },
            },
          ],
        });
      } catch (err) {
        // Non-fatal: lifecycle is a cleanup optimisation only.
        console.warn("[Storage] Could not set bucket lifecycle:", (err as Error).message);
      }
    })().catch((err) => {
      globalForMinio.minioBucketReady = undefined;
      throw err;
    });
  }
  return globalForMinio.minioBucketReady;
}

// ── Upload rules & keys ────────────────────────────────────────────────────

export function validateUploadRequest(kind: UploadKind, contentType: string, size: number) {
  const rule = UPLOAD_RULES[kind];
  const ext = rule.mimeTypes[contentType];
  if (!ext) {
    throw new StorageError(`Unsupported file type. Please upload a ${rule.label}.`, 400);
  }
  if (!Number.isFinite(size) || size <= 0) {
    throw new StorageError("File is empty.", 400);
  }
  if (size > rule.maxBytes) {
    throw new StorageError(
      `File is too large. Maximum size is ${Math.round(rule.maxBytes / (1024 * 1024))} MB.`,
      400
    );
  }
  return { rule, ext };
}

export function validateImageUploadRequest(contentType: string, size: number) {
  const rule = IMAGE_UPLOAD_RULES;
  const ext = rule.mimeTypes[contentType];
  if (!ext) {
    throw new StorageError(`Unsupported file type. Please upload a ${rule.label}.`, 400);
  }
  if (!Number.isFinite(size) || size <= 0) {
    throw new StorageError("File is empty.", 400);
  }
  if (size > rule.maxBytes) {
    throw new StorageError(
      `File is too large. Maximum size is ${Math.round(rule.maxBytes / (1024 * 1024))} MB.`,
      400
    );
  }
  return { rule, ext };
}

/** Unique, unguessable object name — never derived from the user's file name. */
function newObjectName(prefix: string, ext: string): string {
  return `${prefix}${crypto.randomUUID()}.${ext}`;
}

export function kindOfPendingKey(key: string): UploadKind | "image" | null {
  if (key.startsWith(PENDING_KIND_PREFIX.video)) return "video";
  if (key.startsWith(PENDING_KIND_PREFIX.thumbnail)) return "thumbnail";
  if (key.startsWith(PENDING_KIND_PREFIX.image)) return "image";
  return null;
}

/**
 * Create a presigned POST policy for a direct browser → MinIO image upload.
 */
export async function createPresignedImageUpload(contentType: string, size: number) {
  const { rule, ext } = validateImageUploadRequest(contentType, size);
  await ensureBucket();

  const key = newObjectName(PENDING_KIND_PREFIX.image, ext);
  const signer = signerClient();
  const policy = signer.newPostPolicy();
  policy.setBucket(BUCKET);
  policy.setKey(key);
  policy.setContentType(contentType);
  policy.setContentLengthRange(1, rule.maxBytes);
  policy.setExpires(new Date(Date.now() + UPLOAD_URL_TTL_SECONDS * 1000));

  const { postURL, formData } = await signer.presignedPostPolicy(policy);

  return {
    key,
    url: postURL,
    fields: formData as Record<string, string>,
    expiresIn: UPLOAD_URL_TTL_SECONDS,
  };
}

/**
 * Create a presigned POST policy for a direct browser → MinIO upload.
 * MinIO itself enforces the exact key, content type and size range.
 */
export async function createPresignedUpload(kind: UploadKind, contentType: string, size: number) {
  const { rule, ext } = validateUploadRequest(kind, contentType, size);
  await ensureBucket();

  const key = newObjectName(PENDING_KIND_PREFIX[kind], ext);
  const signer = signerClient();
  const policy = signer.newPostPolicy();
  policy.setBucket(BUCKET);
  policy.setKey(key);
  policy.setContentType(contentType);
  policy.setContentLengthRange(1, rule.maxBytes);
  policy.setExpires(new Date(Date.now() + UPLOAD_URL_TTL_SECONDS * 1000));

  const { postURL, formData } = await signer.presignedPostPolicy(policy);

  return {
    key,
    url: postURL,
    fields: formData as Record<string, string>,
    expiresIn: UPLOAD_URL_TTL_SECONDS,
  };
}

// ── Content verification (magic bytes) ─────────────────────────────────────

async function readHead(key: string, length: number): Promise<Buffer> {
  const stream = await internalClient().getPartialObject(BUCKET, key, 0, length);
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

/** Detect actual MIME type from file signature. Returns null if unknown. */
export function sniffMimeType(head: Buffer): string | null {
  // MP4 / ISO-BMFF: "ftyp" box at offset 4. Reject QuickTime ("qt  ") brand.
  if (head.length >= 12 && head.toString("ascii", 4, 8) === "ftyp") {
    const brand = head.toString("ascii", 8, 12);
    if (brand !== "qt  ") return "video/mp4";
    return null;
  }
  // WebM (EBML header) — must declare the "webm" DocType (not generic Matroska)
  if (head.length >= 4 && head[0] === 0x1a && head[1] === 0x45 && head[2] === 0xdf && head[3] === 0xa3) {
    return head.includes(Buffer.from("webm", "ascii")) ? "video/webm" : null;
  }
  // JPEG
  if (head.length >= 3 && head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return "image/jpeg";
  // PNG
  if (
    head.length >= 8 &&
    head.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "image/png";
  }
  // WebP: "RIFF" .... "WEBP"
  if (head.length >= 12 && head.toString("ascii", 0, 4) === "RIFF" && head.toString("ascii", 8, 12) === "WEBP") {
    return "image/webp";
  }
  return null;
}

export interface VerifiedObject {
  key: string;
  mimeType: string;
  size: number;
}

/**
 * Verify a pending upload: it must exist, be within the size limit, and its
 * real content signature must match an allowed type for `kind`.
 * Invalid objects are deleted immediately.
 */
export async function verifyPendingUpload(key: string, expectedKind: UploadKind): Promise<VerifiedObject> {
  if (kindOfPendingKey(key) !== expectedKind) {
    throw new StorageError("Invalid upload reference.", 400);
  }
  await ensureBucket();
  const client = internalClient();
  const rule = UPLOAD_RULES[expectedKind];

  let stat: Minio.BucketItemStat;
  try {
    stat = await client.statObject(BUCKET, key);
  } catch {
    throw new StorageError(
      expectedKind === "video"
        ? "Uploaded video not found. Please upload the file again."
        : "Uploaded thumbnail not found. Please upload the image again.",
      400
    );
  }

  const reject = async (msg: string): Promise<never> => {
    await client.removeObject(BUCKET, key).catch(() => {});
    throw new StorageError(msg, 400);
  };

  if (stat.size <= 0) return reject("Uploaded file is empty.");
  if (stat.size > rule.maxBytes) return reject("Uploaded file exceeds the maximum allowed size.");

  const head = await readHead(key, 4096);
  const detected = sniffMimeType(head);
  if (!detected || !rule.mimeTypes[detected]) {
    return reject(`The uploaded file is not a valid ${rule.label}.`);
  }
  // The extension in the key was derived from the declared type — they must agree.
  const keyExt = key.split(".").pop();
  if (rule.mimeTypes[detected] !== keyExt) {
    return reject("The file contents do not match the declared file type.");
  }

  return { key, mimeType: detected, size: stat.size };
}

/**
 * Verify a pending image upload: must exist, within size limit, valid image magic bytes.
 */
export async function verifyPendingImageUpload(key: string): Promise<VerifiedObject> {
  if (kindOfPendingKey(key) !== "image") {
    throw new StorageError("Invalid image upload reference.", 400);
  }
  await ensureBucket();
  const client = internalClient();
  const rule = IMAGE_UPLOAD_RULES;

  let stat: Minio.BucketItemStat;
  try {
    stat = await client.statObject(BUCKET, key);
  } catch {
    throw new StorageError("Uploaded image not found. Please upload the file again.", 400);
  }

  const reject = async (msg: string): Promise<never> => {
    await client.removeObject(BUCKET, key).catch(() => {});
    throw new StorageError(msg, 400);
  };

  if (stat.size <= 0) return reject("Uploaded file is empty.");
  if (stat.size > rule.maxBytes) return reject("Uploaded file exceeds the maximum allowed size.");

  const head = await readHead(key, 4096);
  const detected = sniffMimeType(head);
  if (!detected || !rule.mimeTypes[detected]) {
    return reject(`The uploaded file is not a valid ${rule.label}.`);
  }

  const keyExt = key.split(".").pop();
  if (rule.mimeTypes[detected] !== keyExt) {
    return reject("The file contents do not match the declared file type.");
  }

  return { key, mimeType: detected, size: stat.size };
}

/**
 * Move a verified pending upload to its permanent location (server-side copy,
 * no data passes through the app) and return the new key.
 */
export async function promotePendingUpload(obj: VerifiedObject, kind: UploadKind | "image"): Promise<string> {
  const client = internalClient();
  const ext = kind === "image" ? IMAGE_UPLOAD_RULES.mimeTypes[obj.mimeType] : UPLOAD_RULES[kind].mimeTypes[obj.mimeType];
  const finalKey = newObjectName(FINAL_PREFIX[kind], ext);

  await client.copyObject(
    new Minio.CopySourceOptions({ Bucket: BUCKET, Object: obj.key }),
    new Minio.CopyDestinationOptions({
      Bucket: BUCKET,
      Object: finalKey,
      MetadataDirective: "REPLACE",
      Headers: { "Content-Type": obj.mimeType },
    })
  );
  await client.removeObject(BUCKET, obj.key).catch(() => {});
  return finalKey;
}

/** Best-effort removal of one or more objects. Never throws. */
export async function deleteObjectsSafe(keys: (string | null | undefined)[]): Promise<void> {
  const list = keys.filter((k): k is string => !!k);
  if (list.length === 0) return;
  try {
    const client = internalClient();
    await Promise.all(
      list.map((k) =>
        client.removeObject(BUCKET, k).catch((err) => {
          console.error(`[Storage] Failed to delete object "${k}":`, (err as Error).message);
        })
      )
    );
  } catch (err) {
    console.error("[Storage] deleteObjectsSafe error:", (err as Error).message);
  }
}

// ── Streaming (downloads via the app) ──────────────────────────────────────

export async function statObject(key: string) {
  return internalClient().statObject(BUCKET, key);
}

/** Returns a Web ReadableStream for the whole object or a byte range. */
export async function getObjectStream(
  key: string,
  range?: { start: number; end: number }
): Promise<ReadableStream<Uint8Array>> {
  const client = internalClient();
  const nodeStream = range
    ? await client.getPartialObject(BUCKET, key, range.start, range.end - range.start + 1)
    : await client.getObject(BUCKET, key);
  return Readable.toWeb(nodeStream) as unknown as ReadableStream<Uint8Array>;
}
