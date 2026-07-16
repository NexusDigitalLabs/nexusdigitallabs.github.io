export type SemanticTier = 'easy' | 'medium' | 'hard';

export const COLOR_WORDS = ['RED', 'BLUE', 'GREEN', 'YELLOW'] as const;
export type ColorWord = (typeof COLOR_WORDS)[number];

export const INK: Record<ColorWord, string> = {
  RED: '#ef4444',
  BLUE: '#3b82f6',
  GREEN: '#22c55e',
  YELLOW: '#eab308',
};

export type MatchRule = 'word' | 'color';

export const SEMANTIC_TIERS: Record<
  SemanticTier,
  { perRoundMs: number; ruleEvery: number | 'random'; basePts: number }
> = {
  easy: { perRoundMs: 2500, ruleEvery: 5, basePts: 50 },
  medium: { perRoundMs: 1300, ruleEvery: 2, basePts: 80 },
  hard: { perRoundMs: 700, ruleEvery: 'random', basePts: 120 },
};

export type Round = {
  word: ColorWord;
  ink: ColorWord;
  rule: MatchRule;
  optionA: ColorWord;
  optionB: ColorWord;
  correct: ColorWord;
};

function pickDistinct(exclude?: ColorWord): ColorWord {
  const pool = COLOR_WORDS.filter((c) => c !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function nextRule(
  tier: SemanticTier,
  roundIndex: number,
  prev: MatchRule
): MatchRule {
  const cfg = SEMANTIC_TIERS[tier];
  if (cfg.ruleEvery === 'random') {
    return Math.random() < 0.5 ? 'word' : 'color';
  }
  if (roundIndex > 0 && roundIndex % cfg.ruleEvery === 0) {
    return prev === 'word' ? 'color' : 'word';
  }
  return prev;
}

export function generateRound(rule: MatchRule): Round {
  const word = COLOR_WORDS[Math.floor(Math.random() * COLOR_WORDS.length)];
  // Prefer mismatch for Stroop effect
  let ink = pickDistinct(word);
  if (Math.random() < 0.15) ink = word;

  const correct = rule === 'word' ? word : ink;
  let distractor = pickDistinct(correct);
  // Ensure distractor is plausible
  if (distractor === correct) distractor = pickDistinct(correct);

  const flip = Math.random() < 0.5;
  return {
    word,
    ink,
    rule,
    optionA: flip ? correct : distractor,
    optionB: flip ? distractor : correct,
    correct,
  };
}

export function streakMultiplier(streak: number): number {
  if (streak >= 10) return 3;
  if (streak >= 5) return 2;
  if (streak >= 2) return 1.5;
  return 1;
}
