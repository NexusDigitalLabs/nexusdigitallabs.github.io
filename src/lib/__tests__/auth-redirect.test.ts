import { describe, it, expect } from 'vitest';
import {
  safeNextPath,
  loginUrl,
  readAuthNextCookie,
  AUTH_NEXT_COOKIE,
} from '../auth-redirect';

describe('safeNextPath', () => {
  it('defaults empty to /', () => {
    expect(safeNextPath(null)).toBe('/');
    expect(safeNextPath('')).toBe('/');
  });

  it('rejects open redirects', () => {
    expect(safeNextPath('https://evil.com')).toBe('/');
    expect(safeNextPath('//evil.com')).toBe('/');
  });

  it('normalizes trailing slash', () => {
    expect(safeNextPath('/tools/debt-optimizer')).toBe('/tools/debt-optimizer/');
    expect(safeNextPath('/tools/debt-optimizer/')).toBe('/tools/debt-optimizer/');
  });

  it('decodes encoded paths', () => {
    expect(safeNextPath('%2Ftools%2Ffuel-tracker%2F')).toBe('/tools/fuel-tracker/');
  });
});

describe('loginUrl', () => {
  it('omits next for home', () => {
    expect(loginUrl('/')).toBe('/login/');
  });

  it('encodes next for tool pages', () => {
    expect(loginUrl('/tools/fuel-tracker/')).toBe(
      '/login/?next=%2Ftools%2Ffuel-tracker%2F'
    );
  });
});

describe('readAuthNextCookie', () => {
  it('reads ndl_auth_next from cookie header', () => {
    const header = `theme=dark; ${AUTH_NEXT_COOKIE}=${encodeURIComponent('/tools/debt-optimizer/')}; other=1`;
    expect(readAuthNextCookie(header)).toBe('/tools/debt-optimizer/');
  });

  it('returns null when missing', () => {
    expect(readAuthNextCookie('a=1')).toBeNull();
    expect(readAuthNextCookie(null)).toBeNull();
  });
});
