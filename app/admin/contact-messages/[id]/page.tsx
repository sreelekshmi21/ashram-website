"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

// ── Types ───────────────────────────────────────────────────────────────────

interface MessageDetail {
  id: string;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
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

// ── Delete Confirmation Modal ───────────────────────────────────────────────

function DeleteModal({
  msg,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  msg: MessageDetail;
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
          Are you sure you want to delete the message from <strong>{msg.fullName}</strong>?
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

export default function AdminContactMessageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [msg, setMsg] = useState<MessageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [statusValue, setStatusValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MessageDetail | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch message detail
  const fetchMessage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/contact-messages/${id}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load message");
      }

      setMsg(json.data);
      setStatusValue(json.data.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMessage();
  }, [fetchMessage]);

  // ── Status Update Handler ─────────────────────────────────────────────────

  const handleStatusUpdate = async () => {
    if (!msg || statusValue === msg.status) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/contact-messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusValue }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update status");
      }

      setToast({ message: "Message status updated successfully.", type: "success" });
      fetchMessage();
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : "Failed to update status",
        type: "error",
      });
      if (msg) setStatusValue(msg.status);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete Handler ────────────────────────────────────────────────────────

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
      // Navigate back to list after short delay
      setTimeout(() => {
        router.push("/admin/contact-messages");
      }, 1000);
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : "Failed to delete message",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Loading Skeleton ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="admin-events">
        <div className="admin-events__header">
          <div>
            <div className="admin-skeleton" style={{ width: "180px", height: "28px" }} />
            <div className="admin-skeleton" style={{ width: "300px", height: "32px", marginTop: "12px" }} />
          </div>
        </div>
        <div className="admin-skeleton admin-skeleton-block" style={{ height: "200px" }} />
        <div className="admin-skeleton admin-skeleton-block" style={{ height: "300px" }} />
      </div>
    );
  }

  // ── Error State ───────────────────────────────────────────────────────────

  if (error || !msg) {
    return (
      <div className="admin-events">
        <div className="admin-events__header">
          <div>
            <Link href="/admin/contact-messages" className="admin-events__back-btn">
              <ChevronLeftIcon /> Back to Messages
            </Link>
            <h1 className="admin-events__title" style={{ marginTop: "0.75rem" }}>
              Message Not Found
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
          <h2 className="admin-dashboard-error__title">Unable to load message</h2>
          <p className="admin-dashboard-error__msg">{error || "Message not found"}</p>
          <button className="admin-dashboard-error__retry" onClick={fetchMessage}>
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
          msg={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}

      {/* Header */}
      <div className="admin-events__header">
        <div>
          <Link href="/admin/contact-messages" className="admin-events__back-btn">
            <ChevronLeftIcon /> Back to Messages
          </Link>
          <h1 className="admin-events__title" style={{ marginTop: "0.75rem" }}>
            {msg.subject}
          </h1>
          <div className="admin-reg-detail__badges">
            <ContactStatusBadge status={msg.status} />
          </div>
        </div>
        <button
          className="admin-msg-detail__delete-btn"
          onClick={() => setDeleteTarget(msg)}
        >
          Delete Message
        </button>
      </div>

      {/* Status Update */}
      <div className="admin-reg-detail__status-card">
        <h3 className="admin-reg-detail__section-title">Update Status</h3>
        <div className="admin-reg-detail__status-form">
          <select
            id="message-status-select"
            className="admin-events__filter"
            value={statusValue}
            onChange={(e) => setStatusValue(e.target.value)}
            disabled={isSaving}
          >
            <option value="New">New</option>
            <option value="Read">Read</option>
            <option value="Replied">Replied</option>
            <option value="Archived">Archived</option>
          </select>
          <button
            className="admin-events__create-btn admin-events__create-btn--small"
            onClick={handleStatusUpdate}
            disabled={isSaving || statusValue === msg.status}
          >
            {isSaving ? "Saving…" : "Update Status"}
          </button>
        </div>
      </div>

      {/* Sender Information */}
      <div className="admin-reg-detail__card">
        <h3 className="admin-reg-detail__section-title">Sender Information</h3>
        <dl className="admin-reg-detail__grid">
          <div className="admin-reg-detail__row">
            <dt className="admin-reg-detail__label">Full Name</dt>
            <dd className="admin-reg-detail__value">{msg.fullName}</dd>
          </div>
          <div className="admin-reg-detail__row">
            <dt className="admin-reg-detail__label">Email</dt>
            <dd className="admin-reg-detail__value">
              <a href={`mailto:${msg.email}`} className="admin-reg-detail__link">
                {msg.email}
              </a>
            </dd>
          </div>
        </dl>
      </div>

      {/* Message Content */}
      <div className="admin-reg-detail__card">
        <h3 className="admin-reg-detail__section-title">Message</h3>
        <div className="admin-msg-detail__content">
          {msg.message}
        </div>
      </div>

      {/* Timestamps */}
      <div className="admin-reg-detail__timestamps">
        <span>Received: {formatDateTime(msg.createdAt)}</span>
        <span>Last Updated: {formatDateTime(msg.updatedAt)}</span>
      </div>
    </div>
  );
}
