/**
 * Make free-text search safe to embed in a PostgREST `or=(…ilike…)` filter.
 * Commas, parentheses, quotes, backslashes and wildcards are filter syntax,
 * so only letters, numbers, spaces and a few email/name characters survive.
 */
export function sanitizeSearch(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return (value ?? '')
    .replace(/[^\p{L}\p{N}\s@.\-_']/gu, ' ')
    .replace(/'/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

/** `or` filter matching any of the columns, e.g. for `.or(ilikeAny(...))`. */
export function ilikeAny(columns: string[], term: string): string {
  return columns.map((c) => `${c}.ilike.*${term}*`).join(',');
}
