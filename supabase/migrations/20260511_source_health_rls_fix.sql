-- Fix: replace over-permissive policy with read-only access for authenticated users.
-- The previous "service_role_full_access" policy (USING (true) WITH CHECK (true))
-- allowed any authenticated user to write to source_health via the REST API.
-- Service_role bypasses RLS entirely and never needed this policy.

DROP POLICY IF EXISTS "service_role_full_access" ON source_health;

CREATE POLICY "authenticated_read" ON source_health
  FOR SELECT TO authenticated USING (true);
