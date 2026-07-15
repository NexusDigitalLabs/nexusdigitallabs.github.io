import { describe, it, expect, beforeEach } from 'vitest';
import {
  normalizeSectionId,
  setHomeHash,
  setHomeSectionIntent,
  setHomeTopIntent,
  takeHomeNavIntent,
  clearHomeSectionIntent,
  isHomeSectionId,
} from '@/lib/scroll';

describe('scroll helpers', () => {
  beforeEach(() => {
    sessionStorage.clear();
    window.history.replaceState(null, '', '/');
  });

  it('normalizes hash or bare id and strips stacked hashes', () => {
    expect(normalizeSectionId('#tools')).toBe('tools');
    expect(normalizeSectionId('articles')).toBe('articles');
    expect(normalizeSectionId('#games#tools')).toBe('games');
  });

  it('recognizes home section ids', () => {
    expect(isHomeSectionId('tools')).toBe(true);
    expect(isHomeSectionId('articles')).toBe(true);
    expect(isHomeSectionId('games')).toBe(true);
    expect(isHomeSectionId('about')).toBe(false);
  });

  it('sets a single home hash without stacking', () => {
    window.history.replaceState(null, '', '/#tools');
    setHomeHash('articles', 'replace');
    expect(window.location.pathname + window.location.hash).toBe('/#articles');
    setHomeHash('tools', 'replace');
    expect(window.location.hash).toBe('#tools');
    expect(window.location.hash.includes('#tools#')).toBe(false);
  });

  it('stores and consumes section intent once (overrides stale tools hash)', () => {
    window.history.replaceState(null, '', '/#tools');
    setHomeSectionIntent('articles');
    expect(takeHomeNavIntent()).toEqual({ type: 'section', id: 'articles' });
    expect(takeHomeNavIntent()).toBeNull();
  });

  it('stores top intent to clear stale hashes', () => {
    setHomeTopIntent();
    expect(takeHomeNavIntent()).toEqual({ type: 'top' });
  });

  it('clears section intent', () => {
    setHomeSectionIntent('games');
    clearHomeSectionIntent();
    expect(takeHomeNavIntent()).toBeNull();
  });
});
