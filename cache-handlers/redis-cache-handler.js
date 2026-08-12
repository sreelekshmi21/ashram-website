// @ts-check
/**
 * Redis Cache Handler for Next.js 16
 *
 * Implements the CacheHandler interface to store `use cache` entries in Redis.
 * See: https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheHandlers
 *
 * This file must be CommonJS (.js) because Next.js loads it via require.resolve().
 *
 * IMPORTANT: The handler is resilient to Redis being unavailable (e.g. during
 * `next build` without a running Redis instance). When Redis is down, get()
 * returns undefined (cache miss) and set() is a no-op. The build completes
 * normally using the default prerendering behavior.
 */

const { createClient } = require("redis");

// ── Redis Client (lazy, resilient) ──────────────────────────────────────────

const CACHE_PREFIX = "nextcache:";
const TAG_PREFIX = "nextcache:tag:";
const TAG_SET_KEY = "nextcache:revalidated-tags";

let client = null;
let isConnected = false;
let connectAttempted = false;

// Suppress repeated error logging during build
let errorLogCount = 0;
const MAX_ERROR_LOGS = 3;

function getClient() {
  if (client) return client;

  client = createClient({
    url: buildRedisUrl(),
    socket: {
      reconnectStrategy(retries) {
        // During build, stop reconnecting after a few attempts
        if (retries > 3 && !isConnected) {
          return new Error("Redis unavailable — skipping cache");
        }
        return Math.min(retries * 100, 5000);
      },
      connectTimeout: 3000,
    },
  });

  client.on("error", (err) => {
    if (errorLogCount < MAX_ERROR_LOGS) {
      console.warn(`[Redis CacheHandler] ${err.message}`);
      errorLogCount++;
      if (errorLogCount === MAX_ERROR_LOGS) {
        console.warn("[Redis CacheHandler] Suppressing further error logs.");
      }
    }
    isConnected = false;
  });

  client.on("connect", () => {
    isConnected = true;
    errorLogCount = 0;
    console.log("[Redis CacheHandler] Connected to Redis");
  });

  client.on("end", () => {
    isConnected = false;
  });

  return client;
}

function buildRedisUrl() {
  if (process.env.REDIS_URL) return process.env.REDIS_URL;

  const host = process.env.REDIS_HOST || "localhost";
  const port = process.env.REDIS_PORT || "6379";
  const password = process.env.REDIS_PASSWORD;
  const db = process.env.REDIS_DB || "0";

  if (password) {
    return `redis://:${encodeURIComponent(password)}@${host}:${port}/${db}`;
  }
  return `redis://${host}:${port}/${db}`;
}

/**
 * Try to get a connected Redis client. Returns null if unavailable.
 * Never blocks the build — uses a short timeout for the initial connect.
 */
async function getConnectedClient() {
  const c = getClient();

  if (isConnected) return c;

  // Only attempt to connect once
  if (!connectAttempted) {
    connectAttempted = true;
    try {
      await Promise.race([
        c.connect(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Connection timeout")), 3000)
        ),
      ]);
      isConnected = true;
      return c;
    } catch {
      // Redis not available — that's fine during build
      return null;
    }
  }

  return null;
}

// ── Local tag timestamp cache (synced via refreshTags) ──────────────────────

const localTagTimestamps = new Map();

// ── Cache Handler Implementation ────────────────────────────────────────────

module.exports = {
  /**
   * Retrieve a cache entry from Redis.
   * Returns undefined on cache miss or when Redis is unavailable.
   * @param {string} cacheKey
   * @param {string[]} softTags
   */
  async get(cacheKey, softTags) {
    const redis = await getConnectedClient();
    if (!redis) return undefined;

    try {
      const stored = await redis.get(CACHE_PREFIX + cacheKey);
      if (!stored) return undefined;

      const data = JSON.parse(stored);

      // Check if entry has expired based on revalidate time
      const now = Date.now();
      if (now > data.timestamp + data.revalidate * 1000) {
        return undefined;
      }

      // Check soft tag invalidation
      if (softTags && softTags.length > 0) {
        for (const tag of softTags) {
          const tagTimestamp = localTagTimestamps.get(tag) || 0;
          if (tagTimestamp > data.timestamp) {
            return undefined;
          }
        }
      }

      // Check explicit tag invalidation
      if (data.tags && data.tags.length > 0) {
        for (const tag of data.tags) {
          const tagTimestamp = localTagTimestamps.get(tag) || 0;
          if (tagTimestamp > data.timestamp) {
            return undefined;
          }
        }
      }

      // Reconstruct ReadableStream from stored base64 data
      return {
        value: new ReadableStream({
          start(controller) {
            controller.enqueue(Buffer.from(data.value, "base64"));
            controller.close();
          },
        }),
        tags: data.tags,
        stale: data.stale,
        timestamp: data.timestamp,
        expire: data.expire,
        revalidate: data.revalidate,
      };
    } catch (err) {
      console.error("[Redis CacheHandler] get() error:", err.message);
      return undefined;
    }
  },

  /**
   * Store a cache entry in Redis. No-op when Redis is unavailable.
   * @param {string} cacheKey
   * @param {Promise<object>} pendingEntry
   */
  async set(cacheKey, pendingEntry) {
    const redis = await getConnectedClient();
    if (!redis) return;

    try {
      const entry = await pendingEntry;

      // Read the stream to get the data
      const reader = entry.value.getReader();
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      reader.releaseLock();

      // Combine chunks and serialize for Redis storage
      const combined = Buffer.concat(
        chunks.map((chunk) => Buffer.from(chunk))
      );

      const serialized = JSON.stringify({
        value: combined.toString("base64"),
        tags: entry.tags,
        stale: entry.stale,
        timestamp: entry.timestamp,
        expire: entry.expire,
        revalidate: entry.revalidate,
      });

      // Use Redis TTL for automatic expiration
      const ttl = entry.expire > 0 ? entry.expire : undefined;

      if (ttl) {
        await redis.set(CACHE_PREFIX + cacheKey, serialized, { EX: ttl });
      } else {
        await redis.set(CACHE_PREFIX + cacheKey, serialized);
      }
    } catch (err) {
      console.error("[Redis CacheHandler] set() error:", err.message);
    }
  },

  /**
   * Sync tag invalidation timestamps from Redis.
   * No-op when Redis is unavailable.
   */
  async refreshTags() {
    const redis = await getConnectedClient();
    if (!redis) return;

    try {
      const tagKeys = await redis.sMembers(TAG_SET_KEY);

      if (tagKeys.length > 0) {
        const values = await redis.mGet(
          tagKeys.map((k) => TAG_PREFIX + k)
        );

        for (let i = 0; i < tagKeys.length; i++) {
          if (values[i]) {
            localTagTimestamps.set(tagKeys[i], Number(values[i]));
          }
        }
      }
    } catch (err) {
      console.error("[Redis CacheHandler] refreshTags() error:", err.message);
    }
  },

  /**
   * Get the most recent revalidation timestamp for the given tags.
   * @param {string[]} tags
   * @returns {Promise<number>}
   */
  async getExpiration(tags) {
    if (!tags || tags.length === 0) return 0;

    const timestamps = tags.map((tag) => localTagTimestamps.get(tag) || 0);
    return Math.max(...timestamps, 0);
  },

  /**
   * Called when tags are revalidated. Writes timestamps to Redis for
   * cross-instance coordination and invalidates matching local entries.
   * No-op when Redis is unavailable.
   * @param {string[]} tags
   * @param {{ expire?: number }} [durations]
   */
  async updateTags(tags, durations) {
    // Always update local timestamps (works even without Redis)
    const now = Date.now();
    for (const tag of tags) {
      localTagTimestamps.set(tag, now);
    }

    const redis = await getConnectedClient();
    if (!redis) return;

    try {
      const pipeline = redis.multi();

      for (const tag of tags) {
        pipeline.set(TAG_PREFIX + tag, String(now));
        pipeline.sAdd(TAG_SET_KEY, tag);
      }

      await pipeline.exec();
    } catch (err) {
      console.error("[Redis CacheHandler] updateTags() error:", err.message);
    }
  },
};
