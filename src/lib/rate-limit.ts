import { createClient } from '@supabase/supabase-js';

// ─── In-Memory fallback ─────────────────────────────────────────────────────
// Used when SUPABASE_SERVICE_ROLE_KEY is not set (local dev without full env).
// Per-instance only — resets on cold start.

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

// ─── Supabase-backed distributed rate limiter ───────────────────────────────
// Uses a PostgreSQL table + atomic SECURITY DEFINER function (check_rate_limit).
// Works across all serverless instances; persists across cold starts.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Lazy singleton — only created once per instance if env vars are available
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _adminClient: ReturnType<typeof createClient<any>> | null = null;
function getAdminClient() {
  if (!_adminClient) {
    _adminClient = createClient(supabaseUrl!, serviceRoleKey!);
  }
  return _adminClient;
}

/**
 * Distributed rate limiter backed by Supabase PostgreSQL (atomic upsert).
 * Falls back to per-instance in-memory when SUPABASE_SERVICE_ROLE_KEY is not set.
 *
 * @param key         Unique identifier for the counter (e.g. 'cron', `share:${userId}`)
 * @param maxRequests Max allowed requests in the window
 * @param windowMs    Window size in milliseconds
 */
export async function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): Promise<{ success: boolean; remaining: number }> {
  if (!supabaseUrl || !serviceRoleKey) {
    return inMemoryLimit(key, maxRequests, windowMs);
  }

  const { data, error } = await getAdminClient().rpc('check_rate_limit', {
    p_key: key,
    p_max_requests: maxRequests,
    p_window_ms: windowMs,
  });

  if (error) {
    // Fail open — better to allow the request than block everything on a DB error
    console.error('Rate limit check failed:', error.message);
    return { success: true, remaining: maxRequests };
  }

  const result = data?.[0] as { allowed: boolean; remaining: number } | undefined;
  return {
    success: result?.allowed ?? true,
    remaining: result?.remaining ?? 0,
  };
}
