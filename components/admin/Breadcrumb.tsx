"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

/**
 * Generate breadcrumb items from the current pathname.
 * e.g. /admin/events/123 → [Admin, Events, 123]
 */
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [];

  const labelMap: Record<string, string> = {
    admin: "Admin",
    dashboard: "Dashboard",
    events: "Events",
    registrations: "Registrations",
    "contact-messages": "Contact Messages",
    payments: "Payments",
    faculty: "Faculty",
    news: "News",
    gallery: "Gallery",
    publications: "Publications",
    testimonials: "Testimonials",
    "site-settings": "Site Settings",
    "user-management": "User Management",
    new: "New Event",
    edit: "Edit",
  };

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = i === segments.length - 1;

    items.push({
      label,
      href: isLast ? undefined : href,
    });
  }

  return items;
}

export default function Breadcrumb() {
  const pathname = usePathname();
  const items = generateBreadcrumbs(pathname);

  if (items.length <= 1) return null;

  return (
    <nav className="admin-breadcrumb" aria-label="Breadcrumb">
      <ol className="admin-breadcrumb__list">
        {items.map((item, index) => (
          <li key={index} className="admin-breadcrumb__item">
            {index > 0 && (
              <svg
                className="admin-breadcrumb__sep"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6 4L10 8L6 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {item.href ? (
              <Link href={item.href} className="admin-breadcrumb__link">
                {item.label}
              </Link>
            ) : (
              <span className="admin-breadcrumb__current" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
