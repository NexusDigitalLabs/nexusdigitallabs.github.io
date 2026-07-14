import type { Metadata } from 'next';
import GameLoader from '@/components/games/GameLoader';

export const metadata: Metadata = {
  title: 'Snake — NexusDigitalLabs Games',
  description: 'Play Snake in your browser. Navigate to eat food, grow your snake. Avoid walls and your tail. Fully client-side.',
  alternates: { canonical: 'https://nexusdigitallabs.dev/games/snake/' },
};

export default function GameSnakePage() {
  return <GameLoader game="snake" />;
}
