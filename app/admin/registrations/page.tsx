"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

// ── Types ───────────────────────────────────────────────────────────────────

interface RegistrationItem {
  id: string;
  registrationNumber: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  registrationStatus: string;
  paymentStatus: string;
  createdAt: string;
  event: {
    id: string;
    title: string;
    slug: string;
  };
}

interface EventOption {
  id: string;
  title: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function RegistrationStatusBadge({ status }: { status: string }) {
  let badgeClass = "admin-status-badge--muted";
  const s = status.toLowerCase();

  if (s === "confirmed" || s === "completed") {
    badgeClass = "admin-status-badge--success";
  } else if (s === "pending") {
    badgeClass = "admin-status-badge--pending";
  } else if (s === "cancelled") {
    badgeClass = "admin-status-badge--danger";
  }

  return (
    <span className={`admin-status-badge ${badgeClass}`}>
      {status}
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  let badgeClass = "admin-status-badge--muted";
  const s = status.toLowerCase();

  if (s === "paid") {
    badgeClass = "admin-status-badge--success";
  } else if (s === "pending") {
    badgeClass = "admin-status-badge--pending";
  } else if (s === "failed") {
    badgeClass = "admin-status-badge--danger";
  } else if (s === "refunded") {
    badgeClass = "admin-status-badge--info";
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

// ── Main Page Component ─────────────────────────────────────────────────────

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [regStatusFilter, setRegStatusFilter] = useState("");
  const [payStatusFilter, setPayStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch registrations
  const fetchRegistrations = useCallback(
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
        if (eventFilter) params.set("eventId", eventFilter);
        if (regStatusFilter) params.set("registrationStatus", regStatusFilter);
        if (payStatusFilter) params.set("paymentStatus", payStatusFilter);

        const res = await fetch(`/api/admin/registrations?${params}`);
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.error || "Failed to load registrations");
        }

        setRegistrations(json.data.registrations);
        setPagination(json.data.pagination);
        if (json.data.events) {
          setEvents(json.data.events);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, eventFilter, regStatusFilter, payStatusFilter, sortOrder]
  );

  useEffect(() => {
    fetchRegistrations(1);
  }, [fetchRegistrations]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handlePageChange = (newPage: number) => {
    fetchRegistrations(newPage);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  // ── Loading Skeleton ──────────────────────────────────────────────────────

  if (loading && registrations.length === 0) {
    return (
      <div className="admin-events">
        <div className="admin-events__header">
          <div>
            <div className="admin-skeleton" style={{ width: "240px", height: "32px" }} />
            <div className="admin-skeleton" style={{ width: "340px", height: "18px", marginTop: "8px" }} />
          </div>
        </div>
        <div className="admin-skeleton" style={{ height: "48px", borderRadius: "10px" }} />
        <div className="admin-skeleton admin-skeleton-block" style={{ height: "400px" }} />
      </div>
    );
  }

  // ── Error State ───────────────────────────────────────────────────────────

  if (error && registrations.length === 0) {
    return (
      <div className="admin-events">
        <div className="admin-events__header">
          <div>
            <h1 className="admin-events__title">Registrations</h1>
            <p className="admin-events__subtitle">Manage event registrations</p>
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
          <h2 className="admin-dashboard-error__title">Unable to load registrations</h2>
          <p className="admin-dashboard-error__msg">{error}</p>
          <button className="admin-dashboard-error__retry" onClick={() => fetchRegistrations(1)}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-events">
      {/* Header */}
      <div className="admin-events__header">
        <div>
          <h1 className="admin-events__title">Registrations</h1>
          <p className="admin-events__subtitle">
            View and manage event registrations
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="admin-events__toolbar">
        <div className="admin-events__search-wrap">
          <span className="admin-events__search-icon"><SearchIcon /></span>
          <input
            id="registrations-search"
            type="text"
            className="admin-events__search"
            placeholder="Search by name, email, or reg number…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          id="registrations-event-filter"
          className="admin-events__filter"
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
        >
          <option value="">All Events</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>
        <select
          id="registrations-reg-status-filter"
          className="admin-events__filter"
          value={regStatusFilter}
          onChange={(e) => setRegStatusFilter(e.target.value)}
        >
          <option value="">All Reg Status</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Completed">Completed</option>
        </select>
        <select
          id="registrations-pay-status-filter"
          className="admin-events__filter"
          value={payStatusFilter}
          onChange={(e) => setPayStatusFilter(e.target.value)}
        >
          <option value="">All Payment Status</option>
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
          <option value="Failed">Failed</option>
          <option value="Refunded">Refunded</option>
        </select>
      </div>

      {/* Registrations Table */}
      <div className="admin-events__table-card">
        {registrations.length === 0 ? (
          <div className="admin-events__empty">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8H32L38 14V40C38 41.1 37.1 42 36 42H12C10.9 42 10 41.1 10 40V10C10 8.9 10.9 8 12 8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <path d="M18 24L22 28L30 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3>No registrations found</h3>
            <p>
              {debouncedSearch || eventFilter || regStatusFilter || payStatusFilter
                ? "Try adjusting your search or filters."
                : "No event registrations have been submitted yet."}
            </p>
          </div>
        ) : (
          <>
            <div className="admin-events__table-scroll">
              <table className="admin-events__table">
                <thead>
                  <tr>
                    <th>Registrant</th>
                    <th className="admin-events__th-hide-tablet">Phone</th>
                    <th className="admin-events__th-hide-mobile">Event</th>
                    <th>
                      <button
                        className="admin-reg__sort-btn"
                        onClick={toggleSortOrder}
                        title={`Sort by date ${sortOrder === "desc" ? "ascending" : "descending"}`}
                      >
                        Date <SortIcon direction={sortOrder} />
                      </button>
                    </th>
                    <th className="admin-events__th-hide-mobile">Payment</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="admin-events__tr">
                      <td>
                        <div className="admin-events__event-title">
                          {reg.fullName}
                        </div>
                        <div className="admin-events__event-slug">
                          {reg.email}
                        </div>
                      </td>
                      <td className="admin-events__td-hide-tablet">
                        <span className="admin-events__venue-text">
                          {reg.mobileNumber}
                        </span>
                      </td>
                      <td className="admin-events__td-hide-mobile">
                        <span className="admin-reg__event-name">
                          {reg.event.title}
                        </span>
                      </td>
                      <td>
                        <div className="admin-events__date-text">
                          {formatDate(reg.createdAt)}
                        </div>
                      </td>
                      <td className="admin-events__td-hide-mobile">
                        <PaymentStatusBadge status={reg.paymentStatus} />
                      </td>
                      <td>
                        <RegistrationStatusBadge status={reg.registrationStatus} />
                      </td>
                      <td>
                        <div className="admin-events__actions">
                          <Link
                            href={`/admin/registrations/${reg.id}`}
                            className="admin-events__action-btn admin-events__action-btn--edit"
                            title="View Details"
                          >
                            <EyeIcon />
                          </Link>
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
      {loading && registrations.length > 0 && (
        <div className="admin-events__loading-overlay">
          <div className="admin-events__spinner" />
        </div>
      )}
    </div>
  );
}
