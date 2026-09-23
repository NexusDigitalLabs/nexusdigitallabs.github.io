import GameLoader from '@/components/games/GameLoader';
import GameSeoSection from '@/components/games/GameSeoSection';
import AdSlot from '@/components/AdSlot';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Cryptic Paths — NexusDigitalLabs Games',
  description:
    'Trace every edge of a node graph exactly once. Complete Eulerian paths under tighter time limits. Free browser puzzle.',
  path: '/games/cryptic-paths/',
  absoluteTitle: true,
});

export default function Page() {
  return (
    <>
      <GameLoader game="cryptic-paths" />
      <GameSeoSection
        title="Cryptic Paths — Eulerian routes on a graph"
        intro="Cryptic Paths is a graph-tracing puzzle: visit every edge exactly once (an Eulerian path). Nodes are connected by edges you must cover without reuse. Timers shorten as difficulty rises."
        mechanics={
          <>
            <p>
              Start at a valid node and move along unused edges. You cannot traverse the same edge twice. Completing all
              edges finishes the puzzle; getting stuck with unused edges remaining fails the attempt.
            </p>
            <p>
              Mathematically, connected graphs have an Eulerian path when exactly zero or two vertices have odd degree.
              Levels are generated to be solvable; your job is to find the route under time pressure.
            </p>
          </>
        }
        scoring={
          <p>
            Faster completions and harder graphs score higher. Dead-end restarts cost time. Optional streaks reward
            consecutive clears without mistakes.
          </p>
        }
        strategy={
          <p>
            Count odd-degree nodes first — start at an odd vertex when two exist. Save bridges (edges whose removal would
            split remaining work) for last. Mentally mark forced corridors before clicking.
          </p>
        }
        related={[{ href: '/games/', label: 'Browse all browser games →' }]}
      />

      <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_GAMES} />
    </>
  );
}
