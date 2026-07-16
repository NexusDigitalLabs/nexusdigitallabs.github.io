import GameLoader from '@/components/games/GameLoader';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Cryptic Paths — NexusDigitalLabs Games',
  description:
    'Trace every edge of a node graph exactly once. Eulerian path puzzles with optional countdowns.',
  path: '/games/cryptic-paths/',
  absoluteTitle: true,
});

export default function Page() {
  return <GameLoader game="cryptic-paths" />;
}
