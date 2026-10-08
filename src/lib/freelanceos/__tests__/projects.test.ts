import { describe, it, expect } from 'vitest';
import { formatBilling, formatDate } from '../projects';

describe('formatBilling', () => {
  const base = { currency: 'USD', rate_minor: null, budget_minor: null };

  it('formats each billing type', () => {
    expect(formatBilling({ ...base, billing_type: 'hourly', rate_minor: 4000 })).toBe('$40.00 / hr');
    expect(formatBilling({ ...base, billing_type: 'retainer', rate_minor: 50000 })).toBe('$500.00 / month');
    expect(formatBilling({ ...base, billing_type: 'fixed', budget_minor: 200000 })).toBe('Fixed · $2,000.00');
    expect(formatBilling({ ...base, billing_type: 'milestone', budget_minor: 100 })).toBe('Milestones · $1.00');
  });

  it('falls back to the type label without amounts', () => {
    expect(formatBilling({ ...base, billing_type: 'hourly' })).toBe('Hourly');
    expect(formatBilling({ ...base, billing_type: 'fixed' })).toBe('Fixed price');
  });
});

describe('formatDate', () => {
  it('formats date-only values without timezone drift', () => {
    expect(formatDate('2026-01-01')).toBe('Jan 1, 2026');
    expect(formatDate('2026-10-07T23:59:59Z')).toBe('Oct 7, 2026');
  });

  it('shows a dash for missing or invalid dates', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate('nope')).toBe('—');
  });
});
