import GameLoader from '@/components/games/GameLoader';
import GameSeoSection from '@/components/games/GameSeoSection';
import AdSlot from '@/components/AdSlot';
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
      <GameSeoSection
        title="Semantic Shift — Stroop reflex challenge"
        intro="Semantic Shift is based on the Stroop effect: the brain slows when word meaning and ink color conflict. Each round asks you to respond to either the written word or the display color before the timer hits zero."
        mechanics={
          <>
            <p>
              Read the prompt carefully — “match the word” versus “match the color” changes the correct answer on the same
              stimulus. Tap the matching choice as fast as you can. Wrong answers break the streak; hesitation burns the
              round clock.
            </p>
          </>
        }
        scoring={
          <p>
            Points favor speed and accuracy. Streak multipliers reward consecutive correct responses. Mode switches mid-run
            are intentional interference — stay locked on the current instruction.
          </p>
        }
        strategy={
          <p>
            Verbally restate the rule each round (“color only”) to override automatic reading. Focus on the ink for color
            mode; for word mode, ignore hue entirely. Short blinks between trials reduce carry-over from the last conflict.
          </p>
        }
        related={[
          { href: '/articles/browser-games-no-download-no-login/', label: 'More free browser games →' },
          { href: '/games/', label: 'Browse all browser games →' },
        ]}
      />

      <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_GAMES} />
    </>
  );
}
