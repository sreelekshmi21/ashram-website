/**
 * Next.js 16 Proxy — protects admin routes.
 *
 * In Next.js 16, middleware.ts has been renamed to proxy.ts and the
 * exported function must be named `proxy` (not `middleware`).
 *
 * This proxy checks for a valid admin session cookie on all /admin/*
 * routes (except /admin/login) and redirects unauthenticated users
 * to the login page.
 *
 * For admin API routes (/api/admin/*), it returns 401 JSON responses
 * instead of redirects — except for the auth endpoints themselves.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateSessionById, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin page routes ─────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    // Allow login page without auth
    if (pathname === "/admin/login") {
      // If already authenticated, redirect to admin dashboard
      const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;
      if (sessionId) {
        const session = await validateSessionById(sessionId);
        if (session) {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
      }
      return NextResponse.next();
    }

    // All other /admin/* routes require authentication
    const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionId) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const session = await validateSessionById(sessionId);

    if (!session) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);

      // Clear the stale cookie
      const response = NextResponse.redirect(loginUrl);
      response.cookies.set(SESSION_COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.SECURE_COOKIES === "true",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
      return response;
    }

    // Attach session info as headers for downstream server components
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-admin-user-id", session.userId);
    requestHeaders.set("x-admin-user-email", session.email);
    requestHeaders.set("x-admin-user-name", session.name);
    requestHeaders.set("x-admin-user-role", session.role);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // ── Admin API routes ──────────────────────────────────────────────────
  if (pathname.startsWith("/api/admin")) {
    // Allow auth endpoints without session
    if (
      pathname === "/api/admin/auth/login" ||
      pathname === "/api/admin/auth/logout" ||
      pathname === "/api/admin/auth/session"
    ) {
      return NextResponse.next();
    }

    // All other admin API routes require authentication
    const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const session = await validateSessionById(sessionId);

    if (!session) {
      const response = NextResponse.json(
        { success: false, error: "Session expired" },
        { status: 401 }
      );
      response.cookies.set(SESSION_COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.SECURE_COOKIES === "true",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
      return response;
    }

    // Attach session info as headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-admin-user-id", session.userId);
    requestHeaders.set("x-admin-user-email", session.email);
    requestHeaders.set("x-admin-user-name", session.name);
    requestHeaders.set("x-admin-user-role", session.role);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // All other routes pass through unchanged
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
