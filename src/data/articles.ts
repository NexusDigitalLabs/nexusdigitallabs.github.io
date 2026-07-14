export interface Article {
  slug: string;
  title: string;
  desc: string;
  date: string;
  readTime: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  tagBorder: string;
}

export const ARTICLES: Article[] = [
  {
    slug: 'how-to-track-car-fuel-efficiency',
    title: "How to Track Your Car's Fuel Efficiency",
    desc: 'A practical guide to calculating L/100km and km/L, logging fill-ups correctly, and understanding what affects your real-world fuel consumption.',
    date: 'Jul 2026', readTime: '6 min read', tag: 'Fuel & Cars',
    tagColor: '#f59e0b', tagBg: 'rgba(245,158,11,0.1)', tagBorder: 'rgba(245,158,11,0.25)',
  },
  {
    slug: 'how-to-save-money-on-fuel',
    title: 'How to Save Money on Fuel Every Month',
    desc: 'Driving habits, tyre pressure, route planning, and vehicle maintenance changes that consistently reduce monthly fuel spend without changing how far you drive.',
    date: 'Jul 2026', readTime: '6 min read', tag: 'Fuel & Cars',
    tagColor: '#f59e0b', tagBg: 'rgba(245,158,11,0.1)', tagBorder: 'rgba(245,158,11,0.25)',
  },
  {
    slug: 'how-to-write-a-freelance-contract',
    title: 'How to Write a Freelance Contract That Actually Protects You',
    desc: 'The six essential clauses every freelance contract must include — scope, payment schedule, revision limits, IP ownership, kill fees, and governing law.',
    date: 'Jul 2026', readTime: '7 min read', tag: 'Freelance Finance',
    tagColor: '#10b981', tagBg: 'rgba(16,185,129,0.1)', tagBorder: 'rgba(16,185,129,0.25)',
  },
  {
    slug: 'freelance-invoice-mistakes',
    title: '5 Invoice Mistakes Freelancers Make That Delay Payment',
    desc: 'The most common invoicing errors that slow down payment — vague line items, missing due dates, no payment instructions — and how to fix each one.',
    date: 'Jul 2026', readTime: '5 min read', tag: 'Freelance Finance',
    tagColor: '#10b981', tagBg: 'rgba(16,185,129,0.1)', tagBorder: 'rgba(16,185,129,0.25)',
  },
  {
    slug: 'how-to-calculate-your-real-hourly-rate',
    title: 'How to Calculate Your Real Hourly Rate as a Freelancer',
    desc: 'The exact formula to calculate your minimum viable hourly rate from income targets, billable hours, taxes, and expenses — not gut feel.',
    date: 'Jul 2026', readTime: '6 min read', tag: 'Freelance Finance',
    tagColor: '#10b981', tagBg: 'rgba(16,185,129,0.1)', tagBorder: 'rgba(16,185,129,0.25)',
  },
  {
    slug: 'chatgpt-prompt-templates-for-developers',
    title: 'ChatGPT Prompt Templates for Developers — Copy and Use Today',
    desc: 'Copy-ready prompt templates for code review, debugging, documentation, architecture decisions, refactoring, and writing unit tests.',
    date: 'Jul 2026', readTime: '8 min read', tag: 'Prompt Engineering',
    tagColor: '#3b82f6', tagBg: 'rgba(59,130,246,0.1)', tagBorder: 'rgba(59,130,246,0.25)',
  },
  {
    slug: 'openai-api-pricing-explained',
    title: 'OpenAI API Pricing Explained: What You Actually Pay',
    desc: 'A plain-language breakdown of how OpenAI token pricing works — input vs output costs, model tiers, real-world cost estimates, and three ways to reduce your bill.',
    date: 'Jul 2026', readTime: '6 min read', tag: 'LLM Cost',
    tagColor: '#6366f1', tagBg: 'rgba(99,102,241,0.1)', tagBorder: 'rgba(99,102,241,0.25)',
  },
  {
    slug: 'free-tools-for-freelancers',
    title: 'Free Tools Every Freelancer Should Be Using in 2026',
    desc: 'A curated list of genuinely free tools for invoicing, contracts, time tracking, project management, and budgeting — with no hidden paywalls.',
    date: 'Jul 2026', readTime: '6 min read', tag: 'Productivity',
    tagColor: '#a78bfa', tagBg: 'rgba(167,139,250,0.1)', tagBorder: 'rgba(167,139,250,0.25)',
  },
  {
    slug: 'how-to-budget-irregular-income',
    title: 'How to Budget on an Irregular Income',
    desc: 'A practical budgeting system for freelancers and contractors — covering income floors, buffer building, tax reserves, and debt payoff on variable cash flow.',
    date: 'Jul 2026', readTime: '6 min read', tag: 'Personal Finance',
    tagColor: '#f59e0b', tagBg: 'rgba(245,158,11,0.1)', tagBorder: 'rgba(245,158,11,0.25)',
  },
  {
    slug: 'how-to-win-at-2048',
    title: 'How to Win at 2048 — Strategy Guide and Best Moves',
    desc: 'The corner anchoring strategy, directional priority rules, and board recovery techniques that consistently reach the 2048 tile and beyond.',
    date: 'Jul 2026', readTime: '5 min read', tag: 'Games',
    tagColor: '#4ade80', tagBg: 'rgba(74,222,128,0.08)', tagBorder: 'rgba(74,222,128,0.25)',
  },
  {
    slug: 'blackjack-basic-strategy',
    title: 'Blackjack Basic Strategy Explained Simply',
    desc: 'When to hit, stand, double down, and split — the mathematically correct plays for every hand in blackjack, explained without jargon.',
    date: 'Jul 2026', readTime: '5 min read', tag: 'Games',
    tagColor: '#4ade80', tagBg: 'rgba(74,222,128,0.08)', tagBorder: 'rgba(74,222,128,0.25)',
  },
  {
    slug: 'why-we-build-privacy-first-tools',
    title: 'Why We Build Privacy-First Tools',
    desc: 'The philosophy behind NexusDigitalLabs — why we chose client-side architecture, what privacy-first actually means in practice, and why the web deserves better tools.',
    date: 'Jul 2026', readTime: '5 min read', tag: 'About',
    tagColor: '#60a5fa', tagBg: 'rgba(96,165,250,0.08)', tagBorder: 'rgba(96,165,250,0.25)',
  },
  {
    slug: 'optimizing-ai-prompt-tokens-for-llms',
    title: 'Optimizing AI Prompt Tokens for LLMs',
    desc: 'How trailing whitespace, nested brackets, and unstructured blocks silently inflate your LLM API costs and corrupt output quality in modern IDE pipelines.',
    date: 'Jun 2025', readTime: '8 min read', tag: 'Prompt Engineering',
    tagColor: '#3b82f6', tagBg: 'rgba(59,130,246,0.1)', tagBorder: 'rgba(59,130,246,0.25)',
  },
  {
    slug: 'how-to-reduce-openai-api-costs',
    title: 'How to Reduce OpenAI API Costs: A Practical Guide',
    desc: 'Six concrete techniques to cut your GPT-4o and Claude API spend without sacrificing output quality — covering token compression, model routing, caching, and batching.',
    date: 'Jun 2025', readTime: '7 min read', tag: 'LLM Cost',
    tagColor: '#6366f1', tagBg: 'rgba(99,102,241,0.1)', tagBorder: 'rgba(99,102,241,0.25)',
  },
  {
    slug: 'how-to-write-a-freelance-invoice',
    title: 'How to Write a Freelance Invoice: Complete Guide',
    desc: 'Everything a freelancer needs to know about creating professional invoices — what to include, how to structure payment terms, and how to get paid faster.',
    date: 'Jun 2025', readTime: '6 min read', tag: 'Freelance Finance',
    tagColor: '#10b981', tagBg: 'rgba(16,185,129,0.1)', tagBorder: 'rgba(16,185,129,0.25)',
  },
  {
    slug: 'avalanche-vs-snowball-debt-payoff',
    title: 'Avalanche vs Snowball: Which Debt Payoff Method Saves More?',
    desc: 'A clear comparison of the two most effective debt elimination strategies — with worked examples showing exactly how much each method saves in time and total interest.',
    date: 'Jun 2025', readTime: '6 min read', tag: 'Personal Finance',
    tagColor: '#f59e0b', tagBg: 'rgba(245,158,11,0.1)', tagBorder: 'rgba(245,158,11,0.25)',
  },
  {
    slug: 'browser-games-no-download-no-login',
    title: 'Browser Games You Can Play Right Now — No Download, No Login',
    desc: 'The best lightweight browser games that run entirely in your browser with no install, no account, and no tracking. 2048, Snake, Blackjack, and more.',
    date: 'Jun 2025', readTime: '4 min read', tag: 'Games',
    tagColor: '#4ade80', tagBg: 'rgba(74,222,128,0.08)', tagBorder: 'rgba(74,222,128,0.25)',
  },
];

/** Articles shown in the homepage preview grid (6 diverse picks) */
export const FEATURED_ARTICLES = ARTICLES.slice(0, 6);
