import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  isThemePreference,
  resolveTheme,
  readStoredTheme,
  writeStoredTheme,
  applyResolvedTheme,
  THEME_STORAGE_KEY,
  THEME_PREFERENCES,
  THEME_BOOT_SCRIPT,
} from '../theme';

describe('isThemePreference', () => {
  it('accepts light, dark, system', () => {
    expect(isThemePreference('light')).toBe(true);
    expect(isThemePreference('dark')).toBe(true);
    expect(isThemePreference('system')).toBe(true);
  });

  it('rejects invalid values', () => {
    expect(isThemePreference('auto')).toBe(false);
    expect(isThemePreference(null)).toBe(false);
    expect(isThemePreference('')).toBe(false);
  });
});

describe('THEME_PREFERENCES', () => {
  it('lists light, dark, system', () => {
    expect(THEME_PREFERENCES).toEqual(['light', 'dark', 'system']);
  });
});

describe('resolveTheme', () => {
  it('returns explicit light/dark as-is', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });

  it('resolves system from the provided flag', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });
});

describe('storage helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('defaults to system when nothing stored', () => {
    expect(readStoredTheme()).toBe('system');
  });

  it('reads and writes preference', () => {
    writeStoredTheme('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(readStoredTheme()).toBe('light');
  });

  it('falls back to system for corrupt values', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'neon');
    expect(readStoredTheme()).toBe('system');
  });
});

describe('applyResolvedTheme', () => {
  it('sets data-theme on documentElement', () => {
    applyResolvedTheme('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    applyResolvedTheme('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});

describe('THEME_BOOT_SCRIPT', () => {
  it('includes the storage key and data-theme assignment', () => {
    expect(THEME_BOOT_SCRIPT).toContain(THEME_STORAGE_KEY);
    expect(THEME_BOOT_SCRIPT).toContain('data-theme');
    expect(THEME_BOOT_SCRIPT).toContain('prefers-color-scheme');
  });
});
