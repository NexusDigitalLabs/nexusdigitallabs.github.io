'use client';

import { useMemo, useState } from 'react';
import {
  type JsonEngineTab,
  formatJsonPretty,
  jsonToJsonPaths,
  jsonToTypeScript,
  jsonToZod,
  parseJsonSafe,
} from '@/lib/json-engine';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

const TABS: { id: JsonEngineTab; label: string }[] = [
  { id: 'typescript', label: 'TypeScript' },
  { id: 'zod', label: 'Zod' },
  { id: 'jsonpath', label: 'JSONPath' },
];

const SAMPLE = `{
  "id": 42,
  "name": "Ada Lovelace",
  "active": true,
  "roles": ["admin", "editor"],
  "profile": {
    "email": "ada@example.com",
    "score": 99.5
  }
}`;

export default function JsonEngineClient() {
  const [raw, setRaw] = useState(SAMPLE);
  const [tab, setTab] = useState<JsonEngineTab>('typescript');
  const { copied, copy } = useCopyToClipboard();

  const parsed = useMemo(() => parseJsonSafe(raw), [raw]);

  const outputs = useMemo(() => {
    if (!parsed.ok) {
      return { typescript: '', zod: '', jsonpath: '', pretty: '' };
    }
    return {
      typescript: jsonToTypeScript(parsed.value),
      zod: jsonToZod(parsed.value),
      jsonpath: jsonToJsonPaths(parsed.value),
      pretty: formatJsonPretty(parsed.value),
    };
  }, [parsed]);

  const activeOut =
    tab === 'typescript'
      ? outputs.typescript
      : tab === 'zod'
        ? outputs.zod
        : outputs.jsonpath;

  return (
    <div className="min-h-[calc(100vh-64px)]" style={{ background: 'var(--ndl-bg)', color: 'var(--ndl-text)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <header className="mb-8">
          <p className="text-[0.6875rem] font-bold tracking-[0.1em] uppercase mb-2" style={{ color: 'var(--ndl-accent)' }}>
            Developer utility
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">JSON &amp; API Mock Engine</h1>
          <p className="text-sm font-light max-w-2xl" style={{ color: 'var(--ndl-muted)' }}>
            Paste JSON to generate TypeScript interfaces, Zod schemas, and JSONPath queries — entirely in your browser.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-0 lg:min-h-[560px] border" style={{ borderColor: 'var(--ndl-border)' }}>
          <div className="flex-1 flex flex-col min-w-0 lg:border-r" style={{ borderColor: 'var(--ndl-border)', background: 'var(--ndl-surface)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--ndl-border)' }}>
              <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--ndl-faint)' }}>
                Input JSON
              </span>
              <button
                type="button"
                onClick={() => setRaw(SAMPLE)}
                className="text-xs font-semibold uppercase tracking-wide px-2 py-1 cursor-pointer bg-transparent"
                style={{ color: 'var(--ndl-muted)', border: '1px solid var(--ndl-border)' }}
              >
                Reset sample
              </button>
            </div>
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              spellCheck={false}
              aria-label="JSON input"
              className="flex-1 w-full min-h-[280px] lg:min-h-0 p-4 text-[13px] leading-relaxed font-mono resize-y lg:resize-none outline-none break-words"
              style={{
                background: 'var(--ndl-input-bg)',
                color: 'var(--ndl-text)',
                border: 'none',
              }}
            />
            {!parsed.ok && (
              <p className="px-4 py-2 text-xs border-t" style={{ borderColor: 'var(--ndl-border)', color: '#f87171' }} role="alert">
                {parsed.error}
              </p>
            )}
          </div>

          <div className="flex-1 flex flex-col min-w-0" style={{ background: 'var(--ndl-surface)' }}>
            <div className="flex flex-wrap items-center gap-1 px-2 py-2 border-b" style={{ borderColor: 'var(--ndl-border)' }}>
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className="text-xs font-semibold px-3 py-1.5 cursor-pointer border-0"
                  style={{
                    color: tab === t.id ? '#fff' : 'var(--ndl-muted)',
                    background: tab === t.id ? 'var(--ndl-accent)' : 'transparent',
                  }}
                >
                  {t.label}
                </button>
              ))}
              <button
                type="button"
                disabled={!parsed.ok || !activeOut}
                onClick={() => { void copy(activeOut); }}
                className="ml-auto text-xs font-semibold uppercase tracking-wide px-3 py-1.5 cursor-pointer disabled:opacity-40"
                style={{
                  color: copied ? '#4ade80' : '#fff',
                  background: copied ? 'transparent' : '#2563eb',
                  border: copied ? '1px solid rgba(74,222,128,0.4)' : 'none',
                }}
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre
              className="flex-1 m-0 p-4 text-[13px] leading-relaxed font-mono overflow-auto break-words whitespace-pre-wrap min-h-[280px]"
              style={{ color: 'var(--ndl-text-secondary)' }}
            >
              {parsed.ok ? activeOut : 'Fix JSON errors to see generated output.'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
