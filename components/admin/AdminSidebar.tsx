"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import NavItem from "./NavItem";
import type { AdminSession } from "@/lib/auth";

// ── SVG Icons ───────────────────────────────────────────────────────────────

function DashboardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function EventsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 7H18" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function RegistrationsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 2H14L17 5V17C17 17.5523 16.5523 18 16 18H4C3.44772 18 3 17.5523 3 17V3C3 2.44772 3.44772 2 4 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7 10L9 12L13 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ContactIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 6L10 11L18 6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function PaymentsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M1 8H19" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 13H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function FacultyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 18C3 14.134 6.13401 11 10 11C13.866 11 17 14.134 17 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function NewsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="12" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14 7H17C17.5523 7 18 7.44772 18 8V16.5C18 17.3284 17.3284 18 16.5 18H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 7H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 10H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 13H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function GalleryIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="7" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2 14L6 10L9 13L13 9L18 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="7" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2 14L6 10L9 13L13 9L18 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14 8.5L18 6V14L14 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 8V12L10 10L7 8Z" fill="currentColor" />
    </svg>
  );
}

function ChevronDownIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.2s ease",
        marginLeft: "auto",
      }}
    >
      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PublicationsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 2H9C9 2 10 2 10 3V17C10 17 9 16 8 16H3V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M17 2H11C11 2 10 2 10 3V17C10 17 11 16 12 16H17V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function TestimonialsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 3H17V13H10L6 17V13H3V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7 7H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 10H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 1V3M10 17V19M1 10H3M17 10H19M3.93 3.93L5.34 5.34M14.66 14.66L16.07 16.07M16.07 3.93L14.66 5.34M5.34 14.66L3.93 16.07" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M1 18C1 14.6863 3.68629 12 7 12C10.3137 12 13 14.6863 13 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="14" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M15 12C17.2091 12.5 19 14.5 19 17" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

// ── Types ───────────────────────────────────────────────────────────────────

interface NavItemDef {
  href: string;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
  comingSoon?: boolean;
}

interface NavSection {
  title?: string;
  items: NavItemDef[];
}

const mainNavSections: NavSection[] = [
  {
    items: [
      { href: "/admin", label: "Dashboard", icon: <DashboardIcon /> },
      { href: "/admin/events", label: "Events", icon: <EventsIcon /> },
      { href: "/admin/registrations", label: "Registrations", icon: <RegistrationsIcon /> },
      { href: "/admin/contact-messages", label: "Contact Messages", icon: <ContactIcon /> },
      { href: "/admin/payments", label: "Payments", icon: <PaymentsIcon /> },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/admin/site-settings", label: "Site Settings", icon: <SettingsIcon />, disabled: true, comingSoon: true },
      { href: "/admin/user-management", label: "User Management", icon: <UsersIcon />, disabled: true, comingSoon: true },
    ],
  },
];

interface AdminSidebarProps {
  session: AdminSession;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

export default function AdminSidebar({
  session,
  isCollapsed,
  isMobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const isGalleryActive = pathname.startsWith("/admin/gallery") || pathname.startsWith("/admin/videos");
  const [galleryOpen, setGalleryOpen] = useState(true);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const initials = session.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      {isMobileOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          "admin-sidebar",
          isCollapsed ? "admin-sidebar--collapsed" : "",
          isMobileOpen ? "admin-sidebar--mobile-open" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label="Admin navigation"
      >
        <div className="admin-sidebar__header">
          <div className="admin-sidebar__logo">
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="23" stroke="#C9A84C" strokeWidth="2" />
              <path d="M24 8C24 8 18 16 18 22C18 25.3 20.7 28 24 28C27.3 28 30 25.3 30 22C30 16 24 8 24 8Z" fill="#E8751A" opacity="0.9" />
              <path d="M24 14C24 14 21 19 21 22.5C21 24.2 22.3 25.5 24 25.5C25.7 25.5 27 24.2 27 22.5C27 19 24 14 24 14Z" fill="#F5A623" />
              <path d="M14 30C16 28 19.5 27 24 27C28.5 27 32 28 34 30" stroke="#2D5A3D" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {!isCollapsed && <span className="admin-sidebar__logo-text">Santhigiri</span>}
          </div>

          <button
            className="admin-sidebar__collapse-btn"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              style={{
                transform: isCollapsed ? "rotate(180deg)" : "none",
                transition: "transform 0.2s ease",
              }}
            >
              <path d="M11 4L6 9L11 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <nav className="admin-sidebar__nav">
          {/* Main section */}
          <div className="admin-sidebar__section">
            {mainNavSections[0].items.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={isActive(item.href)}
                isCollapsed={isCollapsed}
                isDisabled={item.disabled}
                comingSoon={item.comingSoon}
                onClick={onCloseMobile}
              />
            ))}
          </div>

          {/* Content section */}
          <div className="admin-sidebar__section">
            {!isCollapsed && <p className="admin-sidebar__section-title">Content</p>}
            {isCollapsed && <div className="admin-sidebar__section-divider" />}

            <NavItem
              href="/admin/faculty"
              label="Faculty"
              icon={<FacultyIcon />}
              isCollapsed={isCollapsed}
              isDisabled={true}
              comingSoon={true}
              onClick={onCloseMobile}
            />

            <NavItem
              href="/admin/news"
              label="News"
              icon={<NewsIcon />}
              isActive={isActive("/admin/news")}
              isCollapsed={isCollapsed}
              onClick={onCloseMobile}
            />

            {/* Gallery Parent with Submenu */}
            <div className="admin-sidebar__group">
              <button
                type="button"
                onClick={() => setGalleryOpen((prev) => !prev)}
                className={[
                  "admin-nav-item",
                  "admin-nav-item--parent",
                  isGalleryActive ? "admin-nav-item--active" : "",
                  isCollapsed ? "admin-nav-item--collapsed" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{ width: "calc(100% - 1rem)", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                aria-expanded={galleryOpen}
              >
                <span className="admin-nav-item__icon"><GalleryIcon /></span>
                {!isCollapsed && (
                  <>
                    <span className="admin-nav-item__label" style={{ flex: 1 }}>Gallery</span>
                    <ChevronDownIcon isOpen={galleryOpen} />
                  </>
                )}
                {isCollapsed && <span className="admin-nav-item__tooltip">Gallery</span>}
              </button>

              {/* Submenu */}
              {!isCollapsed && galleryOpen && (
                <div style={{ paddingLeft: "1.25rem", margin: "2px 0 6px 0" }}>
                  <Link
                    href="/admin/gallery"
                    onClick={onCloseMobile}
                    className={[
                      "admin-nav-item",
                      pathname === "/admin/gallery" ? "admin-nav-item--active" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={{ fontSize: "0.8125rem", padding: "0.375rem 0.75rem", margin: "1px 0.5rem" }}
                  >
                    <span className="admin-nav-item__icon" style={{ opacity: 0.8 }}><ImageIcon /></span>
                    <span className="admin-nav-item__label">Image Gallery</span>
                  </Link>

                  <Link
                    href="/admin/videos"
                    onClick={onCloseMobile}
                    className={[
                      "admin-nav-item",
                      pathname.startsWith("/admin/videos") ? "admin-nav-item--active" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={{ fontSize: "0.8125rem", padding: "0.375rem 0.75rem", margin: "1px 0.5rem" }}
                  >
                    <span className="admin-nav-item__icon" style={{ opacity: 0.8 }}><VideoIcon /></span>
                    <span className="admin-nav-item__label">Video Gallery</span>
                  </Link>
                </div>
              )}
            </div>

            <NavItem
              href="/admin/publications"
              label="Publications"
              icon={<PublicationsIcon />}
              isActive={isActive("/admin/publications")}
              isCollapsed={isCollapsed}
              onClick={onCloseMobile}
            />

            <NavItem
              href="/admin/testimonials"
              label="Testimonials"
              icon={<TestimonialsIcon />}
              isCollapsed={isCollapsed}
              isDisabled={true}
              comingSoon={true}
              onClick={onCloseMobile}
            />
          </div>

          {/* System section */}
          <div className="admin-sidebar__section">
            {!isCollapsed && <p className="admin-sidebar__section-title">System</p>}
            {isCollapsed && <div className="admin-sidebar__section-divider" />}

            {mainNavSections[1].items.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={isActive(item.href)}
                isCollapsed={isCollapsed}
                isDisabled={item.disabled}
                comingSoon={item.comingSoon}
                onClick={onCloseMobile}
              />
            ))}
          </div>
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user">
            <div className="admin-sidebar__avatar">{initials}</div>
            {!isCollapsed && (
              <div className="admin-sidebar__user-info">
                <p className="admin-sidebar__user-name">{session.name}</p>
                <p className="admin-sidebar__user-role">{session.role}</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
