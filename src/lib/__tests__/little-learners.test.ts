import { describe, expect, it } from 'vitest';
import {
  ACTIVITIES,
  SKILL_STEP,
  choiceCount,
  generateRound,
  levelUpText,
  nextSkill,
  nudge,
  poolItems,
  poolSize,
  stageInfo,
  type Level,
} from '@/lib/games/little-learners';

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

describe('little learners growing difficulty', () => {
  it('starts toddlers on three items and adds one every few right answers', () => {
    expect(poolSize('numbers', 'little', 0)).toBe(3);
    expect(poolSize('numbers', 'little', SKILL_STEP - 1)).toBe(3);
    expect(poolSize('numbers', 'little', SKILL_STEP)).toBe(4);
    expect(poolSize('numbers', 'little', 100)).toBe(5);
    expect(poolSize('letters', 'big', 0)).toBe(5);
    expect(poolSize('letters', 'big', 1000)).toBe(26);
  });

  it('only uses unlocked items as choices', () => {
    for (let i = 0; i < 200; i++) {
      const start = generateRound('numbers', 'little', Math.random, undefined, { size: 3 });
      expect(start.choices.map((c) => c.id).sort()).toEqual(['1', '2', '3']);
      const next = generateRound('letters', 'little', Math.random, undefined, { size: 4 });
      for (const c of next.choices) expect('ABCD').toContain(c.id);
    }
  });

  it('never shows fewer items than there are answer tiles', () => {
    for (const level of ['little', 'big'] as Level[]) {
      for (const a of ACTIVITIES) {
        expect(poolSize(a, level, 0)).toBeGreaterThanOrEqual(choiceCount(level));
        const r = generateRound(a, level, Math.random, undefined, { size: 1 });
        expect(r.choices).toHaveLength(choiceCount(level));
      }
    }
  });

  it('features the newly unlocked item straight after a level-up', () => {
    for (let i = 0; i < 50; i++) {
      const r = generateRound('numbers', 'little', Math.random, '1', { size: 4, focusNewest: true });
      expect(r.target.id).toBe('4');
    }
  });

  it('moves the skill score up for first tries and gently down after the hint', () => {
    expect(nextSkill(2, 0, 2)).toBe(3);
    expect(nextSkill(2, 1, 2)).toBe(2);
    expect(nextSkill(2, 2, 2)).toBe(1);
    expect(nextSkill(0, 3, 2)).toBe(0);
  });

  it('reports stages and names the new item on level-up', () => {
    expect(stageInfo('numbers', 'little', 0)).toEqual({ stage: 1, stages: 3 });
    expect(stageInfo('numbers', 'little', SKILL_STEP * 2)).toEqual({ stage: 3, stages: 3 });
    expect(levelUpText('numbers', 'little', SKILL_STEP)).toBe('Level up! Here comes number four!');
    expect(levelUpText('counting', 'little', SKILL_STEP)).toBe('Level up! Now we can count to four!');
    expect(poolItems('colors', 'little').map((c) => c.id).slice(0, 3)).toEqual(['red', 'blue', 'yellow']);
  });
});
