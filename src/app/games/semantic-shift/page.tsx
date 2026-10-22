import GameLoader from '@/components/games/GameLoader';
import GameGuide from '@/components/games/GameGuide';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Semantic Shift — NexusDigitalLabs Games',
  description:
    'Stroop reflex game — match the word or the ink color under a ticking timer. Streak multipliers. Free in the browser.',
  path: '/games/semantic-shift/',
  absoluteTitle: true,
});

export default function Page() {
  return (
    <>
      <GameLoader game="semantic-shift" />
      <GameGuide
        slug="semantic-shift"
        related={[{ href: '/articles/browser-games-no-download-no-login/', label: 'More free browser games →' }, { href: '/games/', label: 'Browse all browser games →' }]}
      />
    </>
  );
}
