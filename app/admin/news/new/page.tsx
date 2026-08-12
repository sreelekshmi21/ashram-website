"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface FormData {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  status: string;
  coverImage: string;
}

interface FieldErrors {
  [key: string]: string[] | undefined;
}

function toDateInputString(date: Date): string {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

const initialFormData: FormData = {
  title: "",
  excerpt: "",
  content: "",
  category: "General",
  date: toDateInputString(new Date()),
  status: "Draft",
  coverImage: "",
};

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

export default function CreateNewsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
    if (!formData.excerpt.trim() || formData.excerpt.trim().length < 10) {
      errors.excerpt = ["Excerpt must be at least 10 characters"];
    }
    if (!formData.date) {
      errors.date = ["Date is required"];
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
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim() || undefined,
        category: formData.category.trim() || "General",
        date: formData.date,
        status: formData.status,
        coverImage: formData.coverImage.trim() || undefined,
      };

      const res = await fetch("/api/admin/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        if (json.fieldErrors) {
          setFieldErrors(json.fieldErrors);
        }
        throw new Error(json.error || "Failed to create news article");
      }

      setToast({ message: "Article created successfully!", type: "success" });

      setTimeout(() => {
        router.push("/admin/news");
      }, 1000);
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : "Failed to create article",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (field: string): string | undefined => {
    return fieldErrors[field]?.[0];
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
          <h1 className="admin-events__title">Create News Article</h1>
          <p className="admin-events__subtitle">
            Fill in details below to publish a new announcement or press release
          </p>
        </div>
        <Link href="/admin/news" className="admin-events__back-btn">
          ← Back to News
        </Link>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="admin-events-form" noValidate>
        <div className="admin-events-form__section">
          <h2 className="admin-events-form__section-title">Article Details</h2>

          <div className="admin-events-form__field">
            <label htmlFor="news-title" className="admin-events-form__label">
              Title <span className="admin-events-form__required">*</span>
            </label>
            <input
              id="news-title"
              name="title"
              type="text"
              className={`admin-events-form__input ${getFieldError("title") ? "admin-events-form__input--error" : ""}`}
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Annual Ashram Spiritual Convention Announced"
              maxLength={200}
            />
            {getFieldError("title") && (
              <p className="admin-events-form__error">{getFieldError("title")}</p>
            )}
          </div>

          <div className="admin-events-form__field">
            <label htmlFor="news-excerpt" className="admin-events-form__label">
              Excerpt / Summary <span className="admin-events-form__required">*</span>
            </label>
            <textarea
              id="news-excerpt"
              name="excerpt"
              className={`admin-events-form__textarea ${getFieldError("excerpt") ? "admin-events-form__input--error" : ""}`}
              value={formData.excerpt}
              onChange={handleChange}
              placeholder="A brief summary for news cards and search results…"
              rows={3}
              maxLength={1000}
            />
            {getFieldError("excerpt") && (
              <p className="admin-events-form__error">{getFieldError("excerpt")}</p>
            )}
          </div>

          <div className="admin-events-form__field">
            <label htmlFor="news-content" className="admin-events-form__label">
              Full Content
            </label>
            <textarea
              id="news-content"
              name="content"
              className="admin-events-form__textarea"
              value={formData.content}
              onChange={handleChange}
              placeholder="Detailed content of the news article…"
              rows={8}
              maxLength={10000}
            />
          </div>

          <div className="admin-events-form__row">
            <div className="admin-events-form__field">
              <label htmlFor="news-category" className="admin-events-form__label">
                Category
              </label>
              <input
                id="news-category"
                name="category"
                type="text"
                className="admin-events-form__input"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g. Infrastructure, Events, Research, General"
              />
            </div>

            <div className="admin-events-form__field">
              <label htmlFor="news-date" className="admin-events-form__label">
                Publication Date <span className="admin-events-form__required">*</span>
              </label>
              <input
                id="news-date"
                name="date"
                type="date"
                className={`admin-events-form__input ${getFieldError("date") ? "admin-events-form__input--error" : ""}`}
                value={formData.date}
                onChange={handleChange}
              />
              {getFieldError("date") && (
                <p className="admin-events-form__error">{getFieldError("date")}</p>
              )}
            </div>

            <div className="admin-events-form__field">
              <label htmlFor="news-status" className="admin-events-form__label">
                Status
              </label>
              <select
                id="news-status"
                name="status"
                className="admin-events-form__select"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </div>
          </div>

          <div className="admin-events-form__field">
            <label htmlFor="news-cover-image" className="admin-events-form__label">
              Cover Image URL
            </label>
            <input
              id="news-cover-image"
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
        </div>

        {/* Actions */}
        <div className="admin-events-form__actions">
          <Link href="/admin/news" className="admin-events-form__btn admin-events-form__btn--cancel">
            Cancel
          </Link>
          <button
            type="submit"
            className="admin-events-form__btn admin-events-form__btn--submit"
            disabled={isSubmitting}
            id="submit-news-btn"
          >
            {isSubmitting ? "Creating…" : "Create Article"}
          </button>
        </div>
      </form>
    </div>
  );
}
