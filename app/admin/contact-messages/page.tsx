"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

// ── Types ───────────────────────────────────────────────────────────────────

interface MessageItem {
  id: string;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function ContactStatusBadge({ status }: { status: string }) {
  let badgeClass = "admin-status-badge--muted";
  const s = status.toLowerCase();

  if (s === "new") {
    badgeClass = "admin-status-badge--info";
  } else if (s === "read") {
    badgeClass = "admin-status-badge--pending";
  } else if (s === "replied") {
    badgeClass = "admin-status-badge--success";
  } else if (s === "archived") {
    badgeClass = "admin-status-badge--muted";
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

function truncate(str: string, maxLen: number) {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + "…";
}

// ── Icons ───────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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

function ArchiveIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="2" width="14" height="4" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 6V13C2 13.5523 2.44772 14 3 14H13C13.5523 14 14 13.5523 14 13V6" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6 9H10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
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

function SortIcon({ direction }: { direction: "asc" | "desc" }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      {direction === "asc" ? (
        <path d="M6 2L6 10M6 2L3 5M6 2L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M6 10L6 2M6 10L3 7M6 10L9 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
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
  message,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  message: MessageItem;
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
          Delete Message
        </h3>
        <p className="admin-events-modal__msg">
          Are you sure you want to delete the message from <strong>{message.fullName}</strong>?
          <br />
          <span className="admin-events-modal__warning">
            This action cannot be undone.
          </span>
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
            {isDeleting ? "Deleting…" : "Delete Message"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page Component ─────────────────────────────────────────────────────

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
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
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MessageItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [archivingId, setArchivingId] = useState<string | null>(null);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch messages
  const fetchMessages = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "10",
          sort: "createdAt",
          order: sortOrder,
        });
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (statusFilter) params.set("status", statusFilter);

        const res = await fetch(`/api/admin/contact-messages?${params}`);
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.error || "Failed to load messages");
        }

        setMessages(json.data.messages);
        setPagination(json.data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, statusFilter, sortOrder]
  );

  useEffect(() => {
    fetchMessages(1);
  }, [fetchMessages]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handlePageChange = (newPage: number) => {
    fetchMessages(newPage);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/contact-messages/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to delete message");
      }

      setToast({ message: "Message deleted successfully.", type: "success" });
      setDeleteTarget(null);
      fetchMessages(pagination.page);
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : "Failed to delete message",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleArchive = async (msg: MessageItem) => {
    setArchivingId(msg.id);
    try {
      const newStatus = msg.status === "Archived" ? "Read" : "Archived";
      const res = await fetch(`/api/admin/contact-messages/${msg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update status");
      }

      setToast({
        message: `Message ${newStatus === "Archived" ? "archived" : "unarchived"}.`,
        type: "success",
      });
      fetchMessages(pagination.page);
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : "Failed to update status",
        type: "error",
      });
    } finally {
      setArchivingId(null);
    }
  };

  // ── Loading Skeleton ──────────────────────────────────────────────────────

  if (loading && messages.length === 0) {
    return (
      <div className="admin-events">
        <div className="admin-events__header">
          <div>
            <div className="admin-skeleton" style={{ width: "260px", height: "32px" }} />
            <div className="admin-skeleton" style={{ width: "340px", height: "18px", marginTop: "8px" }} />
          </div>
        </div>
        <div className="admin-skeleton" style={{ height: "48px", borderRadius: "10px" }} />
        <div className="admin-skeleton admin-skeleton-block" style={{ height: "400px" }} />
      </div>
    );
  }

  // ── Error State ───────────────────────────────────────────────────────────

  if (error && messages.length === 0) {
    return (
      <div className="admin-events">
        <div className="admin-events__header">
          <div>
            <h1 className="admin-events__title">Contact Messages</h1>
            <p className="admin-events__subtitle">Manage contact form submissions</p>
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
          <h2 className="admin-dashboard-error__title">Unable to load messages</h2>
          <p className="admin-dashboard-error__msg">{error}</p>
          <button className="admin-dashboard-error__retry" onClick={() => fetchMessages(1)}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-events">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <DeleteModal
          message={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}

      {/* Header */}
      <div className="admin-events__header">
        <div>
          <h1 className="admin-events__title">Contact Messages</h1>
          <p className="admin-events__subtitle">
            View and manage contact form submissions
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="admin-events__toolbar">
        <div className="admin-events__search-wrap">
          <span className="admin-events__search-icon"><SearchIcon /></span>
          <input
            id="messages-search"
            type="text"
            className="admin-events__search"
            placeholder="Search by name, email, or subject…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          id="messages-status-filter"
          className="admin-events__filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="New">New</option>
          <option value="Read">Read</option>
          <option value="Replied">Replied</option>
          <option value="Archived">Archived</option>
        </select>
      </div>

      {/* Messages Table */}
      <div className="admin-events__table-card">
        {messages.length === 0 ? (
          <div className="admin-events__empty">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="10" width="40" height="28" rx="4" stroke="currentColor" strokeWidth="2" />
              <path d="M4 14L24 28L44 14" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
            <h3>No messages found</h3>
            <p>
              {debouncedSearch || statusFilter
                ? "Try adjusting your search or filter."
                : "No contact messages have been received yet."}
            </p>
          </div>
        ) : (
          <>
            <div className="admin-events__table-scroll">
              <table className="admin-events__table">
                <thead>
                  <tr>
                    <th>Sender</th>
                    <th className="admin-events__th-hide-mobile">Subject</th>
                    <th>Status</th>
                    <th>
                      <button
                        className="admin-reg__sort-btn"
                        onClick={toggleSortOrder}
                        title={`Sort by date ${sortOrder === "desc" ? "ascending" : "descending"}`}
                      >
                        Date <SortIcon direction={sortOrder} />
                      </button>
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((msg) => (
                    <tr
                      key={msg.id}
                      className={`admin-events__tr ${msg.status === "New" ? "admin-msg__tr--unread" : ""}`}
                    >
                      <td>
                        <div className="admin-events__event-title">
                          {msg.fullName}
                          {msg.status === "New" && (
                            <span className="admin-msg__new-dot" title="Unread" />
                          )}
                        </div>
                        <div className="admin-events__event-slug">
                          {msg.email}
                        </div>
                      </td>
                      <td className="admin-events__td-hide-mobile">
                        <span className="admin-msg__subject">
                          {truncate(msg.subject, 60)}
                        </span>
                      </td>
                      <td>
                        <ContactStatusBadge status={msg.status} />
                      </td>
                      <td>
                        <div className="admin-events__date-text">
                          {formatDate(msg.createdAt)}
                        </div>
                      </td>
                      <td>
                        <div className="admin-events__actions">
                          <Link
                            href={`/admin/contact-messages/${msg.id}`}
                            className="admin-events__action-btn admin-events__action-btn--edit"
                            title="View Message"
                          >
                            <EyeIcon />
                          </Link>
                          <button
                            className="admin-events__action-btn admin-events__action-btn--publish"
                            title={msg.status === "Archived" ? "Unarchive" : "Archive"}
                            onClick={() => handleArchive(msg)}
                            disabled={archivingId === msg.id}
                          >
                            <ArchiveIcon />
                          </button>
                          <button
                            className="admin-events__action-btn admin-events__action-btn--delete"
                            title="Delete"
                            onClick={() => setDeleteTarget(msg)}
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

      {/* Loading overlay for refetch */}
      {loading && messages.length > 0 && (
        <div className="admin-events__loading-overlay">
          <div className="admin-events__spinner" />
        </div>
      )}
    </div>
  );
}
