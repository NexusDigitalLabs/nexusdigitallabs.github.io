import type { ReactNode } from 'react';
import GameSeoSection from '@/components/games/GameSeoSection';
import { GAME_GUIDES, type GameGuideSlug } from '@/data/game-guides';

type Props = {
  slug: GameGuideSlug;
  related?: { href: string; label: string }[];
  disclaimer?: ReactNode;
};

const paragraphs = (items: string[]) => (
  <>
    {items.map((p) => (
      <p key={p}>{p}</p>
    ))}
  </>
);

/** Server-rendered long-form guide for a game page, driven by src/data/game-guides.ts. */
export default function GameGuide({ slug, related, disclaimer }: Props) {
  const g = GAME_GUIDES[slug];
  return (
    <GameSeoSection
      title={g.title}
      intro={g.intro}
      mechanics={paragraphs(g.mechanics)}
      scoring={paragraphs(g.scoring)}
      strategy={paragraphs(g.strategy)}
      sections={g.sections}
      faq={g.faq}
      related={related ?? [{ href: '/games/', label: 'Browse all browser games →' }]}
      disclaimer={disclaimer}
    />
  );
}
