import { describe, expect, it } from 'vitest';
import { hidesSitePromos } from '../promo-paths';

describe('hidesSitePromos', () => {
  it('hides on the Huffle product page and its policy', () => {
    expect(hidesSitePromos('/huffle')).toBe(true);
    expect(hidesSitePromos('/huffle/')).toBe(true);
    expect(hidesSitePromos('/huffle/privacy-policy/')).toBe(true);
  });

  it('keeps promos everywhere else, including lookalike paths', () => {
    expect(hidesSitePromos('/')).toBe(false);
    expect(hidesSitePromos('/tools/')).toBe(false);
    expect(hidesSitePromos('/odova/privacy-policy/')).toBe(false);
    expect(hidesSitePromos('/huffleboard/')).toBe(false);
    expect(hidesSitePromos(null)).toBe(false);
    expect(hidesSitePromos(undefined)).toBe(false);
  });
});
