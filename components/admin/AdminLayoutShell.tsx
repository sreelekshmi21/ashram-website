"use client";

import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import type { AdminSession } from "@/lib/auth";

interface AdminLayoutShellProps {
  session: AdminSession;
  children: React.ReactNode;
}

/**
 * Client wrapper for the admin layout — manages sidebar collapse/expand
 * and mobile drawer state. The server-side layout (layout.tsx) passes
 * the validated session and children into this component.
 */
export default function AdminLayoutShell({
  session,
  children,
}: AdminLayoutShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile drawer on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const toggleMobile = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const closeMobile = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  return (
    <div
      className={`admin-layout ${
        isCollapsed ? "admin-layout--collapsed" : ""
      }`}
    >
      <AdminSidebar
        session={session}
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        onToggleCollapse={toggleCollapse}
        onCloseMobile={closeMobile}
      />

      <div className="admin-layout__main-wrapper">
        <AdminHeader session={session} onToggleMobile={toggleMobile} />
        <main className="admin-layout__content">{children}</main>
      </div>
    </div>
  );
}
