"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  IMAGE_CATEGORIES,
  IMAGE_UPLOAD_RULES,
  formatBytes,
} from "@/lib/imageConfig";

// ── Types ──────────────────────────────────────────────────────────────────

interface GalleryImageItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  imageKey: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  status: "Draft" | "Published";
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  url: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UploadProgress {
  percentage: number;
  uploadedBytes: number;
  totalBytes: number;
}

interface BatchFileItem {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  category: string;
  displayOrder: number;
  status: "Draft" | "Published";
  width: number | null;
  height: number | null;
}

// ── Icons ──────────────────────────────────────────────────────────────────

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 3V15M3 9H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.5 1.5L14.5 4.5L5 14H2V11L11.5 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M9.5 3.5L12.5 6.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 4H13L12.2 14H3.8L3 4Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M1 4H15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M6 2H10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M6.5 7V11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M9.5 7V11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 8C1 8 4 3 8 3C12 3 15 8 15 8C15 8 12 13 8 13C4 13 1 8 1 8Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 8C1 8 4 3 8 3C12 3 15 8 15 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M2 14L14 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UploadCloudIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M16 16l-4-4m0 0l-4 4m4-4v12" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
      <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Components ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const isPublished = status === "Published";
  return (
    <span
      className={`admin-status-badge ${
        isPublished ? "admin-status-badge--success" : "admin-status-badge--pending"
      }`}
    >
      {status}
    </span>
  );
}

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`admin-events-toast admin-events-toast--${type}`}>
      <span>{message}</span>
      <button onClick={onClose} className="admin-events-toast__close" aria-label="Close">
        ×
      </button>
    </div>
  );
}

/** Upload helper using presigned POST directly to MinIO */
function uploadFileToMinIO(
  url: string,
  fields: Record<string, string>,
  file: File,
  onProgress?: (p: UploadProgress) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress({
            percentage: Math.round((e.loaded / e.total) * 100),
            uploadedBytes: e.loaded,
            totalBytes: e.total,
          });
        }
      };
    }

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
}

function cleanFilenameToTitle(name: string): string {
  const base = name.replace(/\.[^/.]+$/, "");
  return base
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// ── Modals ─────────────────────────────────────────────────────────────────

function DeleteModal({
  image,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  image: GalleryImageItem;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="admin-events-modal-overlay" onClick={onCancel}>
      <div
        className="admin-events-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="admin-events-modal__icon">
          <TrashIcon />
        </div>
        <h3 className="admin-events-modal__title">Delete Image</h3>
        <p className="admin-events-modal__msg">
          Are you sure you want to delete <strong>{image.title}</strong>? This will permanently remove the record and delete the image file from MinIO storage.
        </p>
        <div className="admin-events-modal__actions">
          <button
            type="button"
            className="admin-events-modal__btn admin-events-modal__btn--cancel"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="admin-events-modal__btn admin-events-modal__btn--delete"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting…" : "Delete Image"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewModal({
  image,
  onClose,
}: {
  image: GalleryImageItem;
  onClose: () => void;
}) {
  return (
    <div className="admin-events-modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div
        className="admin-events-modal"
        style={{ maxWidth: "760px", width: "95%", padding: "1.5rem" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <h3 className="admin-events-modal__title" style={{ margin: 0, textAlign: "left" }}>
              {image.title}
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "var(--admin-text-secondary)", textAlign: "left" }}>
              {image.category} • <StatusBadge status={image.status} />
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--admin-text-muted)",
              fontSize: "1.5rem",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ borderRadius: "10px", overflow: "hidden", background: "#0D1712", maxHeight: "60vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <img
            src={image.url}
            alt={image.title}
            style={{ maxWidth: "100%", maxHeight: "60vh", objectFit: "contain", display: "block" }}
          />
        </div>

        {image.description && (
          <p style={{ marginTop: "1rem", textAlign: "left", fontSize: "0.875rem", color: "var(--admin-text)" }}>
            {image.description}
          </p>
        )}

        <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", fontSize: "0.8rem", color: "var(--admin-text-muted)", borderTop: "1px solid var(--admin-border-subtle)", paddingTop: "0.75rem" }}>
          <span>Size: {formatBytes(image.size)}</span>
          {image.width && image.height && <span>Dimensions: {image.width} × {image.height}px</span>}
          <span>Order: #{image.displayOrder}</span>
          <span>Added: {new Date(image.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

function AddImageModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [tab, setTab] = useState<"single" | "batch">("single");

  // ── Single upload state ──
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [singlePreview, setSinglePreview] = useState<string | null>(null);
  const [singleDimensions, setSingleDimensions] = useState<{ width: number; height: number } | null>(null);
  const [singleTitle, setSingleTitle] = useState("");
  const [singleDescription, setSingleDescription] = useState("");
  const [singleCategory, setSingleCategory] = useState<string>(IMAGE_CATEGORIES[0]);
  const [singleStatus, setSingleStatus] = useState<"Draft" | "Published">("Published");
  const [singleOrder, setSingleOrder] = useState<number>(0);

  // ── Batch upload state ──
  const [batchItems, setBatchItems] = useState<BatchFileItem[]>([]);
  const [bulkCategory, setBulkCategory] = useState<string>(IMAGE_CATEGORIES[0]);
  const [bulkStatus, setBulkStatus] = useState<"Draft" | "Published">("Published");

  // ── Shared progress state ──
  const [uploading, setUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState("");
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return `"${file.name}" has invalid file type. Only JPEG, PNG, or WebP allowed.`;
    }
    if (file.size > IMAGE_UPLOAD_RULES.maxBytes) {
      return `"${file.name}" exceeds maximum size of 15 MB.`;
    }
    return null;
  };

  const handleSingleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validationErr = validateFile(file);
    if (validationErr) {
      setError(validationErr);
      return;
    }

    setSingleFile(file);
    const preview = URL.createObjectURL(file);
    setSinglePreview(preview);
    if (!singleTitle) {
      setSingleTitle(cleanFilenameToTitle(file.name));
    }

    // Inspect image dimensions
    const img = new Image();
    img.onload = () => {
      setSingleDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = preview;
  };

  const handleBatchSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: BatchFileItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validationErr = validateFile(file);
      if (validationErr) {
        setError(validationErr);
        return;
      }

      const preview = URL.createObjectURL(file);
      newItems.push({
        id: `${file.name}-${Date.now()}-${i}`,
        file,
        previewUrl: preview,
        title: cleanFilenameToTitle(file.name),
        category: bulkCategory,
        displayOrder: batchItems.length + i,
        status: bulkStatus,
        width: null,
        height: null,
      });
    }

    setBatchItems((prev) => [...prev, ...newItems]);
  };

  const handleRemoveBatchItem = (id: string) => {
    setBatchItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleFile) {
      setError("Please select an image file to upload.");
      return;
    }
    if (!singleTitle.trim()) {
      setError("Image title is required.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Step 1: Request presigned upload URL
      setUploadStage("Generating secure upload URL…");
      const urlRes = await fetch("/api/admin/gallery/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: singleFile.type,
          size: singleFile.size,
          fileName: singleFile.name,
        }),
      });
      const urlJson = await urlRes.json();
      if (!urlRes.ok || !urlJson.success) {
        throw new Error(urlJson.error || "Failed to generate upload URL");
      }

      // Step 2: Upload to MinIO
      setUploadStage("Uploading image to storage…");
      await uploadFileToMinIO(
        urlJson.data.url,
        urlJson.data.fields,
        singleFile,
        (p) => setProgress(p)
      );

      // Step 3: Finalize record
      setUploadStage("Verifying and saving image…");
      const saveRes = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: singleTitle.trim(),
          description: singleDescription.trim() || undefined,
          category: singleCategory,
          status: singleStatus,
          displayOrder: Number(singleOrder) || 0,
          imageUploadKey: urlJson.data.key,
          width: singleDimensions?.width || null,
          height: singleDimensions?.height || null,
        }),
      });
      const saveJson = await saveRes.json();
      if (!saveRes.ok || !saveJson.success) {
        throw new Error(saveJson.error || "Failed to save image record");
      }

      onSuccess(`"${singleTitle.trim()}" uploaded successfully.`);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploading(false);
      setUploadStage("");
      setProgress(null);
    }
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (batchItems.length === 0) {
      setError("Please select at least one image file.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const preparedImages = [];

      for (let i = 0; i < batchItems.length; i++) {
        const item = batchItems[i];
        setUploadStage(`Uploading ${i + 1} of ${batchItems.length}: ${item.title}…`);

        // Presigned URL
        const urlRes = await fetch("/api/admin/gallery/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contentType: item.file.type,
            size: item.file.size,
            fileName: item.file.name,
          }),
        });
        const urlJson = await urlRes.json();
        if (!urlRes.ok || !urlJson.success) {
          throw new Error(urlJson.error || `Failed to prepare upload for ${item.title}`);
        }

        // Upload to MinIO
        await uploadFileToMinIO(urlJson.data.url, urlJson.data.fields, item.file, (p) => {
          setProgress({
            percentage: Math.round(((i + p.percentage / 100) / batchItems.length) * 100),
            uploadedBytes: p.uploadedBytes,
            totalBytes: p.totalBytes,
          });
        });

        preparedImages.push({
          title: item.title.trim() || cleanFilenameToTitle(item.file.name),
          category: item.category,
          status: item.status,
          displayOrder: item.displayOrder,
          imageUploadKey: urlJson.data.key,
          width: item.width,
          height: item.height,
        });
      }

      setUploadStage("Finalizing batch in database…");
      const batchRes = await fetch("/api/admin/gallery/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: preparedImages }),
      });
      const batchJson = await batchRes.json();
      if (!batchRes.ok || !batchJson.success) {
        throw new Error(batchJson.error || "Batch registration failed");
      }

      onSuccess(`Successfully uploaded ${preparedImages.length} images.`);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload batch");
    } finally {
      setUploading(false);
      setUploadStage("");
      setProgress(null);
    }
  };

  return (
    <div className="admin-events-modal-overlay" onClick={onClose} style={{ zIndex: 900 }}>
      <div
        className="admin-events-modal"
        style={{ maxWidth: "680px", width: "95%", textAlign: "left", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 className="admin-events-modal__title" style={{ margin: 0 }}>
            Add Image to Gallery
          </h3>
          <button
            onClick={onClose}
            disabled={uploading}
            style={{
              background: "none",
              border: "none",
              color: "var(--admin-text-muted)",
              fontSize: "1.5rem",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--admin-border-subtle)", marginBottom: "1.25rem" }}>
          <button
            type="button"
            onClick={() => { setTab("single"); setError(null); }}
            disabled={uploading}
            style={{
              padding: "0.5rem 1rem",
              background: "none",
              border: "none",
              borderBottom: tab === "single" ? "2px solid var(--admin-accent)" : "2px solid transparent",
              color: tab === "single" ? "var(--admin-text)" : "var(--admin-text-muted)",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Single Upload
          </button>
          <button
            type="button"
            onClick={() => { setTab("batch"); setError(null); }}
            disabled={uploading}
            style={{
              padding: "0.5rem 1rem",
              background: "none",
              border: "none",
              borderBottom: tab === "batch" ? "2px solid var(--admin-accent)" : "2px solid transparent",
              color: tab === "batch" ? "var(--admin-text)" : "var(--admin-text-muted)",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Batch Upload (Multiple)
          </button>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(220, 38, 38, 0.15)",
              border: "1px solid rgba(220, 38, 38, 0.4)",
              color: "#FCA5A5",
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              marginBottom: "1rem",
              fontSize: "0.85rem",
            }}
          >
            {error}
          </div>
        )}

        {/* ── Single Upload Form ── */}
        {tab === "single" && (
          <form onSubmit={handleSingleSubmit} className="admin-events-form" style={{ gap: "1rem" }}>
            {/* File Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: "2px dashed var(--admin-border-subtle)",
                borderRadius: "12px",
                padding: "1.5rem",
                textAlign: "center",
                cursor: uploading ? "not-allowed" : "pointer",
                background: singlePreview ? "#000" : "var(--admin-surface-hover)",
                transition: "border-color 0.2s",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: "none" }}
                onChange={handleSingleSelect}
                disabled={uploading}
              />
              {singlePreview ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                  <img
                    src={singlePreview}
                    alt="Preview"
                    style={{ maxHeight: "180px", maxWidth: "100%", borderRadius: "6px", objectFit: "contain" }}
                  />
                  <span style={{ fontSize: "0.8rem", color: "#A7F3D0" }}>
                    Click to choose a different image ({singleFile?.name} • {singleFile ? formatBytes(singleFile.size) : ""})
                  </span>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", color: "var(--admin-text-muted)" }}>
                  <UploadCloudIcon />
                  <p style={{ margin: 0, fontWeight: 500, color: "var(--admin-text)" }}>
                    Click or drag & drop an image here
                  </p>
                  <span style={{ fontSize: "0.75rem" }}>JPEG, PNG, or WebP • Max 15 MB</span>
                </div>
              )}
            </div>

            <div className="admin-events-form__field">
              <label className="admin-events-form__label">
                Image Title <span className="admin-events-form__required">*</span>
              </label>
              <input
                type="text"
                className="admin-events-form__input"
                placeholder="e.g. Morning Prayer in Prayer Hall"
                value={singleTitle}
                onChange={(e) => setSingleTitle(e.target.value)}
                required
                disabled={uploading}
              />
            </div>

            <div className="admin-events-form__row">
              <div className="admin-events-form__field">
                <label className="admin-events-form__label">Category</label>
                <select
                  className="admin-events-form__select"
                  value={singleCategory}
                  onChange={(e) => setSingleCategory(e.target.value)}
                  disabled={uploading}
                >
                  {IMAGE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-events-form__field">
                <label className="admin-events-form__label">Publication Status</label>
                <select
                  className="admin-events-form__select"
                  value={singleStatus}
                  onChange={(e) => setSingleStatus(e.target.value as "Draft" | "Published")}
                  disabled={uploading}
                >
                  <option value="Published">Published (Visible on site)</option>
                  <option value="Draft">Draft (Admin only)</option>
                </select>
              </div>

              <div className="admin-events-form__field">
                <label className="admin-events-form__label">Display Order</label>
                <input
                  type="number"
                  min="0"
                  className="admin-events-form__input"
                  value={singleOrder}
                  onChange={(e) => setSingleOrder(parseInt(e.target.value, 10) || 0)}
                  disabled={uploading}
                />
              </div>
            </div>

            <div className="admin-events-form__field">
              <label className="admin-events-form__label">Description (Optional)</label>
              <textarea
                className="admin-events-form__textarea"
                rows={3}
                placeholder="Brief description or context about this photograph…"
                value={singleDescription}
                onChange={(e) => setSingleDescription(e.target.value)}
                disabled={uploading}
              />
            </div>

            {uploading && (
              <div style={{ marginTop: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--admin-text-secondary)", marginBottom: "4px" }}>
                  <span>{uploadStage}</span>
                  {progress && <span>{progress.percentage}%</span>}
                </div>
                <div style={{ height: "6px", background: "var(--admin-surface-hover)", borderRadius: "3px", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${progress?.percentage || 0}%`,
                      background: "var(--admin-accent)",
                      transition: "width 0.2s ease",
                    }}
                  />
                </div>
              </div>
            )}

            <div className="admin-events-modal__actions" style={{ marginTop: "1rem", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="admin-events-modal__btn admin-events-modal__btn--cancel"
                onClick={onClose}
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="admin-events__create-btn"
                style={{ margin: 0, padding: "0.55rem 1.5rem" }}
                disabled={uploading || !singleFile}
              >
                {uploading ? "Uploading…" : "Save Image"}
              </button>
            </div>
          </form>
        )}

        {/* ── Batch Upload Form ── */}
        {tab === "batch" && (
          <form onSubmit={handleBatchSubmit} className="admin-events-form" style={{ gap: "1rem" }}>
            <div
              onClick={() => batchInputRef.current?.click()}
              style={{
                border: "2px dashed var(--admin-border-subtle)",
                borderRadius: "12px",
                padding: "1.5rem",
                textAlign: "center",
                cursor: uploading ? "not-allowed" : "pointer",
                background: "var(--admin-surface-hover)",
                transition: "border-color 0.2s",
              }}
            >
              <input
                ref={batchInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                style={{ display: "none" }}
                onChange={handleBatchSelect}
                disabled={uploading}
              />
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", color: "var(--admin-text-muted)" }}>
                <UploadCloudIcon />
                <p style={{ margin: 0, fontWeight: 500, color: "var(--admin-text)" }}>
                  Choose multiple photos to batch upload
                </p>
                <span style={{ fontSize: "0.75rem" }}>Select up to 50 photos • JPEG, PNG, or WebP</span>
              </div>
            </div>

            {batchItems.length > 0 && (
              <>
                {/* Bulk controls */}
                <div style={{ background: "var(--admin-surface-hover)", padding: "0.75rem 1rem", borderRadius: "8px", display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Default for all:</span>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--admin-text-secondary)" }}>Category:</span>
                    <select
                      className="admin-events-form__select"
                      style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                      value={bulkCategory}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBulkCategory(val);
                        setBatchItems((prev) => prev.map((item) => ({ ...item, category: val })));
                      }}
                      disabled={uploading}
                    >
                      {IMAGE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--admin-text-secondary)" }}>Status:</span>
                    <select
                      className="admin-events-form__select"
                      style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                      value={bulkStatus}
                      onChange={(e) => {
                        const val = e.target.value as "Draft" | "Published";
                        setBulkStatus(val);
                        setBatchItems((prev) => prev.map((item) => ({ ...item, status: val })));
                      }}
                      disabled={uploading}
                    >
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                </div>

                {/* List of items */}
                <div style={{ maxHeight: "240px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {batchItems.map((item, idx) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.5rem",
                        background: "var(--admin-surface)",
                        border: "1px solid var(--admin-border-subtle)",
                        borderRadius: "8px",
                      }}
                    >
                      <img
                        src={item.previewUrl}
                        alt="preview"
                        style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "4px" }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBatchItems((prev) =>
                              prev.map((it) => (it.id === item.id ? { ...it, title: val } : it))
                            );
                          }}
                          className="admin-events-form__input"
                          style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem", marginBottom: "4px" }}
                          placeholder="Image title"
                          disabled={uploading}
                        />
                        <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>
                          {formatBytes(item.file.size)} • Order #{item.displayOrder}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveBatchItem(item.id)}
                        disabled={uploading}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--admin-text-muted)",
                          fontSize: "1.2rem",
                          cursor: "pointer",
                          padding: "4px 8px",
                        }}
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {uploading && (
              <div style={{ marginTop: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--admin-text-secondary)", marginBottom: "4px" }}>
                  <span>{uploadStage}</span>
                  {progress && <span>{progress.percentage}%</span>}
                </div>
                <div style={{ height: "6px", background: "var(--admin-surface-hover)", borderRadius: "3px", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${progress?.percentage || 0}%`,
                      background: "var(--admin-accent)",
                      transition: "width 0.2s ease",
                    }}
                  />
                </div>
              </div>
            )}

            <div className="admin-events-modal__actions" style={{ marginTop: "1rem", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="admin-events-modal__btn admin-events-modal__btn--cancel"
                onClick={onClose}
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="admin-events__create-btn"
                style={{ margin: 0, padding: "0.55rem 1.5rem" }}
                disabled={uploading || batchItems.length === 0}
              >
                {uploading ? "Uploading Batch…" : `Upload ${batchItems.length} Images`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function EditImageModal({
  image,
  onClose,
  onSuccess,
}: {
  image: GalleryImageItem;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [title, setTitle] = useState(image.title);
  const [description, setDescription] = useState(image.description || "");
  const [category, setCategory] = useState<string>(image.category);
  const [status, setStatus] = useState<"Draft" | "Published">(image.status);
  const [displayOrder, setDisplayOrder] = useState<number>(image.displayOrder);

  // Replacement image file state
  const [replacementFile, setReplacementFile] = useState<File | null>(null);
  const [replacementPreview, setReplacementPreview] = useState<string | null>(null);
  const [replacementDimensions, setReplacementDimensions] = useState<{ width: number; height: number } | null>(null);

  const [saving, setSaving] = useState(false);
  const [uploadStage, setUploadStage] = useState("");
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReplacementSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please select a valid JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > IMAGE_UPLOAD_RULES.maxBytes) {
      setError("Image exceeds the maximum allowed size of 15 MB.");
      return;
    }

    setReplacementFile(file);
    const preview = URL.createObjectURL(file);
    setReplacementPreview(preview);

    const img = new Image();
    img.onload = () => {
      setReplacementDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = preview;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Image title is required.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let imageUploadKey: string | undefined = undefined;

      // If user provided a replacement image file, upload it first
      if (replacementFile) {
        setUploadStage("Generating upload link for replacement…");
        const urlRes = await fetch("/api/admin/gallery/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contentType: replacementFile.type,
            size: replacementFile.size,
            fileName: replacementFile.name,
          }),
        });
        const urlJson = await urlRes.json();
        if (!urlRes.ok || !urlJson.success) {
          throw new Error(urlJson.error || "Failed to generate upload URL");
        }

        setUploadStage("Uploading new image…");
        await uploadFileToMinIO(
          urlJson.data.url,
          urlJson.data.fields,
          replacementFile,
          (p) => setProgress(p)
        );

        imageUploadKey = urlJson.data.key;
      }

      setUploadStage("Updating image record…");
      const updateRes = await fetch(`/api/admin/gallery/${image.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          status,
          displayOrder: Number(displayOrder) || 0,
          imageUploadKey,
          width: replacementDimensions ? replacementDimensions.width : image.width,
          height: replacementDimensions ? replacementDimensions.height : image.height,
        }),
      });

      const updateJson = await updateRes.json();
      if (!updateRes.ok || !updateJson.success) {
        throw new Error(updateJson.error || "Failed to update image details");
      }

      onSuccess(`"${title.trim()}" updated successfully.`);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update image");
    } finally {
      setSaving(false);
      setUploadStage("");
      setProgress(null);
    }
  };

  return (
    <div className="admin-events-modal-overlay" onClick={onClose} style={{ zIndex: 900 }}>
      <div
        className="admin-events-modal"
        style={{ maxWidth: "640px", width: "95%", textAlign: "left", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 className="admin-events-modal__title" style={{ margin: 0 }}>
            Edit Image
          </h3>
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              background: "none",
              border: "none",
              color: "var(--admin-text-muted)",
              fontSize: "1.5rem",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(220, 38, 38, 0.15)",
              border: "1px solid rgba(220, 38, 38, 0.4)",
              color: "#FCA5A5",
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              marginBottom: "1rem",
              fontSize: "0.85rem",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-events-form" style={{ gap: "1rem" }}>
          {/* Current / Replacement Image preview */}
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", background: "var(--admin-surface-hover)", padding: "0.75rem", borderRadius: "8px" }}>
            <img
              src={replacementPreview || image.url}
              alt="preview"
              style={{ width: "96px", height: "72px", objectFit: "cover", borderRadius: "6px", background: "#000" }}
            />
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 4px", fontSize: "0.85rem", fontWeight: 600, color: "var(--admin-text)" }}>
                {replacementFile ? "Replacement Selected" : "Current Image File"}
              </p>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--admin-text-secondary)" }}>
                {replacementFile
                  ? `${replacementFile.name} (${formatBytes(replacementFile.size)})`
                  : `${formatBytes(image.size)} • ${image.width ? `${image.width}×${image.height}px` : ""}`}
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={saving}
                style={{
                  marginTop: "6px",
                  background: "none",
                  border: "1px solid var(--admin-border-subtle)",
                  borderRadius: "4px",
                  padding: "3px 8px",
                  fontSize: "0.75rem",
                  color: "var(--admin-accent)",
                  cursor: "pointer",
                }}
              >
                {replacementFile ? "Choose Different File" : "Replace Image File…"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: "none" }}
                onChange={handleReplacementSelect}
                disabled={saving}
              />
            </div>
          </div>

          <div className="admin-events-form__field">
            <label className="admin-events-form__label">
              Image Title <span className="admin-events-form__required">*</span>
            </label>
            <input
              type="text"
              className="admin-events-form__input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={saving}
            />
          </div>

          <div className="admin-events-form__row">
            <div className="admin-events-form__field">
              <label className="admin-events-form__label">Category</label>
              <select
                className="admin-events-form__select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={saving}
              >
                {IMAGE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-events-form__field">
              <label className="admin-events-form__label">Publication Status</label>
              <select
                className="admin-events-form__select"
                value={status}
                onChange={(e) => setStatus(e.target.value as "Draft" | "Published")}
                disabled={saving}
              >
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
            </div>

            <div className="admin-events-form__field">
              <label className="admin-events-form__label">Display Order</label>
              <input
                type="number"
                min="0"
                className="admin-events-form__input"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
                disabled={saving}
              />
            </div>
          </div>

          <div className="admin-events-form__field">
            <label className="admin-events-form__label">Description</label>
            <textarea
              className="admin-events-form__textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
            />
          </div>

          {saving && (
            <div style={{ marginTop: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--admin-text-secondary)", marginBottom: "4px" }}>
                <span>{uploadStage}</span>
                {progress && <span>{progress.percentage}%</span>}
              </div>
              <div style={{ height: "6px", background: "var(--admin-surface-hover)", borderRadius: "3px", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${progress?.percentage || 0}%`,
                    background: "var(--admin-accent)",
                    transition: "width 0.2s ease",
                  }}
                />
              </div>
            </div>
          )}

          <div className="admin-events-modal__actions" style={{ marginTop: "1rem", justifyContent: "flex-end" }}>
            <button
              type="button"
              className="admin-events-modal__btn admin-events-modal__btn--cancel"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-events__create-btn"
              style={{ margin: 0, padding: "0.55rem 1.5rem" }}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page Component ────────────────────────────────────────────────────

export default function AdminImageGalleryPage() {
  const [images, setImages] = useState<GalleryImageItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState("displayOrder");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImageItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GalleryImageItem | null>(null);
  const [previewTarget, setPreviewTarget] = useState<GalleryImageItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch images from API
  const fetchImages = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "12",
          sort: sortField,
          order: sortOrder,
        });
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (categoryFilter) params.set("category", categoryFilter);
        if (statusFilter) params.set("status", statusFilter);

        const res = await fetch(`/api/admin/gallery?${params}`);
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.error || "Failed to load images");
        }

        setImages(json.data.images);
        setPagination(json.data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load gallery images");
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, categoryFilter, statusFilter, sortField, sortOrder]
  );

  useEffect(() => {
    fetchImages(1);
  }, [fetchImages]);

  // Handle Quick Publish / Unpublish Toggle
  const handleTogglePublish = async (img: GalleryImageItem) => {
    setPublishingId(img.id);
    const newStatus = img.status === "Published" ? "Draft" : "Published";
    try {
      const res = await fetch(`/api/admin/gallery/${img.id}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update publication status");
      }

      setToast({
        message: `"${img.title}" is now ${newStatus.toLowerCase()}.`,
        type: "success",
      });
      fetchImages(pagination.page);
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : "Failed to update status",
        type: "error",
      });
    } finally {
      setPublishingId(null);
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/gallery/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to delete image");
      }

      setToast({
        message: `"${deleteTarget.title}" deleted successfully.`,
        type: "success",
      });
      setDeleteTarget(null);
      fetchImages(pagination.page);
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : "Failed to delete image",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="admin-events">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="admin-events__header">
        <div>
          <h1 className="admin-events__title">Image Gallery</h1>
          <p className="admin-events__subtitle">
            Upload, manage, and publish spiritual images displayed on the public Visual Journey gallery
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            className="admin-events__create-btn"
            id="add-image-btn"
            onClick={() => setIsAddOpen(true)}
          >
            <PlusIcon />
            <span>Add Image</span>
          </button>
          <Link href="/admin/videos" className="admin-events__back-btn" style={{ margin: 0 }}>
            Switch to Video Gallery →
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-events__toolbar">
        <div className="admin-events__search-wrap">
          <span className="admin-events__search-icon">
            <SearchIcon />
          </span>
          <input
            id="images-search"
            type="text"
            className="admin-events__search"
            placeholder="Search images by title or description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          id="images-category-filter"
          className="admin-events__filter"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {IMAGE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          id="images-status-filter"
          className="admin-events__filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
        </select>

        <select
          id="images-sort-filter"
          className="admin-events__filter"
          value={`${sortField}-${sortOrder}`}
          onChange={(e) => {
            const [field, ord] = e.target.value.split("-");
            setSortField(field);
            setSortOrder(ord as "asc" | "desc");
          }}
        >
          <option value="displayOrder-asc">Display Order (Low → High)</option>
          <option value="displayOrder-desc">Display Order (High → Low)</option>
          <option value="createdAt-desc">Newest First</option>
          <option value="createdAt-asc">Oldest First</option>
          <option value="title-asc">Title (A-Z)</option>
        </select>
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

      {/* Thumbnail Cards Grid */}
      <div className="admin-events__table-card" style={{ padding: "1.5rem" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--admin-text-muted)" }}>
            <div style={{ fontSize: "1.2rem", fontWeight: 500 }}>Loading gallery images…</div>
          </div>
        ) : images.length === 0 ? (
          <div className="admin-events__empty">
            <ImageIcon />
            <h3>No images found</h3>
            <p>
              {debouncedSearch || categoryFilter || statusFilter
                ? "Try adjusting your search criteria or filters."
                : "Add your first photograph to the gallery to get started."}
            </p>
            {!debouncedSearch && !categoryFilter && !statusFilter && (
              <button
                type="button"
                className="admin-events__create-btn admin-events__create-btn--small"
                onClick={() => setIsAddOpen(true)}
              >
                <PlusIcon />
                <span>Add Image</span>
              </button>
            )}
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {images.map((img) => (
                <div
                  key={img.id}
                  style={{
                    borderRadius: "14px",
                    overflow: "hidden",
                    border: "1px solid var(--admin-border-subtle)",
                    background: "var(--admin-surface)",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                >
                  {/* Image Thumbnail Container */}
                  <div
                    style={{
                      height: "190px",
                      position: "relative",
                      background: "#0A140F",
                      cursor: "pointer",
                      overflow: "hidden",
                    }}
                    onClick={() => setPreviewTarget(img)}
                    title="Click to preview enlarged"
                  >
                    <img
                      src={img.url}
                      alt={img.title}
                      loading="lazy"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        transition: "transform 0.3s ease",
                      }}
                      onError={(e) => {
                        // Fallback in case of broken stream
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />

                    {/* Top badges */}
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        background: "rgba(10, 20, 15, 0.75)",
                        backdropFilter: "blur(4px)",
                        color: "#E2E8F0",
                        fontSize: "0.75rem",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontWeight: 500,
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      {img.category}
                    </div>

                    <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                      <StatusBadge status={img.status} />
                    </div>

                    {/* Display Order Chip */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "10px",
                        left: "10px",
                        background: "rgba(0, 0, 0, 0.7)",
                        color: "#FBBF24",
                        fontSize: "0.75rem",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontWeight: 600,
                      }}
                    >
                      Order #{img.displayOrder}
                    </div>

                    {/* Expand hint overlay */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "10px",
                        right: "10px",
                        background: "rgba(0, 0, 0, 0.7)",
                        color: "#fff",
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ExpandIcon />
                    </div>
                  </div>

                  {/* Body Content */}
                  <div
                    style={{
                      padding: "1rem",
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontSize: "1rem",
                          fontWeight: 600,
                          color: "var(--admin-text)",
                          margin: "0 0 0.35rem",
                          lineHeight: 1.3,
                        }}
                      >
                        {img.title}
                      </h3>
                      {img.description && (
                        <p
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--admin-text-secondary)",
                            margin: "0 0 0.5rem",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            lineHeight: 1.4,
                          }}
                        >
                          {img.description}
                        </p>
                      )}
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--admin-text-muted)",
                          display: "flex",
                          gap: "0.75rem",
                          marginBottom: "0.75rem",
                        }}
                      >
                        <span>{formatBytes(img.size)}</span>
                        {img.width && img.height && (
                          <span>{img.width} × {img.height}</span>
                        )}
                        <span>{new Date(img.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderTop: "1px solid var(--admin-border-subtle)",
                        paddingTop: "0.75rem",
                        marginTop: "auto",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(img)}
                        disabled={publishingId === img.id}
                        className="admin-events__action-btn"
                        style={{
                          background: "var(--admin-surface-hover)",
                          border: "1px solid var(--admin-border-subtle)",
                          color: img.status === "Published" ? "#34D399" : "var(--admin-text-muted)",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "0.75rem",
                          cursor: "pointer",
                        }}
                        title={img.status === "Published" ? "Click to Unpublish (Draft)" : "Click to Publish"}
                      >
                        {img.status === "Published" ? <EyeIcon /> : <EyeOffIcon />}
                        <span>{img.status === "Published" ? "Published" : "Draft"}</span>
                      </button>

                      <div style={{ display: "flex", gap: "0.35rem" }}>
                        <button
                          type="button"
                          onClick={() => setEditingImage(img)}
                          className="admin-events__action-btn"
                          title="Edit Image"
                          style={{
                            background: "var(--admin-surface-hover)",
                            border: "1px solid var(--admin-border-subtle)",
                            color: "var(--admin-text)",
                            padding: "6px 8px",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                        >
                          <EditIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(img)}
                          className="admin-events__action-btn"
                          title="Delete Image"
                          style={{
                            background: "rgba(248, 113, 113, 0.12)",
                            border: "1px solid rgba(248, 113, 113, 0.25)",
                            color: "#F87171",
                            padding: "6px 8px",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "2rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid var(--admin-border-subtle)",
                }}
              >
                <span style={{ fontSize: "0.85rem", color: "var(--admin-text-secondary)" }}>
                  Showing {images.length} of {pagination.total} images
                </span>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={() => fetchImages(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="admin-events__page-btn"
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      background: "var(--admin-surface)",
                      border: "1px solid var(--admin-border-subtle)",
                      color: "var(--admin-text)",
                      cursor: pagination.page <= 1 ? "not-allowed" : "pointer",
                      opacity: pagination.page <= 1 ? 0.5 : 1,
                    }}
                  >
                    <ChevronLeftIcon />
                  </button>
                  <span style={{ fontSize: "0.85rem", color: "var(--admin-text)", padding: "0 8px" }}>
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => fetchImages(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="admin-events__page-btn"
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      background: "var(--admin-surface)",
                      border: "1px solid var(--admin-border-subtle)",
                      color: "var(--admin-text)",
                      cursor: pagination.page >= pagination.totalPages ? "not-allowed" : "pointer",
                      opacity: pagination.page >= pagination.totalPages ? 0.5 : 1,
                    }}
                  >
                    <ChevronRightIcon />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {isAddOpen && (
        <AddImageModal
          onClose={() => setIsAddOpen(false)}
          onSuccess={(msg) => {
            setToast({ message: msg, type: "success" });
            fetchImages(1);
          }}
        />
      )}

      {editingImage && (
        <EditImageModal
          image={editingImage}
          onClose={() => setEditingImage(null)}
          onSuccess={(msg) => {
            setToast({ message: msg, type: "success" });
            fetchImages(pagination.page);
          }}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          image={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}

      {previewTarget && (
        <PreviewModal
          image={previewTarget}
          onClose={() => setPreviewTarget(null)}
        />
      )}
    </div>
  );
}
