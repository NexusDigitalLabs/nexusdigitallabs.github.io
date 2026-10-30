import { describe, expect, it } from 'vitest';
import { ACTIVITIES, choiceCount, generateRound, nudge, type Level } from '@/lib/games/little-learners';

describe('little learners rounds', () => {
  const levels: Level[] = ['little', 'big'];

  it('always includes the target exactly once among distinct choices', () => {
    for (const level of levels) {
      for (const activity of ACTIVITIES) {
        for (let i = 0; i < 200; i++) {
          const r = generateRound(activity, level);
          const ids = r.choices.map((c) => c.id);
          expect(ids).toHaveLength(choiceCount(level));
          expect(new Set(ids).size).toBe(ids.length);
          expect(ids.filter((id) => id === r.target.id)).toHaveLength(1);
        }
      }
    }
  });

  it('keeps little mode to the smaller ranges', () => {
    for (let i = 0; i < 200; i++) {
      expect(Number(generateRound('numbers', 'little').target.id)).toBeLessThanOrEqual(5);
      expect(generateRound('counting', 'little').count).toBeLessThanOrEqual(5);
      expect('ABCDEFGH').toContain(generateRound('letters', 'little').target.id);
    }
  });

  it('does not repeat the previous target', () => {
    for (let i = 0; i < 200; i++) {
      expect(generateRound('colors', 'little', Math.random, 'red').target.id).not.toBe('red');
    }
  });

  it('names the tapped choice when nudging', () => {
    expect(nudge('numbers', { id: '5', name: 'five' }, () => 0)).toContain("That's number five");
  });
});
