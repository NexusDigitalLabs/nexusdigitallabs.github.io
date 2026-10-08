import { describe, it, expect } from 'vitest';
import { getEntitlements, isPlan, isWithinLimit, PLANS } from '../entitlements';

describe('getEntitlements', () => {
  it('beta has no business limits but a finite AI cap', () => {
    const e = getEntitlements('beta');
    expect(e.maxClients).toBeNull();
    expect(e.maxActiveProjects).toBeNull();
    expect(e.maxInvoicesPerMonth).toBeNull();
    expect(e.aiActionsPerMonth).toBe(100);
  });

  it('free plan matches the planned limits', () => {
    expect(getEntitlements('free')).toEqual({
      maxClients: 3,
      maxActiveProjects: 2,
      maxInvoicesPerMonth: 5,
      aiActionsPerMonth: 25,
    });
  });

  it('every plan has a finite AI cap', () => {
    for (const plan of PLANS) {
      expect(Number.isFinite(getEntitlements(plan).aiActionsPerMonth)).toBe(true);
    }
  });

  it.each([undefined, null, '', 'enterprise', 'PRO', 42])('falls back to free for %p', (value) => {
    expect(getEntitlements(value)).toEqual(getEntitlements('free'));
  });
});

describe('isPlan', () => {
  it('accepts known plans only', () => {
    expect(isPlan('pro')).toBe(true);
    expect(isPlan('platinum')).toBe(false);
    expect(isPlan(undefined)).toBe(false);
  });
});

describe('isWithinLimit', () => {
  it('treats null as unlimited', () => {
    expect(isWithinLimit(null, 1_000_000)).toBe(true);
  });

  it('allows creating until the limit is reached', () => {
    expect(isWithinLimit(3, 0)).toBe(true);
    expect(isWithinLimit(3, 2)).toBe(true);
    expect(isWithinLimit(3, 3)).toBe(false);
    expect(isWithinLimit(3, 4)).toBe(false);
  });
});
