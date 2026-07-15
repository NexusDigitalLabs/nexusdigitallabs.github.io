import { describe, it, expect } from 'vitest';
import {
  DEFAULT_SVG_EDITS,
  applySvgEdits,
  extractSvgTexts,
  invertHexLightness,
  invertSvgColors,
} from '@/lib/svg-edits';

describe('svg-edits', () => {
  const logo =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#2563eb"/><text x="50" y="66" fill="#ffffff">N</text></svg>';

  it('extracts and replaces text nodes', () => {
    expect(extractSvgTexts(logo)).toEqual(['N']);
    const next = applySvgEdits(logo, {
      ...DEFAULT_SVG_EDITS,
      textReplacements: { N: 'X' },
    });
    expect(next).toContain('>X</text>');
    expect(next).not.toContain('>N</text>');
  });

  it('applies corner radius, size, and rotate wrap', () => {
    const next = applySvgEdits(logo, {
      ...DEFAULT_SVG_EDITS,
      cornerRadius: 12,
      exportSize: 64,
      rotateDeg: 90,
    });
    expect(next).toContain('rx="12"');
    expect(next).toContain('width="64"');
    expect(next).toContain('height="64"');
    expect(next).toContain('transform="');
    expect(next).toContain('rotate(90)');
  });

  it('pads viewBox and sets outline mode', () => {
    const next = applySvgEdits(logo, {
      ...DEFAULT_SVG_EDITS,
      paddingPercent: 10,
      outlineMode: true,
    });
    expect(next).toMatch(/viewBox="-10 -10 120 120"/);
    expect(next).toContain('fill="none"');
    expect(next).toContain('stroke="#2563eb"');
  });

  it('simplifies path precision', () => {
    const pathSvg =
      '<svg viewBox="0 0 10 10"><path d="M1.23456 2.34567L3.0 4.99999"/></svg>';
    const next = applySvgEdits(pathSvg, {
      ...DEFAULT_SVG_EDITS,
      pathPrecision: 2,
    });
    expect(next).toContain('1.23');
    expect(next).toContain('2.35');
  });

  it('inverts hex lightness for dark/light pairs', () => {
    expect(invertHexLightness('#000000')).toBe('#ffffff');
    expect(invertHexLightness('#ffffff')).toBe('#000000');
    const inv = invertSvgColors(logo);
    expect(inv).not.toContain('#2563eb');
    expect(inv).toContain('fill=');
  });
});
