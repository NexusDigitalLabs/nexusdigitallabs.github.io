import { describe, it, expect } from 'vitest';
import { APP_NAV, isNavItemActive } from '../nav';

describe('isNavItemActive', () => {
  it('matches the dashboard only on /app/', () => {
    expect(isNavItemActive('/app/', '/app/')).toBe(true);
    expect(isNavItemActive('/app/', '/app')).toBe(true);
    expect(isNavItemActive('/app/', '/app/clients/')).toBe(false);
  });

  it('matches sections and their sub-pages', () => {
    expect(isNavItemActive('/app/clients/', '/app/clients/')).toBe(true);
    expect(isNavItemActive('/app/clients/', '/app/clients/abc/')).toBe(true);
    expect(isNavItemActive('/app/clients/', '/app/clientsx/')).toBe(false);
  });

  it('handles a missing pathname', () => {
    expect(isNavItemActive('/app/', null)).toBe(false);
  });
});

describe('APP_NAV', () => {
  it('uses trailing-slash /app hrefs (site canonical URL shape)', () => {
    for (const item of APP_NAV) {
      expect(item.href.startsWith('/app/')).toBe(true);
      expect(item.href.endsWith('/')).toBe(true);
    }
  });
});

describe('isAppPath', () => {
  it('matches /app and below only', async () => {
    const { isAppPath } = await import('../paths');
    expect(isAppPath('/app')).toBe(true);
    expect(isAppPath('/app/')).toBe(true);
    expect(isAppPath('/app/clients/')).toBe(true);
    expect(isAppPath('/apps/')).toBe(false);
    expect(isAppPath('/about/')).toBe(false);
    expect(isAppPath(null)).toBe(false);
  });
});
