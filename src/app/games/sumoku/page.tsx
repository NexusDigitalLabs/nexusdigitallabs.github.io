import GameLoader from '@/components/games/GameLoader';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Sumoku — NexusDigitalLabs Games',
  description:
    'Select connected numbers that sum to the target. Gravity refill, timers, and shifting targets on harder tiers.',
  path: '/games/sumoku/',
  absoluteTitle: true,
});

export default function Page() {
  return <GameLoader game="sumoku" />;
}
