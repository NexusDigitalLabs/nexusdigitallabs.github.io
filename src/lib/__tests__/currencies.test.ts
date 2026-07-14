import { describe, expect, it } from 'vitest';
import {
  currencyByCode,
  DEFAULT_CURRENCY,
  isCurrencyCode,
  normalizeCurrencyCode,
} from '@/lib/currencies';

describe('currencies', () => {
  it('recognizes supported currency codes', () => {
    expect(isCurrencyCode('USD')).toBe(true);
    expect(isCurrencyCode('LKR')).toBe(true);
    expect(isCurrencyCode('xyz')).toBe(false);
    expect(isCurrencyCode(null)).toBe(false);
  });

  it('normalizes invalid codes to the default', () => {
    expect(normalizeCurrencyCode('EUR')).toBe('EUR');
    expect(normalizeCurrencyCode('nope')).toBe(DEFAULT_CURRENCY);
    expect(normalizeCurrencyCode(undefined)).toBe('USD');
  });

  it('resolves currency metadata by code', () => {
    expect(currencyByCode('LKR').symbol).toBe('Rs');
    expect(currencyByCode('bad').code).toBe('USD');
  });
});
