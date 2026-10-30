/**
 * Little Learners — round generator for the toddler / playgroup playground.
 * Pure data + logic; the UI lives in src/components/games/GameLittleLearners.tsx.
 */

export type Activity = 'numbers' | 'letters' | 'shapes' | 'colors' | 'counting' | 'matching';
export type Level = 'little' | 'big';

export const ACTIVITIES: readonly Activity[] = ['numbers', 'letters', 'shapes', 'colors', 'counting', 'matching'];

/** One tappable answer. `id` keys into the data tables below; `name` is what gets spoken. */
export type Choice = { id: string; name: string };

export type Round = {
  activity: Activity;
  /** Short on-screen instruction, e.g. "Find the number 3". */
  prompt: string;
  /** Longer sentence for speech, e.g. "Can you find the number three?" */
  say: string;
  target: Choice;
  choices: Choice[];
  /** Counting / matching: the emoji shown above the choices. */
  emoji?: string;
  /** Counting: how many emoji to draw. */
  count?: number;
};

export const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

export const LETTERS: Record<string, { word: string; emoji: string }> = {
  A: { word: 'apple', emoji: '🍎' },
  B: { word: 'bear', emoji: '🐻' },
  C: { word: 'cat', emoji: '🐱' },
  D: { word: 'dog', emoji: '🐶' },
  E: { word: 'elephant', emoji: '🐘' },
  F: { word: 'fish', emoji: '🐟' },
  G: { word: 'grapes', emoji: '🍇' },
  H: { word: 'house', emoji: '🏠' },
  I: { word: 'ice cream', emoji: '🍦' },
  J: { word: 'juice', emoji: '🧃' },
  K: { word: 'kite', emoji: '🪁' },
  L: { word: 'lion', emoji: '🦁' },
  M: { word: 'monkey', emoji: '🐵' },
  N: { word: 'nose', emoji: '👃' },
  O: { word: 'orange', emoji: '🍊' },
  P: { word: 'pig', emoji: '🐷' },
  Q: { word: 'queen', emoji: '👸' },
  R: { word: 'rabbit', emoji: '🐰' },
  S: { word: 'sun', emoji: '☀️' },
  T: { word: 'tree', emoji: '🌳' },
  U: { word: 'umbrella', emoji: '☂️' },
  V: { word: 'van', emoji: '🚐' },
  W: { word: 'whale', emoji: '🐳' },
  X: { word: 'fox', emoji: '🦊' },
  Y: { word: 'yo-yo', emoji: '🪀' },
  Z: { word: 'zebra', emoji: '🦓' },
};

export const SHAPES = ['circle', 'square', 'triangle', 'star', 'heart', 'rectangle', 'oval', 'diamond'] as const;
export type Shape = (typeof SHAPES)[number];

export const COLORS: Record<string, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  yellow: '#facc15',
  green: '#22c55e',
  orange: '#f97316',
  purple: '#a855f7',
  pink: '#ec4899',
  brown: '#92400e',
  black: '#1f2937',
  white: '#ffffff',
};

/** Matching uses small families so distractors look related but are clearly different. */
export const MATCH_SETS: readonly string[][] = [
  ['🐶', '🐱', '🐰', '🐻', '🐼', '🐸', '🐷', '🐮'],
  ['🍎', '🍌', '🍇', '🍓', '🍊', '🍉', '🍐', '🥕'],
  ['🚗', '🚌', '🚂', '✈️', '🚀', '🚲', '🚒', '🚜'],
  ['⚽', '🏀', '🎈', '🧸', '🪁', '🥁', '🎨', '🪀'],
];

const MATCH_NAMES: Record<string, string> = {
  '🐶': 'dog', '🐱': 'cat', '🐰': 'rabbit', '🐻': 'bear', '🐼': 'panda', '🐸': 'frog', '🐷': 'pig', '🐮': 'cow',
  '🍎': 'apple', '🍌': 'banana', '🍇': 'grapes', '🍓': 'strawberry', '🍊': 'orange', '🍉': 'watermelon', '🍐': 'pear', '🥕': 'carrot',
  '🚗': 'car', '🚌': 'bus', '🚂': 'train', '✈️': 'plane', '🚀': 'rocket', '🚲': 'bike', '🚒': 'fire truck', '🚜': 'tractor',
  '⚽': 'ball', '🏀': 'basketball', '🎈': 'balloon', '🧸': 'teddy bear', '🪁': 'kite', '🥁': 'drum', '🎨': 'paints', '🪀': 'yo-yo',
};

const COUNT_EMOJI = ['🐥', '🍎', '⭐', '🐞', '🌸', '🐟', '🍓', '🎈'];

const LITTLE_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const LITTLE_SHAPES: readonly Shape[] = ['circle', 'square', 'triangle', 'star', 'heart'];
const LITTLE_COLORS = ['red', 'blue', 'yellow', 'green', 'orange'];

export type Rng = () => number;

export function choiceCount(level: Level): number {
  return level === 'little' ? 3 : 4;
}

export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pick<T>(items: readonly T[], rng: Rng): T {
  return items[Math.floor(rng() * items.length)];
}

/** Target plus distinct distractors, shuffled. Avoids repeating `previousId` as the target when possible. */
function pickChoices(pool: readonly Choice[], n: number, rng: Rng, previousId?: string): { target: Choice; choices: Choice[] } {
  const candidates = pool.length > 1 ? pool.filter((c) => c.id !== previousId) : pool;
  const target = pick(candidates, rng);
  const others = shuffle(pool.filter((c) => c.id !== target.id), rng).slice(0, n - 1);
  return { target, choices: shuffle([target, ...others], rng) };
}

const numberChoice = (n: number): Choice => ({ id: String(n), name: NUMBER_WORDS[n] });

export function generateRound(activity: Activity, level: Level, rng: Rng = Math.random, previousId?: string): Round {
  const n = choiceCount(level);
  const maxNumber = level === 'little' ? 5 : 10;
  const numbers = Array.from({ length: maxNumber }, (_, i) => numberChoice(i + 1));

  switch (activity) {
    case 'numbers': {
      const { target, choices } = pickChoices(numbers, n, rng, previousId);
      return { activity, prompt: `Find the number ${target.id}`, say: `Can you find the number ${target.name}?`, target, choices };
    }
    case 'letters': {
      const keys = level === 'little' ? LITTLE_LETTERS : Object.keys(LETTERS);
      const pool = keys.map((k) => ({ id: k, name: k }));
      const { target, choices } = pickChoices(pool, n, rng, previousId);
      const { word } = LETTERS[target.id];
      const hint = target.id === 'X' ? `X is at the end of ${word}` : `${target.id} is for ${word}`;
      return {
        activity,
        prompt: `Find the letter ${target.id}`,
        say: `Can you find the letter ${target.id}? ${hint}!`,
        target,
        choices,
        emoji: LETTERS[target.id].emoji,
      };
    }
    case 'shapes': {
      const pool = (level === 'little' ? LITTLE_SHAPES : SHAPES).map((s) => ({ id: s, name: s }));
      const { target, choices } = pickChoices(pool, n, rng, previousId);
      return { activity, prompt: `Find the ${target.name}`, say: `Can you find the ${target.name}?`, target, choices };
    }
    case 'colors': {
      const pool = (level === 'little' ? LITTLE_COLORS : Object.keys(COLORS)).map((c) => ({ id: c, name: c }));
      const { target, choices } = pickChoices(pool, n, rng, previousId);
      return { activity, prompt: `Find ${target.name}`, say: `Can you find the colour ${target.name}?`, target, choices };
    }
    case 'counting': {
      const { target, choices } = pickChoices(numbers, n, rng, previousId);
      const emoji = pick(COUNT_EMOJI, rng);
      return {
        activity,
        prompt: 'How many can you count?',
        say: 'Let’s count together! How many are there?',
        target,
        choices,
        emoji,
        count: Number(target.id),
      };
    }
    case 'matching': {
      const set = pick(MATCH_SETS, rng);
      const pool = set.map((e) => ({ id: e, name: MATCH_NAMES[e] }));
      const { target, choices } = pickChoices(pool, n, rng, previousId);
      return {
        activity,
        prompt: 'Find the one that matches',
        say: `Can you find another ${target.name}?`,
        target,
        choices,
        emoji: target.id,
      };
    }
  }
}

/** What to say when a choice is tapped — names the tapped item so a wrong tap still teaches something. */
export function describeChoice(activity: Activity, choice: Choice): string {
  switch (activity) {
    case 'numbers':
    case 'counting':
      return `number ${choice.name}`;
    case 'letters':
      return `the letter ${choice.name}`;
    case 'shapes':
      return `a ${choice.name}`;
    case 'colors':
      return choice.name;
    case 'matching':
      return `a ${choice.name}`;
  }
}

const CHEERS = ['Yay!', 'Great job!', 'You did it!', 'Super!', 'Well done!', 'Hooray!'];
const NUDGES = ['Oops, good try!', 'Almost!', 'Nice try!', 'So close!'];

export function cheer(activity: Activity, target: Choice, rng: Rng = Math.random): string {
  return `${pick(CHEERS, rng)} That's ${describeChoice(activity, target)}!`;
}

export function nudge(activity: Activity, tapped: Choice, rng: Rng = Math.random): string {
  return `${pick(NUDGES, rng)} That's ${describeChoice(activity, tapped)}. Let's try again!`;
}
