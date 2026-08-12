"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

// ── Types ───────────────────────────────────────────────────────────────────

interface FormData {
  title: string;
  description: string;
  venue: string;
  startDate: string;
  endDate: string;
  registrationRequired: boolean;
  registrationFee: string;
  registrationDeadline: string;
  status: string;
  category: string;
  coverImage: string;
  gradient: string;
}

interface FieldErrors {
  [key: string]: string[] | undefined;
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

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert an ISO date string to a YYYY-MM-DD date input value.
 */
function toDateString(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    venue: "",
    startDate: "",
    endDate: "",
    registrationRequired: true,
    registrationFee: "0",
    registrationDeadline: "",
    status: "Draft",
    category: "SPECIAL",
    coverImage: "",
    gradient: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [eventTitle, setEventTitle] = useState("");

  // Fetch event data
  const fetchEvent = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/admin/events/${eventId}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load event");
      }

      const event = json.data;
      setEventTitle(event.title);
      setFormData({
        title: event.title || "",
        description: event.description || "",
        venue: event.venue || "",
        startDate: toDateString(event.startDate),
        endDate: toDateString(event.endDate),
        registrationRequired: event.registrationRequired ?? true,
        registrationFee: String(Number(event.registrationFee) || 0),
        registrationDeadline: toDateString(event.registrationDeadline),
        status: event.status || "Draft",
        category: event.category || "SPECIAL",
        coverImage: event.coverImage || "",
        gradient: event.gradient || "",
      });
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load event");
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};

    if (!formData.title.trim() || formData.title.trim().length < 3) {
      errors.title = ["Title must be at least 3 characters"];
    }
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      errors.description = ["Description must be at least 10 characters"];
    }
    if (!formData.startDate) {
      errors.startDate = ["Start date is required"];
    }
    if (formData.endDate && formData.startDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        errors.endDate = ["End date must be on or after start date"];
      }
    }
    if (formData.registrationDeadline && formData.startDate) {
      if (new Date(formData.registrationDeadline) > new Date(formData.startDate)) {
        errors.registrationDeadline = ["Registration deadline must be on or before start date"];
      }
    }
    const fee = parseFloat(formData.registrationFee);
    if (isNaN(fee) || fee < 0) {
      errors.registrationFee = ["Registration fee must be a non-negative number"];
    }
    if (formData.coverImage && formData.coverImage.trim()) {
      try {
        new URL(formData.coverImage);
      } catch {
        errors.coverImage = ["Cover image must be a valid URL"];
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setToast(null);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        venue: formData.venue.trim() || undefined,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        registrationRequired: formData.registrationRequired,
        registrationFee: parseFloat(formData.registrationFee) || 0,
        registrationDeadline: formData.registrationDeadline || undefined,
        status: formData.status,
        category: formData.category,
        coverImage: formData.coverImage.trim() || undefined,
        gradient: formData.gradient.trim() || undefined,
      };

      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        if (json.fieldErrors) {
          setFieldErrors(json.fieldErrors);
        }
        throw new Error(json.error || "Failed to update event");
      }

      setToast({ message: "Event updated successfully!", type: "success" });

      setTimeout(() => {
        router.push("/admin/events");
      }, 1000);
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : "Failed to update event",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (field: string): string | undefined => {
    return fieldErrors[field]?.[0];
  };

  // ── Loading State ─────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="admin-events">
        <div className="admin-events__header">
          <div>
            <div className="admin-skeleton" style={{ width: "250px", height: "32px" }} />
            <div className="admin-skeleton" style={{ width: "350px", height: "18px", marginTop: "8px" }} />
          </div>
        </div>
        <div className="admin-skeleton admin-skeleton-block" style={{ height: "200px" }} />
        <div className="admin-skeleton admin-skeleton-block" style={{ height: "150px" }} />
        <div className="admin-skeleton admin-skeleton-block" style={{ height: "150px" }} />
      </div>
    );
  }

  // ── Error State ───────────────────────────────────────────────────────────

  if (loadError) {
    return (
      <div className="admin-events">
        <div className="admin-events__header">
          <div>
            <h1 className="admin-events__title">Edit Event</h1>
          </div>
          <Link href="/admin/events" className="admin-events__back-btn">
            ← Back to Events
          </Link>
        </div>
        <div className="admin-dashboard-error">
          <div className="admin-dashboard-error__icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="16" r="1" fill="currentColor" />
            </svg>
          </div>
          <h2 className="admin-dashboard-error__title">
            {loadError === "Event not found" ? "Event Not Found" : "Unable to Load Event"}
          </h2>
          <p className="admin-dashboard-error__msg">{loadError}</p>
          {loadError !== "Event not found" && (
            <button className="admin-dashboard-error__retry" onClick={fetchEvent}>
              Try Again
            </button>
          )}
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

      {/* Header */}
      <div className="admin-events__header">
        <div>
          <h1 className="admin-events__title">Edit Event</h1>
          <p className="admin-events__subtitle">
            Editing: {eventTitle}
          </p>
        </div>
        <Link href="/admin/events" className="admin-events__back-btn">
          ← Back to Events
        </Link>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="admin-events-form" noValidate>
        {/* Basic Info Section */}
        <div className="admin-events-form__section">
          <h2 className="admin-events-form__section-title">Basic Information</h2>

          <div className="admin-events-form__field">
            <label htmlFor="event-title" className="admin-events-form__label">
              Title <span className="admin-events-form__required">*</span>
            </label>
            <input
              id="event-title"
              name="title"
              type="text"
              className={`admin-events-form__input ${getFieldError("title") ? "admin-events-form__input--error" : ""}`}
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Annual Spiritual Retreat 2026"
              maxLength={200}
            />
            {getFieldError("title") && (
              <p className="admin-events-form__error">{getFieldError("title")}</p>
            )}
          </div>

          <div className="admin-events-form__field">
            <label htmlFor="event-description" className="admin-events-form__label">
              Description <span className="admin-events-form__required">*</span>
            </label>
            <textarea
              id="event-description"
              name="description"
              className={`admin-events-form__textarea ${getFieldError("description") ? "admin-events-form__input--error" : ""}`}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the event in detail…"
              rows={5}
              maxLength={5000}
            />
            <div className="admin-events-form__char-count">
              {formData.description.length}/5000
            </div>
            {getFieldError("description") && (
              <p className="admin-events-form__error">{getFieldError("description")}</p>
            )}
          </div>

          <div className="admin-events-form__field">
            <label htmlFor="event-venue" className="admin-events-form__label">
              Venue
            </label>
            <input
              id="event-venue"
              name="venue"
              type="text"
              className="admin-events-form__input"
              value={formData.venue}
              onChange={handleChange}
              placeholder="e.g. Santhigiri Ashram, Thiruvananthapuram"
              maxLength={300}
            />
          </div>

          <div className="admin-events-form__row">
            <div className="admin-events-form__field">
              <label htmlFor="event-category" className="admin-events-form__label">
                Category
              </label>
              <select
                id="event-category"
                name="category"
                className="admin-events-form__select"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
                <option value="SPECIAL">Special</option>
              </select>
            </div>

            <div className="admin-events-form__field">
              <label htmlFor="event-status" className="admin-events-form__label">
                Status
              </label>
              <select
                id="event-status"
                name="status"
                className="admin-events-form__select"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Date & Time Section */}
        <div className="admin-events-form__section">
          <h2 className="admin-events-form__section-title">Date &amp; Time</h2>

          <div className="admin-events-form__row">
            <div className="admin-events-form__field">
              <label htmlFor="event-start-date" className="admin-events-form__label">
                Start Date <span className="admin-events-form__required">*</span>
              </label>
              <input
                id="event-start-date"
                name="startDate"
                type="date"
                className={`admin-events-form__input ${getFieldError("startDate") ? "admin-events-form__input--error" : ""}`}
                value={formData.startDate}
                onChange={handleChange}
              />
              {getFieldError("startDate") && (
                <p className="admin-events-form__error">{getFieldError("startDate")}</p>
              )}
            </div>

            <div className="admin-events-form__field">
              <label htmlFor="event-end-date" className="admin-events-form__label">
                End Date
              </label>
              <input
                id="event-end-date"
                name="endDate"
                type="date"
                className={`admin-events-form__input ${getFieldError("endDate") ? "admin-events-form__input--error" : ""}`}
                value={formData.endDate}
                onChange={handleChange}
              />
              {getFieldError("endDate") && (
                <p className="admin-events-form__error">{getFieldError("endDate")}</p>
              )}
            </div>
          </div>
        </div>

        {/* Registration Section */}
        <div className="admin-events-form__section">
          <h2 className="admin-events-form__section-title">Registration</h2>

          <div className="admin-events-form__field admin-events-form__field--checkbox">
            <label className="admin-events-form__checkbox-label">
              <input
                id="event-registration-required"
                name="registrationRequired"
                type="checkbox"
                className="admin-events-form__checkbox"
                checked={formData.registrationRequired}
                onChange={handleChange}
              />
              <span className="admin-events-form__checkbox-custom" />
              <span>Registration required</span>
            </label>
          </div>

          {formData.registrationRequired && (
            <div className="admin-events-form__row">
              <div className="admin-events-form__field">
                <label htmlFor="event-fee" className="admin-events-form__label">
                  Registration Fee (₹)
                </label>
                <input
                  id="event-fee"
                  name="registrationFee"
                  type="number"
                  min="0"
                  step="1"
                  className={`admin-events-form__input ${getFieldError("registrationFee") ? "admin-events-form__input--error" : ""}`}
                  value={formData.registrationFee}
                  onChange={handleChange}
                  placeholder="0"
                />
                {getFieldError("registrationFee") && (
                  <p className="admin-events-form__error">{getFieldError("registrationFee")}</p>
                )}
              </div>

              <div className="admin-events-form__field">
                <label htmlFor="event-deadline" className="admin-events-form__label">
                  Registration Deadline
                </label>
                <input
                  id="event-deadline"
                  name="registrationDeadline"
                  type="date"
                  className={`admin-events-form__input ${getFieldError("registrationDeadline") ? "admin-events-form__input--error" : ""}`}
                  value={formData.registrationDeadline}
                  onChange={handleChange}
                />
                {getFieldError("registrationDeadline") && (
                  <p className="admin-events-form__error">{getFieldError("registrationDeadline")}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Media Section */}
        <div className="admin-events-form__section">
          <h2 className="admin-events-form__section-title">Media &amp; Appearance</h2>

          <div className="admin-events-form__field">
            <label htmlFor="event-cover-image" className="admin-events-form__label">
              Cover Image URL
            </label>
            <input
              id="event-cover-image"
              name="coverImage"
              type="url"
              className={`admin-events-form__input ${getFieldError("coverImage") ? "admin-events-form__input--error" : ""}`}
              value={formData.coverImage}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
            {getFieldError("coverImage") && (
              <p className="admin-events-form__error">{getFieldError("coverImage")}</p>
            )}
          </div>

          <div className="admin-events-form__field">
            <label htmlFor="event-gradient" className="admin-events-form__label">
              Card Gradient CSS
            </label>
            <input
              id="event-gradient"
              name="gradient"
              type="text"
              className="admin-events-form__input"
              value={formData.gradient}
              onChange={handleChange}
              placeholder="e.g. linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            />
            <p className="admin-events-form__hint">
              CSS gradient used for the event card on the public site.
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="admin-events-form__actions">
          <Link href="/admin/events" className="admin-events-form__btn admin-events-form__btn--cancel">
            Cancel
          </Link>
          <button
            type="submit"
            className="admin-events-form__btn admin-events-form__btn--submit"
            disabled={isSubmitting}
            id="update-event-btn"
          >
            {isSubmitting ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
