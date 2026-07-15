'use client';

import { useMemo, useState } from 'react';
import { formatEnv } from '@/lib/env-formatter';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

const SAMPLE = `# App
API_URL= https://api.example.com/v1
DATABASE_URL=postgres://user:pass@localhost:5432/db
API_URL=https://api.example.com/v2
FEATURE_FLAG=true
WELCOME_MESSAGE=Hello world
`;

export default function EnvFormatterClient() {
  const [raw, setRaw] = useState(SAMPLE);
  const { copied, copy } = useCopyToClipboard();
  const result = useMemo(() => formatEnv(raw), [raw]);

  return (
    <div className="min-h-[calc(100vh-64px)]" style={{ background: 'var(--ndl-bg)', color: 'var(--ndl-text)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <header className="mb-10">
          <p className="text-[0.6875rem] font-bold tracking-[0.14em] uppercase mb-3" style={{ color: 'var(--ndl-accent)' }}>
            Configuration
          </p>
          <h1 className="text-3xl font-light tracking-tight mb-3">Secure .env Formatter</h1>
          <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--ndl-muted)' }}>
            Sort keys, strip duplicates, and normalize syntax — entirely in your browser. Sharp edges. Zero radius. No server.
          </p>
        </header>

        <label className="block text-[10px] font-bold tracking-[0.14em] uppercase mb-2" style={{ color: 'var(--ndl-faint)' }}>
          Paste .env
        </label>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          spellCheck={false}
          aria-label=".env input"
          rows={12}
          className="w-full p-4 text-[13px] font-mono leading-relaxed outline-none resize-y break-words mb-6"
          style={{
            background: 'var(--ndl-input-bg)',
            color: 'var(--ndl-text)',
            border: '1px solid var(--ndl-border)',
            borderRadius: 0,
          }}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <p className="text-[10px] font-bold tracking-[0.14em] uppercase m-0" style={{ color: 'var(--ndl-faint)' }}>
            Clean output · {result.entries.length} keys
            {result.removedDuplicates.length > 0
              ? ` · ${result.removedDuplicates.length} duplicate${result.removedDuplicates.length === 1 ? '' : 's'} resolved`
              : ''}
          </p>
          <button
            type="button"
            disabled={!result.cleaned}
            onClick={() => { void copy(result.cleaned); }}
            className="text-xs font-semibold uppercase tracking-wide px-4 py-2 cursor-pointer disabled:opacity-40"
            style={{ background: '#111827', color: '#f8fafc', border: '1px solid #334155', borderRadius: 0 }}
          >
            {copied ? 'Copied' : 'Copy cleaned .env'}
          </button>
        </div>

        <pre
          className="m-0 p-4 text-[13px] font-mono leading-relaxed overflow-x-auto break-words whitespace-pre-wrap mb-8"
          style={{
            background: '#0b1220',
            color: '#e2e8f0',
            border: '1px solid #1e293b',
            borderRadius: 0,
            minHeight: '8rem',
          }}
        >
          {result.cleaned || '# No valid KEY=VALUE pairs found'}
        </pre>

        {result.issues.length > 0 && (
          <div>
            <p className="text-[10px] font-bold tracking-[0.14em] uppercase mb-3" style={{ color: 'var(--ndl-faint)' }}>
              Diagnostics
            </p>
            <ul className="space-y-2 m-0 p-0 list-none">
              {result.issues.map((issue, i) => (
                <li
                  key={`${issue.line}-${issue.message}-${i}`}
                  className="text-xs font-mono px-3 py-2"
                  style={{
                    border: '1px solid var(--ndl-border)',
                    borderRadius: 0,
                    color:
                      issue.severity === 'error'
                        ? '#f87171'
                        : issue.severity === 'warning'
                          ? '#fbbf24'
                          : 'var(--ndl-muted)',
                  }}
                >
                  L{issue.line} · {issue.severity.toUpperCase()} · {issue.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
