import type { Metadata } from 'next';
import Game2048 from '@/components/games/Game2048';

export const metadata: Metadata = {
  title: '2048 — NexusDigitalLabs Games',
  description: 'Play 2048 in your browser. Merge tiles to reach 2048. No login, no ads, fully client-side.',
  alternates: { canonical: 'https://nexusdigitallabs.dev/games/2048/' },
};

export default function Game2048Page() {
  return <Game2048 />;
}
