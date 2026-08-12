"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

// ── Types ───────────────────────────────────────────────────────────────────

interface PaymentItem {
  id: string;
  paymentGateway: string;
  gatewayOrderId: string | null;
  gatewayPaymentId: string | null;
  amount: number;
  currency: string;
  paymentStatus: string;
  paymentDate: string | null;
  createdAt: string;
}

interface RegistrationDetail {
  id: string;
  registrationNumber: string;
  eventId: string;
  fullName: string;
  gender: string | null;
  dateOfBirth: string | null;
  age: number | null;
  mobileNumber: string;
  email: string;
  occupation: string | null;
  organisation: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  district: string | null;
  state: string | null;
  country: string | null;
  pinCode: string | null;
  emergencyContactName: string | null;
  emergencyRelationship: string | null;
  emergencyMobileNumber: string | null;
  numberOfParticipants: number;
  preferredLanguage: string | null;
  accommodationRequired: boolean;
  foodPreference: string | null;
  transportationRequired: boolean;
  arrivalDate: string | null;
  departureDate: string | null;
  medicalCondition: string | null;
  allergies: string | null;
  currentMedication: string | null;
  specialAssistance: string | null;
  donationAmount: number | null;
  donationPurpose: string | null;
  registrationStatus: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  event: {
    id: string;
    title: string;
    slug: string;
    venue: string | null;
    startDate: string;
    endDate: string | null;
    registrationFee: number;
    status: string;
  };
  payments: PaymentItem[];
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

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

// ── Detail Field Row ────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="admin-reg-detail__row">
      <dt className="admin-reg-detail__label">{label}</dt>
      <dd className="admin-reg-detail__value">{value}</dd>
    </div>
  );
}

// ── Main Page Component ─────────────────────────────────────────────────────

export default function AdminRegistrationDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [registration, setRegistration] = useState<RegistrationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [statusValue, setStatusValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Fetch registration detail
  const fetchRegistration = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/registrations/${id}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load registration");
      }

      setRegistration(json.data);
      setStatusValue(json.data.registrationStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRegistration();
  }, [fetchRegistration]);

  // ── Status Update Handler ─────────────────────────────────────────────────

  const handleStatusUpdate = async () => {
    if (!registration || statusValue === registration.registrationStatus) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/registrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationStatus: statusValue }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update status");
      }

      setToast({ message: "Registration status updated successfully.", type: "success" });
      fetchRegistration();
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : "Failed to update status",
        type: "error",
      });
      // Reset select to current value
      if (registration) setStatusValue(registration.registrationStatus);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Loading Skeleton ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="admin-events">
        <div className="admin-events__header">
          <div>
            <div className="admin-skeleton" style={{ width: "140px", height: "28px" }} />
            <div className="admin-skeleton" style={{ width: "300px", height: "32px", marginTop: "12px" }} />
          </div>
        </div>
        <div className="admin-skeleton admin-skeleton-block" style={{ height: "300px" }} />
        <div className="admin-skeleton admin-skeleton-block" style={{ height: "200px" }} />
      </div>
    );
  }

  // ── Error State ───────────────────────────────────────────────────────────

  if (error || !registration) {
    return (
      <div className="admin-events">
        <div className="admin-events__header">
          <div>
            <Link href="/admin/registrations" className="admin-events__back-btn">
              <ChevronLeftIcon /> Back to Registrations
            </Link>
            <h1 className="admin-events__title" style={{ marginTop: "0.75rem" }}>
              Registration Not Found
            </h1>
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
          <h2 className="admin-dashboard-error__title">Unable to load registration</h2>
          <p className="admin-dashboard-error__msg">{error || "Registration not found"}</p>
          <button className="admin-dashboard-error__retry" onClick={fetchRegistration}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Build address string
  const addressParts = [
    registration.addressLine1,
    registration.addressLine2,
    registration.city,
    registration.district,
    registration.state,
    registration.pinCode,
    registration.country,
  ].filter(Boolean);
  const fullAddress = addressParts.length > 0 ? addressParts.join(", ") : null;

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

      {/* Header */}
      <div className="admin-events__header">
        <div>
          <Link href="/admin/registrations" className="admin-events__back-btn">
            <ChevronLeftIcon /> Back to Registrations
          </Link>
          <h1 className="admin-events__title" style={{ marginTop: "0.75rem" }}>
            {registration.registrationNumber}
          </h1>
          <div className="admin-reg-detail__badges">
            <RegistrationStatusBadge status={registration.registrationStatus} />
            <PaymentStatusBadge status={registration.paymentStatus} />
          </div>
        </div>
      </div>

      {/* Status Update */}
      <div className="admin-reg-detail__status-card">
        <h3 className="admin-reg-detail__section-title">Update Registration Status</h3>
        <div className="admin-reg-detail__status-form">
          <select
            id="registration-status-select"
            className="admin-events__filter"
            value={statusValue}
            onChange={(e) => setStatusValue(e.target.value)}
            disabled={isSaving}
          >
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Completed">Completed</option>
          </select>
          <button
            className="admin-events__create-btn admin-events__create-btn--small"
            onClick={handleStatusUpdate}
            disabled={isSaving || statusValue === registration.registrationStatus}
          >
            {isSaving ? "Saving…" : "Update Status"}
          </button>
        </div>
      </div>

      {/* Participant Information */}
      <div className="admin-reg-detail__card">
        <h3 className="admin-reg-detail__section-title">Participant Information</h3>
        <dl className="admin-reg-detail__grid">
          <DetailRow label="Full Name" value={registration.fullName} />
          <DetailRow label="Email" value={registration.email} />
          <DetailRow label="Mobile" value={registration.mobileNumber} />
          <DetailRow label="Gender" value={registration.gender} />
          <DetailRow
            label="Date of Birth"
            value={registration.dateOfBirth ? formatDate(registration.dateOfBirth) : null}
          />
          <DetailRow label="Age" value={registration.age} />
          <DetailRow label="Occupation" value={registration.occupation} />
          <DetailRow label="Organisation" value={registration.organisation} />
        </dl>
      </div>

      {/* Address */}
      {fullAddress && (
        <div className="admin-reg-detail__card">
          <h3 className="admin-reg-detail__section-title">Address</h3>
          <dl className="admin-reg-detail__grid">
            <DetailRow label="Address" value={fullAddress} />
          </dl>
        </div>
      )}

      {/* Emergency Contact */}
      {(registration.emergencyContactName || registration.emergencyMobileNumber) && (
        <div className="admin-reg-detail__card">
          <h3 className="admin-reg-detail__section-title">Emergency Contact</h3>
          <dl className="admin-reg-detail__grid">
            <DetailRow label="Contact Name" value={registration.emergencyContactName} />
            <DetailRow label="Relationship" value={registration.emergencyRelationship} />
            <DetailRow label="Phone" value={registration.emergencyMobileNumber} />
          </dl>
        </div>
      )}

      {/* Event Preferences */}
      <div className="admin-reg-detail__card">
        <h3 className="admin-reg-detail__section-title">Event Preferences</h3>
        <dl className="admin-reg-detail__grid">
          <DetailRow label="Number of Participants" value={registration.numberOfParticipants} />
          <DetailRow label="Preferred Language" value={registration.preferredLanguage} />
          <DetailRow label="Accommodation Required" value={registration.accommodationRequired ? "Yes" : "No"} />
          <DetailRow label="Food Preference" value={registration.foodPreference} />
          <DetailRow label="Transportation Required" value={registration.transportationRequired ? "Yes" : "No"} />
          <DetailRow
            label="Arrival Date"
            value={registration.arrivalDate ? formatDate(registration.arrivalDate) : null}
          />
          <DetailRow
            label="Departure Date"
            value={registration.departureDate ? formatDate(registration.departureDate) : null}
          />
        </dl>
      </div>

      {/* Health Information */}
      {(registration.medicalCondition || registration.allergies || registration.currentMedication || registration.specialAssistance) && (
        <div className="admin-reg-detail__card">
          <h3 className="admin-reg-detail__section-title">Health Information</h3>
          <dl className="admin-reg-detail__grid">
            <DetailRow label="Medical Conditions" value={registration.medicalCondition} />
            <DetailRow label="Allergies" value={registration.allergies} />
            <DetailRow label="Current Medication" value={registration.currentMedication} />
            <DetailRow label="Special Assistance" value={registration.specialAssistance} />
          </dl>
        </div>
      )}

      {/* Donation */}
      {(registration.donationAmount || registration.donationPurpose) && (
        <div className="admin-reg-detail__card">
          <h3 className="admin-reg-detail__section-title">Donation</h3>
          <dl className="admin-reg-detail__grid">
            <DetailRow
              label="Donation Amount"
              value={registration.donationAmount ? formatCurrency(Number(registration.donationAmount)) : null}
            />
            <DetailRow label="Donation Purpose" value={registration.donationPurpose} />
          </dl>
        </div>
      )}

      {/* Event Information */}
      <div className="admin-reg-detail__card">
        <h3 className="admin-reg-detail__section-title">Event Information</h3>
        <dl className="admin-reg-detail__grid">
          <DetailRow
            label="Event"
            value={
              <Link href={`/admin/events/${registration.event.id}/edit`} className="admin-reg-detail__link">
                {registration.event.title}
              </Link>
            }
          />
          <DetailRow label="Venue" value={registration.event.venue} />
          <DetailRow label="Start Date" value={formatDate(registration.event.startDate)} />
          <DetailRow
            label="End Date"
            value={registration.event.endDate ? formatDate(registration.event.endDate) : null}
          />
          <DetailRow label="Registration Fee" value={formatCurrency(Number(registration.event.registrationFee))} />
          <DetailRow label="Event Status" value={registration.event.status} />
        </dl>
      </div>

      {/* Payment History */}
      {registration.payments.length > 0 && (
        <div className="admin-reg-detail__card">
          <h3 className="admin-reg-detail__section-title">Payment History</h3>
          <div className="admin-events__table-scroll">
            <table className="admin-events__table">
              <thead>
                <tr>
                  <th>Gateway</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="admin-events__th-hide-mobile">Order ID</th>
                  <th className="admin-events__th-hide-mobile">Payment ID</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {registration.payments.map((payment) => (
                  <tr key={payment.id} className="admin-events__tr">
                    <td>
                      <span className="admin-reg__event-name">
                        {payment.paymentGateway}
                      </span>
                    </td>
                    <td>
                      {formatCurrency(Number(payment.amount))}
                    </td>
                    <td>
                      <PaymentStatusBadge status={payment.paymentStatus} />
                    </td>
                    <td className="admin-events__td-hide-mobile">
                      <span className="admin-events__event-slug" style={{ marginTop: 0 }}>
                        {payment.gatewayOrderId || "—"}
                      </span>
                    </td>
                    <td className="admin-events__td-hide-mobile">
                      <span className="admin-events__event-slug" style={{ marginTop: 0 }}>
                        {payment.gatewayPaymentId || "—"}
                      </span>
                    </td>
                    <td>
                      <div className="admin-events__date-text">
                        {payment.paymentDate
                          ? formatDateTime(payment.paymentDate)
                          : formatDateTime(payment.createdAt)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="admin-reg-detail__timestamps">
        <span>Registered: {formatDateTime(registration.createdAt)}</span>
        <span>Last Updated: {formatDateTime(registration.updatedAt)}</span>
      </div>
    </div>
  );
}
