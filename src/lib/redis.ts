const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || "";
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "";

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!REDIS_URL) return null;
  try {
    const res = await fetch(`${REDIS_URL}/get/${key}`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    });
    const data = await res.json();
    if (!data.result) return null;
    return JSON.parse(data.result) as T;
  } catch { return null; }
}

export async function cacheSet(key: string, value: unknown, ttl = 300): Promise<void> {
  if (!REDIS_URL) return;
  try {
    await fetch(`${REDIS_URL}/set/${key}/${encodeURIComponent(JSON.stringify(value))}?ex=${ttl}`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    });
  } catch {}
}

export async function cacheDel(key: string): Promise<void> {
  if (!REDIS_URL) return;
  try {
    await fetch(`${REDIS_URL}/del/${key}`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    });
  } catch {}
}

export async function rateLimit(key: string, max: number, window: number): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  return { allowed: true, remaining: max, resetAt: Date.now() + window * 1000 };
}

export const CACHE_KEYS = {
  FEATURED_LISTINGS: "listings:featured",
  CATEGORIES: "categories:all",
  BRANDS: (category: string) => `brands:${category}`,
  LISTING: (id: string) => `listing:${id}`,
  USER: (id: string) => `user:${id}`,
  STATS: "platform:stats",
} as const;

export const CACHE_TTL = {
  SHORT: 60,
  MEDIUM: 300,
  LONG: 1800,
  VERY_LONG: 86400,
} as const;

export const redis = {
  ping: async () => "PONG",
};
