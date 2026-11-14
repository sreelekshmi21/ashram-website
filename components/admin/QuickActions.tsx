import Link from "next/link";

interface QuickActionItem {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const defaultActions: QuickActionItem[] = [
  {
    title: "Events",
    description: "Manage ashram events & retreats",
    href: "/admin/events",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 7H18" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M14 1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Registrations",
    description: "View participant registrations",
    href: "/admin/registrations",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 2H14L17 5V17C17 17.5523 16.5523 18 16 18H4C3.44772 18 3 17.5523 3 17V3C3 2.44772 3.44772 2 4 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M7 10L9 12L13 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Contact Messages",
    description: "Check user inquiries & messages",
    href: "/admin/contact-messages",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 6L10 11L18 6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Payments",
    description: "Track transactions & donations",
    href: "/admin/payments",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M1 8H19" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 13H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Video Gallery",
    description: "Upload and manage videos",
    href: "/admin/videos",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="4" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M14 8.5L18 6V14L14 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 8V12L10 10L7 8Z" fill="currentColor" />
      </svg>
    ),
  },
];

export default function QuickActions() {
  return (
    <div className="admin-quick-actions">
      <div className="admin-quick-actions__header">
        <h3 className="admin-quick-actions__title">Quick Actions</h3>
        <p className="admin-quick-actions__subtitle">Direct navigation to active management sections</p>
      </div>

      <div className="admin-quick-actions__grid">
        {defaultActions.map((action) => (
          <Link key={action.href} href={action.href} className="admin-quick-action-card">
            <div className="admin-quick-action-card__icon">{action.icon}</div>
            <div className="admin-quick-action-card__info">
              <span className="admin-quick-action-card__title">{action.title}</span>
              <span className="admin-quick-action-card__desc">{action.description}</span>
            </div>
            <svg
              className="admin-quick-action-card__arrow"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M6 3L11 8L6 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
