/**
 * NexusDigitalLabs brand mark — a segmented "N" whose two joints are nodes
 * (nexus = connection). Single source of truth for the geometry and colours:
 * used by <BrandMark />, the social cards (src/app/og/[...path]/route.tsx)
 * and the icon generator (scripts/gen-favicons.mjs → favicon, PWA, Apple).
 *
 * No imports on purpose: the icon script runs this file directly with
 * `node --experimental-strip-types`.
 */

export const BRAND_VIEWBOX = '0 0 48 48';

/** Left stem, diagonal, right stem — each takes one palette colour. */
export const BRAND_STROKES = [
  { d: 'M10 39V9', color: 0 },
  { d: 'M10 9L38 39', color: 1 },
  { d: 'M38 39V9', color: 2 },
] as const;

/** Nodes at the two joints (top-left, bottom-right). */
export const BRAND_NODES = [
  { cx: 10, cy: 9, color: 0 },
  { cx: 38, cy: 39, color: 2 },
] as const;

export type BrandPalette = readonly [string, string, string];

export const BRAND_PALETTES: { light: BrandPalette; dark: BrandPalette } = {
  light: ['#2563eb', '#6366f1', '#06b6d4'],
  dark: ['#3b82f6', '#818cf8', '#22d3ee'],
};

/**
 * Regular: 7-unit strokes, 6.5-unit nodes. Compact (≤ ~24px): thicker
 * strokes and nodes so it stays legible as a favicon. Nodes sit flush on the
 * strokes — an outline ring was tried and split the letter apart ("i!").
 */
export function brandMarkMetrics(compact: boolean) {
  return compact
    ? { strokeWidth: 8, nodeRadius: 7, ringWidth: 0 }
    : { strokeWidth: 7, nodeRadius: 6.5, ringWidth: 0 };
}

/** Standalone SVG markup (for raster icons and data URIs). */
export function brandMarkSvg({
  palette,
  size,
  compact = size <= 24,
  ringColor,
  background,
  padding = 0,
  radius = 0,
}: {
  palette: BrandPalette;
  size: number;
  compact?: boolean;
  /** Colour of the ring around nodes — the background they sit on. */
  ringColor?: string;
  /** Optional solid tile behind the mark (app icons). */
  background?: string;
  /** Fraction of the canvas reserved as margin on each side (0–0.45). */
  padding?: number;
  /** Corner radius of the background tile, as a fraction of size. */
  radius?: number;
}): string {
  const m = brandMarkMetrics(compact);
  const inner = 48 * (1 - 2 * padding);
  const scale = inner / 48;
  const offset = 48 * padding;
  const ring = m.ringWidth && ringColor ? ` stroke="${ringColor}" stroke-width="${m.ringWidth}"` : '';
  const tile = background
    ? `<rect width="48" height="48" rx="${48 * radius}" fill="${background}"/>`
    : '';
  const strokes = BRAND_STROKES.map(
    (s) => `<path d="${s.d}" stroke="${palette[s.color]}" stroke-width="${m.strokeWidth}" stroke-linecap="round" fill="none"/>`
  ).join('');
  const nodes = BRAND_NODES.map(
    (n) => `<circle cx="${n.cx}" cy="${n.cy}" r="${m.nodeRadius}" fill="${palette[n.color]}"${ring}/>`
  ).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${BRAND_VIEWBOX}">${tile}<g transform="translate(${offset} ${offset}) scale(${scale})">${strokes}${nodes}</g></svg>`;
}
