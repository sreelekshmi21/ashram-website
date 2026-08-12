/**
 * Redis-backed cookie session authentication for the admin panel.
 *
 * Sessions are stored in Redis with a configurable TTL. A cryptographically
 * random session ID is set as an HTTP-only, Secure, SameSite=Lax cookie.
 * No JWTs are used — the cookie value is an opaque session ID that maps
 * to session data in Redis.
 */

import crypto from "crypto";
import { redis } from "@/lib/redis";
import { cookies } from "next/headers";
import type { AdminRole } from "@prisma/client";

// ── Configuration ───────────────────────────────────────────────────────────

const SESSION_PREFIX = "admin_session:";
const COOKIE_NAME = "admin_session_id";

/** Default session TTL: 24 hours. Override via ADMIN_SESSION_TTL env (seconds). */
function getSessionTtl(): number {
  return parseInt(process.env.ADMIN_SESSION_TTL || "86400", 10);
}

/** Extended session TTL for "Remember Me": 30 days. */
function getRememberMeTtl(): number {
  return parseInt(process.env.ADMIN_SESSION_REMEMBER_TTL || "2592000", 10);
}

// ── Types ───────────────────────────────────────────────────────────────────

export interface AdminSession {
  userId: string;
  email: string;
  name: string;
  role: AdminRole;
  createdAt: string;
}

// ── Session Operations ──────────────────────────────────────────────────────

/**
 * Create a new admin session. Stores session data in Redis and sets an
 * HTTP-only cookie with the session ID.
 *
 * Must be called from a Route Handler or Server Function (where cookies
 * can be written).
 */
export async function createSession(
  data: AdminSession,
  rememberMe = false
): Promise<string> {
  const sessionId = crypto.randomBytes(32).toString("hex");
  const key = `${SESSION_PREFIX}${sessionId}`;
  const ttl = rememberMe ? getRememberMeTtl() : getSessionTtl();

  // Ensure Redis is connected
  if (!redis.isOpen) {
    await redis.connect().catch(() => {});
  }

  await redis.set(key, JSON.stringify(data), { EX: ttl });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.SECURE_COOKIES === "true",
    sameSite: "lax",
    path: "/",
    maxAge: ttl,
  });

  return sessionId;
}

/**
 * Validate the current session by reading the cookie and looking up the
 * session data in Redis.
 *
 * Returns the session data if valid, or null if the session is missing,
 * expired, or Redis is unavailable.
 */
export async function validateSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const key = `${SESSION_PREFIX}${sessionCookie.value}`;

    // Ensure Redis is connected
    if (!redis.isOpen) {
      await redis.connect().catch(() => {});
    }

    if (!redis.isReady) {
      return null;
    }

    const raw = await redis.get(key);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as AdminSession;
  } catch (error) {
    console.error("[Auth] Session validation error:", error);
    return null;
  }
}

/**
 * Validate the session from a raw session ID (used in proxy/middleware where
 * `cookies()` from next/headers is not available).
 */
export async function validateSessionById(
  sessionId: string
): Promise<AdminSession | null> {
  try {
    if (!sessionId) {
      return null;
    }

    const key = `${SESSION_PREFIX}${sessionId}`;

    if (!redis.isOpen) {
      await redis.connect().catch(() => {});
    }

    if (!redis.isReady) {
      return null;
    }

    const raw = await redis.get(key);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as AdminSession;
  } catch (error) {
    console.error("[Auth] Session validation by ID error:", error);
    return null;
  }
}

/**
 * Destroy the current session. Removes the session from Redis and deletes
 * the cookie.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);

  try {
    if (sessionCookie?.value) {
      const key = `${SESSION_PREFIX}${sessionCookie.value}`;

      if (!redis.isOpen) {
        await redis.connect().catch(() => {});
      }

      if (redis.isReady) {
        await redis.del(key);
      }
    }
  } catch (error) {
    console.error("[Auth] Session destruction error:", error);
  } finally {
    // Clear the cookie regardless
    cookieStore.set(COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.SECURE_COOKIES === "true",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }
}

/**
 * Get the cookie name (exported for use in proxy.ts where we read cookies
 * from the request directly).
 */
export const SESSION_COOKIE_NAME = COOKIE_NAME;
