import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { ARTICLES } from '@/data/articles';

export const metadata = pageMetadata({
  title: 'Articles — NexusDigitalLabs',
  description:
    'Practical guides on AI prompt engineering, LLM cost reduction, freelance finance, debt payoff strategies, and developer productivity — written by NexusDigitalLabs.',
  path: '/articles/',
  absoluteTitle: true,
  type: 'website',
  ogDescription:
    'Practical guides on prompt engineering, LLM cost reduction, freelance invoicing, debt strategy, and developer tools.',
});

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
