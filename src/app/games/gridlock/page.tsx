import GameLoader from '@/components/games/GameLoader';
import GameSeoSection from '@/components/games/GameSeoSection';
import AdSlot from '@/components/AdSlot';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Gridlock — NexusDigitalLabs Games',
  description:
    'Memory training game: memorize flashing tiles, then recreate the pattern. Harder grids and shorter windows as you level up.',
  path: '/games/gridlock/',
  absoluteTitle: true,
});

export default function Page() {
  return (
    <>
      <GameLoader game="gridlock" />
      <GameSeoSection
        title="Gridlock — memorize and recreate patterns"
        intro="Gridlock is a short-term memory challenge. A pattern of tiles flashes on a grid; you must reproduce it exactly before the round timer expires. Later levels use larger grids, more flashes, and less time."
        mechanics={
          <>
            <p>
              Watch the highlight sequence carefully, then tap or click the same cells in the response phase. Order and
              positions both matter depending on the round rules shown in the UI. Missing a cell or adding an extra one
              ends the streak.
            </p>
          </>
        }
        scoring={
          <p>
            Points scale with grid size, number of lit cells, and remaining time. Consecutive correct rounds may apply a
            streak multiplier. Wrong reconstructions reset the streak.
          </p>
        }
        strategy={
          <p>
            Chunk the pattern into rows or shapes instead of memorizing isolated cells. Verbally label positions (“top-left
            L”) if that helps. On larger boards, lock the first flash cluster before the second appears.
          </p>
        }
        related={[{ href: '/games/', label: 'Browse all browser games →' }]}
      />

      <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_GAMES} />
    </>
  );
}
