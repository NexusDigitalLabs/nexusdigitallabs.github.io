import GameLoader from '@/components/games/GameLoader';
import GameGuide from '@/components/games/GameGuide';
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
      <GameGuide
        slug="cryptic-paths"
        related={[{ href: '/games/', label: 'Browse all browser games →' }]}
      />
    </>
  );
}
