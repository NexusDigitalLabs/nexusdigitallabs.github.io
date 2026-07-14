import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Articles — NexusDigitalLabs',
  description:
    'Practical guides on AI prompt engineering, LLM cost reduction, freelance finance, debt payoff strategies, and developer productivity — written by NexusDigitalLabs.',
  alternates: { canonical: 'https://nexusdigitallabs.dev/articles/' },
  openGraph: {
    title: 'Articles — NexusDigitalLabs',
    description: 'Practical guides on prompt engineering, LLM cost reduction, freelance invoicing, debt strategy, and developer tools.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

const ARTICLES = [
  {
    slug: 'optimizing-ai-prompt-tokens-for-llms',
    title: 'Optimizing AI Prompt Tokens for LLMs',
    desc: 'How trailing whitespace, nested brackets, and unstructured blocks silently inflate your LLM API costs and corrupt output quality in modern IDE pipelines.',
    date: 'Jun 2025',
    readTime: '8 min read',
    tag: 'Prompt Engineering',
    tagColor: '#3b82f6',
    tagBg: 'rgba(59,130,246,0.1)',
    tagBorder: 'rgba(59,130,246,0.25)',
  },
  {
    slug: 'how-to-reduce-openai-api-costs',
    title: 'How to Reduce OpenAI API Costs: A Practical Guide',
    desc: 'Six concrete techniques to cut your GPT-4o and Claude API spend without sacrificing output quality — covering token compression, model routing, caching, and batching.',
    date: 'Jun 2025',
    readTime: '7 min read',
    tag: 'LLM Cost',
    tagColor: '#6366f1',
    tagBg: 'rgba(99,102,241,0.1)',
    tagBorder: 'rgba(99,102,241,0.25)',
  },
  {
    slug: 'how-to-write-a-freelance-invoice',
    title: 'How to Write a Freelance Invoice: Complete Guide',
    desc: 'Everything a freelancer needs to know about creating professional invoices — what to include, how to structure payment terms, and how to get paid faster.',
    date: 'Jun 2025',
    readTime: '6 min read',
    tag: 'Freelance Finance',
    tagColor: '#10b981',
    tagBg: 'rgba(16,185,129,0.1)',
    tagBorder: 'rgba(16,185,129,0.25)',
  },
  {
    slug: 'avalanche-vs-snowball-debt-payoff',
    title: 'Avalanche vs Snowball: Which Debt Payoff Method Saves More?',
    desc: 'A clear comparison of the two most effective debt elimination strategies — with worked examples showing exactly how much each method saves in time and total interest.',
    date: 'Jun 2025',
    readTime: '6 min read',
    tag: 'Personal Finance',
    tagColor: '#f59e0b',
    tagBg: 'rgba(245,158,11,0.1)',
    tagBorder: 'rgba(245,158,11,0.25)',
  },
  {
    slug: 'browser-games-no-download-no-login',
    title: 'Browser Games You Can Play Right Now — No Download, No Login',
    desc: 'The best lightweight browser games that run entirely in your browser with no install, no account, and no tracking. 2048, Snake, Blackjack, and more.',
    date: 'Jun 2025',
    readTime: '4 min read',
    tag: 'Games',
    tagColor: '#4ade80',
    tagBg: 'rgba(74,222,128,0.08)',
    tagBorder: 'rgba(74,222,128,0.25)',
  },
];

export default function ArticlesIndexPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="ndl-dot-grid border-b border-slate-800/50 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-6 sm:px-10">
          <div className="ndl-anim-1 inline-flex items-center gap-2 text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            Knowledge base
          </div>
          <h1 className="ndl-anim-2 text-4xl sm:text-5xl font-light tracking-tight text-white leading-tight mb-4">
            Articles
          </h1>
          <p className="ndl-anim-3 text-slate-400 text-base sm:text-lg font-light leading-relaxed max-w-xl">
            Practical guides on AI prompt engineering, freelance finance, debt strategy, and developer tooling — written to be useful, not just readable.
          </p>
        </div>
      </section>

      {/* ── Article list ─────────────────────────────────────────────────── */}
      <section className="py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-6 sm:px-10">
          <div className="divide-y divide-slate-800/50">
            {ARTICLES.map((a, i) => (
              <article key={a.slug} className={`py-8 sm:py-10 ${i === 0 ? 'pt-0' : ''}`}>
                <Link
                  href={`/articles/${a.slug}/`}
                  className="group block no-underline"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span
                      className="text-[0.6rem] font-bold tracking-widest uppercase px-2.5 py-1"
                      style={{ color: a.tagColor, background: a.tagBg, border: `1px solid ${a.tagBorder}` }}
                    >
                      {a.tag}
                    </span>
                    <span className="text-xs text-slate-500">{a.date}</span>
                    <span className="text-xs text-slate-600">·</span>
                    <span className="text-xs text-slate-500">{a.readTime}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-light text-white tracking-tight mb-3 group-hover:text-blue-300 transition-colors duration-200">
                    {a.title}
                  </h2>
                  <p className="text-sm text-slate-400 font-light leading-relaxed max-w-2xl mb-4">
                    {a.desc}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 group-hover:text-blue-300 transition-colors">
                    Read article
                    <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
