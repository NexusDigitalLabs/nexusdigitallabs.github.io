import { ARTICLES } from '@/data/articles';
import { LESSONS, PHASES, lessonMetaDescription } from '@/data/academy';
import { GAMES, TOOLS, type ToolAccent } from '@/data/catalog';
import { normalizeSitePath } from '@/lib/seo';

/**
 * Per-page social preview cards (WhatsApp, LinkedIn, X, Slack…), rendered by
 * src/app/og/[...path]/route.tsx. Content comes from the same catalogs that
 * drive the site, so new tools/games/articles/lessons get a card for free.
 *
 * Server-only: imports the large catalogs. pageMetadata only builds the URL
 * (ogCardPath in seo.ts), so client bundles never include this file.
 */

export type OgCard = {
  /** Small label above the title, e.g. "Free tool" or "Article · Freelancing". */
  eyebrow: string;
  title: string;
  description: string;
  /** Hex accent for the glow, rail and eyebrow. */
  accent: string;
  /** Optional 24×24 stroke icon path (Heroicons-style, as used in the catalogs). */
  iconPath?: string;
};

export const ACCENT_HEX: Record<ToolAccent | 'violet' | 'emerald' | 'amber' | 'blue', string> = {
  violet: '#8b5cf6',
  emerald: '#10b981',
  sky: '#0ea5e9',
  amber: '#f59e0b',
  blue: '#3b82f6',
  slate: '#94a3b8',
};

const SITE_DESCRIPTION =
  'Free tools, games and guides built for speed, privacy and utility — no account needed for most of them.';

const STATIC_CARDS: Record<string, OgCard> = {
  '/': {
    eyebrow: 'Software studio',
    title: 'Free tools that make everyday tasks effortless.',
    description: SITE_DESCRIPTION,
    accent: ACCENT_HEX.blue,
  },
  '/about/': {
    eyebrow: 'About',
    title: 'A software studio for minimalist, privacy-first tools.',
    description: 'Fast, focused web utilities and developer tools — built lean, accessible and free to use.',
    accent: ACCENT_HEX.slate,
  },
  '/contact/': {
    eyebrow: 'Contact',
    title: 'Get in touch with NexusDigitalLabs.',
    description: 'Questions, feedback or a project in mind? Send a message and we’ll get back to you.',
    accent: ACCENT_HEX.slate,
  },
  '/articles/': {
    eyebrow: 'Articles',
    title: 'Practical guides for freelancers, developers and everyday money.',
    description: 'Invoicing, pricing, budgeting, AI costs, fuel savings and game strategy — written to be useful.',
    accent: ACCENT_HEX.blue,
  },
  '/games/': {
    eyebrow: 'Browser games',
    title: 'Free browser games — no download, no login.',
    description: '2048, Snake, Sudoku, Blackjack and original brain games that run instantly in your browser.',
    accent: ACCENT_HEX.amber,
  },
  '/academy/': {
    eyebrow: 'Free course',
    title: 'Become an AI engineer, one free lesson at a time.',
    description: 'From Python foundations to RAG, agents, evals and deployment — with a quiz after every lesson.',
    accent: ACCENT_HEX.violet,
  },
  '/freelanceos/': {
    eyebrow: 'FreelanceOS · Free beta',
    title: 'Run your freelance business in one place.',
    description: 'Clients, projects, auto-numbered PDF invoices, payments and expenses — with a revenue dashboard.',
    accent: ACCENT_HEX.blue,
    iconPath: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  '/privacy-policy/': {
    eyebrow: 'Legal',
    title: 'Privacy Policy',
    description: 'What we collect, why, and the choices you have — for the tools, games and FreelanceOS.',
    accent: ACCENT_HEX.slate,
  },
  '/terms/': {
    eyebrow: 'Legal',
    title: 'Terms of Use',
    description: 'The terms for using NexusDigitalLabs tools, games, articles and FreelanceOS.',
    accent: ACCENT_HEX.slate,
  },
  '/login/': {
    eyebrow: 'Account',
    title: 'Sign in to NexusDigitalLabs',
    description: 'Use Google or a one-time magic link — no passwords to remember.',
    accent: ACCENT_HEX.slate,
  },
  '/account/': {
    eyebrow: 'Account',
    title: 'Your NexusDigitalLabs account',
    description: 'Manage your profile and sign-in.',
    accent: ACCENT_HEX.slate,
  },
  '/odova/privacy-policy/': {
    eyebrow: 'Odova',
    title: 'Odova Privacy Policy',
    description: 'How the Odova fuel tracking app handles your data.',
    accent: ACCENT_HEX.amber,
  },
  '/odova/terms/': {
    eyebrow: 'Odova',
    title: 'Odova Terms of Use',
    description: 'The terms for using the Odova fuel tracking app.',
    accent: ACCENT_HEX.amber,
  },
};

/** Generic card for any path without a specific one — never echoes the path. */
export const FALLBACK_CARD: OgCard = STATIC_CARDS['/'];

let registry: Map<string, OgCard> | null = null;

function buildRegistry(): Map<string, OgCard> {
  const cards = new Map<string, OgCard>(Object.entries(STATIC_CARDS));

  for (const tool of TOOLS) {
    cards.set(normalizeSitePath(tool.href), {
      eyebrow: 'Free tool',
      title: tool.title,
      description: tool.desc,
      accent: ACCENT_HEX[tool.accent],
      iconPath: tool.iconPath,
    });
  }

  for (const game of GAMES) {
    cards.set(normalizeSitePath(game.href), {
      eyebrow: game.category === 'brain' ? 'Brain game' : 'Browser game',
      title: game.title,
      description: game.desc,
      accent: game.category === 'brain' ? ACCENT_HEX.violet : ACCENT_HEX.amber,
      iconPath: game.iconPath,
    });
  }

  for (const article of ARTICLES) {
    cards.set(normalizeSitePath(`/articles/${article.slug}/`), {
      eyebrow: `Article · ${article.tag}`,
      title: article.title,
      description: article.desc,
      accent: /^#[0-9a-f]{6}$/i.test(article.tagColor) ? article.tagColor : ACCENT_HEX.blue,
    });
  }

  for (const lesson of LESSONS) {
    if (lesson.status !== 'ready') continue;
    const phase = PHASES.find((p) => p.id === lesson.phaseId);
    cards.set(normalizeSitePath(`/academy/${lesson.slug}/`), {
      eyebrow: `AI Engineer Academy · Lesson ${lesson.order}`,
      title: lesson.title,
      description: lessonMetaDescription(lesson),
      accent: ACCENT_HEX[phase?.color ?? 'violet'],
    });
  }

  return cards;
}

function cards(): Map<string, OgCard> {
  registry ??= buildRegistry();
  return registry;
}

export function ogCardFor(path: string): OgCard | undefined {
  return cards().get(normalizeSitePath(path));
}

/** Every page path with a dedicated card (pre-rendered at build). */
export function ogCardPaths(): string[] {
  return [...cards().keys()];
}
