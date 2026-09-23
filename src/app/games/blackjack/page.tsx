import GameLoader from '@/components/games/GameLoader';
import GameSeoSection from '@/components/games/GameSeoSection';
import AdSlot from '@/components/AdSlot';
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
      <GameSeoSection
        title="Blackjack — beat the dealer to 21"
        intro="This is a free browser Blackjack table that follows classic casino rules for practice and entertainment. Chip stacks are simulated. Nothing here involves real currency, deposits, withdrawals, or prizes of monetary value."
        mechanics={
          <>
            <p>
              Place a simulated bet, then hit, stand, or double down. Number cards are face value; face cards count as 10;
              aces count as 1 or 11. The dealer draws to 17. Going over 21 busts. Blackjack (ace + ten-value) pays according
              to the table rules shown in the UI.
            </p>
            <p>
              Reloading the page resets simulated chips. There is no cash-out, no peer-to-peer wagering, and no connection
              to any gambling operator.
            </p>
          </>
        }
        scoring={
          <p>
            Outcomes are win, lose, push, or blackjack on the simulated stake. Session “balance” is a local scoreboard for
            practice only — it has no monetary value and is not transferable.
          </p>
        }
        strategy={
          <p>
            Basic strategy charts reduce the house edge in real casinos; here they are a learning aid only. Favor standing
            on hard 17+, hitting soft hands that can improve, and doubling on strong totals versus weak dealer upcards.
            Read our basic-strategy article for a full walkthrough.
          </p>
        }
        related={[
          { href: '/articles/blackjack-basic-strategy/', label: 'Blackjack basic strategy explained →' },
          { href: '/games/', label: 'Browse all browser games →' },
        ]}
        disclaimer={
          <p>
            <strong style={{ color: '#f59e0b' }}>Legal / entertainment disclaimer:</strong>{' '}
            NexusDigitalLabs Blackjack is strictly for entertainment and education. No real money is wagered or awarded.
            If you are seeking help with gambling-related problems, contact local support services in your region.
          </p>
        }
      />

      <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_GAMES} />
    </>
  );
}
