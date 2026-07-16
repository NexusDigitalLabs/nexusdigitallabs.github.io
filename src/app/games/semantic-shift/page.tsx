import GameLoader from '@/components/games/GameLoader';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Semantic Shift — NexusDigitalLabs Games',
  description:
    'Stroop reflex game — match the word or the ink color under a ticking timer. Streak multipliers.',
  path: '/games/semantic-shift/',
  absoluteTitle: true,
});

export default function Page() {
  return <GameLoader game="semantic-shift" />;
}
