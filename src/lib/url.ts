/**
 * Lässt nur http(s)-URLs durch — schützt vor javascript:/data:-URLs in
 * href-Attributen, falls eine Quelle oder ein Admin-Eintrag manipuliert ist.
 * Gibt die URL zurück oder null, wenn sie nicht sicher verlinkbar ist.
 */
export function sanitizeExternalUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return url;
    return null;
  } catch {
    return null;
  }
}
