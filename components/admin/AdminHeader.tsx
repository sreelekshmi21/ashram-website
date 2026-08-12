"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import Breadcrumb from "./Breadcrumb";
import type { AdminSession } from "@/lib/auth";

interface AdminHeaderProps {
  session: AdminSession;
  onToggleMobile: () => void;
}

export default function AdminHeader({
  session,
  onToggleMobile,
}: AdminHeaderProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const initials = session.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const roleBadgeClass =
    session.role === "SuperAdmin"
      ? "admin-header__role-badge--super"
      : session.role === "Admin"
      ? "admin-header__role-badge--admin"
      : "admin-header__role-badge--editor";

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      const res = await fetch("/api/admin/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/admin/login");
        router.refresh();
      }
    } catch {
      console.error("[Admin] Logout failed");
    } finally {
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, router]);

  return (
    <header className="admin-header">
      {/* Left: mobile toggle + breadcrumb */}
      <div className="admin-header__left">
        <button
          className="admin-header__mobile-toggle"
          onClick={onToggleMobile}
          aria-label="Toggle navigation menu"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M3 6H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M3 11H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M3 16H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <Breadcrumb />
      </div>

      {/* Right: user info + logout */}
      <div className="admin-header__right">
        <div className="admin-header__user">
          <div className="admin-header__avatar">{initials}</div>
          <div className="admin-header__user-meta">
            <span className="admin-header__user-name">{session.name}</span>
            <span
              className={`admin-header__role-badge ${roleBadgeClass}`}
            >
              {session.role}
            </span>
          </div>
        </div>

        <button
          className="admin-header__logout"
          onClick={handleLogout}
          disabled={isLoggingOut}
          aria-label="Sign out"
          title="Sign out"
        >
          {isLoggingOut ? (
            <span className="admin-header__logout-spinner" />
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 2H4C2.89543 2 2 2.89543 2 4V14C2 15.1046 2.89543 16 4 16H6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M11 5L16 9L11 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 9H7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
