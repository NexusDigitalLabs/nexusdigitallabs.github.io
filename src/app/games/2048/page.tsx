import GameLoader from '@/components/games/GameLoader';
import GameSeoSection from '@/components/games/GameSeoSection';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: '2048 — NexusDigitalLabs Games',
  description:
    'Play 2048 in your browser. Slide and merge tiles to reach 2048. Keyboard, WASD, and touch — free, no download.',
  path: '/games/2048/',
  absoluteTitle: true,
});

export default function Page() {
  return (
    <>
      <GameLoader game="2048" />
      <GameSeoSection
        title="2048 — merge tiles to the target"
        intro="2048 is a single-player sliding puzzle on a 4×4 grid. Each move shifts every tile as far as it can in one direction. Matching numbers collide into their sum; a new 2 or 4 appears after each successful slide. Reach the 2048 tile to win, then keep going for a higher score."
        mechanics={
          <>
            <p>
              Use arrow keys, WASD, or swipe on touch devices. Only moves that change the board count. When two tiles with
              the same value collide, they merge once per move into a single tile with double the value.
            </p>
            <p>
              The game ends when the grid is full and no merge is possible. High scores can be stored locally in your
              browser; optional account sync is available if you sign in.
            </p>
          </>
        }
        scoring={
          <p>
            Points equal the value of each newly merged tile. Chaining merges in one direction can produce large score
            jumps. The win condition is creating a 2048 tile; continuing afterward is optional high-score play.
          </p>
        }
        strategy={
          <>
            <p>
              Keep your highest tile in a corner and build a monotonic “snake” of decreasing values toward it. Avoid
              random up/down flips that strand large tiles in the center. Prefer merging mid-value tiles before forcing
              moves that fill empty cells you need for recovery.
            </p>
          </>
        }
        related={[
          { href: '/articles/how-to-win-at-2048/', label: 'How to Win at 2048 — full strategy guide →' },
          { href: '/games/', label: 'Browse all browser games →' },
        ]}
      />
    </>
  );
}
