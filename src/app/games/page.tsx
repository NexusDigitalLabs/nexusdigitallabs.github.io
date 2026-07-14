import GameLoader from '@/components/games/GameLoader';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Games — NexusDigitalLabs',
  description:
    'Browser-based mini-games built with zero-bloat React. Play 2048, Snake, and Blackjack — scores persist locally, no login required.',
  path: '/games/',
  absoluteTitle: true,
  ogDescription: '2048, Snake, and Blackjack — built in-browser, no tracking.',
});

export default function GamesPage() {
  return <GameLoader game="lobby" />;
}
