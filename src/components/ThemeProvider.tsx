'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  applyResolvedTheme,
  readStoredTheme,
  resolveTheme,
  writeStoredTheme,
  type ResolvedTheme,
  type ThemePreference,
} from '@/lib/theme';

interface ThemeContextValue {
  /** User preference: light | dark | system */
  theme: ThemePreference;
  /** Effective theme after resolving system */
  resolvedTheme: ResolvedTheme;
  setTheme: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemDark(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark');
  const [ready, setReady] = useState(false);

  // Hydrate from localStorage after mount (boot script already set data-theme)
  useEffect(() => {
    const stored = readStoredTheme();
    const resolved = resolveTheme(stored, getSystemDark());
    setThemeState(stored);
    setResolvedTheme(resolved);
    applyResolvedTheme(resolved);
    setReady(true);
  }, []);

  // Follow OS changes when preference is "system"
  useEffect(() => {
    if (!ready || theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const resolved = resolveTheme('system', mq.matches);
      setResolvedTheme(resolved);
      applyResolvedTheme(resolved);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme, ready]);

  const setTheme = useCallback((preference: ThemePreference) => {
    writeStoredTheme(preference);
    const resolved = resolveTheme(preference, getSystemDark());
    setThemeState(preference);
    setResolvedTheme(resolved);
    applyResolvedTheme(resolved);
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
