import GameLoader from '@/components/games/GameLoader';
import GameGuide from '@/components/games/GameGuide';
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
      <GameGuide
        slug="sumoku"
        related={[{ href: '/games/', label: 'Browse all browser games →' }]}
      />
    </>
  );
}
