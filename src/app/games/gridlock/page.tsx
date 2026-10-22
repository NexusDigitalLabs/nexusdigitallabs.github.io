import GameLoader from '@/components/games/GameLoader';
import GameGuide from '@/components/games/GameGuide';
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
      <GameGuide
        slug="gridlock"
        related={[{ href: '/games/', label: 'Browse all browser games →' }]}
      />
    </>
  );
}
