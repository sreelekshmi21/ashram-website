"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { VIDEO_CATEGORIES, formatBytes } from "@/lib/videoConfig";

interface FormData {
  title: string;
  description: string;
  category: string;
  status: "Draft" | "Published";
  displayOrder: string;
}

interface UploadProgress {
  percentage: number;
  uploadedBytes: number;
  totalBytes: number;
}

export default function CreateVideoPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    category: VIDEO_CATEGORIES[0],
    status: "Draft",
    displayOrder: "0",
  });

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null);

  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [uploadStage, setUploadStage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["video/mp4", "video/webm"].includes(file.type)) {
      setError("Please select a valid MP4 or WebM video file.");
      return;
    }
    setError(null);
    setVideoFile(file);

    // Auto-detect duration from metadata
    const url = URL.createObjectURL(file);
    const tempVideo = document.createElement("video");
    tempVideo.preload = "metadata";
    tempVideo.src = url;
    tempVideo.onloadedmetadata = () => {
      if (tempVideo.duration && Number.isFinite(tempVideo.duration)) {
        setDurationSeconds(Math.round(tempVideo.duration));
      }
      URL.revokeObjectURL(url);
    };
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please select a valid JPEG, PNG, or WebP thumbnail image.");
      return;
    }
    setError(null);
    setThumbnailFile(file);
  };

  const uploadFileToMinIO = (
    url: string,
    fields: Record<string, string>,
    file: File,
    onProgress: (p: UploadProgress) => void
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress({
            percentage: Math.round((e.loaded / e.total) * 100),
            uploadedBytes: e.loaded,
            totalBytes: e.total,
          });
        }
      };

      xhr.onload = () => {
        // S3/MinIO responds with 204 No Content or 200 OK
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Storage server rejected upload (HTTP ${xhr.status})`));
        }
      };

      xhr.onerror = () => reject(new Error("Network error during file upload"));
      xhr.onabort = () => reject(new Error("File upload aborted"));

      const data = new FormData();
      Object.entries(fields).forEach(([k, v]) => data.append(k, v));
      data.append("file", file);

      xhr.send(data);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError("Video title is required.");
      return;
    }

    if (!videoFile) {
      setError("Please select a video file to upload.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Get presigned upload URL for Video
      setUploadStage("Preparing video upload…");
      const videoUrlRes = await fetch("/api/admin/videos/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "video",
          contentType: videoFile.type,
          size: videoFile.size,
          fileName: videoFile.name,
        }),
      });
      const videoUrlJson = await videoUrlRes.json();
      if (!videoUrlRes.ok || !videoUrlJson.success) {
        throw new Error(videoUrlJson.error || "Failed to prepare video upload");
      }
      const videoUpload = videoUrlJson.data;

      // 2. Upload Video directly to MinIO
      setUploadStage("Uploading video…");
      await uploadFileToMinIO(
        videoUpload.url,
        videoUpload.fields,
        videoFile,
        setUploadProgress
      );

      // 3. Handle optional thumbnail upload
      let thumbnailKey: string | null = null;
      if (thumbnailFile) {
        setUploadStage("Preparing thumbnail upload…");
        const thumbUrlRes = await fetch("/api/admin/videos/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind: "thumbnail",
            contentType: thumbnailFile.type,
            size: thumbnailFile.size,
            fileName: thumbnailFile.name,
          }),
        });
        const thumbUrlJson = await thumbUrlRes.json();
        if (!thumbUrlRes.ok || !thumbUrlJson.success) {
          throw new Error(thumbUrlJson.error || "Failed to prepare thumbnail upload");
        }
        const thumbUpload = thumbUrlJson.data;

        setUploadStage("Uploading thumbnail…");
        await uploadFileToMinIO(
          thumbUpload.url,
          thumbUpload.fields,
          thumbnailFile,
          () => {}
        );
        thumbnailKey = thumbUpload.key;
      }

      // 4. Finalize video creation in database
      setUploadStage("Finalizing and saving video…");
      const createRes = await fetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          category: formData.category,
          videoUploadKey: videoUpload.key,
          thumbnailUploadKey: thumbnailKey,
          durationSeconds: durationSeconds,
          status: formData.status,
          displayOrder: parseInt(formData.displayOrder, 10) || 0,
        }),
      });
      const createJson = await createRes.json();
      if (!createRes.ok || !createJson.success) {
        throw new Error(createJson.error || "Failed to save video record");
      }

      router.push("/admin/videos");
    } catch (err) {
      console.error("[Upload Video Error]:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred during upload.");
      setIsSubmitting(false);
      setUploadProgress(null);
      setUploadStage("");
    }
  };

  return (
    <div className="admin-events">
      <div className="admin-events__header">
        <div>
          <h1 className="admin-events__title">Upload Video</h1>
          <p className="admin-events__subtitle">
            Upload MP4 or WebM spiritual videos with custom thumbnails directly to secure object storage
          </p>
        </div>
        <Link href="/admin/videos" className="admin-events__back-btn">
          ← Back to Videos
        </Link>
      </div>

      {error && (
        <div
          style={{
            background: "rgba(220, 38, 38, 0.15)",
            border: "1px solid rgba(220, 38, 38, 0.4)",
            color: "#FCA5A5",
            padding: "0.875rem 1.25rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-events-form">
        <div className="admin-events-form__section">
          <h2 className="admin-events-form__section-title">Video Details</h2>

          <div className="admin-events-form__field">
            <label htmlFor="video-title" className="admin-events-form__label">
              Video Title <span className="admin-events-form__required">*</span>
            </label>
            <input
              id="video-title"
              type="text"
              className="admin-events-form__input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Guided Meditation on Light and Grace"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="admin-events-form__row">
            <div className="admin-events-form__field">
              <label htmlFor="video-category" className="admin-events-form__label">
                Category <span className="admin-events-form__required">*</span>
              </label>
              <select
                id="video-category"
                className="admin-events-form__select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                disabled={isSubmitting}
              >
                {VIDEO_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-events-form__field">
              <label htmlFor="video-status" className="admin-events-form__label">
                Status
              </label>
              <select
                id="video-status"
                className="admin-events-form__select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "Draft" | "Published" })}
                disabled={isSubmitting}
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </div>

            <div className="admin-events-form__field">
              <label htmlFor="video-order" className="admin-events-form__label">
                Display Order
              </label>
              <input
                id="video-order"
                type="number"
                min="0"
                className="admin-events-form__input"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="admin-events-form__field">
            <label htmlFor="video-desc" className="admin-events-form__label">
              Description
            </label>
            <textarea
              id="video-desc"
              className="admin-events-form__textarea"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of the discourse, teacher, occasion, or meditation session…"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="admin-events-form__section">
          <h2 className="admin-events-form__section-title">Media Files</h2>

          <div className="admin-events-form__field">
            <label htmlFor="video-file" className="admin-events-form__label">
              Video File (MP4, WebM up to 2GB) <span className="admin-events-form__required">*</span>
            </label>
            <input
              id="video-file"
              type="file"
              accept="video/mp4,video/webm"
              onChange={handleVideoSelect}
              className="admin-events-form__input"
              disabled={isSubmitting}
              required
            />
            {videoFile && (
              <p className="admin-events-form__hint">
                Selected: {videoFile.name} ({formatBytes(videoFile.size)})
              </p>
            )}
          </div>

          <div className="admin-events-form__field">
            <label htmlFor="thumbnail-file" className="admin-events-form__label">
              Thumbnail Image (JPEG, PNG, WebP up to 5MB - Optional)
            </label>
            <input
              id="thumbnail-file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleThumbnailSelect}
              className="admin-events-form__input"
              disabled={isSubmitting}
            />
            {thumbnailFile && (
              <p className="admin-events-form__hint">
                Selected: {thumbnailFile.name} ({formatBytes(thumbnailFile.size)})
              </p>
            )}
          </div>

          {isSubmitting && (
            <div style={{ marginTop: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.875rem" }}>
                <span>{uploadStage}</span>
                {uploadProgress && <span>{uploadProgress.percentage}%</span>}
              </div>
              <div
                style={{
                  height: "8px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${uploadProgress?.percentage || 0}%`,
                    background: "var(--admin-accent)",
                    transition: "width 0.2s ease",
                  }}
                />
              </div>
              {uploadProgress && (
                <div style={{ textAlign: "right", fontSize: "0.75rem", color: "var(--admin-text-muted)", marginTop: "0.25rem" }}>
                  {formatBytes(uploadProgress.uploadedBytes)} of {formatBytes(uploadProgress.totalBytes)}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="admin-events-form__actions">
          <Link
            href="/admin/videos"
            className="admin-events-form__btn admin-events-form__btn--cancel"
            style={{ pointerEvents: isSubmitting ? "none" : "auto", opacity: isSubmitting ? 0.6 : 1 }}
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="admin-events-form__btn admin-events-form__btn--submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Uploading Video…" : "Upload & Save Video"}
          </button>
        </div>
      </form>
    </div>
  );
}

