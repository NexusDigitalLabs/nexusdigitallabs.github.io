import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

// The shadcn CLI has twice rewritten component imports to `from "cn"` and
// installed the unrelated npm package `cn`. Our helper lives in @/lib/utils.
describe('shadcn cn import guard', () => {
  const root = process.cwd();

  it('does not depend on the npm package "cn"', () => {
    const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
    expect(pkg.dependencies?.cn).toBeUndefined();
    expect(pkg.devDependencies?.cn).toBeUndefined();
  });

  it('ui components import cn from @/lib/utils', () => {
    const dir = path.join(root, 'src/components/ui');
    for (const file of readdirSync(dir)) {
      const src = readFileSync(path.join(dir, file), 'utf8');
      expect(src, file).not.toMatch(/from ["']cn["']/);
    }
  });
});
