import GameLoader from '@/components/games/GameLoader';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: '2048 — NexusDigitalLabs Games',
  description:
    'Play 2048 in your browser. Merge tiles to reach 2048. No login, no ads, fully client-side.',
  path: '/games/2048/',
  absoluteTitle: true,
});

export default function Game2048Page() {
  return <GameLoader game="2048" />;
}
