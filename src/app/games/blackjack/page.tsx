import GameLoader from '@/components/games/GameLoader';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Blackjack — NexusDigitalLabs Games',
  description:
    'Play Blackjack in your browser. Beat the dealer to 21. Dealer draws to 17. Classic casino rules, fully client-side.',
  path: '/games/blackjack/',
  absoluteTitle: true,
});

export default function GameBlackjackPage() {
  return (
    <>
      {/* Always-visible disclaimer — server-rendered so Google can index it.
          Required for AdSense gambling-adjacent content policy compliance. */}
      <div style={{
        background: 'rgba(245,158,11,0.07)',
        borderBottom: '1px solid rgba(245,158,11,0.22)',
        padding: '0.5rem 1.25rem',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '0.6875rem', color: '#b45309', fontWeight: 500, margin: 0 }}>
          <span style={{ color: '#f59e0b', fontWeight: 700 }}>For entertainment only</span>
          {' '}— No real money, no gambling, no financial risk. Chip balances are simulated and reset on reload.
        </p>
      </div>

      <GameLoader game="blackjack" />
    </>
  );
}
