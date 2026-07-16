import GameLoader from '@/components/games/GameLoader';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Nexus Sudoku — NexusDigitalLabs Games',
  description:
    'Play Sudoku in your browser. Unique puzzles from Beginner to Hard with timers, conflict checks, and local high scores.',
  path: '/games/sudoku/',
  absoluteTitle: true,
});

export default function Page() {
  return <GameLoader game="sudoku" />;
}
