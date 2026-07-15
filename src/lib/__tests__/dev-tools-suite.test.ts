import { describe, it, expect, vi } from 'vitest';
import {
  parseJsonSafe,
  jsonToTypeScript,
  jsonToZod,
  jsonToJsonPaths,
} from '@/lib/json-engine';
import {
  applySvgColorMap,
  colorToPickerHex,
  downloadSvgFile,
  extractSvgColors,
  optimizeSvg,
  svgForPreview,
  svgToReactComponent,
  svgToVueComponent,
} from '@/lib/svg-studio';
import { formatEnv } from '@/lib/env-formatter';
import {
  buildPromptPackage,
  estimateTokens,
  languageFromFilename,
} from '@/lib/prompt-packager';

describe('json-engine', () => {
  it('parses valid JSON and rejects invalid', () => {
    expect(parseJsonSafe('{"a":1}').ok).toBe(true);
    expect(parseJsonSafe('{').ok).toBe(false);
  });

  it('emits TypeScript interfaces for nested objects', () => {
    const parsed = parseJsonSafe('{"user":{"id":1,"name":"Ada"},"tags":["a","b"]}');
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const ts = jsonToTypeScript(parsed.value);
    expect(ts).toContain('export interface');
    expect(ts).toContain('user:');
    expect(ts).toContain('tags:');
  });

  it('emits Zod import and schema', () => {
    const parsed = parseJsonSafe('{"ok":true}');
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const zod = jsonToZod(parsed.value);
    expect(zod).toContain("import { z } from 'zod'");
    expect(zod).toContain('z.object');
  });

  it('lists JSONPath entries', () => {
    const parsed = parseJsonSafe('{"a":{"b":2}}');
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const paths = jsonToJsonPaths(parsed.value);
    expect(paths).toContain('$');
    expect(paths).toContain('$.a');
    expect(paths).toContain('$.a.b');
  });
});

describe('svg-studio', () => {
  it('rejects non-svg', () => {
    expect(optimizeSvg('<div/>').ok).toBe(false);
  });

  it('strips junk attributes and empty metadata', () => {
    const raw =
      '<svg inkscape:version="1"><metadata>x</metadata><g></g><circle cx="1" cy="1" r="1"/></svg>';
    const result = optimizeSvg(raw);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.optimized).not.toContain('inkscape');
    expect(result.optimized).not.toContain('metadata');
    expect(result.optimized).toContain('circle');
    expect(result.optimized).toContain('xmlns=');
  });

  it('builds React and Vue components', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>';
    expect(svgToReactComponent(svg, 'logo.svg')).toContain('export function Logo');
    expect(svgToReactComponent(svg, 'logo.svg')).toContain('{...props}');
    expect(svgToVueComponent(svg, 'logo.svg')).toContain('defineOptions');
    expect(svgToVueComponent(svg, 'logo.svg')).toContain('<template>');
  });

  it('adds concrete size for viewBox-only preview SVGs', () => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#2563eb"/><text x="50" y="66" fill="#fff">N</text></svg>';
    const preview = svgForPreview(svg, 160);
    expect(preview).toContain('width="160"');
    expect(preview).toContain('height="160"');
    expect(preview).toContain('>N</text>');
  });

  it('extracts and remaps fill colors including short hex', () => {
    const svg =
      '<svg viewBox="0 0 100 100"><rect fill="#2563eb"/><text fill="#fff">N</text></svg>';
    expect(colorToPickerHex('#fff')).toBe('#ffffff');
    const swatches = extractSvgColors(svg);
    expect(swatches.map((s) => s.hex).sort()).toEqual(['#2563eb', '#ffffff']);
    const remapped = applySvgColorMap(
      svg,
      { '#2563eb': '#ef4444', '#ffffff': '#111111' },
      swatches
    );
    expect(remapped).toContain('fill="#ef4444"');
    expect(remapped).toContain('fill="#111111"');
    expect(remapped).not.toContain('#2563eb');
  });

  it('downloadSvgFile creates an object URL download (jsdom smoke)', () => {
    const createObjectURL = vi.fn(() => 'blob:mock');
    const revokeObjectURL = vi.fn();
    const click = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL });
    const originalCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreate(tag);
      if (tag === 'a') {
        Object.defineProperty(el, 'click', { value: click });
      }
      return el;
    });

    downloadSvgFile('<svg xmlns="http://www.w3.org/2000/svg"/>', 'mark');
    expect(createObjectURL).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalled();
  });
});

describe('env-formatter', () => {
  it('sorts keys, quotes spaced values, and drops duplicate keys keeping last', () => {
    const result = formatEnv('B=1\nA=hello world\nB=2\n');
    expect(result.cleaned).toContain('A="hello world"');
    expect(result.cleaned.indexOf('A=')).toBeLessThan(result.cleaned.indexOf('B='));
    expect(result.cleaned).toMatch(/B=2/);
    expect(result.removedDuplicates).toContain('B');
  });

  it('flags invalid keys', () => {
    const result = formatEnv('1BAD=x');
    expect(result.issues.some((i) => i.severity === 'error')).toBe(true);
    expect(result.entries.length).toBe(0);
  });
});

describe('prompt-packager', () => {
  it('maps extensions to fence languages', () => {
    expect(languageFromFilename('a.tsx')).toBe('tsx');
    expect(languageFromFilename('x.env')).toBe('dotenv');
  });

  it('estimates tokens and builds structured package', () => {
    expect(estimateTokens('hello world')).toBeGreaterThan(0);
    const out = buildPromptPackage(
      [{ id: '1', name: 'a.ts', language: 'typescript', content: ' cons t x = 1; ' }],
      {
        title: 'Review',
        instructions: 'Find bugs',
        includeTree: true,
        fenceLanguageFromExtension: true,
      }
    );
    expect(out).toContain('# Review');
    expect(out).toContain('## Instructions');
    expect(out).toContain('## File tree');
    expect(out).toContain('### a.ts');
    expect(out).toContain('```typescript');
  });
});
