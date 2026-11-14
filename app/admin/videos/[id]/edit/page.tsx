"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { VIDEO_CATEGORIES, formatBytes, formatDuration } from "@/lib/videoConfig";

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

export default function EditVideoPage() {
  const router = useRouter();
  const params = useParams();
  const videoId = params.id as string;

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    category: VIDEO_CATEGORIES[0],
    status: "Draft",
    displayOrder: "0",
  });

  const [existingVideo, setExistingVideo] = useState<{
    streamUrl: string;
    thumbnailUrl: string | null;
    videoSize: number;
    durationSeconds: number | null;
  } | null>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [removeThumbnail, setRemoveThumbnail] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null);

  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [uploadStage, setUploadStage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideo = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/videos/${videoId}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load video");
      }
      const vid = json.data;
      setFormData({
        title: vid.title,
        description: vid.description || "",
        category: vid.category,
        status: vid.status,
        displayOrder: String(vid.displayOrder ?? 0),
      });
      setDurationSeconds(vid.durationSeconds);
      setExistingVideo({
        streamUrl: vid.streamUrl,
        thumbnailUrl: vid.thumbnailUrl,
        videoSize: vid.videoSize,
        durationSeconds: vid.durationSeconds,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load video details");
    } finally {
      setIsLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    fetchVideo();
  }, [fetchVideo]);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["video/mp4", "video/webm"].includes(file.type)) {
      setError("Please select a valid MP4 or WebM video file.");
      return;
    }
    setError(null);
    setVideoFile(file);

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
    setRemoveThumbnail(false);
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

    setIsSubmitting(true);
    setError(null);

    try {
      let videoUploadKey: string | null = null;
      if (videoFile) {
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

        setUploadStage("Uploading new video file…");
        await uploadFileToMinIO(
          videoUpload.url,
          videoUpload.fields,
          videoFile,
          setUploadProgress
        );
        videoUploadKey = videoUpload.key;
      }

      let thumbnailUploadKey: string | null = null;
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

        setUploadStage("Uploading new thumbnail…");
        await uploadFileToMinIO(
          thumbUpload.url,
          thumbUpload.fields,
          thumbnailFile,
          () => {}
        );
        thumbnailUploadKey = thumbUpload.key;
      }

      setUploadStage("Saving changes…");
      const updateRes = await fetch(`/api/admin/videos/${videoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          category: formData.category,
          videoUploadKey: videoUploadKey,
          thumbnailUploadKey: thumbnailUploadKey,
          removeThumbnail: removeThumbnail,
          durationSeconds: durationSeconds,
          status: formData.status,
          displayOrder: parseInt(formData.displayOrder, 10) || 0,
        }),
      });
      const updateJson = await updateRes.json();
      if (!updateRes.ok || !updateJson.success) {
        throw new Error(updateJson.error || "Failed to update video record");
      }

      router.push("/admin/videos");
    } catch (err) {
      console.error("[Edit Video Error]:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setIsSubmitting(false);
      setUploadProgress(null);
      setUploadStage("");
    }
  };

  if (isLoading) {
    return (
      <div className="admin-events">
        <div className="admin-skeleton" style={{ height: "40px", width: "200px", marginBottom: "1rem" }} />
        <div className="admin-skeleton admin-skeleton-block" style={{ height: "400px" }} />
      </div>
    );
  }

  return (
    <div className="admin-events">
      <div className="admin-events__header">
        <div>
          <h1 className="admin-events__title">Edit Video</h1>
          <p className="admin-events__subtitle">Update video details, replace media files, or adjust order</p>
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
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="admin-events-form__section">
          <h2 className="admin-events-form__section-title">Replace Media (Optional)</h2>

          {existingVideo && (
            <div
              style={{
                marginBottom: "1.5rem",
                padding: "1rem",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "8px",
                border: "1px solid var(--admin-border-subtle)",
              }}
            >
              <div style={{ fontSize: "0.875rem", color: "var(--admin-text-secondary)", marginBottom: "0.5rem" }}>
                Current File: {formatBytes(existingVideo.videoSize)} | Duration:{" "}
                {formatDuration(existingVideo.durationSeconds) || "N/A"}
              </div>
              <div style={{ maxWidth: "320px", borderRadius: "6px", overflow: "hidden", aspectRatio: "16/9" }}>
                <video
                  src={existingVideo.streamUrl}
                  controls
                  playsInline
                  style={{ width: "100%", height: "100%", background: "#000" }}
                />
              </div>
            </div>
          )}

          <div className="admin-events-form__field">
            <label htmlFor="replace-video-file" className="admin-events-form__label">
              Replace Video File (Leave empty to keep current)
            </label>
            <input
              id="replace-video-file"
              type="file"
              accept="video/mp4,video/webm"
              onChange={handleVideoSelect}
              className="admin-events-form__input"
              disabled={isSubmitting}
            />
            {videoFile && (
              <p className="admin-events-form__hint">
                New file selected: {videoFile.name} ({formatBytes(videoFile.size)})
              </p>
            )}
          </div>

          <div className="admin-events-form__field">
            <label htmlFor="replace-thumbnail-file" className="admin-events-form__label">
              Replace Thumbnail Image
            </label>
            <input
              id="replace-thumbnail-file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleThumbnailSelect}
              className="admin-events-form__input"
              disabled={isSubmitting}
            />
            {existingVideo?.thumbnailUrl && !removeThumbnail && !thumbnailFile && (
              <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                <img
                  src={existingVideo.thumbnailUrl}
                  alt="Current Thumbnail"
                  style={{ width: "80px", height: "45px", objectFit: "cover", borderRadius: "4px" }}
                />
                <button
                  type="button"
                  onClick={() => setRemoveThumbnail(true)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#FCA5A5",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Remove current thumbnail
                </button>
              </div>
            )}
            {removeThumbnail && (
              <p className="admin-events-form__hint" style={{ color: "#FCA5A5" }}>
                Thumbnail will be removed upon saving.
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
            {isSubmitting ? "Saving Changes…" : "Update Video"}
          </button>
        </div>
      </form>
    </div>
  );
}

