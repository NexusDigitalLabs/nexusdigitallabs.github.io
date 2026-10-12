import { describe, it, expect } from 'vitest';
import { decodeEvents, encodeEvents, isAnalyticsEvent } from '../analytics-events';

describe('analytics event cookie', () => {
  it('round-trips known events', () => {
    expect(decodeEvents(encodeEvents(['client_created', 'invoice_issued']))).toEqual(['client_created', 'invoice_issued']);
  });

  it('drops unknown or injected names', () => {
    expect(decodeEvents('client_created.<script>.drop_tables.signup')).toEqual(['client_created', 'signup']);
    expect(decodeEvents('client_created%2Esignup')).toEqual(['client_created', 'signup']);
    expect(decodeEvents(undefined)).toEqual([]);
  });

  it('caps the number of events delivered at once', () => {
    expect(decodeEvents(Array(50).fill('login').join('.'))).toHaveLength(10);
  });

  it('only allows whitelisted names', () => {
    expect(isAnalyticsEvent('payment_recorded')).toBe(true);
    expect(isAnalyticsEvent('jane@example.com')).toBe(false);
  });
});
