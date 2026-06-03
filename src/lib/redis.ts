import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    lazyConnect: true,
  });

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

// ── Cache helpers ──────────────────────────────

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const val = await redis.get(key);
    if (!val) return null;
    return JSON.parse(val) as T;
  } catch {
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds = 300
): Promise<void> {
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // non-blocking
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch {
    // non-blocking
  }
}

export async function cacheDelPattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) await redis.del(...keys);
  } catch {
    // non-blocking
  }
}

// ── Rate limiting ──────────────────────────────

export async function rateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const current = await redis.incr(`rate:${key}`);
  if (current === 1) {
    await redis.expire(`rate:${key}`, windowSeconds);
  }

  const ttl = await redis.ttl(`rate:${key}`);
  const remaining = Math.max(0, maxRequests - current);
  const resetAt = Date.now() + ttl * 1000;

  return {
    allowed: current <= maxRequests,
    remaining,
    resetAt,
  };
}

// ── Session store ──────────────────────────────

export async function setUserOnline(userId: string): Promise<void> {
  await redis.setex(`online:${userId}`, 300, "1");
}

export async function isUserOnline(userId: string): Promise<boolean> {
  const result = await redis.get(`online:${userId}`);
  return result === "1";
}

export const CACHE_KEYS = {
  FEATURED_LISTINGS: "listings:featured",
  CATEGORIES: "categories:all",
  BRANDS: (category: string) => `brands:${category}`,
  LISTING: (id: string) => `listing:${id}`,
  USER: (id: string) => `user:${id}`,
  SEARCH_SUGGESTIONS: (q: string) => `search:suggest:${q}`,
  STATS: "platform:stats",
} as const;

export const CACHE_TTL = {
  SHORT: 60,          // 1 min
  MEDIUM: 300,        // 5 min
  LONG: 1800,         // 30 min
  VERY_LONG: 86400,   // 24 hours
} as const;
