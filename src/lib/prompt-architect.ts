/**
 * Prompt Architect — local token estimate + whitespace transforms.
 * Transforms never mutate the source string in place; callers decide where to store results.
 */

export const SAMPLE_PROMPT = `You are an expert software engineer helping with LLM prompt optimisation.





Your goals:



  - Reduce token overhead by 50%+ without losing semantic meaning
  - Prefer concise, structured instructions over prose
  - Preserve all constraints, tools, and safety rules



Context block (intentionally padded):






  Project: NexusDigitalLabs Prompt Architect
  Stack:     TypeScript, React, Next.js





  When the user pastes a system prompt:
      1.   Count approximate tokens
      2. Strip trailing whitespace / excess blank lines
      3.   Report savings







Respond in plain text only. Do not invent APIs.`;

export function estimateTokens(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  // Word / punctuation base (≈ cl100k_base for English)
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
  // Newlines are usually their own BPE tokens — blank-line bloat must count
  // or whitespace transforms would appear to save 0 tokens.
  const newlines = (text.match(/\n/g) || []).length;
  // Runs of 2+ spaces ≈ half a token each (trailing / indent waste)
  const spaceRuns = text.match(/ {2,}/g) || [];
  const excessSpaces = spaceRuns.reduce((n, run) => n + Math.ceil(run.length / 2), 0);
  return Math.max(1, Math.round(count + newlines + excessSpaces * 0.35));
}

export type PromptStats = { chars: number; words: number; lines: number; tokens: number };

export function computeStats(text: string): PromptStats {
  return {
    chars: text.length,
    words: text.trim() === '' ? 0 : text.trim().split(/\s+/).length,
    lines: text === '' ? 0 : text.split('\n').length,
    tokens: estimateTokens(text),
  };
}

/** Collapse multi-spaces, trim each line, reduce 3+ newlines to one blank line. */
export function removeExtraWhitespace(text: string): string {
  return text
    .split('\n')
    .map((l) => l.replace(/ {2,}/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Replace all newlines with spaces and collapse runs of spaces. */
export function flattenToSingleLine(text: string): string {
  return text.replace(/\r\n|\r|\n/g, ' ').replace(/ {2,}/g, ' ').trim();
}

/** Tabs → spaces, trimStart per line, collapse 4+ newlines. */
export function trimAndNormalize(text: string): string {
  return text
    .split('\n')
    .map((l) => l.trimStart().replace(/\t/g, '  '))
    .join('\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
}
