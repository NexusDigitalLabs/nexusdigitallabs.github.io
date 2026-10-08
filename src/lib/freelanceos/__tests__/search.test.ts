import { describe, it, expect } from 'vitest';
import { ilikeAny, sanitizeSearch } from '../search';

describe('sanitizeSearch', () => {
  it('keeps names, emails and unicode letters', () => {
    expect(sanitizeSearch('  ABC   Corp ')).toBe('ABC Corp');
    expect(sanitizeSearch('jane.doe@example.com')).toBe('jane.doe@example.com');
    expect(sanitizeSearch('Café Müller')).toBe('Café Müller');
  });

  it('strips PostgREST filter syntax', () => {
    expect(sanitizeSearch('a,org_id.eq.x')).toBe('a org_id.eq.x');
    expect(sanitizeSearch('x),(name.ilike.*')).toBe('x name.ilike.');
    expect(sanitizeSearch("o'brien%")).toBe('o brien');
  });

  it('handles arrays, undefined and long input', () => {
    expect(sanitizeSearch(['first', 'second'])).toBe('first');
    expect(sanitizeSearch(undefined)).toBe('');
    expect(sanitizeSearch('a'.repeat(200))).toHaveLength(80);
  });
});

describe('ilikeAny', () => {
  it('builds an or filter', () => {
    expect(ilikeAny(['name', 'email'], 'abc')).toBe('name.ilike.*abc*,email.ilike.*abc*');
  });
});
