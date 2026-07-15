import { describe, it, expect } from 'vitest';
import {
  parseJsonSafe,
  jsonToTypeScript,
  jsonToZod,
  jsonToJsonPaths,
} from '@/lib/json-engine';
import { optimizeSvg, svgToReactComponent, svgToVueComponent } from '@/lib/svg-studio';
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
