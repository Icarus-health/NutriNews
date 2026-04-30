-- Rate limit counters table
-- Used by check_rate_limit() to enforce distributed request limits
-- across all serverless instances (unlike in-memory maps).

CREATE TABLE IF NOT EXISTS rate_limit_entries (
  key       TEXT        PRIMARY KEY,
  count     INT         NOT NULL DEFAULT 1,
  reset_at  TIMESTAMPTZ NOT NULL
);

-- Only the service role may read/write this table
ALTER TABLE rate_limit_entries ENABLE ROW LEVEL SECURITY;

-- No user-facing RLS policies — access is via SECURITY DEFINER function only.

-- Atomic check-and-increment using a single upsert.
-- Returns whether the request is allowed and how many remain.
-- SECURITY DEFINER so it can be called from any auth context (user or anon).
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_key         TEXT,
  p_max_requests INT,
  p_window_ms   BIGINT
)
RETURNS TABLE(allowed BOOLEAN, remaining INT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count   INT;
  v_now     TIMESTAMPTZ := NOW();
  v_reset   TIMESTAMPTZ := v_now + (p_window_ms || ' milliseconds')::INTERVAL;
BEGIN
  INSERT INTO rate_limit_entries (key, count, reset_at)
  VALUES (p_key, 1, v_reset)
  ON CONFLICT (key) DO UPDATE
    SET
      count    = CASE
                   WHEN rate_limit_entries.reset_at < v_now THEN 1
                   ELSE rate_limit_entries.count + 1
                 END,
      reset_at = CASE
                   WHEN rate_limit_entries.reset_at < v_now THEN v_reset
                   ELSE rate_limit_entries.reset_at
                 END
  RETURNING rate_limit_entries.count INTO v_count;

  RETURN QUERY
    SELECT
      v_count <= p_max_requests,
      GREATEST(0, p_max_requests - v_count);
END;
$$;

-- Periodic cleanup: remove expired entries older than 1 day to keep the table small.
-- Can be called manually or via a Supabase cron (pg_cron).
CREATE OR REPLACE FUNCTION cleanup_rate_limit_entries()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM rate_limit_entries
  WHERE reset_at < NOW() - INTERVAL '1 day';
$$;
