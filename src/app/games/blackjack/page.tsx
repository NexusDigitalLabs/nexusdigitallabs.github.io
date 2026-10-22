import GameLoader from '@/components/games/GameLoader';
import GameGuide from '@/components/games/GameGuide';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Blackjack — NexusDigitalLabs Games',
  description:
    'Play Blackjack in your browser for entertainment only. Beat the dealer to 21. No real money, no gambling risk.',
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
      <GameGuide
        slug="blackjack"
        related={[{ href: '/articles/blackjack-basic-strategy/', label: 'Blackjack basic strategy explained →' }, { href: '/games/', label: 'Browse all browser games →' }]}
        disclaimer={
          <p>
            <strong style={{ color: '#f59e0b' }}>Legal / entertainment disclaimer:</strong>{' '}
            NexusDigitalLabs Blackjack is strictly for entertainment and education. No real money is wagered or awarded.
            If you are seeking help with gambling-related problems, contact local support services in your region.
          </p>
        }
      />
    </>
  );
}
