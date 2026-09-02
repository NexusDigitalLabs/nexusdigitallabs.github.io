'use client';

import { useEffect } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { readStoredTheme, THEME_STORAGE_KEY } from '@/lib/theme';

/**
 * This page defaults to dark regardless of the OS setting — only an explicit
 * "light" choice lightens it. Mirrors AR_THEME_BOOT_SCRIPT, which runs pre-paint.
 */
export const AR_THEME_BOOT_SCRIPT = `(function(){try{var p=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});document.documentElement.setAttribute('data-ar-theme',p==='light'?'light':'dark');}catch(e){document.documentElement.setAttribute('data-ar-theme','dark');}})();`;

export default function ThemeScope() {
  const { theme } = useTheme();

  useEffect(() => {
    // Before ThemeProvider hydrates, `theme` is still the default "system",
    // so read storage directly to avoid a flash for light-preference visitors.
    const preference = theme === 'system' ? readStoredTheme() : theme;
    document.documentElement.setAttribute(
      'data-ar-theme',
      preference === 'light' ? 'light' : 'dark',
    );
    return () => document.documentElement.removeAttribute('data-ar-theme');
  }, [theme]);

  return null;
}
