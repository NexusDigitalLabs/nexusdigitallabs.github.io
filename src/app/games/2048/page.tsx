import GameLoader from '@/components/games/GameLoader';
import GameGuide from '@/components/games/GameGuide';
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
      <GameGuide
        slug="2048"
        related={[{ href: '/articles/how-to-win-at-2048/', label: 'How to Win at 2048 — full strategy guide →' }, { href: '/games/', label: 'Browse all browser games →' }]}
      />
    </>
  );
}
