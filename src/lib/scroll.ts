/**
 * Scroll helpers for homepage section anchors (sticky header aware).
 * Next.js App Router often drops or restores stale hashes on soft navigations,
 * so cross-route section jumps also use a short-lived sessionStorage intent.
 */

export const HOME_SECTION_IDS = ['tools', 'articles', 'games'] as const;
export type HomeSectionId = (typeof HOME_SECTION_IDS)[number];

export const HOME_SECTION_INTENT_KEY = 'ndl_home_section';
const HOME_TOP_INTENT = '__top__';

export type HomeNavIntent =
  | { type: 'section'; id: HomeSectionId }
  | { type: 'top' };

export function normalizeSectionId(hashOrId: string): string {
  return hashOrId.replace(/^#/, '').trim().split('#')[0]?.trim() ?? '';
}

export function isHomeSectionId(id: string): id is HomeSectionId {
  return (HOME_SECTION_IDS as readonly string[]).includes(id);
}

/** Scroll to an element by id; no-op if missing. */
export function scrollToSectionId(hashOrId: string, behavior: ScrollBehavior = 'smooth'): boolean {
  if (typeof document === 'undefined') return false;
  const id = normalizeSectionId(hashOrId);
  if (!id) return false;
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior, block: 'start' });
  return true;
}

/** Set location to `/#id` (or `/` when empty) without stacking hashes. */
export function setHomeHash(hashOrId: string, mode: 'push' | 'replace' = 'replace'): void {
  if (typeof window === 'undefined') return;
  const id = normalizeSectionId(hashOrId);
  const url = id ? `/#${id}` : '/';
  if (mode === 'push') window.history.pushState(null, '', url);
  else window.history.replaceState(null, '', url);
}

function writeIntent(value: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(HOME_SECTION_INTENT_KEY, value);
  } catch {
    // private mode / blocked storage
  }
}

export function setHomeSectionIntent(sectionId: string): void {
  const id = normalizeSectionId(sectionId);
  if (!isHomeSectionId(id)) return;
  writeIntent(id);
}

/** Force homepage top and clear any stale restored hash. */
export function setHomeTopIntent(): void {
  writeIntent(HOME_TOP_INTENT);
}

/** Consume a pending home nav intent (once). `null` = fall back to URL hash. */
export function takeHomeNavIntent(): HomeNavIntent | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(HOME_SECTION_INTENT_KEY);
    if (raw === null) return null;
    sessionStorage.removeItem(HOME_SECTION_INTENT_KEY);
    if (raw === HOME_TOP_INTENT) return { type: 'top' };
    const id = normalizeSectionId(raw);
    if (isHomeSectionId(id)) return { type: 'section', id };
    return null;
  } catch {
    return null;
  }
}

export function clearHomeSectionIntent(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(HOME_SECTION_INTENT_KEY);
  } catch {
    // ignore
  }
}
