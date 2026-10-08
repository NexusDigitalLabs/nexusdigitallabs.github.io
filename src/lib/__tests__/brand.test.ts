import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { BRAND_PALETTES, brandMarkMetrics, brandMarkSvg } from '@/lib/brand';

describe('brand mark', () => {
  it('keeps the CSS theme variables in sync with BRAND_PALETTES', () => {
    const css = readFileSync('src/app/globals.css', 'utf8');
    const block = (selector: RegExp) => css.slice(css.search(selector)).split('}')[0];
    const dark = block(/:root,\s*\n?\[data-theme="dark"\]/);
    const light = block(/\[data-theme="light"\] \{/);
    BRAND_PALETTES.dark.forEach((hex, i) => expect(dark).toContain(`--ndl-logo-${i + 1}:      ${hex}`));
    BRAND_PALETTES.light.forEach((hex, i) => expect(light).toContain(`--ndl-logo-${i + 1}:      ${hex}`));
  });

  it('uses heavier strokes when compact (favicon sizes)', () => {
    expect(brandMarkMetrics(true).strokeWidth).toBeGreaterThan(brandMarkMetrics(false).strokeWidth);
  });

  it('renders a standalone SVG with three strokes and two nodes', () => {
    const svg = brandMarkSvg({ palette: BRAND_PALETTES.light, size: 64, background: '#000', padding: 0.2 });
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true);
    expect(svg.match(/<path /g)).toHaveLength(3);
    expect(svg.match(/<circle /g)).toHaveLength(2);
    expect(svg).toContain('<rect width="48" height="48"');
  });

  it('ships the generated adaptive favicon', () => {
    const icon = readFileSync('src/app/icon.svg', 'utf8');
    expect(icon).toContain('prefers-color-scheme:dark');
    for (const hex of [...BRAND_PALETTES.light, ...BRAND_PALETTES.dark]) expect(icon).toContain(hex);
  });
});
