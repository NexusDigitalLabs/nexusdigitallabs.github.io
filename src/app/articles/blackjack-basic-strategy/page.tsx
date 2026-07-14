import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';

export const metadata = pageMetadata({
  title: 'Blackjack Basic Strategy Explained Simply — NexusDigitalLabs',
  description:
    'A clear explanation of blackjack basic strategy — when to hit, stand, double down, and split — and why following it is the mathematically correct play.',
  path: '/articles/blackjack-basic-strategy/',
  keywords: [
    'blackjack basic strategy',
    'when to hit in blackjack',
    'blackjack strategy guide',
    'blackjack rules explained',
    'how to play blackjack',
    'blackjack hand chart',
  ],
  absoluteTitle: true,
  type: 'article',
  ogTitle: 'Blackjack Basic Strategy Explained Simply',
  ogDescription:
    'When to hit, stand, double down, and split — the mathematically correct plays for every hand in blackjack.',
});

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-medium text-slate-100 tracking-tight mt-10 mb-3">{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-slate-400 font-light leading-relaxed mb-4 text-sm sm:text-base">{children}</p>;
}
function UL({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="text-slate-400 font-light text-sm sm:text-base leading-relaxed mb-4 space-y-1.5 pl-5 list-disc marker:text-slate-600">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

const FAQ = [
  { q: 'Does basic strategy guarantee winning?', a: 'No. Basic strategy minimises the house edge to roughly 0.5%, but the house still has a mathematical advantage. Basic strategy tells you the statistically best decision for each hand — it does not eliminate variance or guarantee short-term profit.' },
  { q: 'Should I take insurance?', a: 'No. Insurance is a side bet with a house edge of around 7%. Basic strategy consistently recommends declining insurance regardless of your hand. The only exception is if you are card counting and have determined the deck is rich in tens.' },
  { q: 'What does "the dealer busts approximately 28% of the time" mean in practice?', a: 'When the dealer shows a bust card (2–6), standing on a weak hand (12–16) is often correct because the dealer is likely to bust without you needing to risk a bust yourself. Taking this into account is why basic strategy sometimes tells you to stand on hands that feel uncomfortable.' },
  { q: 'Is blackjack skill or luck?', a: 'Both. The cards are random, so luck always plays a role. However, decisions significantly affect expected outcomes. A player using basic strategy faces a house edge of ~0.5%. A player making poor decisions faces a house edge of 2–4%. Over many hands, that difference is substantial.' },
];

export default function BlackjackStrategyPage() {
  return (
    <>
      <div className="text-center py-2 px-4" style={{ background: 'rgba(245,158,11,0.07)', borderBottom: '1px solid rgba(245,158,11,0.2)' }}>
        <p className="text-xs" style={{ color: '#b45309' }}>
          <span style={{ color: '#f59e0b', fontWeight: 700 }}>For entertainment only</span> — No real money, no gambling. This article discusses strategy for recreational play.
        </p>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'Article',
        headline: 'Blackjack Basic Strategy Explained Simply',
        author: { '@type': 'Organization', name: 'NexusDigitalLabs' },
        publisher: { '@type': 'Organization', name: 'NexusDigitalLabs', url: 'https://nexusdigitallabs.dev' },
        url: 'https://nexusdigitallabs.dev/articles/blackjack-basic-strategy/',
      })}} />

      <div className="max-w-2xl mx-auto px-6 sm:px-10 py-12 sm:py-16">
        <Link href="/articles/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors no-underline mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          All articles
        </Link>
        <article>
          <header className="mb-10">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="text-[0.6rem] font-bold tracking-widest uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1">Games</span>
              <span className="text-xs text-slate-500">Jul 2026</span>
              <span className="text-xs text-slate-600">·</span>
              <span className="text-xs text-slate-500">5 min read</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-light text-white tracking-tight leading-snug mb-5">Blackjack Basic Strategy Explained Simply</h1>
            <p className="text-slate-400 font-light text-base sm:text-lg leading-relaxed">Basic strategy is the set of mathematically optimal decisions for every possible blackjack hand. It does not require memorising card counts — just understanding a handful of rules.</p>
          </header>

          <div className="prose prose-invert max-w-none">
            <P>Blackjack is unique among card games in that the correct decision for each hand can be calculated mathematically. Basic strategy is the result of that calculation — a complete set of rules for when to hit, stand, double down, or split, based on your hand value and the dealer&apos;s visible card.</P>
            <P>Players who follow basic strategy reduce the house edge to approximately 0.5%. Players who play by feel typically face a house edge of 2–4%. That difference compounds over many hands.</P>

            <H2>The Objective</H2>
            <P>The goal is not to reach 21 — it is to beat the dealer without going over 21. This distinction matters because it changes many decisions. You are not playing against 21; you are playing against the dealer&apos;s hand.</P>

            <H2>When to Stand</H2>
            <UL items={[
              'Hard 17 or higher — always stand, regardless of dealer upcard',
              'Hard 13–16 — stand when dealer shows 2–6 (bust cards); hit when dealer shows 7–Ace',
              'Hard 12 — stand when dealer shows 4–6; hit otherwise',
              'Soft 18 (Ace + 7) — stand when dealer shows 2, 7, or 8; hit or double when dealer shows 9, 10, or Ace',
            ]} />

            <H2>When to Hit</H2>
            <UL items={[
              'Hard 11 or lower — always hit (consider doubling at 9, 10, or 11)',
              'Hard 12–16 when dealer shows 7 or higher — the dealer is unlikely to bust, so you need to improve your hand',
              'Soft 17 or lower (Ace + 6 or less) — hit or double; an Ace still provides safety against busting',
            ]} />

            <H2>When to Double Down</H2>
            <P>Doubling down doubles your bet and commits you to exactly one more card. The goal is to do this when you are likely to win and maximise your payout.</P>
            <UL items={[
              'Hard 11 — double against any dealer upcard except an Ace',
              'Hard 10 — double when dealer shows 2–9',
              'Hard 9 — double when dealer shows 3–6',
              'Soft 13–18 (Ace + 2 through Ace + 7) — various doubling opportunities against dealer bust cards',
            ]} />

            <H2>When to Split</H2>
            <P>Splitting creates two separate hands from a pair. Always split high-value pairs; never split low-value pairs that form a strong hand.</P>
            <UL items={[
              <span key="1"><strong className="text-slate-200">Always split:</strong> Aces and 8s</span>,
              <span key="2"><strong className="text-slate-200">Never split:</strong> 10s (you already have 20), 5s (you have 10, great for doubling)</span>,
              <span key="3"><strong className="text-slate-200">Split 9s</strong> against dealer 2–6, 8–9; stand against dealer 7, 10, or Ace</span>,
              <span key="4"><strong className="text-slate-200">Split 7s</strong> against dealer 2–7</span>,
              <span key="5"><strong className="text-slate-200">Split 6s</strong> against dealer 2–6</span>,
              <span key="6"><strong className="text-slate-200">Split 4s</strong> only against dealer 5–6 (otherwise hit)</span>,
              <span key="7"><strong className="text-slate-200">Split 2s and 3s</strong> against dealer 2–7</span>,
            ]} />

            <H2>The Most Important Rule</H2>
            <P>Never take insurance. The insurance side bet has a house edge of approximately 7.7% in a standard game. No matter what cards you hold, declining insurance is the correct play according to basic strategy.</P>

            <H2>Frequently Asked Questions</H2>
            <div className="space-y-5 mt-2">
              {FAQ.map((item) => (
                <div key={item.q} className="border-l-2 border-slate-700 pl-4">
                  <p className="text-sm font-semibold text-slate-200 mb-1">{item.q}</p>
                  <p className="text-sm text-slate-400 font-light leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-14 p-6 rounded-2xl bg-slate-900/50 border border-slate-800/60">
            <p className="text-xs font-semibold tracking-widest text-emerald-400 uppercase mb-3">Play now — for entertainment only</p>
            <h3 className="text-base font-semibold text-white mb-2">Blackjack — Browser Game</h3>
            <p className="text-sm text-slate-400 font-light leading-relaxed mb-4">Practice basic strategy with our free browser Blackjack. No real money, no download, no account. Chip balances reset on reload.</p>
            <Link href="/games/blackjack/" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 no-underline">
              Play Blackjack
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}
