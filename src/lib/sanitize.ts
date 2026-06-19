/** Escape special characters for PostgREST ilike filter strings */
export function sanitizeFilterValue(value: string): string {
  return value
    .replace(/[,().\\]/g, '')   // remove PostgREST filter-syntax characters
    .replace(/%/g, '\\%')       // escape SQL LIKE wildcard %
    .replace(/_/g, '\\_')       // escape SQL LIKE wildcard _
    .trim()
    .slice(0, 200);
}
