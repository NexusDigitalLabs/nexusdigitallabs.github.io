import GameLoader from '@/components/games/GameLoader';
import GameSeoSection from '@/components/games/GameSeoSection';
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
      <GameSeoSection
        title="Nexus Sudoku — logic on a 9×9 grid"
        intro="Fill the grid so every row, column, and 3×3 box contains the digits 1–9 exactly once. Each puzzle has a unique solution. Difficulty tiers change how many clues you start with and how scoring rewards speed."
        mechanics={
          <>
            <p>
              Select a cell and enter a digit, or use pencil marks for candidates. The board rejects moves that immediately
              contradict row, column, or box uniqueness when validation is enabled. Clear a difficulty to unlock harder sets.
            </p>
          </>
        }
        scoring={
          <p>
            Faster completions and higher difficulties award more points. Mistakes or hints (if offered) typically reduce
            the score. Timers measure elapsed solve time for comparison across runs.
          </p>
        }
        strategy={
          <p>
            Start with naked singles and hidden singles, then pairs and pointing pairs before guessing. Scan boxes that
            share a row or column to eliminate candidates systematically rather than trial-and-error.
          </p>
        }
        related={[{ href: '/games/', label: 'Browse all browser games →' }]}
      />
    </>
  );
}
