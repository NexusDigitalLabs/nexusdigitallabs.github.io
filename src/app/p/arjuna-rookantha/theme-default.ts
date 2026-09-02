import { THEME_STORAGE_KEY } from '@/lib/theme';

/**
 * Seeds a dark preference for visitors who arrive here without one, so the
 * header toggle shows "Dark" selected rather than "System". An existing
 * preference is left untouched. Runs before first paint to avoid a flash, and
 * mirrors the resolve logic in THEME_BOOT_SCRIPT.
 */
export const DARK_DEFAULT_BOOT_SCRIPT = `(function(){try{var k=${JSON.stringify(
  THEME_STORAGE_KEY,
)};var p=localStorage.getItem(k);if(p!=='light'&&p!=='dark'&&p!=='system'){localStorage.setItem(k,'dark');p='dark';}var r=p==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):p;document.documentElement.setAttribute('data-theme',r);}catch(e){}})();`;
