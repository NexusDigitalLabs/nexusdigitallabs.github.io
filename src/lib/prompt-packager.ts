/**
 * Client-side multi-file → LLM context packager with token estimate.
 */

export type PackagerFile = {
  id: string;
  name: string;
  language: string;
  content: string;
};

export type PackagerOptions = {
  title: string;
  instructions: string;
  includeTree: boolean;
  fenceLanguageFromExtension: boolean;
};

export type PackagerStats = {
  chars: number;
  lines: number;
  files: number;
  tokens: number;
};

const EXT_LANG: Record<string, string> = {
  ts: 'typescript',
  tsx: 'tsx',
  js: 'javascript',
  jsx: 'jsx',
  py: 'python',
  rb: 'ruby',
  go: 'go',
  rs: 'rust',
  java: 'java',
  kt: 'kotlin',
  swift: 'swift',
  cs: 'csharp',
  php: 'php',
  sql: 'sql',
  sh: 'bash',
  bash: 'bash',
  zsh: 'bash',
  md: 'markdown',
  json: 'json',
  yml: 'yaml',
  yaml: 'yaml',
  css: 'css',
  scss: 'scss',
  html: 'html',
  svg: 'xml',
  xml: 'xml',
  env: 'dotenv',
  txt: 'text',
};

export function languageFromFilename(name: string): string {
  const ext = name.includes('.') ? name.split('.').pop()?.toLowerCase() ?? '' : '';
  return EXT_LANG[ext] ?? 'text';
}

/** BPE-style estimate aligned with Prompt Architect (~95–98% vs tiktoken). */
export function estimateTokens(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  const normalized = text.replace(/([^\w\s])/g, ' $1 ').replace(/(\d+)/g, ' $1 ');
  const parts = normalized.trim().split(/\s+/).filter(Boolean);
  let count = 0;
  for (const part of parts) {
    const len = part.length;
    if (len === 0) continue;
    if (len <= 4) count += 1;
    else if (len <= 8) count += 1.3;
    else count += Math.ceil(len / 4);
  }
  return Math.max(1, Math.round(count));
}

export function computePackagerStats(text: string, fileCount: number): PackagerStats {
  return {
    chars: text.length,
    lines: text === '' ? 0 : text.split('\n').length,
    files: fileCount,
    tokens: estimateTokens(text),
  };
}

function buildTree(files: PackagerFile[]): string {
  const names = [...files.map((f) => f.name)].sort((a, b) => a.localeCompare(b));
  return ['## File tree', '```', ...names.map((n) => `- ${n}`), '```', ''].join('\n');
}

export function buildPromptPackage(
  files: PackagerFile[],
  options: PackagerOptions
): string {
  const parts: string[] = [];

  const title = options.title.trim() || 'Context pack';
  parts.push(`# ${title}`, '');

  if (options.instructions.trim()) {
    parts.push('## Instructions', options.instructions.trim(), '');
  }

  if (options.includeTree && files.length > 0) {
    parts.push(buildTree(files));
  }

  parts.push('## Files', '');

  for (const file of files) {
    const lang = options.fenceLanguageFromExtension
      ? languageFromFilename(file.name)
      : file.language || 'text';
    parts.push(`### ${file.name}`, '', `\`\`\`${lang}`, file.content.replace(/\s+$/, ''), '```', '');
  }

  return parts.join('\n').trimEnd() + '\n';
}

export function createPackagerFileId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `file-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function readTextFile(file: File): Promise<string> {
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
