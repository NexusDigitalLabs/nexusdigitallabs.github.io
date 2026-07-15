/**
 * Client-side JSON → TypeScript interfaces, Zod schemas, and JSONPath queries.
 * No runtime Zod/Monaco dependencies — outputs are plain text.
 */

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = { [key: string]: JsonValue };

export type JsonEngineTab = 'typescript' | 'zod' | 'jsonpath';

export type ParseJsonResult =
  | { ok: true; value: JsonValue }
  | { ok: false; error: string };

export function parseJsonSafe(raw: string): ParseJsonResult {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, error: 'Paste or type JSON to begin.' };
  try {
    const value = JSON.parse(trimmed) as unknown;
    return { ok: true, value: value as JsonValue };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid JSON';
    return { ok: false, error: message };
  }
}

function isPlainObject(value: JsonValue): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sanitizeIdent(raw: string, fallback: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^(\d)/, '_$1');
  return cleaned || fallback;
}

function toPascalCase(raw: string): string {
  const parts = raw.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  if (parts.length === 0) return 'Root';
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('');
}

function quoteProp(key: string): string {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key) ? key : JSON.stringify(key);
}

type TsTypeCtx = {
  interfaces: Map<string, string>;
  usedNames: Set<string>;
};

function uniqueName(base: string, used: Set<string>): string {
  let name = base;
  let i = 2;
  while (used.has(name)) {
    name = `${base}${i}`;
    i += 1;
  }
  used.add(name);
  return name;
}

function inferTsType(value: JsonValue, nameHint: string, ctx: TsTypeCtx): string {
  if (value === null) return 'null';
  if (typeof value === 'string') return 'string';
  if (typeof value === 'number') return Number.isInteger(value) ? 'number' : 'number';
  if (typeof value === 'boolean') return 'boolean';

  if (Array.isArray(value)) {
    if (value.length === 0) return 'unknown[]';
    const elementTypes = [...new Set(value.map((v) => inferTsType(v, `${nameHint}Item`, ctx)))];
    if (elementTypes.length === 1) return `${elementTypes[0]}[]`;
    return `(${elementTypes.join(' | ')})[]`;
  }

  if (isPlainObject(value)) {
    const ifaceName = uniqueName(toPascalCase(nameHint), ctx.usedNames);
    const lines: string[] = [`export interface ${ifaceName} {`];
    const keys = Object.keys(value);
    if (keys.length === 0) {
      lines.push('  [key: string]: unknown;');
    } else {
      for (const key of keys) {
        const childHint = sanitizeIdent(key, 'Field');
        const childType = inferTsType(value[key], childHint, ctx);
        lines.push(`  ${quoteProp(key)}: ${childType};`);
      }
    }
    lines.push('}');
    ctx.interfaces.set(ifaceName, lines.join('\n'));
    return ifaceName;
  }

  return 'unknown';
}

export function jsonToTypeScript(value: JsonValue, rootName = 'Root'): string {
  const ctx: TsTypeCtx = { interfaces: new Map(), usedNames: new Set() };
  const rootType = inferTsType(value, rootName, ctx);

  if (isPlainObject(value) || Array.isArray(value)) {
    const parts = [...ctx.interfaces.values()];
    if (!isPlainObject(value)) {
      parts.push(`export type ${toPascalCase(rootName)} = ${rootType};`);
    }
    return parts.join('\n\n') || `export type ${toPascalCase(rootName)} = ${rootType};`;
  }

  return `export type ${toPascalCase(rootName)} = ${rootType};`;
}

function inferZod(value: JsonValue, nameHint: string, schemas: Map<string, string>, used: Set<string>): string {
  if (value === null) return 'z.null()';
  if (typeof value === 'string') return 'z.string()';
  if (typeof value === 'number') return 'z.number()';
  if (typeof value === 'boolean') return 'z.boolean()';

  if (Array.isArray(value)) {
    if (value.length === 0) return 'z.array(z.unknown())';
    const elementSchemas = [
      ...new Set(value.map((v) => inferZod(v, `${nameHint}Item`, schemas, used))),
    ];
    if (elementSchemas.length === 1) return `z.array(${elementSchemas[0]})`;
    return `z.array(z.union([${elementSchemas.join(', ')}]))`;
  }

  if (isPlainObject(value)) {
    const schemaName = uniqueName(`${sanitizeIdent(toPascalCase(nameHint), 'Root')}Schema`, used);
    const fields: string[] = [];
    for (const key of Object.keys(value)) {
      const child = inferZod(value[key], sanitizeIdent(key, 'Field'), schemas, used);
      fields.push(`  ${quoteProp(key)}: ${child},`);
    }
    const body = fields.length > 0 ? fields.join('\n') : '  // empty object';
    schemas.set(schemaName, `export const ${schemaName} = z.object({\n${body}\n});`);
    return schemaName;
  }

  return 'z.unknown()';
}

export function jsonToZod(value: JsonValue, rootName = 'Root'): string {
  const schemas = new Map<string, string>();
  const used = new Set<string>();
  const rootExpr = inferZod(value, rootName, schemas, used);
  const header = `import { z } from 'zod';\n`;
  if (schemas.size === 0) {
    return `${header}\nexport const ${sanitizeIdent(toPascalCase(rootName), 'Root')}Schema = ${rootExpr};\n`;
  }
  return `${header}\n${[...schemas.values()].join('\n\n')}\n`;
}

function collectJsonPaths(value: JsonValue, path: string, out: string[]): void {
  out.push(path || '$');

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectJsonPaths(item, `${path}[${index}]`, out);
    });
    return;
  }

  if (isPlainObject(value)) {
    for (const key of Object.keys(value)) {
      const segment = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)
        ? `${path}.${key}`
        : `${path}[${JSON.stringify(key)}]`;
      collectJsonPaths(value[key], segment || `$.${key}`, out);
    }
  }
}

export function jsonToJsonPaths(value: JsonValue): string {
  const paths: string[] = [];
  collectJsonPaths(value, '$', paths);
  const unique = [...new Set(paths)];
  return unique.map((p) => p).join('\n');
}

export function formatJsonPretty(value: JsonValue): string {
  return JSON.stringify(value, null, 2);
}
