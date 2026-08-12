"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
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

function toDateString(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
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

export default function EditNewsPage() {
  const router = useRouter();
  const params = useParams();
  const newsId = params.id as string;

  const [formData, setFormData] = useState<FormData>({
    title: "",
    excerpt: "",
    content: "",
    category: "General",
    date: "",
    status: "Draft",
    coverImage: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [articleTitle, setArticleTitle] = useState("");

  const fetchNewsItem = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/admin/news/${newsId}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load article");
      }

      const item = json.data;
      setArticleTitle(item.title);
      setFormData({
        title: item.title || "",
        excerpt: item.excerpt || "",
        content: item.content || "",
        category: item.category || "General",
        date: toDateString(item.date),
        status: item.status || "Draft",
        coverImage: item.coverImage || "",
      });
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load article");
    } finally {
      setIsLoading(false);
    }
  }, [newsId]);

  useEffect(() => {
    fetchNewsItem();
  }, [fetchNewsItem]);

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

      const res = await fetch(`/api/admin/news/${newsId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        if (json.fieldErrors) {
          setFieldErrors(json.fieldErrors);
        }
        throw new Error(json.error || "Failed to update article");
      }

      setToast({ message: "Article updated successfully!", type: "success" });

      setTimeout(() => {
        router.push("/admin/news");
      }, 1000);
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : "Failed to update article",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (field: string): string | undefined => {
    return fieldErrors[field]?.[0];
  };

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
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="admin-events">
        <div className="admin-events__header">
          <div>
            <h1 className="admin-events__title">Edit News Article</h1>
          </div>
          <Link href="/admin/news" className="admin-events__back-btn">
            ← Back to News
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
          <h2 className="admin-dashboard-error__title">Unable to Load Article</h2>
          <p className="admin-dashboard-error__msg">{loadError}</p>
          <button className="admin-dashboard-error__retry" onClick={fetchNewsItem}>
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

      {/* Header */}
      <div className="admin-events__header">
        <div>
          <h1 className="admin-events__title">Edit News Article</h1>
          <p className="admin-events__subtitle">
            Editing: {articleTitle}
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
            id="update-news-btn"
          >
            {isSubmitting ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
