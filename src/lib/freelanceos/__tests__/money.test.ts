import { describe, it, expect } from 'vitest';
import {
  currencyDecimals,
  currencyOptions,
  formatMoney,
  isCurrencyCode,
  minorToInput,
  parseMoneyToMinor,
} from '../money';

describe('currencyDecimals', () => {
  it('knows zero- and three-decimal currencies', () => {
    expect(currencyDecimals('USD')).toBe(2);
    expect(currencyDecimals('JPY')).toBe(0);
    expect(currencyDecimals('KWD')).toBe(3);
  });
});

describe('parseMoneyToMinor', () => {
  it.each([
    ['40', 'USD', 4000],
    ['40.5', 'USD', 4050],
    ['1,234.56', 'USD', 123456],
    [' 12 ', 'USD', 1200],
    ['0.01', 'USD', 1],
    ['1500', 'JPY', 1500],
    ['1.234', 'KWD', 1234],
  ])('parses %s %s → %d', (input, currency, expected) => {
    expect(parseMoneyToMinor(input, currency)).toEqual({ ok: true, value: expected });
  });

  it('treats empty input as null', () => {
    expect(parseMoneyToMinor('  ', 'USD')).toEqual({ ok: true, value: null });
  });

  it.each([
    ['-5', 'USD'],
    ['abc', 'USD'],
    ['1.234', 'USD'],
    ['10.5', 'JPY'],
    ['1e5', 'USD'],
    ['99999999999999999999', 'USD'],
  ])('rejects %s %s', (input, currency) => {
    expect(parseMoneyToMinor(input, currency)).toEqual({ ok: false });
  });

  it('avoids float rounding errors', () => {
    expect(parseMoneyToMinor('0.29', 'USD')).toEqual({ ok: true, value: 29 });
    expect(parseMoneyToMinor('1.15', 'USD')).toEqual({ ok: true, value: 115 });
  });
});

describe('minorToInput', () => {
  it('round-trips with parseMoneyToMinor', () => {
    expect(minorToInput(4050, 'USD')).toBe('40.50');
    expect(minorToInput(5, 'USD')).toBe('0.05');
    expect(minorToInput(1500, 'JPY')).toBe('1500');
    expect(minorToInput(null, 'USD')).toBe('');
  });
});

describe('formatMoney', () => {
  it('formats minor units for display', () => {
    expect(formatMoney(123456, 'USD')).toBe('$1,234.56');
    expect(formatMoney(1500, 'JPY')).toBe('¥1,500');
  });
});

describe('currency codes', () => {
  it('validates ISO codes', () => {
    expect(isCurrencyCode('LKR')).toBe(true);
    expect(isCurrencyCode('usd')).toBe(false);
    expect(isCurrencyCode('XYZ1')).toBe(false);
  });

  it('lists common currencies first', () => {
    const options = currencyOptions();
    expect(options[0].code).toBe('USD');
    expect(options.some((o) => o.code === 'LKR')).toBe(true);
    expect(new Set(options.map((o) => o.code)).size).toBe(options.length);
  });
});
