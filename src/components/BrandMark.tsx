import { useId } from 'react';
import { BRAND_NODES, BRAND_STROKES, BRAND_VIEWBOX, brandGapCircles, brandMarkMetrics } from '@/lib/brand';

/**
 * The NexusDigitalLabs logo mark. Colours come from --ndl-logo-* CSS vars
 * (globals.css), so it follows the site theme. The gap around each node is
 * cut out of the strokes with a mask — transparent, so it works on any
 * background. Decorative by default; pass `title` when the mark stands alone
 * without the "NexusDigitalLabs" wordmark.
 */
export default function BrandMark({
  size = 32,
  title,
  className,
}: {
  size?: number;
  title?: string;
  className?: string;
}) {
  const compact = size <= 24;
  const m = brandMarkMetrics(compact);
  const maskId = `ndl-gap-${useId().replace(/:/g, '')}`;
  const colors = ['var(--ndl-logo-1)', 'var(--ndl-logo-2)', 'var(--ndl-logo-3)'];

  return (
    <svg
      width={size}
      height={size}
      viewBox={BRAND_VIEWBOX}
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x={-8} y={-8} width={64} height={64}>
          <rect x={-8} y={-8} width={64} height={64} fill="white" />
          {brandGapCircles(compact).map((c) => (
            <circle key={`${c.cx}-${c.cy}`} cx={c.cx} cy={c.cy} r={c.r} fill="black" />
          ))}
        </mask>
      </defs>
      <g mask={`url(#${maskId})`}>
        {BRAND_STROKES.map((s) => (
          <path key={s.d} d={s.d} stroke={colors[s.color]} strokeWidth={m.strokeWidth} strokeLinecap="round" fill="none" />
        ))}
      </g>
      {BRAND_NODES.map((n) => (
        <circle key={`${n.cx}-${n.cy}`} cx={n.cx} cy={n.cy} r={m.nodeRadius} fill={colors[n.color]} />
      ))}
    </svg>
  );
}
