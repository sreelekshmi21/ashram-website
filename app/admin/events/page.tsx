"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

// ── Types ───────────────────────────────────────────────────────────────────

interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string | null;
  venue: string | null;
  startDate: string;
  endDate: string | null;
  registrationRequired: boolean;
  registrationFee: number;
  registrationDeadline: string | null;
  status: string;
  category?: string;
  gradient: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { registrations: number };
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

  if (["published", "completed"].includes(s)) {
    badgeClass = "admin-status-badge--success";
  } else if (["draft"].includes(s)) {
    badgeClass = "admin-status-badge--pending";
  } else if (["cancelled"].includes(s)) {
    badgeClass = "admin-status-badge--danger";
  }

  return (
    <span className={`admin-status-badge ${badgeClass}`}>
      {status}
    </span>
  );
}

function CategoryBadge({ category }: { category?: string }) {
  const cat = (category || "SPECIAL").toUpperCase();
  let label = "Special";
  let badgeStyle = {
    backgroundColor: "rgba(168, 85, 247, 0.15)",
    color: "#C084FC",
    border: "1px solid rgba(168, 85, 247, 0.3)",
  };

  if (cat === "MONTHLY") {
    label = "Monthly";
    badgeStyle = {
      backgroundColor: "rgba(251, 146, 60, 0.15)",
      color: "#FB923C",
      border: "1px solid rgba(251, 146, 60, 0.3)",
    };
  } else if (cat === "YEARLY") {
    label = "Yearly";
    badgeStyle = {
      backgroundColor: "rgba(52, 211, 153, 0.15)",
      color: "#34D399",
      border: "1px solid rgba(52, 211, 153, 0.3)",
    };
  }

  return (
    <span
      className="admin-status-badge"
      style={{ ...badgeStyle, textTransform: "capitalize", fontWeight: 600 }}
    >
      {label}
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

function formatCurrency(amount: number) {
  if (amount === 0) return "Free";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
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
  event,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  event: EventItem;
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
          Delete Event
        </h3>
        <p className="admin-events-modal__msg">
          Are you sure you want to delete <strong>{event.title}</strong>?
          {event._count.registrations > 0 && (
            <>
              <br />
              <span className="admin-events-modal__warning">
                This event has {event._count.registrations} registration(s) that will also be deleted.
              </span>
            </>
          )}
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
            {isDeleting ? "Deleting…" : "Delete Event"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page Component ─────────────────────────────────────────────────────

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
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
  const [deleteTarget, setDeleteTarget] = useState<EventItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch events
  const fetchEvents = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "10",
          sort: "createdAt",
          order: "desc",
        });
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (statusFilter) params.set("status", statusFilter);
        if (categoryFilter) params.set("category", categoryFilter);

        const res = await fetch(`/api/admin/events?${params}`);
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.error || "Failed to load events");
        }

        setEvents(json.data.events);
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
    fetchEvents(1);
  }, [fetchEvents]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handlePageChange = (newPage: number) => {
    fetchEvents(newPage);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/events/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to delete event");
      }

      setToast({ message: `"${deleteTarget.title}" deleted successfully.`, type: "success" });
      setDeleteTarget(null);
      fetchEvents(pagination.page);
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : "Failed to delete event",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePublish = async (event: EventItem) => {
    setPublishingId(event.id);
    try {
      const newStatus = event.status === "Published" ? "Draft" : "Published";
      const res = await fetch(`/api/admin/events/${event.id}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update status");
      }

      setToast({
        message: `"${event.title}" ${newStatus === "Published" ? "published" : "unpublished"}.`,
        type: "success",
      });
      fetchEvents(pagination.page);
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : "Failed to update status",
        type: "error",
      });
    } finally {
      setPublishingId(null);
    }
  };

  // ── Loading Skeleton ──────────────────────────────────────────────────────

  if (loading && events.length === 0) {
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

  // ── Error State ───────────────────────────────────────────────────────────

  if (error && events.length === 0) {
    return (
      <div className="admin-events">
        <div className="admin-events__header">
          <div>
            <h1 className="admin-events__title">Events</h1>
            <p className="admin-events__subtitle">Manage ashram events and retreats</p>
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
          <h2 className="admin-dashboard-error__title">Unable to load events</h2>
          <p className="admin-dashboard-error__msg">{error}</p>
          <button className="admin-dashboard-error__retry" onClick={() => fetchEvents(1)}>
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
          event={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}

      {/* Header */}
      <div className="admin-events__header">
        <div>
          <h1 className="admin-events__title">Events</h1>
          <p className="admin-events__subtitle">
            Manage ashram events, retreats, and programs
          </p>
        </div>
        <Link href="/admin/events/new" className="admin-events__create-btn" id="create-event-btn">
          <PlusIcon />
          <span>Create Event</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="admin-events__toolbar">
        <div className="admin-events__search-wrap">
          <span className="admin-events__search-icon"><SearchIcon /></span>
          <input
            id="events-search"
            type="text"
            className="admin-events__search"
            placeholder="Search events…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          id="events-status-filter"
          className="admin-events__filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Published">Published</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Completed">Completed</option>
        </select>
        <select
          id="events-category-filter"
          className="admin-events__filter"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="MONTHLY">Monthly</option>
          <option value="YEARLY">Yearly</option>
          <option value="SPECIAL">Special</option>
        </select>
      </div>

      {/* Events Table */}
      <div className="admin-events__table-card">
        {events.length === 0 ? (
          <div className="admin-events__empty">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="10" width="36" height="28" rx="4" stroke="currentColor" strokeWidth="2" />
              <path d="M6 18H42" stroke="currentColor" strokeWidth="2" />
              <path d="M16 6V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M32 6V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <h3>No events found</h3>
            <p>
              {debouncedSearch || statusFilter || categoryFilter
                ? "Try adjusting your search or filters."
                : "Create your first event to get started."}
            </p>
            {!debouncedSearch && !statusFilter && !categoryFilter && (
              <Link href="/admin/events/new" className="admin-events__create-btn admin-events__create-btn--small">
                <PlusIcon />
                <span>Create Event</span>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="admin-events__table-scroll">
              <table className="admin-events__table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th className="admin-events__th-hide-mobile">Venue</th>
                    <th className="admin-events__th-hide-mobile">Date</th>
                    <th className="admin-events__th-hide-tablet">Registrations</th>
                    <th className="admin-events__th-hide-tablet">Fee</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="admin-events__tr">
                      <td>
                        <div className="admin-events__event-title">
                          {event.title}
                        </div>
                        <div className="admin-events__event-slug">
                          /{event.slug}
                        </div>
                      </td>
                      <td>
                        <CategoryBadge category={event.category} />
                      </td>
                      <td>
                        <StatusBadge status={event.status} />
                      </td>
                      <td className="admin-events__td-hide-mobile">
                        <span className="admin-events__venue-text">
                          {event.venue || "—"}
                        </span>
                      </td>
                      <td className="admin-events__td-hide-mobile">
                        <div className="admin-events__date-text">
                          {formatDate(event.startDate)}
                        </div>
                        {event.endDate && (
                          <div className="admin-events__date-sub">
                            to {formatDate(event.endDate)}
                          </div>
                        )}
                      </td>
                      <td className="admin-events__td-hide-tablet">
                        <span className="admin-events__reg-count">
                          {event._count.registrations}
                        </span>
                      </td>
                      <td className="admin-events__td-hide-tablet">
                        <span className="admin-events__fee-text">
                          {formatCurrency(Number(event.registrationFee))}
                        </span>
                      </td>
                      <td>
                        <div className="admin-events__actions">
                          <button
                            className="admin-events__action-btn admin-events__action-btn--publish"
                            title={event.status === "Published" ? "Unpublish" : "Publish"}
                            onClick={() => handleTogglePublish(event)}
                            disabled={publishingId === event.id}
                          >
                            {event.status === "Published" ? <EyeOffIcon /> : <EyeIcon />}
                          </button>
                          <Link
                            href={`/admin/events/${event.id}/edit`}
                            className="admin-events__action-btn admin-events__action-btn--edit"
                            title="Edit"
                          >
                            <EditIcon />
                          </Link>
                          <button
                            className="admin-events__action-btn admin-events__action-btn--delete"
                            title="Delete"
                            onClick={() => setDeleteTarget(event)}
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
                      // Show first, last, current, and adjacent pages
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
      {loading && events.length > 0 && (
        <div className="admin-events__loading-overlay">
          <div className="admin-events__spinner" />
        </div>
      )}
    </div>
  );
}
