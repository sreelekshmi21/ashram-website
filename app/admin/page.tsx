"use client";

import { useEffect, useState, useCallback } from "react";
import StatCard from "@/components/admin/StatCard";
import RecentTable from "@/components/admin/RecentTable";
import QuickActions from "@/components/admin/QuickActions";

// ── Types ───────────────────────────────────────────────────────────────────

interface DashboardSummary {
  totalEvents: number;
  publishedEvents: number;
  upcomingEvents: number;
  totalRegistrations: number;
  totalContactMessages: number;
  newContactMessages: number;
  successfulPayments: number;
  totalDonationAmount: number;
  totalPaymentAmount: number;
}

interface RecentRegistration {
  id: string;
  registrationNumber: string;
  fullName: string;
  email: string;
  registrationStatus: string;
  paymentStatus: string;
  createdAt: string;
  event: { title: string };
}

interface RecentMessage {
  id: string;
  fullName: string;
  email: string;
  subject: string;
  status: string;
  createdAt: string;
}

interface RecentPayment {
  id: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  paymentDate: string | null;
  createdAt: string;
  registration: {
    fullName: string;
    registrationNumber: string;
    event: { title: string };
  };
}

interface DashboardData {
  summary: DashboardSummary;
  recentRegistrations: RecentRegistration[];
  recentMessages: RecentMessage[];
  recentPayments: RecentPayment[];
}

// ── Status Badge Helper ─────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  let badgeClass = "admin-status-badge--muted";
  const s = status.toLowerCase();

  if (["confirmed", "paid", "replied", "published", "completed"].includes(s)) {
    badgeClass = "admin-status-badge--success";
  } else if (["pending", "new", "draft"].includes(s)) {
    badgeClass = "admin-status-badge--pending";
  } else if (["failed", "cancelled", "archived"].includes(s)) {
    badgeClass = "admin-status-badge--danger";
  } else if (["read"].includes(s)) {
    badgeClass = "admin-status-badge--info";
  }

  return (
    <span className={`admin-status-badge ${badgeClass}`}>
      {status}
    </span>
  );
}

// ── Currency Formatter Helper ───────────────────────────────────────────────

function formatCurrency(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
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

function EventsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 7H18" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PublishedIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 2C5.58 2 2 5.58 2 10C2 14.42 5.58 18 10 18C14.42 18 18 14.42 18 10C18 5.58 14.42 2 10 2Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.5 10L9 12.5L13.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="7" cy="11" r="1" fill="currentColor" />
      <circle cx="10" cy="11" r="1" fill="currentColor" />
      <circle cx="13" cy="11" r="1" fill="currentColor" />
      <path d="M6 1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function RegistrationsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 2H14L17 5V17C17 17.5523 16.5523 18 16 18H4C3.44772 18 3 17.5523 3 17V3C3 2.44772 3.44772 2 4 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7 10L9 12L13 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ContactIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 6L10 11L18 6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function PaymentsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M1 8H19" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 13H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function DonationIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 2L12.5 7.5H18L13.5 11L15.5 16.5L10 13L4.5 16.5L6.5 11L2 7.5H7.5L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

// ── Main Page Component ─────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/dashboard");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load dashboard data");
      }
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ── Loading Skeleton State ──
  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="admin-dashboard__header">
          <div className="admin-skeleton" style={{ width: "200px", height: "32px" }} />
          <div className="admin-skeleton" style={{ width: "300px", height: "18px", marginTop: "8px" }} />
        </div>

        <div className="admin-stats-grid">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="admin-skeleton admin-skeleton-card" />
          ))}
        </div>

        <div className="admin-skeleton admin-skeleton-block" style={{ height: "160px" }} />

        <div className="admin-recent-grid">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="admin-skeleton admin-skeleton-block" style={{ height: "320px" }} />
          ))}
        </div>
      </div>
    );
  }

  // ── Error State ──
  if (error || !data) {
    return (
      <div className="admin-dashboard-error">
        <div className="admin-dashboard-error__icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="16" r="1" fill="currentColor" />
          </svg>
        </div>
        <h2 className="admin-dashboard-error__title">Unable to load dashboard</h2>
        <p className="admin-dashboard-error__msg">{error || "Could not retrieve data from server."}</p>
        <button className="admin-dashboard-error__retry" onClick={fetchDashboardData}>
          Try Again
        </button>
      </div>
    );
  }

  const { summary, recentRegistrations, recentMessages, recentPayments } = data;

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-dashboard__header">
        <h1 className="admin-dashboard__title">Dashboard Overview</h1>
        <p className="admin-dashboard__subtitle">
          Real-time summary of ashram events, registrations, messages, and payments
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="admin-stats-grid">
        <StatCard
          title="Total Events"
          value={summary.totalEvents}
          icon={<EventsIcon />}
          accentColor="gold"
          href="/admin/events"
        />

        <StatCard
          title="Published Events"
          value={summary.publishedEvents}
          icon={<PublishedIcon />}
          accentColor="forest"
          href="/admin/events"
        />

        <StatCard
          title="Upcoming Events"
          value={summary.upcomingEvents}
          icon={<CalendarIcon />}
          accentColor="blue"
          href="/admin/events"
        />

        <StatCard
          title="Event Registrations"
          value={summary.totalRegistrations}
          icon={<RegistrationsIcon />}
          accentColor="saffron"
          href="/admin/registrations"
        />

        <StatCard
          title="Contact Messages"
          value={summary.totalContactMessages}
          icon={<ContactIcon />}
          accentColor="purple"
          subtitle={summary.newContactMessages > 0 ? `${summary.newContactMessages} new unread` : "All read"}
          href="/admin/contact-messages"
        />

        <StatCard
          title="Successful Payments"
          value={summary.successfulPayments}
          icon={<PaymentsIcon />}
          accentColor="emerald"
          subtitle={summary.totalPaymentAmount > 0 ? formatCurrency(summary.totalPaymentAmount) : undefined}
          href="/admin/payments"
        />

        <StatCard
          title="Total Donations"
          value={formatCurrency(summary.totalDonationAmount)}
          icon={<DonationIcon />}
          accentColor="gold"
          subtitle="Direct & event donations"
          href="/admin/payments"
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Activity Tables */}
      <div className="admin-recent-grid">
        {/* Recent Registrations */}
        <RecentTable<RecentRegistration>
          title="Recent Registrations"
          icon={<RegistrationsIcon />}
          viewAllHref="/admin/registrations"
          emptyMessage="No registrations received yet."
          rows={recentRegistrations}
          columns={[
            {
              key: "participant",
              label: "Participant",
              render: (row) => (
                <div>
                  <div style={{ fontWeight: 600 }}>{row.fullName}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>
                    {row.registrationNumber}
                  </div>
                </div>
              ),
            },
            {
              key: "event",
              label: "Event",
              hideOnMobile: true,
              render: (row) => (
                <span style={{ color: "var(--admin-text-secondary)" }}>
                  {row.event?.title || "N/A"}
                </span>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (row) => <StatusBadge status={row.registrationStatus} />,
            },
          ]}
        />

        {/* Recent Contact Messages */}
        <RecentTable<RecentMessage>
          title="Recent Messages"
          icon={<ContactIcon />}
          viewAllHref="/admin/contact-messages"
          emptyMessage="No contact messages received yet."
          rows={recentMessages}
          columns={[
            {
              key: "sender",
              label: "From",
              render: (row) => (
                <div>
                  <div style={{ fontWeight: 600 }}>{row.fullName}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>
                    {row.email}
                  </div>
                </div>
              ),
            },
            {
              key: "subject",
              label: "Subject",
              hideOnMobile: true,
              render: (row) => (
                <span style={{ color: "var(--admin-text-secondary)" }}>
                  {row.subject}
                </span>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (row) => <StatusBadge status={row.status} />,
            },
          ]}
        />

        {/* Recent Payments */}
        <RecentTable<RecentPayment>
          title="Recent Payments"
          icon={<PaymentsIcon />}
          viewAllHref="/admin/payments"
          emptyMessage="No payment records found."
          rows={recentPayments}
          columns={[
            {
              key: "payer",
              label: "Payer",
              render: (row) => (
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {row.registration?.fullName || "Anonymous"}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>
                    {row.paymentDate ? formatDate(row.paymentDate) : formatDate(row.createdAt)}
                  </div>
                </div>
              ),
            },
            {
              key: "amount",
              label: "Amount",
              render: (row) => (
                <span style={{ fontWeight: 600, color: "var(--admin-accent)" }}>
                  {formatCurrency(Number(row.amount), row.currency)}
                </span>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (row) => <StatusBadge status={row.paymentStatus} />,
            },
          ]}
        />
      </div>
    </div>
  );
}
