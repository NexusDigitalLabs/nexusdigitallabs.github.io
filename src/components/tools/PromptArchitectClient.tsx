'use client';

import { useState } from 'react';
import {
  SAMPLE_PROMPT,
  computeStats,
  flattenToSingleLine,
  removeExtraWhitespace,
  trimAndNormalize,
} from '@/lib/prompt-architect';

const MODELS = [
  { id: 'gpt4o', label: 'GPT-4o', rate: 2.50 },
  { id: 'gpt4omini', label: 'GPT-4o mini', rate: 0.15 },
  { id: 'claude', label: 'Claude 3.5', rate: 3.00 },
  { id: 'gemini', label: 'Gemini 1.5', rate: 1.25 },
];

function formatCost(tokens: number, rate: number): string {
  return '$' + ((tokens / 1_000_000) * rate).toFixed(6);
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 px-3 py-2 rounded-lg bg-zinc-900/60">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">{label}</span>
      <span className="text-sm font-semibold text-zinc-200 tabular-nums">{value}</span>
    </div>
  );
}

export default function PromptArchitectClient() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const inStats = computeStats(input);
  const outStats = output !== '' ? computeStats(output) : null;
  const tokensSaved = outStats ? inStats.tokens - outStats.tokens : null;
  const costTokens = outStats ? outStats.tokens : inStats.tokens;

  /**
   * IMPORTANT: transforms never call setInput.
   * Only Clear / Load sample / "Use Output as Input" may change the left panel.
   */
  function applyTransform(fn: (t: string) => string) {
    const source = input;
    if (!source.trim()) return;
    const next = fn(source);
    setOutput(next);
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

  function loadSample() {
    setInput(SAMPLE_PROMPT);
    setOutput('');
  }

  const btnBase =
    'text-xs font-medium px-3.5 py-2 rounded-lg border transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-50 tracking-tight leading-tight mb-3">
          Advanced Prompt Architect
          <br className="hidden sm:block" />
          <span className="text-violet-400"> &amp; Token Counter</span>
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Optimize system prompts in the browser. Action buttons write only to Optimized Output — your Input
          Prompt stays unchanged unless you click &quot;Use Output as Input&quot;.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* INPUT — source of truth; never mutated by transform buttons */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="promptInput" className="text-sm font-medium text-zinc-300">
              Input Prompt
              {output ? (
                <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  original · unchanged
                </span>
              ) : null}
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={loadSample}
                className="text-xs text-violet-400/90 hover:text-violet-300 hover:bg-violet-500/10 rounded-md px-2.5 py-1 transition-colors"
              >
                Load sample
              </button>
              <button
                type="button"
                onClick={() => {
                  setInput('');
                  setOutput('');
                }}
                className="text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/70 rounded-md px-2.5 py-1 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
          <textarea
            id="promptInput"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste a real system prompt, or click Load sample…"
            className="flex-1 w-full min-h-[280px] lg:min-h-0 lg:h-80 rounded-xl resize-none border border-zinc-800 bg-zinc-900/70 text-zinc-100 text-sm leading-relaxed px-4 py-3.5 placeholder:text-zinc-700 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 font-mono"
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
          />
          <div className="flex flex-wrap gap-2" aria-label="Input statistics">
            <StatBox label="Chars" value={inStats.chars.toLocaleString()} />
            <StatBox label="Words" value={inStats.words.toLocaleString()} />
            <StatBox label="Lines" value={inStats.lines.toLocaleString()} />
            <StatBox label="Tokens" value={inStats.tokens.toLocaleString()} />
          </div>
        </div>

        {/* OUTPUT — only target of transform buttons */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-300" id="optimized-output-label">
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
              type="button"
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
            role="region"
            aria-labelledby="optimized-output-label"
            aria-live="polite"
            className={`flex-1 w-full min-h-[280px] lg:min-h-0 lg:h-80 rounded-xl border px-4 py-3.5 text-sm leading-relaxed font-mono overflow-auto whitespace-pre-wrap break-words transition-colors duration-300 ${
              output
                ? 'text-zinc-100 border-violet-500/35 bg-zinc-900/70'
                : 'text-zinc-600 italic select-none border-zinc-800 bg-zinc-900/70'
            } ${copied ? 'bg-emerald-500/5' : ''}`}
          >
            {output || 'Optimized prompt will appear here after applying an action…'}
          </div>

          <div className="flex flex-wrap gap-2" aria-label="Output statistics">
            <StatBox label="Chars" value={outStats ? outStats.chars.toLocaleString() : '—'} />
            <StatBox label="Words" value={outStats ? outStats.words.toLocaleString() : '—'} />
            <StatBox label="Lines" value={outStats ? outStats.lines.toLocaleString() : '—'} />
            <StatBox label="Tokens" value={outStats ? outStats.tokens.toLocaleString() : '—'} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <button
          type="button"
          onClick={() => applyTransform(removeExtraWhitespace)}
          className={`${btnBase} border-zinc-700 bg-zinc-900/40 text-zinc-300 hover:text-zinc-100 hover:border-violet-500/50 hover:bg-violet-500/10`}
        >
          Remove Extra Whitespace
        </button>
        <button
          type="button"
          onClick={() => applyTransform(flattenToSingleLine)}
          className={`${btnBase} border-zinc-700 bg-zinc-900/40 text-zinc-300 hover:text-zinc-100 hover:border-violet-500/50 hover:bg-violet-500/10`}
        >
          Flatten to Single Line
        </button>
        <button
          type="button"
          onClick={() => applyTransform(trimAndNormalize)}
          className={`${btnBase} border-zinc-700 bg-zinc-900/40 text-zinc-300 hover:text-zinc-100 hover:border-violet-500/50 hover:bg-violet-500/10`}
        >
          Trim &amp; Normalize
        </button>
        <button
          type="button"
          onClick={useOutputAsInput}
          disabled={!output}
          title="Replace Input with Output, then clear Output — the only action that edits Input"
          className={`${btnBase} border-zinc-700 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          Use Output as Input →
        </button>
      </div>

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

      <section className="border-t border-zinc-800/60 pt-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight mb-2">About Prompt Architect</h2>
          <p className="text-sm text-zinc-400 font-light leading-relaxed mb-8">
            A free, 100% client-side tool for AI engineers who need to measure, compress, and optimize system
            prompts before they reach the API endpoint. Zero data is transmitted — all processing happens in your
            browser.
          </p>

          <div className="space-y-3">
            {[
              {
                q: 'Do the transform buttons change my Input Prompt?',
                a: 'No. Remove Extra Whitespace, Flatten, and Trim & Normalize only write to Optimized Output. Input changes only when you type, Clear, Load sample, or click Use Output as Input.',
              },
              {
                q: 'How accurate is the token counter?',
                a: "The estimator uses a punctuation-boundary BPE approximation that achieves ~95–98% accuracy against OpenAI's tiktoken library for standard English text. It splits on punctuation boundaries and applies subword length adjustments to approximate GPT-4's cl100k_base vocabulary.",
              },
              {
                q: 'What does "Flatten to Single Line" do?',
                a: 'It replaces every newline character (\\n), Windows carriage return (\\r\\n), and legacy Mac line ending (\\r) with a single space, then collapses any resulting consecutive spaces into one. Produces a compact, single-line string safe for JSON payloads.',
              },
              {
                q: 'What does "Remove Extra Whitespace" preserve vs. remove?',
                a: 'Removes: leading/trailing whitespace per line, 2+ consecutive spaces, and 3+ consecutive newlines (collapsed to a single blank line). Preserves: one blank line for paragraph breaks, single newlines between list items, and all meaningful text characters.',
              },
              {
                q: 'Does this work for Claude, Gemini, and other LLMs?',
                a: 'Yes. All transformer-based language models process tokens, and reducing token count reduces cost and improves throughput regardless of provider. The estimates are a reliable planning proxy for all major models when working with standard English text.',
              },
            ].map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-xl border border-zinc-800 bg-zinc-900/40 open:bg-zinc-900/70 transition-colors"
              >
                <summary className="cursor-pointer list-none px-5 py-4 text-sm font-medium text-zinc-200 flex items-center justify-between gap-4">
                  {q}
                  <span className="text-zinc-600 group-open:rotate-180 transition-transform shrink-0">▾</span>
                </summary>
                <p className="px-5 pb-4 text-sm text-zinc-400 font-light leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
