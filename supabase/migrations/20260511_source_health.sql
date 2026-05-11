-- Source health tracking: records the result of each cron run per RSS source.
-- Enables the admin dashboard "Quellen" tab to surface dead/failing feeds.

CREATE TABLE IF NOT EXISTS source_health (
  source_name          text PRIMARY KEY,
  source_type          text NOT NULL,
  items_last_run       integer NOT NULL DEFAULT 0,
  error_last_run       text,
  last_checked_at      timestamptz NOT NULL DEFAULT now(),
  consecutive_failures integer NOT NULL DEFAULT 0,
  total_checks         integer NOT NULL DEFAULT 0,
  total_failures       integer NOT NULL DEFAULT 0
);

ALTER TABLE source_health ENABLE ROW LEVEL SECURITY;

-- Authenticated users may read source health (displayed in admin dashboard).
-- Writes come exclusively from the service_role (cron job), which bypasses RLS.
CREATE POLICY "authenticated_read" ON source_health
  FOR SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_source_health_failures
  ON source_health (consecutive_failures DESC, last_checked_at DESC);

-- Atomic upsert function called by the cron job after each RSS fetch.
-- Increments consecutive_failures on error, resets to 0 on success.
CREATE OR REPLACE FUNCTION upsert_source_health_batch(rows jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  r jsonb;
  p_error text;
BEGIN
  FOR r IN SELECT * FROM jsonb_array_elements(rows)
  LOOP
    p_error := NULLIF(r->>'error_last_run', '');

    INSERT INTO source_health (
      source_name, source_type, items_last_run, error_last_run,
      last_checked_at, consecutive_failures, total_checks, total_failures
    ) VALUES (
      r->>'source_name',
      r->>'source_type',
      (r->>'items_last_run')::integer,
      p_error,
      now(),
      CASE WHEN p_error IS NOT NULL THEN 1 ELSE 0 END,
      1,
      CASE WHEN p_error IS NOT NULL THEN 1 ELSE 0 END
    )
    ON CONFLICT (source_name) DO UPDATE SET
      source_type          = EXCLUDED.source_type,
      items_last_run       = EXCLUDED.items_last_run,
      error_last_run       = EXCLUDED.error_last_run,
      last_checked_at      = EXCLUDED.last_checked_at,
      consecutive_failures = CASE
        WHEN EXCLUDED.error_last_run IS NOT NULL
          THEN source_health.consecutive_failures + 1
        ELSE 0
      END,
      total_checks         = source_health.total_checks + 1,
      total_failures       = source_health.total_failures +
        CASE WHEN EXCLUDED.error_last_run IS NOT NULL THEN 1 ELSE 0 END;
  END LOOP;
END;
$$;
