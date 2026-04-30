import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// ─── In-Memory fallback (dev / no Upstash configured) ──────────────────────
// Per-instance only — resets on cold start. Acceptable for local dev.

const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

function inMemoryLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = inMemoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    inMemoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: maxRequests - 1 };
  }
  if (entry.count >= maxRequests) return { success: false, remaining: 0 };
  entry.count++;
  return { success: true, remaining: maxRequests - entry.count };
}

// ─── Upstash distributed rate limiter ──────────────────────────────────────
// One Ratelimit instance per (maxRequests, windowMs) combination, cached for reuse.

const upstashLimiterCache = new Map<string, Ratelimit>();

function msToUpstashDuration(ms: number): `${number} ${'ms' | 's' | 'm' | 'h' | 'd'}` {
  if (ms < 1000) return `${ms} ms`;
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s} s`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h`;
  return `${Math.round(h / 24)} d`;
}

function getUpstashLimiter(maxRequests: number, windowMs: number): Ratelimit {
  const cacheKey = `${maxRequests}:${windowMs}`;
  if (!upstashLimiterCache.has(cacheKey)) {
    upstashLimiterCache.set(cacheKey, new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(maxRequests, msToUpstashDuration(windowMs)),
      prefix: 'nn_rl',
    }));
  }
  return upstashLimiterCache.get(cacheKey)!;
}

const useUpstash = !!(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
);

/**
 * Distributed rate limiter backed by Upstash Redis (sliding window).
 * Falls back to per-instance in-memory when Upstash env vars are not set.
 *
 * @param key         Unique identifier for the counter (e.g. 'cron', `share:${userId}`)
 * @param maxRequests Max number of requests allowed in the window
 * @param windowMs    Window size in milliseconds
 */
export async function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): Promise<{ success: boolean; remaining: number }> {
  if (!useUpstash) {
    return inMemoryLimit(key, maxRequests, windowMs);
  }

  const limiter = getUpstashLimiter(maxRequests, windowMs);
  const { success, remaining } = await limiter.limit(key);
  return { success, remaining };
}
