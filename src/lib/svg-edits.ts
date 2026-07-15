/**
 * Client-side SVG geometry / text / export edit pipeline.
 */

import {
  applySvgColorMap,
  colorToPickerHex,
  extractSvgColors,
  svgForPreview,
} from '@/lib/svg-studio';

export const SVG_SIZE_PRESETS = [16, 24, 32, 48, 64, 128, 256, 512] as const;

export type SvgEditOptions = {
  /** Force root width/height (px). null = leave source sizes. */
  exportSize: number | null;
  /** Expand/shrink viewBox by this % of its size (negative shrinks). */
  paddingPercent: number;
  rotateDeg: number;
  flipH: boolean;
  flipV: boolean;
  /** Root opacity 0–1 */
  opacity: number;
  /** Absolute stroke-width for every stroked element; null = unchanged */
  strokeWidth: number | null;
  /** Absolute rx/ry on every <rect>; null = unchanged */
  cornerRadius: number | null;
  /** Convert solid fills to stroke outlines */
  outlineMode: boolean;
  /** Round path command numbers to N decimals; null = unchanged */
  pathPrecision: number | null;
  /** Exact text node content replacements */
  textReplacements: Record<string, string>;
};

export const DEFAULT_SVG_EDITS: SvgEditOptions = {
  exportSize: null,
  paddingPercent: 0,
  rotateDeg: 0,
  flipH: false,
  flipV: false,
  opacity: 1,
  strokeWidth: null,
  cornerRadius: null,
  outlineMode: false,
  pathPrecision: null,
  textReplacements: {},
};

export function editsAreActive(edits: SvgEditOptions): boolean {
  return (
    edits.exportSize !== null ||
    edits.paddingPercent !== 0 ||
    edits.rotateDeg !== 0 ||
    edits.flipH ||
    edits.flipV ||
    edits.opacity !== 1 ||
    edits.strokeWidth !== null ||
    edits.cornerRadius !== null ||
    edits.outlineMode ||
    edits.pathPrecision !== null ||
    Object.keys(edits.textReplacements).length > 0
  );
}

/** Unique non-whitespace text contents inside <text>…</text>. */
export function extractSvgTexts(svg: string): string[] {
  const found = new Set<string>();
  const re = /<text\b[^>]*>([\s\S]*?)<\/text>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(svg)) !== null) {
    const text = m[1].replace(/<[^>]+>/g, '').trim();
    if (text) found.add(text);
  }
  return [...found];
}

function parseViewBox(attrs: string): { minX: number; minY: number; width: number; height: number } | null {
  const m = /\bviewBox\s*=\s*(["'])([^"']+)\1/i.exec(attrs);
  if (!m) return null;
  const parts = m[2].trim().split(/[\s,]+/).map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return null;
  return { minX: parts[0], minY: parts[1], width: parts[2], height: parts[3] };
}

function setOrReplaceAttr(tagOpen: string, name: string, value: string): string {
  const re = new RegExp(`\\s${name}\\s*=\\s*(["'][^"']*["'])`, 'i');
  if (re.test(tagOpen)) {
    return tagOpen.replace(re, ` ${name}="${value}"`);
  }
  return tagOpen.replace(/\/?>$/, (end) => ` ${name}="${value}"${end}`);
}

function removeAttr(tagOpen: string, name: string): string {
  return tagOpen.replace(new RegExp(`\\s${name}\\s*=\\s*(["'][^"']*["'])`, 'i'), '');
}

function applyTextReplacements(svg: string, map: Record<string, string>): string {
  let out = svg;
  for (const [from, to] of Object.entries(map)) {
    if (!from || from === to) continue;
    out = out.replace(
      /(<text\b[^>]*>)([\s\S]*?)(<\/text>)/gi,
      (full, open: string, inner: string, close: string) => {
        if (inner.replace(/<[^>]+>/g, '').trim() !== from) return full;
        return `${open}${to}${close}`;
      }
    );
  }
  return out;
}

function applyCornerRadius(svg: string, radius: number): string {
  const r = Math.max(0, radius);
  return svg.replace(/<rect\b[^>]*\/?>/gi, (tag) => {
    let next = setOrReplaceAttr(tag, 'rx', String(r));
    next = setOrReplaceAttr(next, 'ry', String(r));
    return next;
  });
}

function applyStrokeWidth(svg: string, width: number): string {
  const w = Math.max(0, width);
  let out = svg.replace(/\bstroke-width\s*=\s*(["'])[^"']*\1/gi, `stroke-width="${w}"`);
  out = out.replace(/<([a-zA-Z]+)(\s[^>]*?\bstroke\s*=\s*(["'](?!none)[^"']*["'])[^>]*?)(\/?)>/gi, (full, name, attrs, _stroke, slash) => {
    if (/\bstroke-width\s*=/i.test(attrs)) return full;
    return `<${name}${attrs} stroke-width="${w}"${slash}>`;
  });
  return out;
}

function applyOutlineMode(svg: string): string {
  return svg.replace(/<([a-zA-Z]+)(\s[^>]*?)(\/?)>/gi, (full, name: string, attrs: string, slash: string) => {
    if (/^(svg|g|defs|clipPath|mask|linearGradient|radialGradient|stop|title|desc|metadata|style|script)$/i.test(name)) {
      return full;
    }
    const fillM = /\bfill\s*=\s*(["'])(.*?)\1/i.exec(attrs);
    if (!fillM) return full;
    const fillVal = fillM[2].trim();
    if (!fillVal || fillVal.toLowerCase() === 'none') return full;

    let tag = `<${name}${attrs}${slash}>`;
    tag = setOrReplaceAttr(tag, 'stroke', fillVal);
    tag = setOrReplaceAttr(tag, 'fill', 'none');
    if (!/\bstroke-width\s*=/i.test(tag)) {
      tag = setOrReplaceAttr(tag, 'stroke-width', '2');
    }
    return tag;
  });
}

function applyPathPrecision(svg: string, decimals: number): string {
  const d = Math.max(0, Math.min(8, Math.floor(decimals)));
  return svg.replace(/\bd\s*=\s*(["'])([\s\S]*?)\1/gi, (_full, quote: string, path: string) => {
    const next = path.replace(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi, (num) => {
      const n = Number(num);
      if (!Number.isFinite(n)) return num;
      return String(Number(n.toFixed(d)));
    });
    return `d=${quote}${next}${quote}`;
  });
}

function applyViewBoxPadding(svg: string, paddingPercent: number): string {
  if (paddingPercent === 0) return svg;
  return svg.replace(/<svg\b([^>]*)>/i, (full, attrs: string) => {
    const vb = parseViewBox(attrs);
    if (!vb || vb.width <= 0 || vb.height <= 0) return full;
    const padX = (vb.width * paddingPercent) / 100;
    const padY = (vb.height * paddingPercent) / 100;
    const next = `${vb.minX - padX} ${vb.minY - padY} ${vb.width + padX * 2} ${vb.height + padY * 2}`;
    const withVb = setOrReplaceAttr(`<svg${attrs}>`, 'viewBox', next);
    return withVb;
  });
}

function applyRootOpacity(svg: string, opacity: number): string {
  const o = Math.max(0, Math.min(1, opacity));
  if (o === 1) {
    return svg.replace(/<svg\b([^>]*)>/i, (full, attrs: string) => {
      if (!/\bopacity\s*=/i.test(attrs)) return full;
      return removeAttr(`<svg${attrs}>`, 'opacity');
    });
  }
  return svg.replace(/<svg\b([^>]*)>/i, (_full, attrs: string) =>
    setOrReplaceAttr(`<svg${attrs}>`, 'opacity', String(o))
  );
}

function applyExportSize(svg: string, size: number): string {
  const s = Math.max(1, Math.round(size));
  return svg.replace(/<svg\b([^>]*)>/i, (_full, attrs: string) => {
    let tag = setOrReplaceAttr(`<svg${attrs}>`, 'width', String(s));
    tag = setOrReplaceAttr(tag, 'height', String(s));
    return tag;
  });
}

function applyTransforms(
  svg: string,
  rotateDeg: number,
  flipH: boolean,
  flipV: boolean
): string {
  if (rotateDeg === 0 && !flipH && !flipV) return svg;

  const open = svg.match(/<svg\b([^>]*)>/i);
  if (!open) return svg;
  const vb = parseViewBox(open[1] ?? '') ?? { minX: 0, minY: 0, width: 100, height: 100 };
  const cx = vb.minX + vb.width / 2;
  const cy = vb.minY + vb.height / 2;
  const sx = flipH ? -1 : 1;
  const sy = flipV ? -1 : 1;
  const parts = [
    `translate(${cx} ${cy})`,
    rotateDeg !== 0 ? `rotate(${rotateDeg})` : '',
    sx !== 1 || sy !== 1 ? `scale(${sx} ${sy})` : '',
    `translate(${-cx} ${-cy})`,
  ].filter(Boolean);
  const transform = parts.join(' ');

  return svg.replace(/<svg\b([^>]*)>([\s\S]*)<\/svg>/i, (_full, attrs: string, inner: string) => {
    return `<svg${attrs}><g transform="${transform}">${inner}</g></svg>`;
  });
}

/** Run the full non-color edit pipeline. */
export function applySvgEdits(svg: string, edits: SvgEditOptions): string {
  let out = svg;
  out = applyTextReplacements(out, edits.textReplacements);
  if (edits.cornerRadius !== null) out = applyCornerRadius(out, edits.cornerRadius);
  if (edits.strokeWidth !== null) out = applyStrokeWidth(out, edits.strokeWidth);
  if (edits.outlineMode) out = applyOutlineMode(out);
  if (edits.pathPrecision !== null) out = applyPathPrecision(out, edits.pathPrecision);
  out = applyViewBoxPadding(out, edits.paddingPercent);
  out = applyTransforms(out, edits.rotateDeg, edits.flipH, edits.flipV);
  out = applyRootOpacity(out, edits.opacity);
  if (edits.exportSize !== null) out = applyExportSize(out, edits.exportSize);
  return out;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = colorToPickerHex(hex);
  if (!h) return null;
  return {
    r: parseInt(h.slice(1, 3), 16),
    g: parseInt(h.slice(3, 5), 16),
    b: parseInt(h.slice(5, 7), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${clamp(r).toString(16).padStart(2, '0')}${clamp(g).toString(16).padStart(2, '0')}${clamp(b).toString(16).padStart(2, '0')}`;
}

/** Invert perceived lightness (HSL L) for a dark/light pair. */
export function invertHexLightness(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      default: h = ((r - g) / d + 4) / 6; break;
    }
  }
  const l2 = 1 - l;
  const C = (1 - Math.abs(2 * l2 - 1)) * s;
  const X = C * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = l2 - C / 2;
  let r1 = 0, g1 = 0, b1 = 0;
  const H = h * 6;
  if (H < 1) [r1, g1, b1] = [C, X, 0];
  else if (H < 2) [r1, g1, b1] = [X, C, 0];
  else if (H < 3) [r1, g1, b1] = [0, C, X];
  else if (H < 4) [r1, g1, b1] = [0, X, C];
  else if (H < 5) [r1, g1, b1] = [X, 0, C];
  else [r1, g1, b1] = [C, 0, X];
  return rgbToHex((r1 + m) * 255, (g1 + m) * 255, (b1 + m) * 255);
}

/** Produce a lightness-inverted color variant of the SVG. */
export function invertSvgColors(svg: string): string {
  const swatches = extractSvgColors(svg);
  const map: Record<string, string> = {};
  for (const s of swatches) {
    map[s.hex] = invertHexLightness(s.hex);
  }
  return applySvgColorMap(svg, map, swatches);
}

export function downloadBlobFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Rasterize SVG to PNG and trigger download (browser only). */
export async function downloadSvgAsPng(
  svg: string,
  filename: string,
  sizePx: number
): Promise<void> {
  const size = Math.max(16, Math.round(sizePx));
  const prepared = svgForPreview(
    applyExportSizeLocal(svg, size),
    size
  );

  const blobSvg = new Blob([prepared], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blobSvg);

  try {
    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas unavailable'));
            return;
          }
          ctx.clearRect(0, 0, size, size);
          ctx.drawImage(img, 0, 0, size, size);
          canvas.toBlob((b) => {
            if (!b) reject(new Error('PNG encode failed'));
            else resolve(b);
          }, 'image/png');
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('SVG rasterize failed'));
      img.src = url;
    });

    const safe = (filename.trim() || 'icon').replace(/\.svg$/i, '').replace(/[^\w.\-()+ ]+/g, '_');
    downloadBlobFile(pngBlob, `${safe}-${size}.png`);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function applyExportSizeLocal(svg: string, size: number): string {
  return applyExportSize(svg, size);
}
