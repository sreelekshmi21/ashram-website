"use client";

import Link from "next/link";

export interface NavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
  isCollapsed?: boolean;
  isDisabled?: boolean;
  comingSoon?: boolean;
  onClick?: () => void;
}

export default function NavItem({
  href,
  label,
  icon,
  isActive = false,
  isCollapsed = false,
  isDisabled = false,
  comingSoon = false,
  onClick,
}: NavItemProps) {
  const classes = [
    "admin-nav-item",
    isActive ? "admin-nav-item--active" : "",
    isDisabled ? "admin-nav-item--disabled" : "",
    isCollapsed ? "admin-nav-item--collapsed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (isDisabled) {
    return (
      <div className={classes} aria-disabled="true">
        <span className="admin-nav-item__icon">{icon}</span>
        {!isCollapsed && (
          <span className="admin-nav-item__label">
            {label}
            {comingSoon && (
              <span className="admin-nav-item__badge">Soon</span>
            )}
          </span>
        )}
        {isCollapsed && (
          <span className="admin-nav-item__tooltip">
            {label}
            {comingSoon && " — Coming Soon"}
          </span>
        )}
      </div>
    );
  }

  return (
    <Link href={href} className={classes} onClick={onClick}>
      <span className="admin-nav-item__icon">{icon}</span>
      {!isCollapsed && (
        <span className="admin-nav-item__label">{label}</span>
      )}
      {isCollapsed && (
        <span className="admin-nav-item__tooltip">{label}</span>
      )}
    </Link>
  );
}
