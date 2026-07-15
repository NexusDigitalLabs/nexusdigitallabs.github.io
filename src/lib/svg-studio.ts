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
