import { describe, it, expect, beforeEach } from 'vitest';
import { THEME_STORAGE_KEY } from '@/lib/theme';
import { DARK_DEFAULT_BOOT_SCRIPT } from '../theme-default';

function runBootScript(): void {
  new Function(DARK_DEFAULT_BOOT_SCRIPT)();
}

describe('DARK_DEFAULT_BOOT_SCRIPT', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('seeds dark when no preference is stored', () => {
    runBootScript();

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('seeds dark when the stored value is corrupt', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'neon');

    runBootScript();

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('keeps an explicit light preference and applies it', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light');

    runBootScript();

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('keeps an explicit system preference and resolves it against the OS', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'system');

    runBootScript();

    // The test setup reports a dark OS preference.
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('system');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
