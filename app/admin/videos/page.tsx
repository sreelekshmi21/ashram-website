"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { VIDEO_CATEGORIES, formatBytes, formatDuration } from "@/lib/videoConfig";

interface VideoItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  videoMimeType: string;
  videoSize: number;
  thumbnailKey: string | null;
  durationSeconds: number | null;
  status: "Draft" | "Published";
  displayOrder: number;
  createdAt: string;
  streamUrl: string;
  thumbnailUrl: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

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

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 5V19L19 12L8 5Z" />
    </svg>
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

function DeleteModal({
  video,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  video: VideoItem;
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
        aria-labelledby="delete-modal-title"
      >
        <div className="admin-events-modal__icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="16" r="1" fill="currentColor" />
          </svg>
        </div>
        <h3 id="delete-modal-title" className="admin-events-modal__title">
          Delete Video
        </h3>
        <p className="admin-events-modal__msg">
          Are you sure you want to delete <strong>{video.title}</strong>? This will permanently delete the video file and its thumbnail from MinIO object storage.
        </p>
        <div className="admin-events-modal__actions">
          <button
            className="admin-events-modal__btn admin-events-modal__btn--cancel"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            className="admin-events-modal__btn admin-events-modal__btn--delete"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting…" : "Delete Video"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewModal({
  video,
  onClose,
}: {
  video: VideoItem;
  onClose: () => void;
}) {
  return (
    <div className="admin-events-modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div
        className="admin-events-modal"
        style={{ maxWidth: "800px", width: "95%", padding: "1.5rem" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 className="admin-events-modal__title" style={{ margin: 0 }}>
            {video.title}
          </h3>
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
        <div style={{ borderRadius: "8px", overflow: "hidden", background: "#000", aspectRatio: "16/9" }}>
          <video
            src={video.streamUrl}
            controls
            playsInline
            style={{ width: "100%", height: "100%", display: "block" }}
          />
        </div>
        <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between", fontSize: "0.875rem", color: "var(--admin-text-secondary)" }}>
          <span>Category: {video.category}</span>
          <span>Size: {formatBytes(video.videoSize)}</span>
          <span>Duration: {formatDuration(video.durationSeconds) || "N/A"}</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VideoItem | null>(null);
  const [previewTarget, setPreviewTarget] = useState<VideoItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchVideos = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "10",
          sort: "displayOrder",
          order: "asc",
        });
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (statusFilter) params.set("status", statusFilter);
        if (categoryFilter) params.set("category", categoryFilter);

        const res = await fetch(`/api/admin/videos?${params}`);
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.error || "Failed to load videos");
        }

        setVideos(json.data.videos);
        setPagination(json.data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, statusFilter, categoryFilter]
  );

  useEffect(() => {
    fetchVideos(1);
  }, [fetchVideos]);

  const handlePageChange = (newPage: number) => {
    fetchVideos(newPage);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/videos/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to delete video");
      }

      setToast({ message: `"${deleteTarget.title}" deleted successfully.`, type: "success" });
      setDeleteTarget(null);
      fetchVideos(pagination.page);
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : "Failed to delete video",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePublish = async (video: VideoItem) => {
    setPublishingId(video.id);
    try {
      const newStatus = video.status === "Published" ? "Draft" : "Published";
      const res = await fetch(`/api/admin/videos/${video.id}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update status");
      }

      setToast({
        message: `"${video.title}" ${newStatus === "Published" ? "published" : "unpublished"}.`,
        type: "success",
      });
      fetchVideos(pagination.page);
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : "Failed to update status",
        type: "error",
      });
    } finally {
      setPublishingId(null);
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

      {deleteTarget && (
        <DeleteModal
          video={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}

      {previewTarget && (
        <PreviewModal
          video={previewTarget}
          onClose={() => setPreviewTarget(null)}
        />
      )}

      <div className="admin-events__header">
        <div>
          <h1 className="admin-events__title">Video Gallery</h1>
          <p className="admin-events__subtitle">
            Upload, manage, and publish spiritual discourses, documentaries, and meditation videos
          </p>
        </div>
        <Link href="/admin/videos/new" className="admin-events__create-btn" id="create-video-btn">
          <PlusIcon />
          <span>Upload Video</span>
        </Link>
      </div>

      <div className="admin-events__toolbar">
        <div className="admin-events__search-wrap">
          <span className="admin-events__search-icon"><SearchIcon /></span>
          <input
            id="videos-search"
            type="text"
            className="admin-events__search"
            placeholder="Search by title or description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          id="videos-category-filter"
          className="admin-events__filter"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {VIDEO_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          id="videos-status-filter"
          className="admin-events__filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Published">Published</option>
        </select>
      </div>

      <div className="admin-events__table-card">
        {videos.length === 0 && !loading ? (
          <div className="admin-events__empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="4" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M18 9L22 6V16L18 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3>No videos found</h3>
            <p>
              {debouncedSearch || statusFilter || categoryFilter
                ? "Try adjusting your search or filters."
                : "Upload your first video to get started."}
            </p>
            {!debouncedSearch && !statusFilter && !categoryFilter && (
              <Link href="/admin/videos/new" className="admin-events__create-btn admin-events__create-btn--small">
                <PlusIcon />
                <span>Upload Video</span>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="admin-events__table-scroll">
              <table className="admin-events__table">
                <thead>
                  <tr>
                    <th>Video</th>
                    <th>Status</th>
                    <th className="admin-events__th-hide-mobile">Category</th>
                    <th className="admin-events__th-hide-mobile">Duration & Size</th>
                    <th className="admin-events__th-hide-tablet">Order</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map((vid) => (
                    <tr key={vid.id} className="admin-events__tr">
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div
                            onClick={() => setPreviewTarget(vid)}
                            style={{
                              position: "relative",
                              width: "72px",
                              height: "44px",
                              borderRadius: "6px",
                              overflow: "hidden",
                              background: "#1E3328",
                              flexShrink: 0,
                              cursor: "pointer",
                            }}
                          >
                            {vid.thumbnailUrl ? (
                              <img
                                src={vid.thumbnailUrl}
                                alt={vid.title}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "var(--admin-accent)",
                                }}
                              >
                                <PlayIcon />
                              </div>
                            )}
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                background: "rgba(0,0,0,0.3)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: 0,
                                transition: "opacity 0.2s",
                              }}
                              className="thumb-play-overlay"
                            >
                              <PlayIcon />
                            </div>
                          </div>
                          <div>
                            <div className="admin-events__event-title">{vid.title}</div>
                            {vid.description && (
                              <div
                                className="admin-events__event-slug"
                                style={{
                                  maxWidth: "260px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {vid.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={vid.status} />
                      </td>
                      <td className="admin-events__td-hide-mobile">
                        <span className="admin-events__venue-text">{vid.category}</span>
                      </td>
                      <td className="admin-events__td-hide-mobile">
                        <span className="admin-events__fee-text">
                          {formatDuration(vid.durationSeconds) || "—"}
                        </span>
                        <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>
                          {formatBytes(vid.videoSize)}
                        </div>
                      </td>
                      <td className="admin-events__td-hide-tablet">
                        <span className="admin-events__reg-count">{vid.displayOrder}</span>
                      </td>
                      <td>
                        <div className="admin-events__actions">
                          <button
                            className="admin-events__action-btn admin-events__action-btn--publish"
                            title={vid.status === "Published" ? "Unpublish" : "Publish"}
                            onClick={() => handleTogglePublish(vid)}
                            disabled={publishingId === vid.id}
                          >
                            {vid.status === "Published" ? <EyeOffIcon /> : <EyeIcon />}
                          </button>
                          <Link
                            href={`/admin/videos/${vid.id}/edit`}
                            className="admin-events__action-btn admin-events__action-btn--edit"
                            title="Edit"
                          >
                            <EditIcon />
                          </Link>
                          <button
                            className="admin-events__action-btn admin-events__action-btn--delete"
                            title="Delete"
                            onClick={() => setDeleteTarget(vid)}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="admin-events__pagination">
                <span className="admin-events__pagination-info">
                  Showing {(pagination.page - 1) * pagination.limit + 1}–
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                </span>
                <div className="admin-events__pagination-btns">
                  <button
                    className="admin-events__page-btn"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    aria-label="Previous page"
                  >
                    <ChevronLeftIcon />
                  </button>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      className={`admin-events__page-btn ${p === pagination.page ? "admin-events__page-btn--active" : ""}`}
                      onClick={() => handlePageChange(p)}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    className="admin-events__page-btn"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    aria-label="Next page"
                  >
                    <ChevronRightIcon />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {loading && videos.length > 0 && (
        <div className="admin-events__loading-overlay">
          <div className="admin-events__spinner" />
        </div>
      )}
    </div>
  );
}

