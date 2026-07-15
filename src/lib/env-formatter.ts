/**
 * Client-side .env parser / formatter.
 */

export type EnvIssueSeverity = 'error' | 'warning' | 'info';

export type EnvIssue = {
  line: number;
  severity: EnvIssueSeverity;
  message: string;
};

export type EnvEntry = {
  key: string;
  value: string;
  quoted: boolean;
  originalLine: number;
};

export type EnvFormatResult = {
  cleaned: string;
  entries: EnvEntry[];
  issues: EnvIssue[];
  removedDuplicates: string[];
};

const KEY_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;

function stripInlineComment(valuePart: string): string {
  // Do not strip # inside quotes
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < valuePart.length; i += 1) {
    const ch = valuePart[i];
    const prev = i > 0 ? valuePart[i - 1] : '';
    if (ch === "'" && !inDouble && prev !== '\\') inSingle = !inSingle;
    if (ch === '"' && !inSingle && prev !== '\\') inDouble = !inDouble;
    if (ch === '#' && !inSingle && !inDouble) {
      return valuePart.slice(0, i).trimEnd();
    }
  }
  return valuePart;
}

function parseValue(raw: string): { value: string; quoted: boolean } {
  const v = raw.trim();
  if (
    (v.startsWith('"') && v.endsWith('"') && v.length >= 2) ||
    (v.startsWith("'") && v.endsWith("'") && v.length >= 2)
  ) {
    return { value: v.slice(1, -1), quoted: true };
  }
  return { value: v, quoted: false };
}

function needsQuotes(value: string): boolean {
  return /[\s#"'`$\\]/.test(value) || value === '';
}

function formatValue(value: string, forceQuote: boolean): string {
  if (forceQuote || needsQuotes(value)) {
    const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `"${escaped}"`;
  }
  return value;
}

export function formatEnv(raw: string): EnvFormatResult {
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  const issues: EnvIssue[] = [];
  const byKey = new Map<string, EnvEntry>();
  const removedDuplicates: string[] = [];

  lines.forEach((line, index) => {
    const lineNo = index + 1;
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) return;

    if (!trimmed.includes('=')) {
      issues.push({
        line: lineNo,
        severity: 'error',
        message: 'Line is missing "=" separator.',
      });
      return;
    }

    const eqIndex = trimmed.indexOf('=');
    const keyRaw = trimmed.slice(0, eqIndex);
    const valueRaw = trimmed.slice(eqIndex + 1);

    if (/^\s|\s$/.test(keyRaw) || keyRaw !== keyRaw.trim()) {
      issues.push({
        line: lineNo,
        severity: 'warning',
        message: 'Whitespace around key or before "=" — will be normalized.',
      });
    }
    if (/^\s/.test(valueRaw) && !valueRaw.trimStart().startsWith('"') && !valueRaw.trimStart().startsWith("'")) {
      issues.push({
        line: lineNo,
        severity: 'warning',
        message: 'Space after "=" — will be trimmed unless the value is quoted.',
      });
    }

    const key = keyRaw.trim();
    if (!KEY_RE.test(key)) {
      issues.push({
        line: lineNo,
        severity: 'error',
        message: `Invalid key "${key}". Use letters, digits, and underscore; must not start with a digit.`,
      });
      return;
    }

    const valuePart = stripInlineComment(valueRaw);
    const { value, quoted } = parseValue(valuePart);

    if (!quoted && /\s/.test(value)) {
      issues.push({
        line: lineNo,
        severity: 'warning',
        message: `Value for ${key} contains spaces and was unquoted — will be quoted in output.`,
      });
    }

    if (byKey.has(key)) {
      removedDuplicates.push(key);
      issues.push({
        line: lineNo,
        severity: 'info',
        message: `Duplicate key "${key}" — later declaration wins.`,
      });
    }

    byKey.set(key, {
      key,
      value,
      quoted: quoted || needsQuotes(value),
      originalLine: lineNo,
    });
  });

  const entries = [...byKey.values()].sort((a, b) =>
    a.key.localeCompare(b.key, 'en', { sensitivity: 'base' })
  );

  const cleaned = entries
    .map((e) => `${e.key}=${formatValue(e.value, e.quoted)}`)
    .join('\n');

  const finalBlock = cleaned ? `${cleaned}\n` : '';

  return {
    cleaned: finalBlock,
    entries,
    issues,
    removedDuplicates: [...new Set(removedDuplicates)],
  };
}
