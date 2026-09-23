import GameLoader from '@/components/games/GameLoader';
import AdSlot from '@/components/AdSlot';
import { pageMetadata } from '@/lib/seo';
import { FUN_GAMES, BRAIN_GAMES } from '@/data/catalog';

export const metadata = pageMetadata({
  title: 'Games — NexusDigitalLabs',
  description:
    'Browser-based mini-games built with zero-bloat React. Play 2048, Snake, Blackjack, Sudoku, and more — free, no download required.',
  path: '/games/',
  absoluteTitle: true,
  ogDescription: '2048, Snake, Blackjack, and brain trainers — built in-browser.',
});

export default function GamesPage() {
  return (
    <>
      <GameLoader game="lobby" />
      <section className="border-t py-14 sm:py-16" style={{ borderColor: 'var(--ndl-border)' }}>
        <div className="max-w-3xl mx-auto px-6 sm:px-10 space-y-8">
          <div>
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-4"
              style={{ color: 'var(--ndl-accent)' }}
            >
              About NexusDigitalLabs Games
            </p>
            <h2 className="text-2xl font-light tracking-tight mb-4" style={{ color: 'var(--ndl-text)' }}>
              Free browser games with no download
            </h2>
            <p className="text-sm font-light leading-relaxed mb-4" style={{ color: 'var(--ndl-muted)' }}>
              This lobby lists every mini-game on the site. Each title runs entirely in your browser with a lightweight
              React client — no app store install and no account required to play. Optional sign-in can sync high scores
              when you want them across devices.
            </p>
            <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--ndl-muted)' }}>
              <strong style={{ color: 'var(--ndl-text)' }}>Fun:</strong>{' '}
              {FUN_GAMES.map((g) => g.title).join(', ')}.
              {' '}
              <strong style={{ color: 'var(--ndl-text)' }}>Brain trainers:</strong>{' '}
              {BRAIN_GAMES.map((g) => g.title).join(', ')}.
            </p>
          </div>
          <p className="text-xs font-light leading-relaxed" style={{ color: 'var(--ndl-faint)' }}>
            Blackjack and similar card games are for entertainment only — no real money, no gambling, and no cash prizes.
            See each game page for rules, scoring, and strategy notes.
          </p>
          <a
            href="/articles/browser-games-no-download-no-login/"
            className="inline-block text-sm no-underline"
            style={{ color: 'var(--ndl-accent)' }}
          >
            Browser games you can play right now — article →
          </a>
        </div>
      </section>

      <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_GAMES_INDEX} />
    </>
  );
}
