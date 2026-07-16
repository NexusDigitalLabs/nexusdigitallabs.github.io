import { describe, it, expect } from 'vitest';
import { ARTICLES } from '@/data/articles';
import { GAME_COUNT, GAMES, TOOL_COUNT, TOOLS } from '@/data/catalog';

describe('site catalog counts', () => {
  it('exposes tool and game counts from catalog length', () => {
    expect(TOOL_COUNT).toBe(TOOLS.length);
    expect(GAME_COUNT).toBe(GAMES.length);
    expect(TOOL_COUNT).toBeGreaterThanOrEqual(8);
    expect(GAME_COUNT).toBe(8);
  });

  it('keeps article list non-empty for homepage stats', () => {
    expect(ARTICLES.length).toBeGreaterThanOrEqual(17);
  });

  it('uses unique tool and game hrefs', () => {
    const toolHrefs = TOOLS.map((t) => t.href);
    const gameHrefs = GAMES.map((g) => g.href);
    expect(new Set(toolHrefs).size).toBe(toolHrefs.length);
    expect(new Set(gameHrefs).size).toBe(gameHrefs.length);
  });
});
