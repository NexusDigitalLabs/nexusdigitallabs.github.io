import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { FALLBACK_CARD, ogCardFor, ogCardPaths, type OgCard } from '@/lib/og-cards';
import { OG_CARD_SIZE, pagePathFromOgSegments } from '@/lib/seo';

/**
 * Per-page social preview cards: /og/<page path>/ → 1200×630 PNG.
 * Every page with a card (src/lib/og-cards.ts) is pre-rendered at build.
 * Other paths render the generic brand card — the URL is never echoed into
 * the image, so nobody can mint images with arbitrary text on this domain.
 */

export const dynamic = 'force-static';

export function generateStaticParams() {
  return ogCardPaths().map((p) => ({ path: p === '/' ? ['home'] : p.split('/').filter(Boolean) }));
}

const fontFile = (weight: number) =>
  readFile(path.join(process.cwd(), 'public/fonts/inter', `inter-latin-${weight}-normal.woff`));

/** Trim at a word boundary so long titles/descriptions never overflow the card. */
function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).replace(/\s+\S*$/, '')}…`;
}

function Card({ card }: { card: OgCard }) {
  const title = clip(card.title, 90);
  const titleSize = title.length > 60 ? 56 : title.length > 36 ? 66 : 76;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0b0f19',
        backgroundImage: `radial-gradient(circle at 88% 12%, ${card.accent}45 0%, ${card.accent}00 48%)`,
        color: '#f8fafc',
        fontFamily: 'Inter',
      }}
    >
      {/* Accent rail (the glow is part of the root background) */}
      <div style={{ height: 8, width: '100%', background: `linear-gradient(90deg, ${card.accent}, #6366f1, #818cf8)` }} />

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '56px 72px 52px', justifyContent: 'space-between' }}>
        {/* Brand row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            N
          </div>
          <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.5 }}>NexusDigitalLabs</div>
          <div
            style={{
              marginLeft: 10,
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              color: card.accent,
              border: `2px solid ${card.accent}88`,
              borderRadius: 999,
              padding: '6px 16px',
            }}
          >
            {clip(card.eyebrow, 42)}
          </div>
        </div>

        {/* Title + description (+ icon) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 44 }}>
          {card.iconPath && (
            <div
              style={{
                width: 150,
                height: 150,
                flexShrink: 0,
                borderRadius: 36,
                background: `${card.accent}22`,
                border: `2px solid ${card.accent}66`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="84" height="84" viewBox="0 0 24 24" fill="none" stroke={card.accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d={card.iconPath} />
              </svg>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22, flex: 1 }}>
            <div style={{ fontSize: titleSize, fontWeight: 300, lineHeight: 1.08, letterSpacing: -1.5 }}>{title}</div>
            <div style={{ fontSize: 28, lineHeight: 1.4, color: '#cbd5e1' }}>{clip(card.description, 150)}</div>
          </div>
        </div>

        <div style={{ fontSize: 22, color: '#94a3b8' }}>nexusdigitallabs.dev</div>
      </div>
    </div>
  );
}

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;
  const card = ogCardFor(pagePathFromOgSegments(segments)) ?? FALLBACK_CARD;
  const [light, regular, semibold, bold] = await Promise.all([fontFile(300), fontFile(400), fontFile(600), fontFile(700)]);

  return new ImageResponse(<Card card={card} />, {
    ...OG_CARD_SIZE,
    fonts: [
      { name: 'Inter', data: light, weight: 300, style: 'normal' },
      { name: 'Inter', data: regular, weight: 400, style: 'normal' },
      { name: 'Inter', data: semibold, weight: 600, style: 'normal' },
      { name: 'Inter', data: bold, weight: 700, style: 'normal' },
    ],
    headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400' },
  });
}
