/**
 * Money is stored as integer minor units (e.g. cents) + ISO 4217 code.
 * Never use floats for amounts: parse and format through these helpers.
 */

const COMMON_CURRENCIES = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'NZD', 'SGD', 'INR', 'LKR', 'AED', 'JPY'];

function supportedCurrencies(): string[] {
  try {
    return Intl.supportedValuesOf('currency');
  } catch {
    return COMMON_CURRENCIES;
  }
}

const SUPPORTED = new Set(supportedCurrencies());

export function isCurrencyCode(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Z]{3}$/.test(value) && SUPPORTED.has(value);
}

/** Number of minor-unit digits for a currency (USD 2, JPY 0, KWD 3). */
export function currencyDecimals(currency: string): number {
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    return 2;
  }
}

/**
 * Parse user input like "1,234.50" into minor units. Returns null for empty
 * input, NaN-free; throws nothing. Rejects negatives and more decimals than
 * the currency allows.
 */
export function parseMoneyToMinor(input: string, currency: string): { ok: true; value: number | null } | { ok: false } {
  const cleaned = input.replace(/[\s,]/g, '');
  if (cleaned === '') return { ok: true, value: null };
  const match = /^(\d+)(?:\.(\d*))?$/.exec(cleaned);
  if (!match) return { ok: false };

  const decimals = currencyDecimals(currency);
  const [, whole, frac = ''] = match;
  if (frac.length > decimals) return { ok: false };

  const value = Number(whole + frac.padEnd(decimals, '0'));
  if (!Number.isSafeInteger(value)) return { ok: false };
  return { ok: true, value };
}

/** Minor units → plain input string ("1234.50"), for edit forms. */
export function minorToInput(minor: number | null | undefined, currency: string): string {
  if (minor === null || minor === undefined) return '';
  const decimals = currencyDecimals(currency);
  if (decimals === 0) return String(minor);
  const s = String(minor).padStart(decimals + 1, '0');
  return `${s.slice(0, -decimals)}.${s.slice(-decimals)}`;
}

/** Minor units → localized display string ("$1,234.50"). */
export function formatMoney(minor: number, currency: string, locale = 'en-US'): string {
  const decimals = currencyDecimals(currency);
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(minor / 10 ** decimals);
  } catch {
    return `${currency} ${minorToInput(minor, currency)}`;
  }
}

export type CurrencyOption = { code: string; label: string };

/** Common currencies first, then every other supported code A–Z. */
export function currencyOptions(locale = 'en'): CurrencyOption[] {
  let names: Intl.DisplayNames | null = null;
  try {
    names = new Intl.DisplayNames([locale], { type: 'currency' });
  } catch {
    names = null;
  }
  const label = (code: string) => {
    const name = names?.of(code);
    return name && name !== code ? `${code} — ${name}` : code;
  };
  const common = COMMON_CURRENCIES.filter((c) => SUPPORTED.has(c));
  const rest = [...SUPPORTED].filter((c) => !common.includes(c)).sort();
  return [...common, ...rest].map((code) => ({ code, label: label(code) }));
}
