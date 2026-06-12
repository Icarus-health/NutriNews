import { createHash, timingSafeEqual } from 'crypto';

/**
 * Timing-sicherer String-Vergleich für Secrets (z.B. CRON_SECRET).
 * Hashen normalisiert die Länge, damit timingSafeEqual nutzbar ist und
 * auch die Länge des Secrets nicht über das Timing durchsickert.
 */
export function safeEqual(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  const hashA = createHash('sha256').update(a).digest();
  const hashB = createHash('sha256').update(b).digest();
  return timingSafeEqual(hashA, hashB);
}
