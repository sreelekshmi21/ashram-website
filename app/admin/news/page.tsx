"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

// ── Types ───────────────────────────────────────────────────────────────────

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  date: string;
  status: string;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  let badgeClass = "admin-status-badge--muted";
  const s = status.toLowerCase();

  if (s === "published") {
    badgeClass = "admin-status-badge--success";
  } else if (s === "draft") {
    badgeClass = "admin-status-badge--pending";
  }

  return (
    <span className={`admin-status-badge ${badgeClass}`}>
      {status}
    </span>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Icons ───────────────────────────────────────────────────────────────────

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

// ── Toast Component ─────────────────────────────────────────────────────────

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

// ── Delete Confirmation Modal ───────────────────────────────────────────────

function DeleteModal({
  newsItem,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  newsItem: NewsItem;
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
          Delete News Article
        </h3>
        <p className="admin-events-modal__msg">
          Are you sure you want to delete <strong>{newsItem.title}</strong>? This action cannot be undone.
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
            {isDeleting ? "Deleting…" : "Delete Article"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page Component ─────────────────────────────────────────────────────

export default function AdminNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
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
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NewsItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchNews = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "10",
        });
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (statusFilter) params.set("status", statusFilter);

        const res = await fetch(`/api/admin/news?${params}`);
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.error || "Failed to load news");
        }

        setNews(json.data.news);
        setPagination(json.data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, statusFilter]
  );

  useEffect(() => {
    fetchNews(1);
  }, [fetchNews]);

  const handlePageChange = (newPage: number) => {
    fetchNews(newPage);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/news/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to delete article");
      }

      setToast({ message: `"${deleteTarget.title}" deleted successfully.`, type: "success" });
      setDeleteTarget(null);
      fetchNews(pagination.page);
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : "Failed to delete article",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePublish = async (item: NewsItem) => {
    setPublishingId(item.id);
    try {
      const newStatus = item.status === "Published" ? "Draft" : "Published";
      const res = await fetch(`/api/admin/news/${item.id}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update status");
      }

      setToast({
        message: `"${item.title}" ${newStatus === "Published" ? "published" : "unpublished"}.`,
        type: "success",
      });
      fetchNews(pagination.page);
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : "Failed to update status",
        type: "error",
      });
    } finally {
      setPublishingId(null);
    }
  };

  if (loading && news.length === 0) {
    return (
      <div className="admin-events">
        <div className="admin-events__header">
          <div>
            <div className="admin-skeleton" style={{ width: "200px", height: "32px" }} />
            <div className="admin-skeleton" style={{ width: "300px", height: "18px", marginTop: "8px" }} />
          </div>
        </div>
        <div className="admin-skeleton" style={{ height: "48px", borderRadius: "10px" }} />
        <div className="admin-skeleton admin-skeleton-block" style={{ height: "400px" }} />
      </div>
    );
  }

  if (error && news.length === 0) {
    return (
      <div className="admin-events">
        <div className="admin-events__header">
          <div>
            <h1 className="admin-events__title">News</h1>
            <p className="admin-events__subtitle">Manage ashram news and announcements</p>
          </div>
        </div>
        <div className="admin-dashboard-error">
          <div className="admin-dashboard-error__icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="16" r="1" fill="currentColor" />
            </svg>
          </div>
          <h2 className="admin-dashboard-error__title">Unable to load news</h2>
          <p className="admin-dashboard-error__msg">{error}</p>
          <button className="admin-dashboard-error__retry" onClick={() => fetchNews(1)}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
          newsItem={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}

      {/* Header */}
      <div className="admin-events__header">
        <div>
          <h1 className="admin-events__title">News &amp; Announcements</h1>
          <p className="admin-events__subtitle">
            Manage ashram news articles, press releases, and updates
          </p>
        </div>
        <Link href="/admin/news/new" className="admin-events__create-btn" id="create-news-btn">
          <PlusIcon />
          <span>Create Article</span>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="admin-events__toolbar">
        <div className="admin-events__search-wrap">
          <span className="admin-events__search-icon"><SearchIcon /></span>
          <input
            id="news-search"
            type="text"
            className="admin-events__search"
            placeholder="Search news…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          id="news-status-filter"
          className="admin-events__filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Published">Published</option>
        </select>
      </div>

      {/* Table */}
      <div className="admin-events__table-card">
        {news.length === 0 ? (
          <div className="admin-events__empty">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="10" width="36" height="28" rx="4" stroke="currentColor" strokeWidth="2" />
              <path d="M6 18H42" stroke="currentColor" strokeWidth="2" />
              <path d="M16 6V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M32 6V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <h3>No news articles found</h3>
            <p>
              {debouncedSearch || statusFilter
                ? "Try adjusting your search or filters."
                : "Create your first news article to get started."}
            </p>
            {!debouncedSearch && !statusFilter && (
              <Link href="/admin/news/new" className="admin-events__create-btn admin-events__create-btn--small">
                <PlusIcon />
                <span>Create Article</span>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="admin-events__table-scroll">
              <table className="admin-events__table">
                <thead>
                  <tr>
                    <th>Article</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th className="admin-events__th-hide-mobile">Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {news.map((item) => (
                    <tr key={item.id} className="admin-events__tr">
                      <td>
                        <div className="admin-events__event-title">
                          {item.title}
                        </div>
                        <div className="admin-events__event-slug">
                          /{item.slug}
                        </div>
                      </td>
                      <td>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-saffron/10 text-saffron">
                          {item.category}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="admin-events__td-hide-mobile">
                        <div className="admin-events__date-text">
                          {formatDate(item.date)}
                        </div>
                      </td>
                      <td>
                        <div className="admin-events__actions">
                          <button
                            className="admin-events__action-btn admin-events__action-btn--publish"
                            title={item.status === "Published" ? "Unpublish" : "Publish"}
                            onClick={() => handleTogglePublish(item)}
                            disabled={publishingId === item.id}
                          >
                            {item.status === "Published" ? <EyeOffIcon /> : <EyeIcon />}
                          </button>
                          <Link
                            href={`/admin/news/${item.id}/edit`}
                            className="admin-events__action-btn admin-events__action-btn--edit"
                            title="Edit"
                          >
                            <EditIcon />
                          </Link>
                          <button
                            className="admin-events__action-btn admin-events__action-btn--delete"
                            title="Delete"
                            onClick={() => setDeleteTarget(item)}
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

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="admin-events__pagination">
                <span className="admin-events__pagination-info">
                  Showing {(pagination.page - 1) * pagination.limit + 1}–
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                  {pagination.total}
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
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      return (
                        p === 1 ||
                        p === pagination.totalPages ||
                        Math.abs(p - pagination.page) <= 1
                      );
                    })
                    .map((p, idx, arr) => (
                      <span key={p}>
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span className="admin-events__page-ellipsis">…</span>
                        )}
                        <button
                          className={`admin-events__page-btn ${
                            p === pagination.page ? "admin-events__page-btn--active" : ""
                          }`}
                          onClick={() => handlePageChange(p)}
                        >
                          {p}
                        </button>
                      </span>
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

      {loading && news.length > 0 && (
        <div className="admin-events__loading-overlay">
          <div className="admin-events__spinner" />
        </div>
      )}
    </div>
  );
}
