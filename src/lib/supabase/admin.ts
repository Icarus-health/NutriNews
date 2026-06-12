import { createClient } from '@supabase/supabase-js';

/**
 * Service-Role-Client für serverseitige Schreibzugriffe, die RLS bewusst
 * umgehen (z.B. daily_briefings, Konto-Löschung). Niemals in Client-Code
 * importieren — der Key existiert nur in der Server-Umgebung.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
