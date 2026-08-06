import GameLoader from '@/components/games/GameLoader';
import GameSeoSection from '@/components/games/GameSeoSection';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Sumoku — NexusDigitalLabs Games',
  description:
    'Select connected numbers that sum to the target. Clear tiles, drop replacements, race the clock. Free browser puzzle.',
  path: '/games/sumoku/',
  absoluteTitle: true,
});

export default function Page() {
  return (
    <>
      <GameLoader game="sumoku" />
      <GameSeoSection
        title="Sumoku — hit the target sum"
        intro="Sumoku asks you to select a connected group of numbers whose values add exactly to the shown target. Cleared tiles drop replacements; higher tiers tighten the clock and enlarge the board."
        mechanics={
          <>
            <p>
              Tap adjacent cells (edge-connected) to build a selection. When the sum matches the target, those tiles clear
              and gravity fills gaps. Selections that overshoot or cannot reach the target should be cancelled and rebuilt.
            </p>
          </>
        }
        scoring={
          <p>
            Larger valid groups and faster clears usually score higher. Combos from cascading drops can add bonuses.
            Running out of time or valid moves ends the run.
          </p>
        }
        strategy={
          <p>
            Prefer selections that also set up the next target rather than greedily clearing the first match you see.
            Watch for high-value outliers that force awkward sums — clear them early when the target allows.
          </p>
        }
        related={[{ href: '/games/', label: 'Browse all browser games →' }]}
      />
    </>
  );
}
