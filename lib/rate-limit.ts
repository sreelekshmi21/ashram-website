/**
 * Redis-backed sliding window rate limiter.
 *
 * Uses a simple counter with TTL per key. Each key represents an IP + route
 * combination. When the counter exceeds the limit within the window, requests
 * are rejected with HTTP 429.
 *
 * Falls back to allowing requests if Redis is unavailable — rate limiting
 * is a best-effort protection, never a reason to block legitimate users.
 */

import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";

const RATE_LIMIT_PREFIX = "ratelimit:";

export interface RateLimitConfig {
  /** Maximum number of requests allowed within the window */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
  /** Identifier prefix for the rate limit bucket (e.g., "contact", "razorpay") */
  identifier: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Extract client IP from the request headers.
 * Checks x-forwarded-for (reverse proxy / load balancer), then x-real-ip,
 * then falls back to a generic key.
 */
function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // x-forwarded-for can be comma-separated; take the first (client) IP
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

/**
 * Check rate limit for a request. Returns the result without sending a response.
 */
export async function checkRateLimit(
  request: Request,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const ip = getClientIp(request);
  const key = `${RATE_LIMIT_PREFIX}${config.identifier}:${ip}`;

  try {
    // Ensure client is connected
    if (!redis.isOpen) {
      await redis.connect().catch(() => {});
    }

    if (!redis.isReady) {
      // Redis not available — allow the request
      return {
        success: true,
        limit: config.limit,
        remaining: config.limit,
        retryAfterSeconds: 0,
      };
    }

    // Increment counter and set TTL atomically using MULTI
    const results = await redis
      .multi()
      .incr(key)
      .ttl(key)
      .exec();

    const currentCount = results[0] as unknown as number;
    const ttl = results[1] as unknown as number;

    // If this is the first request in the window, set the expiry
    if (currentCount === 1 || ttl === -1) {
      await redis.expire(key, config.windowSeconds);
    }

    const remaining = Math.max(0, config.limit - currentCount);
    const retryAfterSeconds = ttl > 0 ? ttl : config.windowSeconds;

    if (currentCount > config.limit) {
      return {
        success: false,
        limit: config.limit,
        remaining: 0,
        retryAfterSeconds,
      };
    }

    return {
      success: true,
      limit: config.limit,
      remaining,
      retryAfterSeconds: 0,
    };
  } catch (error) {
    console.error("[RateLimiter] Error:", error);
    // On Redis failure, allow the request
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit,
      retryAfterSeconds: 0,
    };
  }
}

/**
 * Apply rate limiting to a request. Returns a 429 NextResponse if the limit
 * is exceeded, or null if the request is allowed.
 *
 * Usage:
 * ```ts
 * const limited = await applyRateLimit(request, RATE_LIMITS.contact);
 * if (limited) return limited;
 * // ... handle request
 * ```
 */
export async function applyRateLimit(
  request: Request,
  config: RateLimitConfig
): Promise<NextResponse | null> {
  const result = await checkRateLimit(request, config);

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Too many requests. Please try again later.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(result.retryAfterSeconds),
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(result.retryAfterSeconds),
        },
      }
    );
  }

  return null;
}

// ── Pre-configured rate limit profiles ──────────────────────────────────────

export const RATE_LIMITS = {
  /** Contact form & event registrations: 5 requests per 10 minutes */
  contact: {
    limit: 5,
    windowSeconds: 600, // 10 minutes
    identifier: "contact",
  },
  registration: {
    limit: 5,
    windowSeconds: 600,
    identifier: "registration",
  },

  /** Razorpay payment APIs: 10 requests per minute */
  razorpayCreateOrder: {
    limit: 10,
    windowSeconds: 60,
    identifier: "razorpay-create",
  },
  razorpayVerifyPayment: {
    limit: 10,
    windowSeconds: 60,
    identifier: "razorpay-verify",
  },

  /** Public read APIs (events): 100 requests per minute */
  publicApi: {
    limit: 100,
    windowSeconds: 60,
    identifier: "public-api",
  },

  /** Admin login: 20 attempts per 15 minutes (brute-force protection) */
  adminLogin: {
    limit: 20,
    windowSeconds: 900, // 15 minutes
    identifier: "admin-login",
  },
} as const satisfies Record<string, RateLimitConfig>;
