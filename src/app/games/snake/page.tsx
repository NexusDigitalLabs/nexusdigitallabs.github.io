import GameLoader from '@/components/games/GameLoader';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Snake — NexusDigitalLabs Games',
  description:
    'Play Snake in your browser. Navigate to eat food, grow your snake. Avoid walls and your tail. Fully client-side.',
  path: '/games/snake/',
  absoluteTitle: true,
});

export default function GameSnakePage() {
  return <GameLoader game="snake" />;
}
