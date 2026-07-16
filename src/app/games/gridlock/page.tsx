import GameLoader from '@/components/games/GameLoader';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Gridlock — NexusDigitalLabs Games',
  description:
    'Pattern memory challenge. Flash, hide, recreate tile patterns on 3×3 to 5×5 grids. Fully client-side.',
  path: '/games/gridlock/',
  absoluteTitle: true,
});

export default function Page() {
  return <GameLoader game="gridlock" />;
}
