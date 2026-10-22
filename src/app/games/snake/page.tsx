import GameLoader from '@/components/games/GameLoader';
import GameGuide from '@/components/games/GameGuide';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Snake — NexusDigitalLabs Games',
  description:
    'Classic Snake in the browser. Eat food, grow longer, wrap through walls, and avoid your tail. Free, no download.',
  path: '/games/snake/',
  absoluteTitle: true,
});

export default function Page() {
  return (
    <>
      <GameLoader game="snake" />
      <GameGuide
        slug="snake"
        related={[{ href: '/articles/browser-games-no-download-no-login/', label: 'Browser games with no download or login →' }, { href: '/games/', label: 'Browse all browser games →' }]}
      />
    </>
  );
}
