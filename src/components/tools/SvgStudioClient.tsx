'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  optimizeSvg,
  readSvgFile,
  svgToReactComponent,
  svgToVueComponent,
} from '@/lib/svg-studio';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

type OutTab = 'optimized' | 'react' | 'vue';

const SAMPLE = `<svg width="64" height="64" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" rx="12" fill="#2563eb"/>
  <path d="M20 34l8 8 16-20" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export default function SvgStudioClient() {
  const [raw, setRaw] = useState(SAMPLE);
  const [filename, setFilename] = useState<string | null>('check.svg');
  const [tab, setTab] = useState<OutTab>('optimized');
  const [dragOver, setDragOver] = useState(false);
  const { copied, copy } = useCopyToClipboard();

  const result = useMemo(() => optimizeSvg(raw), [raw]);

  const outputs = useMemo(() => {
    if (!result.ok) return { optimized: '', react: '', vue: '' };
    return {
      optimized: result.optimized,
      react: svgToReactComponent(result.optimized, filename),
      vue: svgToVueComponent(result.optimized, filename),
    };
  }, [result, filename]);

  const active =
    tab === 'optimized' ? outputs.optimized : tab === 'react' ? outputs.react : outputs.vue;

  const onFiles = useCallback(async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    try {
      const text = await readSvgFile(file);
      setRaw(text);
      setFilename(file.name);
    } catch {
      setRaw('');
      setFilename(null);
    }
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)]" style={{ background: 'var(--ndl-bg)', color: 'var(--ndl-text)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <header className="mb-8">
          <p className="text-[0.6875rem] font-bold tracking-[0.1em] uppercase mb-2" style={{ color: 'var(--ndl-accent)' }}>
            Developer utility
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">Interactive SVG Studio</h1>
          <p className="text-sm font-light max-w-2xl" style={{ color: 'var(--ndl-muted)' }}>
            Drop an SVG, scrub export junk, and copy React or Vue components — all client-side.
          </p>
        </header>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            void onFiles(e.dataTransfer.files);
          }}
          className="mb-6 p-8 text-center border-2 border-dashed transition-colors"
          style={{
            borderColor: dragOver ? 'var(--ndl-accent)' : 'var(--ndl-border)',
            background: dragOver ? 'rgba(37,99,235,0.08)' : 'var(--ndl-surface)',
          }}
        >
          <p className="text-sm font-medium mb-2">Drop .svg file here</p>
          <p className="text-xs mb-4" style={{ color: 'var(--ndl-faint)' }}>or paste markup below</p>
          <label className="inline-block cursor-pointer text-xs font-semibold uppercase tracking-wide px-4 py-2" style={{ background: '#2563eb', color: '#fff' }}>
            Browse file
            <input
              type="file"
              accept=".svg,image/svg+xml"
              className="sr-only"
              onChange={(e) => { void onFiles(e.target.files); }}
            />
          </label>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="border flex flex-col min-h-[320px]" style={{ borderColor: 'var(--ndl-border)', background: 'var(--ndl-surface)' }}>
            <div className="px-4 py-3 border-b text-[10px] font-bold tracking-widest uppercase" style={{ borderColor: 'var(--ndl-border)', color: 'var(--ndl-faint)' }}>
              Source SVG
            </div>
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              spellCheck={false}
              aria-label="SVG source"
              className="flex-1 w-full p-4 text-[13px] font-mono leading-relaxed resize-y outline-none min-h-[240px] break-words"
              style={{ background: 'var(--ndl-input-bg)', color: 'var(--ndl-text)', border: 'none' }}
            />
            {!result.ok && (
              <p className="px-4 py-2 text-xs border-t" style={{ borderColor: 'var(--ndl-border)', color: '#f87171' }} role="alert">
                {result.error}
              </p>
            )}
            {result.ok && result.warnings.length > 0 && (
              <ul className="px-4 py-2 text-xs border-t space-y-1" style={{ borderColor: 'var(--ndl-border)', color: 'var(--ndl-faint)' }}>
                {result.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div
              className="border flex items-center justify-center min-h-[160px] p-6"
              style={{
                borderColor: 'var(--ndl-border)',
                backgroundImage:
                  'linear-gradient(45deg, #1e293b 25%, transparent 25%), linear-gradient(-45deg, #1e293b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1e293b 75%), linear-gradient(-45deg, transparent 75%, #1e293b 75%)',
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0',
                backgroundColor: '#0f172a',
              }}
              aria-label="SVG preview"
            >
              {result.ok ? (
                <div
                  className="max-w-full max-h-40 overflow-hidden [&_svg]:max-w-full [&_svg]:max-h-40"
                  dangerouslySetInnerHTML={{ __html: result.optimized }}
                />
              ) : (
                <span className="text-xs" style={{ color: '#64748b' }}>Preview unavailable</span>
              )}
            </div>

            <div className="border flex flex-col min-h-[280px] flex-1" style={{ borderColor: 'var(--ndl-border)', background: 'var(--ndl-surface)' }}>
              <div className="flex flex-wrap gap-1 px-2 py-2 border-b" style={{ borderColor: 'var(--ndl-border)' }}>
                {([
                  ['optimized', 'Optimized SVG'],
                  ['react', 'React'],
                  ['vue', 'Vue'],
                ] as const).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className="text-xs font-semibold px-3 py-1.5 cursor-pointer border-0"
                    style={{
                      color: tab === id ? '#fff' : 'var(--ndl-muted)',
                      background: tab === id ? 'var(--ndl-accent)' : 'transparent',
                    }}
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={!result.ok}
                  onClick={() => { void copy(active); }}
                  className="ml-auto text-xs font-semibold uppercase tracking-wide px-3 py-1.5 cursor-pointer disabled:opacity-40"
                  style={{ background: '#2563eb', color: '#fff' }}
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="m-0 p-4 text-[12px] font-mono leading-relaxed overflow-auto break-words whitespace-pre-wrap flex-1" style={{ color: 'var(--ndl-text-secondary)' }}>
                {result.ok ? active : 'Fix SVG to generate output.'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
