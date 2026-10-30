import GameLoader from '@/components/games/GameLoader';
import GameGuide from '@/components/games/GameGuide';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Little Learners — Toddler Learning Games | NexusDigitalLabs',
  description:
    'Free learning playground for toddlers and playgroup kids: numbers, letters, shapes, colours, counting and matching. Read-aloud questions, gentle feedback, no login.',
  path: '/games/little-learners/',
  absoluteTitle: true,
  ogDescription: 'Numbers, letters, shapes, colours, counting and matching for ages 2–5.',
});

export default function Page() {
  return (
    <>
      <GameLoader game="little-learners" />
      <GameGuide slug="little-learners" />
    </>
  );
}
