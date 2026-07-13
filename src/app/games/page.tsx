import type { Metadata } from 'next';
import GamesLobbyClient from '@/components/games/GamesLobbyClient';

export const metadata: Metadata = {
  title: 'Games — NexusDigitalLabs',
  description:
    'Browser-based mini-games built with zero-bloat React. Play 2048, Snake, and Blackjack — scores persist locally, no login required.',
  alternates: { canonical: 'https://nexusdigitallabs.dev/games/' },
  openGraph: {
    title: 'Games — NexusDigitalLabs',
    description: '2048, Snake, and Blackjack — built in-browser, no tracking.',
    url: 'https://nexusdigitallabs.dev/games/',
    images: [{ url: 'https://nexusdigitallabs.dev/og-image.png' }],
  },
};

export default function GamesPage() {
  return <GamesLobbyClient />;
}
