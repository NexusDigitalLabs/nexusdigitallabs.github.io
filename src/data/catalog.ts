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

export type GameCard = {
  href: string;
  iconPath: string;
  title: string;
  desc: string;
  cta: string;
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
    iconPath: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z',
    title: '2048',
    desc: 'Slide and merge tiles on a 4×4 grid. Reach the 2048 tile to win. Keyboard, WASD, and touch swipe support.',
    cta: 'Play now',
  },
  {
    href: '/games/snake/',
    iconPath: 'M13 10V3L4 14h7v7l9-11h-7z',
    title: 'Snake',
    desc: 'Navigate your snake to eat food and grow. Avoid walls and your own tail. Speed increases as your score climbs.',
    cta: 'Play now',
  },
  {
    href: '/games/blackjack/',
    iconPath: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
    title: 'Blackjack',
    desc: 'Beat the dealer to 21 without going bust. Dealer draws to 17. Hit, stand, or double down. Classic casino rules.',
    cta: 'Play now',
  },
];

export const TOOL_COUNT = TOOLS.length;
export const GAME_COUNT = GAMES.length;
