import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Browser Games You Can Play Right Now — No Download, No Login — NexusDigitalLabs',
  description:
    'The best lightweight browser games that run entirely in your browser with no install, no account, and no tracking. 2048, Snake, Blackjack, and more.',
  keywords: [
    'browser games no download', 'free browser games no login', 'play games online instantly',
    '2048 browser game', 'snake game browser', 'blackjack online free',
    'no account games', 'lightweight browser games', 'developer games browser',
  ],
  alternates: { canonical: 'https://nexusdigitallabs.dev/articles/browser-games-no-download-no-login/' },
  openGraph: {
    title: 'Browser Games You Can Play Right Now — No Download, No Login',
    description: 'Lightweight browser games that run entirely in your browser — no install, no account, no tracking.',
    type: 'article',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

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

const GAMES = [
  {
    title: '2048',
    accent: '#f59e0b',
    accentBg: 'rgba(245,158,11,0.08)',
    accentBorder: 'rgba(245,158,11,0.2)',
    tag: 'Strategy',
    desc: 'A tile-merging strategy game played on a 4×4 grid. Slide tiles in four directions — when two tiles with the same number collide, they merge into one. The goal is to create a tile with the value 2048.',
    why: 'Short sessions (2–10 minutes). Pure logic — no reflexes required. High replayability because the board state changes with every move. Perfect for focused, meditative mental engagement.',
    href: '/games/2048/',
  },
  {
    title: 'Snake',
    accent: '#4ade80',
    accentBg: 'rgba(74,222,128,0.08)',
    accentBorder: 'rgba(74,222,128,0.2)',
    tag: 'Arcade',
    desc: 'Guide a growing snake around a canvas to eat food. Each piece of food grows the snake by one segment. The game ends when the snake hits a wall or its own tail. Speed increases gradually as your score climbs.',
    why: 'Fast feedback loop — games last 30 seconds to a few minutes. Requires just four keys. The challenge scales naturally with your skill. Easily one of the most accessible arcade games ever made.',
    href: '/games/snake/',
  },
  {
    title: 'Blackjack',
    accent: '#818cf8',
    accentBg: 'rgba(129,140,248,0.08)',
    accentBorder: 'rgba(129,140,248,0.2)',
    tag: 'Card Game',
    desc: 'The classic casino card game, played for entertainment with no real money. Beat the dealer to 21 without going bust. Start with 500 chips, place bets, hit, stand, or double down. The dealer must draw to 17.',
    why: 'A game of informed decision-making with a fixed rule set. Each hand takes under a minute. The optimal strategy (basic strategy) is learnable and makes each decision analytically interesting.',
    href: '/games/blackjack/',
  },
];

export default function BrowserGamesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: 'Browser Games You Can Play Right Now — No Download, No Login',
            description: 'Lightweight browser games that run entirely in your browser — no install, no account, no tracking.',
            author: { '@type': 'Organization', name: 'NexusDigitalLabs' },
            publisher: { '@type': 'Organization', name: 'NexusDigitalLabs', url: 'https://nexusdigitallabs.dev' },
            url: 'https://nexusdigitallabs.dev/articles/browser-games-no-download-no-login/',
          }),
        }}
      />

      <div className="max-w-2xl mx-auto px-6 sm:px-10 py-12 sm:py-16">
        <Link href="/articles/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors no-underline mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All articles
        </Link>

        <article>
          <header className="mb-10">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="text-[0.6rem] font-bold tracking-widest uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1">
                Games
              </span>
              <span className="text-xs text-slate-500">Jun 2025</span>
              <span className="text-xs text-slate-600">·</span>
              <span className="text-xs text-slate-500">4 min read</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-light text-white tracking-tight leading-snug mb-5">
              Browser Games You Can Play Right Now — No Download, No Login
            </h1>
            <p className="text-slate-400 font-light text-base sm:text-lg leading-relaxed">
              The best lightweight browser games that run entirely in your browser with no install, no account, and no tracking. 2048, Snake, Blackjack, and more.
            </p>
          </header>

          <div className="prose prose-invert max-w-none">
            <P>
              Most gaming sites today demand app downloads, account registrations, email addresses, or payment information before you can play anything. The alternative — browser games — has largely been abandoned by the mainstream in favour of monetisation funnels.
            </P>
            <P>
              There is still a strong case for the simple browser game: zero setup, instant access, no battery drain from heavyweight installs, and no privacy exposure from account creation. For a five-minute break, a browser game running in a tab is still the most frictionless entertainment on the web.
            </P>
            <P>
              NexusDigitalLabs builds browser games that load instantly, store your scores locally in your browser (never on a server), and require nothing but a URL. Here is what is currently available and why each game is worth your time.
            </P>

            <H2>The Games</H2>

            <div className="space-y-8 my-6">
              {GAMES.map((g) => (
                <div
                  key={g.title}
                  style={{ border: `1px solid ${g.accentBorder}`, background: g.accentBg }}
                  className="p-5 rounded-xl"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="text-[0.6rem] font-bold tracking-widest uppercase px-2.5 py-1"
                      style={{ color: g.accent, background: 'rgba(0,0,0,0.3)', border: `1px solid ${g.accentBorder}` }}
                    >
                      {g.tag}
                    </span>
                    <h3 className="text-base font-semibold text-white m-0">{g.title}</h3>
                  </div>
                  <p className="text-sm text-slate-400 font-light leading-relaxed mb-2">{g.desc}</p>
                  <p className="text-sm text-slate-500 font-light leading-relaxed mb-3">
                    <strong className="text-slate-300">Why play it: </strong>{g.why}
                  </p>
                  <Link
                    href={g.href}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold no-underline transition-colors"
                    style={{ color: g.accent }}
                  >
                    Play {g.title}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>

            <H2>What Makes a Good Browser Game in 2025</H2>
            <P>
              The browser game landscape has split into two categories: hyper-casual mobile ports that are dense with ads and upsells, and a smaller category of genuinely well-designed games that prioritise the experience over monetisation.
            </P>
            <P>The characteristics of a well-designed browser game:</P>
            <UL items={[
              'Loads in under two seconds on a standard connection',
              'Controls are learnable in under 60 seconds',
              'No account required to play or save progress',
              'Scores are stored locally, not on a server that can be shut down',
              'No ads that interrupt gameplay',
              'Works on both desktop and mobile without a separate app',
            ]} />
            <P>
              Games that meet all of these criteria are rare. Most well-known browser games compromise on at least two of them once the developer needs to monetise. Our games are built with these constraints as non-negotiable requirements — which is why they are also completely free.
            </P>

            <H2>Privacy and Scores</H2>
            <P>
              Your high scores for 2048, Snake, and Blackjack are stored in your browser&apos;s <code className="font-mono text-xs bg-slate-800/80 text-blue-300 px-1.5 py-0.5 rounded border border-slate-700/50">localStorage</code>. This means:
            </P>
            <UL items={[
              'Scores persist across sessions on the same device and browser',
              'Clearing your browser data or switching browsers resets your scores',
              'Scores are never sent to any server — they cannot be seen by anyone but you',
              'There is no leaderboard, because a leaderboard requires a server storing your data',
            ]} />
            <P>
              This is an intentional design choice. A server-side leaderboard would require storing usernames, tracking sessions, and managing a database — all of which create privacy exposure and infrastructure costs that would eventually need to be paid for. Local storage scores are simpler, faster, and more private.
            </P>
          </div>

          {/* CTA */}
          <div className="mt-14 p-6 rounded-2xl bg-slate-900/50 border border-slate-800/60">
            <p className="text-xs font-semibold tracking-widest text-emerald-400 uppercase mb-3">Play now</p>
            <h3 className="text-base font-semibold text-white mb-2">NexusDigitalLabs Games</h3>
            <p className="text-sm text-slate-400 font-light leading-relaxed mb-4">
              2048, Snake, and Blackjack — free, no login, no tracking. High scores saved in your browser.
            </p>
            <Link
              href="/games/"
              className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 no-underline"
            >
              Browse all games
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}
