import type { Metadata } from 'next';
import GameLoader from '@/components/games/GameLoader';

export const metadata: Metadata = {
  title: 'Blackjack — NexusDigitalLabs Games',
  description: 'Play Blackjack in your browser. Beat the dealer to 21. Dealer draws to 17. Classic casino rules, fully client-side.',
  alternates: { canonical: 'https://nexusdigitallabs.dev/games/blackjack/' },
};

export default function GameBlackjackPage() {
  return <GameLoader game="blackjack" />;
}
