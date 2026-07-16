/**
 * Canonical catalogs for homepage cards and site stats.
 * Keep these in sync when adding tools or games — counts are derived from length.
 */

export type ToolAccent = 'violet' | 'emerald' | 'sky' | 'amber' | 'blue' | 'slate';

export type ToolCard = {
  href: string;
  accent: ToolAccent;
  iconPath: string;
  title: string;
  desc: string;
};

export type GameCategory = 'fun' | 'brain';

export type GameCard = {
  href: string;
  iconPath: string;
  title: string;
  desc: string;
  cta: string;
  category: GameCategory;
};

export const TOOLS: readonly ToolCard[] = [
  {
    href: '/tools/prompt-architect/',
    accent: 'violet',
    iconPath: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    title: 'Prompt Architect',
    desc: 'Advanced system prompt flattener with live token counting and API cost estimation for LLM workspaces.',
  },
  {
    href: '/tools/json-engine/',
    accent: 'blue',
    iconPath: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    title: 'JSON Engine',
    desc: 'Turn JSON into TypeScript interfaces, Zod schemas, and JSONPath queries — entirely in the browser.',
  },
  {
    href: '/tools/svg-studio/',
    accent: 'emerald',
    iconPath: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    title: 'SVG Studio',
    desc: 'Optimize SVGs, preview on a checkerboard, and export React or Vue components without leaving your machine.',
  },
  {
    href: '/tools/env-formatter/',
    accent: 'slate',
    iconPath: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
    title: 'Env Formatter',
    desc: 'Sort, deduplicate, and validate .env files locally with sharp, minimalist output — secrets never leave the tab.',
  },
  {
    href: '/tools/prompt-packager/',
    accent: 'violet',
    iconPath: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    title: 'Prompt Packager',
    desc: 'Flatten multi-file context into one LLM-ready block with character and token estimates for Cursor and Claude.',
  },
  {
    href: '/tools/invoice-generator/',
    accent: 'emerald',
    iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    title: 'Invoice Generator',
    desc: 'Freelancer invoice builder with live PDF preview, line items, tax configuration, and bank wire details.',
  },
  {
    href: '/tools/debt-optimizer/',
    accent: 'sky',
    iconPath: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    title: 'Debt Optimizer',
    desc: 'Short, Medium, and Long plans that clear debt while building savings — no monthly payment guesswork.',
  },
  {
    href: '/tools/fuel-tracker/',
    accent: 'amber',
    iconPath: 'M3 10h2l1 2h13l1-5H6L5 5H3m0 5v6a1 1 0 001 1h1a2 2 0 104 0h4a2 2 0 104 0h1a1 1 0 001-1v-3',
    title: 'Fuel Tracker',
    desc: 'Log fill-ups, track L/100km efficiency, and monitor fuel costs across multiple vehicles with cross-device sync.',
  },
];

export const GAMES: readonly GameCard[] = [
  {
    href: '/games/2048/',
    iconPath:
      'M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z',
    title: '2048',
    desc: 'Slide and merge tiles on a 4×4 grid. Reach the 2048 tile to win. Keyboard, WASD, and touch swipe support.',
    cta: 'Play now',
    category: 'fun',
  },
  {
    href: '/games/snake/',
    iconPath: 'M13 10V3L4 14h7v7l9-11h-7z',
    title: 'Snake',
    desc: 'Navigate your snake to eat food and grow. Wrap through walls, level up, and avoid your own tail.',
    cta: 'Play now',
    category: 'fun',
  },
  {
    href: '/games/blackjack/',
    iconPath:
      'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
    title: 'Blackjack',
    desc: 'Beat the dealer to 21 without going bust. Dealer draws to 17. Hit, stand, or double down. Classic casino rules.',
    cta: 'Play now',
    category: 'fun',
  },
  {
    href: '/games/sudoku/',
    iconPath: 'M4 5h16v14H4V5zm4 0v14m4-14v14m4-14v14M4 9h16M4 13h16',
    title: 'Nexus Sudoku',
    desc: 'Fill a 9×9 Sudoku with unique solutions. Choose Beginner through Hard — timers and scoring scale with difficulty.',
    cta: 'Solve',
    category: 'brain',
  },
  {
    href: '/games/gridlock/',
    iconPath: 'M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z',
    title: 'Gridlock',
    desc: 'Memorize a flashing tile pattern, then recreate it. Harder grids, more flashes, shorter windows.',
    cta: 'Train memory',
    category: 'brain',
  },
  {
    href: '/games/sumoku/',
    iconPath: 'M12 6v12m-6-6h12M5 5l14 14M19 5L5 19',
    title: 'Sumoku',
    desc: 'Select connected numbers that sum to the target. Clear tiles, drop replacements, race the clock on higher tiers.',
    cta: 'Add it up',
    category: 'brain',
  },
  {
    href: '/games/cryptic-paths/',
    iconPath: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9m0 0L9 7',
    title: 'Cryptic Paths',
    desc: 'Trace every edge of a node graph exactly once. Complete Eulerian paths under tighter time limits.',
    cta: 'Trace route',
    category: 'brain',
  },
  {
    href: '/games/semantic-shift/',
    iconPath: 'M7 8h10M7 12h6m-2 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z',
    title: 'Semantic Shift',
    desc: 'Classic Stroop challenge — match the word or the ink color before the timer expires. Streak multipliers reward focus.',
    cta: 'React',
    category: 'brain',
  },
];

export const FUN_GAMES = GAMES.filter((g) => g.category === 'fun');
export const BRAIN_GAMES = GAMES.filter((g) => g.category === 'brain');

export const TOOL_COUNT = TOOLS.length;
export const GAME_COUNT = GAMES.length;
