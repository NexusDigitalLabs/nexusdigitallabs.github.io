import { describe, expect, it } from 'vitest';
import { GAMES } from '@/data/catalog';
import { GAME_GUIDES } from '@/data/game-guides';

const words = (text: string) => text.split(/\s+/).filter(Boolean).length;

function guideWords(slug: keyof typeof GAME_GUIDES) {
  const g = GAME_GUIDES[slug];
  const parts = [
    g.title,
    g.intro,
    ...g.mechanics,
    ...g.scoring,
    ...g.strategy,
    ...g.sections.flatMap((s) => [s.title, ...(s.paragraphs ?? []), ...(s.items ?? [])]),
    ...g.faq.flatMap((f) => [f.q, f.a]),
  ];
  return words(parts.join(' '));
}

describe('game guides', () => {
  it('has a guide for every game in the catalog', () => {
    for (const game of GAMES) {
      const slug = game.href.replace(/^\/games\/|\/$/g, '');
      expect(Object.keys(GAME_GUIDES), `missing guide for ${slug}`).toContain(slug);
    }
  });

  it.each(Object.keys(GAME_GUIDES) as (keyof typeof GAME_GUIDES)[])(
    '%s guide is substantial and has an FAQ',
    (slug) => {
      expect(guideWords(slug)).toBeGreaterThanOrEqual(650);
      expect(GAME_GUIDES[slug].faq.length).toBeGreaterThanOrEqual(3);
      expect(GAME_GUIDES[slug].sections.length).toBeGreaterThanOrEqual(2);
    },
  );

  it('keeps the numbers quoted in guides in sync with the game code', async () => {
    const { SUDOKU_TIERS } = await import('@/lib/games/sudoku');
    const { GRIDLOCK_TIERS } = await import('@/lib/games/gridlock');
    const { SNAKE_BASE_TICK_MS, SNAKE_TICK_STEP_MS, SNAKE_MIN_TICK_MS, SNAKE_POINTS_PER_LEVEL } = await import(
      '@/lib/snake-levels'
    );
    const text = (slug: keyof typeof GAME_GUIDES) => JSON.stringify(GAME_GUIDES[slug]);

    for (const t of Object.values(SUDOKU_TIERS)) {
      expect(text('sudoku')).toContain(String(t.clues));
    }
    expect(text('sudoku')).toContain('1,800');
    expect(text('gridlock')).toContain(`${GRIDLOCK_TIERS.hard.points}`);
    expect(text('snake')).toContain(`${SNAKE_BASE_TICK_MS} milliseconds`);
    expect(text('snake')).toContain(`${SNAKE_TICK_STEP_MS} milliseconds`);
    expect(text('snake')).toContain(`${SNAKE_MIN_TICK_MS} milliseconds`);
    expect(text('snake')).toContain(`${SNAKE_POINTS_PER_LEVEL} points`);
  });
});
