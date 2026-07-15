/**
 * Client-side SVG scrubber + React / Vue component codegen.
 */

export type SvgOptimizeResult =
  | { ok: true; optimized: string; warnings: string[] }
  | { ok: false; error: string };

const JUNK_ATTR =
  /\s(?:inkscape|sodipodi|xmlns:inkscape|xmlns:sodipodi|xmlns:sketch|data-name|data-testid)(?::[a-zA-Z0-9_-]+)?="[^"]*"/gi;

const EDITOR_COMMENTS = /<!--(?!\s*#)[\s\S]*?-->/g;

export function optimizeSvg(raw: string): SvgOptimizeResult {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, error: 'Paste SVG markup or drop an .svg file.' };
  if (!/<svg[\s>]/i.test(trimmed)) {
    return { ok: false, error: 'Input does not look like an SVG (missing <svg> root).' };
  }

  const warnings: string[] = [];
  let out = trimmed;

  out = out.replace(EDITOR_COMMENTS, '');
  if (/inkscape|sodipodi|sketch:/i.test(raw)) {
    warnings.push('Removed editor namespaces / Inkscape–Sodipodi attributes.');
  }
  out = out.replace(JUNK_ATTR, '');

  // Drop empty <metadata>, <title>, <desc> often injected by export tools
  out = out.replace(/<(metadata|title|desc)(\s[^>]*)?>[\s\S]*?<\/\1>/gi, '');
  out = out.replace(/<(metadata|title|desc)(\s[^>]*)?\/>/gi, '');

  // Remove empty groups
  let prev = '';
  while (prev !== out) {
    prev = out;
    out = out.replace(/<g(\s[^>]*)?>\s*<\/g>/gi, '');
  }

  // Collapse whitespace between tags
  out = out.replace(/>\s+</g, '><');
  out = out.replace(/\s{2,}/g, ' ');
  out = out.replace(/\s+>/g, '>');
  out = out.trim();

  // Ensure xmlns if missing (browsers tolerate it; React often expects it)
  if (!/\sxmlns=/.test(out) && /^<svg[\s>]/i.test(out)) {
    out = out.replace(/^<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"');
    warnings.push('Added missing xmlns="http://www.w3.org/2000/svg".');
  }

  return { ok: true, optimized: out, warnings };
}

const SKIP_COLORS = new Set([
  'none',
  'currentcolor',
  'inherit',
  'transparent',
  'context-fill',
  'context-stroke',
]);

const NAMED_HEX: Record<string, string> = {
  white: '#ffffff',
  black: '#000000',
  red: '#ff0000',
  green: '#008000',
  blue: '#0000ff',
  yellow: '#ffff00',
  cyan: '#00ffff',
  magenta: '#ff00ff',
  gray: '#808080',
  grey: '#808080',
  silver: '#c0c0c0',
  maroon: '#800000',
  olive: '#808000',
  lime: '#00ff00',
  aqua: '#00ffff',
  teal: '#008080',
  navy: '#000080',
  fuchsia: '#ff00ff',
  purple: '#800080',
  orange: '#ffa500',
};

/** Expand #rgb → #rrggbb; return lowercase #rrggbb or null if not editable. */
export function colorToPickerHex(raw: string): string | null {
  const v = raw.trim().toLowerCase();
  if (!v || SKIP_COLORS.has(v) || v.startsWith('url(')) return null;

  if (NAMED_HEX[v]) return NAMED_HEX[v];

  const hex3 = /^#([0-9a-f]{3})$/i.exec(v);
  if (hex3) {
    const [r, g, b] = hex3[1].split('');
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  const hex6 = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(v);
  if (hex6) return `#${hex6[1]}`.toLowerCase();

  const rgb = /^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*[0-9.]+\s*)?\)$/i.exec(v);
  if (rgb) {
    const toByte = (n: string) => {
      const num = Number(n);
      if (!Number.isFinite(num)) return null;
      return Math.max(0, Math.min(255, Math.round(num)));
    };
    const r = toByte(rgb[1]);
    const g = toByte(rgb[2]);
    const b = toByte(rgb[3]);
    if (r === null || g === null || b === null) return null;
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  return null;
}

export type SvgColorSwatch = {
  /** Normalized #rrggbb key for the picker */
  hex: string;
  /** Distinct original tokens found in the SVG that map to this hex */
  originals: string[];
};

/**
 * Extract editable fill / stroke / stop-color values (attributes + style declarations).
 */
export function extractSvgColors(svg: string): SvgColorSwatch[] {
  const byHex = new Map<string, Set<string>>();

  const remember = (token: string) => {
    const hex = colorToPickerHex(token);
    if (!hex) return;
    const set = byHex.get(hex) ?? new Set<string>();
    set.add(token.trim());
    byHex.set(hex, set);
  };

  const attrRe = /\b(?:fill|stroke|stop-color)\s*=\s*(["'])(.*?)\1/gi;
  let m: RegExpExecArray | null;
  while ((m = attrRe.exec(svg)) !== null) {
    remember(m[2]);
  }

  const styleRe = /\b(?:fill|stroke|stop-color)\s*:\s*([^;}"']+)/gi;
  while ((m = styleRe.exec(svg)) !== null) {
    remember(m[1].trim());
  }

  return [...byHex.entries()]
    .map(([hex, originals]) => ({
      hex,
      originals: [...originals].sort((a, b) => a.localeCompare(b)),
    }))
    .sort((a, b) => a.hex.localeCompare(b.hex));
}

/** Replace every occurrence of an original color token with a new #rrggbb value. */
export function replaceSvgColor(svg: string, original: string, nextHex: string): string {
  const normalized = colorToPickerHex(nextHex);
  if (!normalized) return svg;
  const target = original.trim();
  if (!target) return svg;

  // Escape for literal replace across the document.
  const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return svg.replace(new RegExp(escaped, 'gi'), normalized);
}

/**
 * Apply a map of normalized hex → new hex across all matching original tokens.
 */
export function applySvgColorMap(
  svg: string,
  map: Record<string, string>,
  swatches: SvgColorSwatch[]
): string {
  let out = svg;
  for (const swatch of swatches) {
    const next = map[swatch.hex];
    if (!next || next.toLowerCase() === swatch.hex.toLowerCase()) continue;
    for (const original of swatch.originals) {
      out = replaceSvgColor(out, original, next);
    }
  }
  return out;
}

/**
 * Ensure an SVG has concrete pixel size for HTML preview.
 * ViewBox-only SVGs often render at 0×0 under max-width/max-height CSS.
 */
export function svgForPreview(svg: string, sizePx = 160): string {
  const openMatch = svg.match(/<svg\b([^>]*)>/i);
  if (!openMatch) return svg;

  const attrs = openMatch[1] ?? '';
  const hasWidth = /\bwidth\s*=/i.test(attrs);
  const hasHeight = /\bheight\s*=/i.test(attrs);
  const sizeStyle = `width:${sizePx}px;height:${sizePx}px;max-width:100%;display:block`;

  if (hasWidth && hasHeight) {
    if (/\bstyle\s*=/i.test(attrs)) {
      return svg.replace(
        /(<svg\b[^>]*\bstyle=")([^"]*)(")/i,
        `$1${sizeStyle};$2$3`
      );
    }
    return svg.replace(
      /<svg\b([^>]*)>/i,
      `<svg$1 style="${sizeStyle}">`
    );
  }

  return svg.replace(
    /<svg\b([^>]*)>/i,
    `<svg$1 width="${sizePx}" height="${sizePx}" style="${sizeStyle}">`
  );
}

function toComponentName(filename: string | null): string {
  const base = (filename ?? 'Icon').replace(/\.svg$/i, '');
  const pascal = base
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');
  return pascal || 'Icon';
}

/** Convert HTML-style SVG attributes to JSX-friendly ones inside the string. */
export function svgToJsxBody(svg: string): string {
  return svg
    .replace(/\sclass=/gi, ' className=')
    .replace(/\sstroke-width=/gi, ' strokeWidth=')
    .replace(/\sstroke-linecap=/gi, ' strokeLinecap=')
    .replace(/\sstroke-linejoin=/gi, ' strokeLinejoin=')
    .replace(/\sstroke-dasharray=/gi, ' strokeDasharray=')
    .replace(/\sstroke-opacity=/gi, ' strokeOpacity=')
    .replace(/\sfill-opacity=/gi, ' fillOpacity=')
    .replace(/\sfill-rule=/gi, ' fillRule=')
    .replace(/\sclip-rule=/gi, ' clipRule=')
    .replace(/\sclip-path=/gi, ' clipPath=')
    .replace(/\sfont-size=/gi, ' fontSize=')
    .replace(/\sfont-family=/gi, ' fontFamily=')
    .replace(/\sstop-color=/gi, ' stopColor=')
    .replace(/\sstop-opacity=/gi, ' stopOpacity=')
    .replace(/\sxlink:href=/gi, ' xlinkHref=');
}

export function svgToReactComponent(svg: string, filename: string | null = null): string {
  const name = toComponentName(filename);
  const jsx = svgToJsxBody(svg);
  // Inject {...props} on root <svg>
  const withProps = jsx.replace(
    /<svg(\s|>)/i,
    (_m, edge: string) =>
      edge === '>'
        ? '<svg {...props}>'
        : '<svg {...props} '
  );

  return `import type { SVGProps } from 'react';

export function ${name}(props: SVGProps<SVGSVGElement>) {
  return (
    ${withProps
      .split('\n')
      .map((line, i) => (i === 0 ? line : `    ${line}`))
      .join('\n')}
  );
}
`;
}

export function svgToVueComponent(svg: string, filename: string | null = null): string {
  const name = toComponentName(filename);
  return `<script setup lang="ts">
defineOptions({ name: '${name}' });
</script>

<template>
  ${svg}
</template>
`;
}

export async function readSvgFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Could not read file as text.'));
    };
    reader.onerror = () => reject(new Error('File read failed.'));
    reader.readAsText(file);
  });
}

/** Trigger a browser download of SVG markup (client-only). */
export function downloadSvgFile(svg: string, filename: string): void {
  const safeName = (filename.trim() || 'icon.svg').replace(/[^\w.\-()+ ]+/g, '_');
  const name = safeName.toLowerCase().endsWith('.svg') ? safeName : `${safeName}.svg`;
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
