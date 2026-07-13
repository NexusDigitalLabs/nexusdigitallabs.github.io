import type { Metadata } from 'next';
import GameSnake from '@/components/games/GameSnake';

export const metadata: Metadata = {
  title: 'Snake — NexusDigitalLabs Games',
  description: 'Play Snake in your browser. Navigate to eat food, grow your snake. Avoid walls and your tail. Fully client-side.',
  alternates: { canonical: 'https://nexusdigitallabs.dev/games/snake/' },
};

export default function GameSnakePage() {
  return <GameSnake />;
}
