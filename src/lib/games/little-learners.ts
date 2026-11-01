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

/**
 * Target plus distinct distractors, shuffled. Avoids repeating `previousId` as the target when possible.
 * `focusNewest` makes the last item of the pool the target, so a freshly unlocked item gets played at once.
 */
function pickChoices(
  pool: readonly Choice[],
  n: number,
  rng: Rng,
  previousId?: string,
  focusNewest = false,
): { target: Choice; choices: Choice[] } {
  const candidates = pool.length > 1 ? pool.filter((c) => c.id !== previousId) : pool;
  const newest = pool[pool.length - 1];
  const target = focusNewest && newest.id !== previousId ? newest : pick(candidates, rng);
  const others = shuffle(pool.filter((c) => c.id !== target.id), rng).slice(0, n - 1);
  return { target, choices: shuffle([target, ...others], rng) };
}

const numberChoice = (n: number): Choice => ({ id: String(n), name: NUMBER_WORDS[n] });

// ---------- growing difficulty ----------
// Each game starts with a small set of items (Little: 1–3, A–C, three shapes…) and adds one more
// every SKILL_STEP first-try right answers, so "1, 3, 2" becomes "1, 4, 3" and so on.

/** First-try right answers needed to unlock the next item. */
export const SKILL_STEP = 3;
const START_SIZE: Record<Level, number> = { little: 3, big: 5 };

/** Every item a game can use at this level, in teaching order (easiest first). */
export function poolItems(activity: Activity, level: Level): Choice[] {
  switch (activity) {
    case 'numbers':
    case 'counting':
      return Array.from({ length: level === 'little' ? 5 : 10 }, (_, i) => numberChoice(i + 1));
    case 'letters':
      return (level === 'little' ? LITTLE_LETTERS : Object.keys(LETTERS)).map((k) => ({ id: k, name: k }));
    case 'shapes':
      return (level === 'little' ? LITTLE_SHAPES : SHAPES).map((x) => ({ id: x, name: x }));
    case 'colors':
      return (level === 'little' ? LITTLE_COLORS : Object.keys(COLORS)).map((c) => ({ id: c, name: c }));
    case 'matching':
      // Matching draws from one picture family per round; the size limits how many of that family are in play.
      return MATCH_SETS[0].map((e) => ({ id: e, name: MATCH_NAMES[e] }));
  }
}

/** How many items are in play for a skill score. Never fewer than the number of choices shown. */
export function poolSize(activity: Activity, level: Level, skill: number): number {
  const max = poolItems(activity, level).length;
  const start = Math.max(choiceCount(level), Math.min(START_SIZE[level], max));
  return Math.min(max, start + Math.floor(Math.max(0, skill) / SKILL_STEP));
}

/** Stage 1 is the starting set; the last stage has every item unlocked. */
export function stageInfo(activity: Activity, level: Level, skill: number): { stage: number; stages: number } {
  const first = poolSize(activity, level, 0);
  const max = poolItems(activity, level).length;
  return { stage: poolSize(activity, level, skill) - first + 1, stages: max - first + 1 };
}

/** Skill after a solved round: up for a first-try answer, down a little when the child needed the hint. */
export function nextSkill(skill: number, wrongTaps: number, hintAfter: number): number {
  if (wrongTaps === 0) return skill + 1;
  if (wrongTaps >= hintAfter) return Math.max(0, skill - 1);
  return skill;
}

export function skillKey(level: Level, activity: string): string {
  return `${level}:${activity}`;
}

export type RoundOptions = {
  /** How many items are in play (from poolSize); defaults to all of them. */
  size?: number;
  /** Make the newest item the target — used right after a level-up. */
  focusNewest?: boolean;
};

export function generateRound(
  activity: Activity,
  level: Level,
  rng: Rng = Math.random,
  previousId?: string,
  opts: RoundOptions = {},
): Round {
  const n = choiceCount(level);
  const all = poolItems(activity, level);
  const size = Math.max(n, Math.min(all.length, opts.size ?? all.length));
  const focus = opts.focusNewest ?? false;
  const pool = all.slice(0, size);

  switch (activity) {
    case 'numbers': {
      const { target, choices } = pickChoices(pool, n, rng, previousId, focus);
      return { activity, prompt: `Find the number ${target.id}`, say: `Can you find the number ${target.name}?`, target, choices };
    }
    case 'letters': {
      const { target, choices } = pickChoices(pool, n, rng, previousId, focus);
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
      const { target, choices } = pickChoices(pool, n, rng, previousId, focus);
      return { activity, prompt: `Find the ${target.name}`, say: `Can you find the ${target.name}?`, target, choices };
    }
    case 'colors': {
      const { target, choices } = pickChoices(pool, n, rng, previousId, focus);
      return { activity, prompt: `Find ${target.name}`, say: `Can you find the colour ${target.name}?`, target, choices };
    }
    case 'counting': {
      const { target, choices } = pickChoices(pool, n, rng, previousId, focus);
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
      const set = pick(MATCH_SETS, rng).slice(0, size);
      const family = set.map((e) => ({ id: e, name: MATCH_NAMES[e] }));
      const { target, choices } = pickChoices(family, n, rng, previousId, focus);
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

/** Said when a new item unlocks — names it so the child hears the new word straight away. */
export function levelUpText(activity: Activity, level: Level, skill: number): string {
  const newest = poolItems(activity, level)[poolSize(activity, level, skill) - 1];
  switch (activity) {
    case 'matching':
      return 'Level up! More pictures to match!';
    case 'counting':
      return `Level up! Now we can count to ${newest.name}!`;
    default:
      return `Level up! Here comes ${describeChoice(activity, newest)}!`;
  }
}

export function nudge(activity: Activity, tapped: Choice, rng: Rng = Math.random): string {
  return `${pick(NUDGES, rng)} That's ${describeChoice(activity, tapped)}. Let's try again!`;
}
