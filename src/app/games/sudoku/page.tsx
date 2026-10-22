import GameLoader from '@/components/games/GameLoader';
import GameGuide from '@/components/games/GameGuide';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Nexus Sudoku — NexusDigitalLabs Games',
  description:
    'Play Sudoku in your browser. Unique puzzles from Beginner to Hard with timers and scoring. Free, no download.',
  path: '/games/sudoku/',
  absoluteTitle: true,
});

export default function Page() {
  return (
    <>
      <GameLoader game="sudoku" />
      <GameGuide
        slug="sudoku"
        related={[{ href: '/games/', label: 'Browse all browser games →' }]}
      />
    </>
  );
}
