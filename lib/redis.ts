import { createClient, type RedisClientType } from "redis";

const globalForRedis = globalThis as unknown as {
  redis: RedisClientType | undefined;
};

function buildRedisUrl(): string {
  // Prefer explicit REDIS_URL if set
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }

  const host = process.env.REDIS_HOST || "localhost";
  const port = process.env.REDIS_PORT || "6379";
  const password = process.env.REDIS_PASSWORD;
  const db = process.env.REDIS_DB || "0";

  if (password) {
    return `redis://:${encodeURIComponent(password)}@${host}:${port}/${db}`;
  }

  return `redis://${host}:${port}/${db}`;
}

function createRedisClient(): RedisClientType {
  const client = createClient({
    url: buildRedisUrl(),
    socket: {
      reconnectStrategy(retries) {
        // Exponential backoff: 50ms, 100ms, 200ms ... up to 5s
        const delay = Math.min(retries * 50, 5000);
        return delay;
      },
      connectTimeout: 10000,
    },
  });

  client.on("error", (err) => {
    console.error("Redis client error:", err);
  });

  client.on("connect", () => {
    console.log("Redis client connected");
  });

  client.on("reconnecting", () => {
    console.log("Redis client reconnecting...");
  });

  // Connect immediately (returns a promise, but we handle it lazily)
  client.connect().catch((err) => {
    console.error("Redis initial connection failed:", err);
  });

  return client as RedisClientType;
}

export const redis: RedisClientType =
  globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;
