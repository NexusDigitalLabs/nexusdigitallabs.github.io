import GameLoader from '@/components/games/GameLoader';
import GameSeoSection from '@/components/games/GameSeoSection';
import AdSlot from '@/components/AdSlot';
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
      <GameSeoSection
        title="Snake — grow without colliding"
        intro="Snake is an arcade classic: steer a moving snake to eat food pellets, grow longer, and survive as speed and length increase. This browser version wraps through walls on many levels and ends when you hit your own body."
        mechanics={
          <>
            <p>
              Change direction with arrow keys or swipe. The snake advances one cell per tick; you cannot reverse
              instantly into yourself. Eating food increases length by one segment and usually raises the level or speed.
            </p>
            <p>
              Wall wrapping lets the head exit one edge and enter the opposite side. Your body still occupies cells — plan
              turns before the corridor closes.
            </p>
          </>
        }
        scoring={
          <p>
            Score typically rises with each pellet eaten, sometimes with bonuses for consecutive collects or higher levels.
            Surviving longer at higher speed is the main skill curve; length is both score fuel and collision risk.
          </p>
        }
        strategy={
          <p>
            Cut wide loops early so you leave open lanes for later. Avoid boxing yourself into a spiral with no exit.
            When the board is crowded, prioritize clearing space over chasing distant food.
          </p>
        }
        related={[
          { href: '/articles/browser-games-no-download-no-login/', label: 'Browser games with no download or login →' },
          { href: '/games/', label: 'Browse all browser games →' },
        ]}
      />

      <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_GAMES} />
    </>
  );
}
