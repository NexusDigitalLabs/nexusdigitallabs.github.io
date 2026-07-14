export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'ndl-theme';

export const THEME_PREFERENCES: ThemePreference[] = ['light', 'dark', 'system'];

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

/** Resolve stored preference against OS preference. */
export function resolveTheme(
  preference: ThemePreference,
  systemDark?: boolean,
): ResolvedTheme {
  if (preference === 'light' || preference === 'dark') return preference;
  const dark = systemDark
    ?? (typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : true);
  return dark ? 'dark' : 'light';
}

export function readStoredTheme(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(raw) ? raw : 'system';
  } catch {
    return 'system';
  }
}

export function writeStoredTheme(preference: ThemePreference): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // ignore quota / private mode
  }
}

/** Apply resolved theme to <html data-theme="…">. */
export function applyResolvedTheme(resolved: ResolvedTheme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', resolved);
}

/**
 * Inline boot script — run before first paint to avoid FOUC.
 * Keep in sync with THEME_STORAGE_KEY / resolve logic above.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var p=localStorage.getItem(k);if(p!=='light'&&p!=='dark'&&p!=='system')p='system';var r=p==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):p;document.documentElement.setAttribute('data-theme',r);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;
