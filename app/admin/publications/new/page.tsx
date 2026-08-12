"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ── Types ───────────────────────────────────────────────────────────────────

interface FormData {
  title: string;
  author: string;
  price: string;
  pages: string;
  language: string;
  isbn: string;
  description: string;
  longDescription: string;
  gradient: string;
  coverImage: string;
  status: string;
  displayOrder: string;
}

interface FieldErrors {
  [key: string]: string[] | undefined;
}

const initialFormData: FormData = {
  title: "",
  author: "Ashram Publications",
  price: "300",
  pages: "200",
  language: "English",
  isbn: "",
  description: "",
  longDescription: "",
  gradient: "linear-gradient(135deg, #1A3A25, #2D5A3D, #3D7A53)",
  coverImage: "",
  status: "Draft",
  displayOrder: "0",
};

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

// ── Main Component ──────────────────────────────────────────────────────────

export default function CreatePublicationPage() {
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

    if (!formData.title.trim() || formData.title.trim().length < 2) {
      errors.title = ["Title must be at least 2 characters"];
    }
    if (!formData.author.trim()) {
      errors.author = ["Author is required"];
    }
    const priceVal = parseFloat(formData.price);
    if (isNaN(priceVal) || priceVal < 0) {
      errors.price = ["Price must be a valid non-negative number"];
    }
    const pagesVal = parseInt(formData.pages, 10);
    if (isNaN(pagesVal) || pagesVal < 1) {
      errors.pages = ["Pages must be at least 1"];
    }
    if (!formData.language.trim()) {
      errors.language = ["Language is required"];
    }
    if (!formData.isbn.trim()) {
      errors.isbn = ["ISBN is required"];
    }
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      errors.description = ["Description must be at least 10 characters"];
    }
    if (!formData.longDescription.trim() || formData.longDescription.trim().length < 10) {
      errors.longDescription = ["Long description must be at least 10 characters"];
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
        author: formData.author.trim(),
        price: parseFloat(formData.price) || 0,
        pages: parseInt(formData.pages, 10) || 1,
        language: formData.language.trim(),
        isbn: formData.isbn.trim(),
        description: formData.description.trim(),
        longDescription: formData.longDescription.trim(),
        gradient: formData.gradient.trim() || undefined,
        coverImage: formData.coverImage.trim() || undefined,
        status: formData.status,
        displayOrder: parseInt(formData.displayOrder, 10) || 0,
      };

      const res = await fetch("/api/admin/publications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        if (json.fieldErrors) {
          setFieldErrors(json.fieldErrors);
        }
        throw new Error(json.error || "Failed to create publication");
      }

      setToast({ message: "Publication created successfully!", type: "success" });

      setTimeout(() => {
        router.push("/admin/publications");
      }, 1000);
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : "Failed to create publication",
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
          <h1 className="admin-events__title">Create New Publication</h1>
          <p className="admin-events__subtitle">
            Fill in the details below to add a new book to the catalog
          </p>
        </div>
        <Link href="/admin/publications" className="admin-events__back-btn">
          ← Back to Publications
        </Link>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="admin-events-form" noValidate>
        {/* Basic Info Section */}
        <div className="admin-events-form__section">
          <h2 className="admin-events-form__section-title">Book Information</h2>

          <div className="admin-events-form__field">
            <label htmlFor="pub-title" className="admin-events-form__label">
              Title <span className="admin-events-form__required">*</span>
            </label>
            <input
              id="pub-title"
              name="title"
              type="text"
              className={`admin-events-form__input ${getFieldError("title") ? "admin-events-form__input--error" : ""}`}
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. The Path of Surrender"
              maxLength={200}
            />
            {getFieldError("title") && (
              <p className="admin-events-form__error">{getFieldError("title")}</p>
            )}
          </div>

          <div className="admin-events-form__row">
            <div className="admin-events-form__field">
              <label htmlFor="pub-author" className="admin-events-form__label">
                Author <span className="admin-events-form__required">*</span>
              </label>
              <input
                id="pub-author"
                name="author"
                type="text"
                className={`admin-events-form__input ${getFieldError("author") ? "admin-events-form__input--error" : ""}`}
                value={formData.author}
                onChange={handleChange}
                placeholder="e.g. Ashram Publications"
                maxLength={200}
              />
              {getFieldError("author") && (
                <p className="admin-events-form__error">{getFieldError("author")}</p>
              )}
            </div>

            <div className="admin-events-form__field">
              <label htmlFor="pub-isbn" className="admin-events-form__label">
                ISBN <span className="admin-events-form__required">*</span>
              </label>
              <input
                id="pub-isbn"
                name="isbn"
                type="text"
                className={`admin-events-form__input ${getFieldError("isbn") ? "admin-events-form__input--error" : ""}`}
                value={formData.isbn}
                onChange={handleChange}
                placeholder="978-81-XXXXX-05-8"
                maxLength={100}
              />
              {getFieldError("isbn") && (
                <p className="admin-events-form__error">{getFieldError("isbn")}</p>
              )}
            </div>
          </div>

          <div className="admin-events-form__row">
            <div className="admin-events-form__field">
              <label htmlFor="pub-price" className="admin-events-form__label">
                Price (₹) <span className="admin-events-form__required">*</span>
              </label>
              <input
                id="pub-price"
                name="price"
                type="number"
                min="0"
                step="1"
                className={`admin-events-form__input ${getFieldError("price") ? "admin-events-form__input--error" : ""}`}
                value={formData.price}
                onChange={handleChange}
              />
              {getFieldError("price") && (
                <p className="admin-events-form__error">{getFieldError("price")}</p>
              )}
            </div>

            <div className="admin-events-form__field">
              <label htmlFor="pub-pages" className="admin-events-form__label">
                Pages <span className="admin-events-form__required">*</span>
              </label>
              <input
                id="pub-pages"
                name="pages"
                type="number"
                min="1"
                step="1"
                className={`admin-events-form__input ${getFieldError("pages") ? "admin-events-form__input--error" : ""}`}
                value={formData.pages}
                onChange={handleChange}
              />
              {getFieldError("pages") && (
                <p className="admin-events-form__error">{getFieldError("pages")}</p>
              )}
            </div>
          </div>

          <div className="admin-events-form__row">
            <div className="admin-events-form__field">
              <label htmlFor="pub-language" className="admin-events-form__label">
                Language <span className="admin-events-form__required">*</span>
              </label>
              <input
                id="pub-language"
                name="language"
                type="text"
                className={`admin-events-form__input ${getFieldError("language") ? "admin-events-form__input--error" : ""}`}
                value={formData.language}
                onChange={handleChange}
                placeholder="e.g. English / Malayalam"
              />
              {getFieldError("language") && (
                <p className="admin-events-form__error">{getFieldError("language")}</p>
              )}
            </div>

            <div className="admin-events-form__field">
              <label htmlFor="pub-status" className="admin-events-form__label">
                Status
              </label>
              <select
                id="pub-status"
                name="status"
                className="admin-events-form__select"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </div>

            <div className="admin-events-form__field">
              <label htmlFor="pub-order" className="admin-events-form__label">
                Display Order
              </label>
              <input
                id="pub-order"
                name="displayOrder"
                type="number"
                min="0"
                className="admin-events-form__input"
                value={formData.displayOrder}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Descriptions Section */}
        <div className="admin-events-form__section">
          <h2 className="admin-events-form__section-title">Descriptions</h2>

          <div className="admin-events-form__field">
            <label htmlFor="pub-description" className="admin-events-form__label">
              Short Description <span className="admin-events-form__required">*</span>
            </label>
            <textarea
              id="pub-description"
              name="description"
              className={`admin-events-form__textarea ${getFieldError("description") ? "admin-events-form__input--error" : ""}`}
              value={formData.description}
              onChange={handleChange}
              placeholder="A brief overview displayed on publication cards…"
              rows={3}
              maxLength={2000}
            />
            {getFieldError("description") && (
              <p className="admin-events-form__error">{getFieldError("description")}</p>
            )}
          </div>

          <div className="admin-events-form__field">
            <label htmlFor="pub-long-description" className="admin-events-form__label">
              Full Description <span className="admin-events-form__required">*</span>
            </label>
            <textarea
              id="pub-long-description"
              name="longDescription"
              className={`admin-events-form__textarea ${getFieldError("longDescription") ? "admin-events-form__input--error" : ""}`}
              value={formData.longDescription}
              onChange={handleChange}
              placeholder="Detailed description shown on the publication detail page…"
              rows={6}
              maxLength={10000}
            />
            {getFieldError("longDescription") && (
              <p className="admin-events-form__error">{getFieldError("longDescription")}</p>
            )}
          </div>
        </div>

        {/* Appearance Section */}
        <div className="admin-events-form__section">
          <h2 className="admin-events-form__section-title">Appearance &amp; Media</h2>

          <div className="admin-events-form__field">
            <label htmlFor="pub-gradient" className="admin-events-form__label">
              Cover Gradient CSS
            </label>
            <input
              id="pub-gradient"
              name="gradient"
              type="text"
              className="admin-events-form__input"
              value={formData.gradient}
              onChange={handleChange}
              placeholder="linear-gradient(135deg, #1A3A25, #2D5A3D, #3D7A53)"
            />
            <p className="admin-events-form__hint">
              CSS gradient background used for the book cover illustration.
            </p>
          </div>

          <div className="admin-events-form__field">
            <label htmlFor="pub-cover-image" className="admin-events-form__label">
              Cover Image URL (Optional)
            </label>
            <input
              id="pub-cover-image"
              name="coverImage"
              type="url"
              className={`admin-events-form__input ${getFieldError("coverImage") ? "admin-events-form__input--error" : ""}`}
              value={formData.coverImage}
              onChange={handleChange}
              placeholder="https://example.com/cover.jpg"
            />
            {getFieldError("coverImage") && (
              <p className="admin-events-form__error">{getFieldError("coverImage")}</p>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="admin-events-form__actions">
          <Link href="/admin/publications" className="admin-events-form__btn admin-events-form__btn--cancel">
            Cancel
          </Link>
          <button
            type="submit"
            className="admin-events-form__btn admin-events-form__btn--submit"
            disabled={isSubmitting}
            id="submit-publication-btn"
          >
            {isSubmitting ? "Creating…" : "Create Publication"}
          </button>
        </div>
      </form>
    </div>
  );
}
