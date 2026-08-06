import type { ReactNode } from 'react';

type RelatedLink = { href: string; label: string };

type GameSeoSectionProps = {
  title: string;
  intro: string;
  mechanicsTitle?: string;
  mechanics: ReactNode;
  scoringTitle?: string;
  scoring: ReactNode;
  strategyTitle?: string;
  strategy: ReactNode;
  related?: RelatedLink[];
  disclaimer?: ReactNode;
};

/**
 * Server-rendered explainer below GameLoader so crawlers see real text on game routes.
 */
export default function GameSeoSection({
  title,
  intro,
  mechanicsTitle = 'How to play',
  mechanics,
  scoringTitle = 'Scoring',
  scoring,
  strategyTitle = 'Strategy tips',
  strategy,
  related,
  disclaimer,
}: GameSeoSectionProps) {
  return (
    <section className="border-t py-14 sm:py-16" style={{ borderColor: 'var(--ndl-border)' }}>
      <div className="max-w-3xl mx-auto px-6 sm:px-10 space-y-10">
        <div>
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-4"
            style={{ color: 'var(--ndl-accent)' }}
          >
            About this game
          </p>
          <h2 className="text-2xl font-light tracking-tight mb-4" style={{ color: 'var(--ndl-text)' }}>
            {title}
          </h2>
          <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--ndl-muted)' }}>
            {intro}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-medium tracking-tight mb-3" style={{ color: 'var(--ndl-text)' }}>
            {mechanicsTitle}
          </h3>
          <div className="text-sm font-light leading-relaxed space-y-3" style={{ color: 'var(--ndl-muted)' }}>
            {mechanics}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium tracking-tight mb-3" style={{ color: 'var(--ndl-text)' }}>
            {scoringTitle}
          </h3>
          <div className="text-sm font-light leading-relaxed space-y-3" style={{ color: 'var(--ndl-muted)' }}>
            {scoring}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium tracking-tight mb-3" style={{ color: 'var(--ndl-text)' }}>
            {strategyTitle}
          </h3>
          <div className="text-sm font-light leading-relaxed space-y-3" style={{ color: 'var(--ndl-muted)' }}>
            {strategy}
          </div>
        </div>

        {related && related.length > 0 ? (
          <div className="pt-4 border-t" style={{ borderColor: 'var(--ndl-border)' }}>
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-3"
              style={{ color: 'var(--ndl-faint)' }}
            >
              Related
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {related.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm no-underline"
                  style={{ color: 'var(--ndl-accent)' }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        ) : null}

        {disclaimer ? (
          <div
            className="rounded-lg border px-4 py-3 text-xs font-light leading-relaxed"
            style={{
              borderColor: 'rgba(245,158,11,0.35)',
              background: 'rgba(245,158,11,0.06)',
              color: 'var(--ndl-muted)',
            }}
          >
            {disclaimer}
          </div>
        ) : null}
      </div>
    </section>
  );
}
