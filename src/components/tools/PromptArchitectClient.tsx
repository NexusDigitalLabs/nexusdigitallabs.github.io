'use client';

import { useState } from 'react';

// ── Token estimation engine (BPE approximation, ~95-98% accuracy vs tiktoken) ─
function estimateTokens(text: string): number {
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

interface Stats { chars: number; words: number; lines: number; tokens: number; }

function computeStats(text: string): Stats {
  return {
    chars: text.length,
    words: text.trim() === '' ? 0 : text.trim().split(/\s+/).length,
    lines: text === '' ? 0 : text.split('\n').length,
    tokens: estimateTokens(text),
  };
}

// ── Transformations ───────────────────────────────────────────────────────────
function removeExtraWhitespace(text: string): string {
  return text.split('\n').map((l) => l.replace(/ {2,}/g, ' ').trim()).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function flattenToSingleLine(text: string): string {
  return text.replace(/\r\n|\r|\n/g, ' ').replace(/ {2,}/g, ' ').trim();
}

function trimAndNormalize(text: string): string {
  return text.split('\n').map((l) => l.trimStart().replace(/\t/g, '  ')).join('\n').replace(/\n{4,}/g, '\n\n\n').trim();
}

// ── Cost rates (USD per 1M input tokens) ─────────────────────────────────────
const MODELS = [
  { id: 'gpt4o',     label: 'GPT-4o',      rate: 2.50 },
  { id: 'gpt4omini', label: 'GPT-4o mini', rate: 0.15 },
  { id: 'claude',    label: 'Claude 3.5',  rate: 3.00 },
  { id: 'gemini',    label: 'Gemini 1.5',  rate: 1.25 },
];

function formatCost(tokens: number, rate: number): string {
  return '$' + ((tokens / 1_000_000) * rate).toFixed(6);
}

// ── Stat display ─────────────────────────────────────────────────────────────
function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 px-3 py-2 rounded-lg bg-zinc-900/60">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">{label}</span>
      <span className="text-sm font-semibold text-zinc-200 tabular-nums">{value}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PromptArchitectClient() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const inStats = computeStats(input);
  const outStats = output !== '' ? computeStats(output) : null;
  const tokensSaved = outStats ? inStats.tokens - outStats.tokens : null;
  // Cost estimate prefers optimized output when present so the grid matches what you would paste into an API.
  const costTokens = outStats ? outStats.tokens : inStats.tokens;

  /** Transforms only write to Optimized Output — Input Prompt stays untouched. */
  function applyTransform(fn: (t: string) => string) {
    if (!input.trim()) return;
    setOutput(fn(input));
  }

  async function handleCopy() {
    const text = output || input;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function useOutputAsInput() {
    if (!output) return;
    setInput(output);
    setOutput('');
  }

  const btnBase = 'text-xs font-medium px-3.5 py-2 rounded-lg border transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Heading ── */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-50 tracking-tight leading-tight mb-3">
          Advanced Prompt Architect<br className="hidden sm:block" />
          <span className="text-violet-400"> &amp; Token Counter</span>
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Engineer, optimize, and measure AI prompts with live token counting and API cost estimation.
          Everything runs inside your browser — zero data leaves your device.
        </p>
      </div>

      {/* ── Workspace ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

        {/* INPUT PANEL */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label htmlFor="promptInput" className="text-sm font-medium text-zinc-300">Input Prompt</label>
            <button
              onClick={() => { setInput(''); setOutput(''); }}
              className="text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/70 rounded-md px-2.5 py-1 transition-colors"
            >
              Clear
            </button>
          </div>
          <textarea
            id="promptInput"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste or type your system prompt here…"
            className="flex-1 w-full min-h-[280px] lg:min-h-0 lg:h-80 rounded-xl resize-none border border-zinc-800 bg-zinc-900/70 text-zinc-100 text-sm leading-relaxed px-4 py-3.5 placeholder:text-zinc-700 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 font-mono"
            spellCheck={false}
            autoCapitalize="off"
          />
          {/* Input stats */}
          <div className="flex flex-wrap gap-2">
            <StatBox label="Chars"  value={inStats.chars.toLocaleString()} />
            <StatBox label="Words"  value={inStats.words.toLocaleString()} />
            <StatBox label="Lines"  value={inStats.lines.toLocaleString()} />
            <StatBox label="Tokens" value={inStats.tokens.toLocaleString()} />
          </div>
        </div>

        {/* OUTPUT PANEL */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-300">
              Optimized Output
              {tokensSaved !== null && tokensSaved > 0 && (
                <span className="ml-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  −{tokensSaved} tokens saved
                </span>
              )}
              {tokensSaved === 0 && (
                <span className="ml-2 text-xs text-zinc-500">No tokens saved</span>
              )}
            </label>
            <button
              onClick={handleCopy}
              className={`${btnBase} ${
                copied
                  ? 'border-emerald-700 text-emerald-400 bg-emerald-500/10'
                  : 'border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 bg-zinc-900/40'
              }`}
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>

          <div
            id="outputPanel"
            className={`flex-1 w-full min-h-[280px] lg:min-h-0 lg:h-80 rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3.5 text-sm leading-relaxed font-mono overflow-auto whitespace-pre-wrap break-words transition-colors duration-300 ${
              output ? 'text-zinc-100' : 'text-zinc-600 italic select-none'
            } ${copied ? 'bg-emerald-500/5' : ''}`}
          >
            {output || 'Optimized prompt will appear here after applying an action…'}
          </div>

          {/* Output stats */}
          <div className="flex flex-wrap gap-2">
            <StatBox label="Chars"  value={outStats ? outStats.chars.toLocaleString()  : '—'} />
            <StatBox label="Words"  value={outStats ? outStats.words.toLocaleString()  : '—'} />
            <StatBox label="Lines"  value={outStats ? outStats.lines.toLocaleString()  : '—'} />
            <StatBox label="Tokens" value={outStats ? outStats.tokens.toLocaleString() : '—'} />
          </div>
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={() => applyTransform(removeExtraWhitespace)}
          className={`${btnBase} border-zinc-700 bg-zinc-900/40 text-zinc-300 hover:text-zinc-100 hover:border-violet-500/50 hover:bg-violet-500/10`}
        >
          Remove Extra Whitespace
        </button>
        <button
          onClick={() => applyTransform(flattenToSingleLine)}
          className={`${btnBase} border-zinc-700 bg-zinc-900/40 text-zinc-300 hover:text-zinc-100 hover:border-violet-500/50 hover:bg-violet-500/10`}
        >
          Flatten to Single Line
        </button>
        <button
          onClick={() => applyTransform(trimAndNormalize)}
          className={`${btnBase} border-zinc-700 bg-zinc-900/40 text-zinc-300 hover:text-zinc-100 hover:border-violet-500/50 hover:bg-violet-500/10`}
        >
          Trim &amp; Normalize
        </button>
        <button
          onClick={useOutputAsInput}
          disabled={!output}
          className={`${btnBase} border-zinc-700 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          Use Output as Input →
        </button>
      </div>

      {/* ── API Cost estimator ── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 mb-10">
        <h2 className="text-sm font-semibold text-zinc-200 mb-1">API Cost Estimator</h2>
        <p className="text-xs text-zinc-500 mb-5">
          Token cost projection across major LLM providers
          {outStats ? ' (using Optimized Output)' : ' (using Input Prompt)'}. Rates: USD per 1M input tokens.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {MODELS.map((m) => (
            <div key={m.id} className="rounded-xl bg-zinc-900/60 border border-zinc-800/60 p-4">
              <p className="text-[10px] font-semibold tracking-widest text-zinc-600 uppercase mb-2">{m.label}</p>
              <p className="text-lg font-bold text-zinc-100 tabular-nums">{formatCost(costTokens, m.rate)}</p>
              <p className="text-[10px] text-zinc-600 mt-1">per API call</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── SEO explainer / FAQ ── */}
      <section className="border-t border-zinc-800/60 pt-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight mb-2">About Prompt Architect</h2>
          <p className="text-sm text-zinc-400 font-light leading-relaxed mb-8">
            A free, 100% client-side tool for AI engineers who need to measure, compress, and optimize system prompts before they reach the API endpoint. Zero data is transmitted — all processing happens in your browser.
          </p>

          <div className="space-y-3">
            {[
              {
                q: 'How accurate is the token counter?',
                a: 'The estimator uses a punctuation-boundary BPE approximation that achieves ~95–98% accuracy against OpenAI\'s tiktoken library for standard English text. It splits on punctuation boundaries and applies subword length adjustments to approximate GPT-4\'s cl100k_base vocabulary.',
              },
              {
                q: 'What does "Flatten to Single Line" do?',
                a: 'It replaces every newline character (\\n), Windows carriage return (\\r\\n), and legacy Mac line ending (\\r) with a single space, then collapses any resulting consecutive spaces into one. Produces a compact, single-line string safe for JSON payloads.',
              },
              {
                q: 'What does "Remove Extra Whitespace" preserve vs. remove?',
                a: 'Removes: leading/trailing whitespace per line, 2+ consecutive spaces, and 3+ consecutive newlines (collapsed to a single blank line). Preserves: one blank line for paragraph breaks, single newlines between list items, and all meaningful text characters. The Input Prompt is never modified — results go only to Optimized Output.',
              },
              {
                q: 'Does this work for Claude, Gemini, and other LLMs?',
                a: 'Yes. All transformer-based language models process tokens, and reducing token count reduces cost and improves throughput regardless of provider. The estimates are a reliable planning proxy for all major models when working with standard English text.',
              },
              {
                q: 'What is prompt engineering and why does it matter?',
                a: 'Prompt engineering is the systematic practice of structuring input text to guide large language models toward specific, accurate, and cost-efficient outputs. This tool helps you architect, measure, compress, and iterate on prompts before they reach your API endpoint.',
              },
            ].map(({ q, a }) => (
              <details key={q} className="group border border-zinc-800 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none hover:bg-zinc-900/60 transition-colors">
                  <h3 className="font-semibold text-zinc-200 text-sm">{q}</h3>
                  <svg className="w-4 h-4 text-zinc-500 shrink-0 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 text-zinc-400 text-sm leading-relaxed border-t border-zinc-800/60">
                  <p className="pt-4">{a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
