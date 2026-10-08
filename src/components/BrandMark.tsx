import { BRAND_NODES, BRAND_STROKES, BRAND_VIEWBOX, brandMarkMetrics } from '@/lib/brand';

/**
 * The NexusDigitalLabs logo mark. Colours come from --ndl-logo-* CSS vars
 * (globals.css), so it follows the site theme. Decorative by default; pass
 * `title` when the mark stands alone without the "NexusDigitalLabs" wordmark.
 */
export default function BrandMark({
  size = 32,
  title,
  ringColor = 'var(--ndl-bg)',
  className,
}: {
  size?: number;
  title?: string;
  /** The surface behind the mark — rings around the nodes use it. */
  ringColor?: string;
  className?: string;
}) {
  const m = brandMarkMetrics(size <= 24);
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
      {BRAND_STROKES.map((s) => (
        <path key={s.d} d={s.d} stroke={colors[s.color]} strokeWidth={m.strokeWidth} strokeLinecap="round" fill="none" />
      ))}
      {BRAND_NODES.map((n) => (
        <circle
          key={`${n.cx}-${n.cy}`}
          cx={n.cx}
          cy={n.cy}
          r={m.nodeRadius}
          fill={colors[n.color]}
          stroke={m.ringWidth ? ringColor : undefined}
          strokeWidth={m.ringWidth || undefined}
        />
      ))}
    </svg>
  );
}
