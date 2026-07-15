'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  applySvgColorMap,
  downloadSvgFile,
  extractSvgColors,
  optimizeSvg,
  readSvgFile,
  svgForPreview,
  svgToReactComponent,
  svgToVueComponent,
  type SvgColorSwatch,
} from '@/lib/svg-studio';
import {
  DEFAULT_SVG_EDITS,
  SVG_SIZE_PRESETS,
  applySvgEdits,
  downloadSvgAsPng,
  editsAreActive,
  extractSvgTexts,
  invertSvgColors,
  type SvgEditOptions,
} from '@/lib/svg-edits';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

type OutTab = 'optimized' | 'react' | 'vue';

const SAMPLE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="22" fill="#2563eb"/>
  <text x="50" y="66" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="700" fill="#ffffff" text-anchor="middle">N</text>
</svg>`;

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: 'var(--ndl-faint)' }}>
      {children}
    </span>
  );
}

function ControlBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-3 border" style={{ borderColor: 'var(--ndl-border)', background: 'var(--ndl-surface-2)' }}>
      {children}
    </div>
  );
}

export default function SvgStudioClient() {
  const [raw, setRaw] = useState(SAMPLE);
  const [filename, setFilename] = useState<string | null>('ndl-mark.svg');
  const [tab, setTab] = useState<OutTab>('optimized');
  const [dragOver, setDragOver] = useState(false);
  const [colorMap, setColorMap] = useState<Record<string, string>>({});
  const [edits, setEdits] = useState<SvgEditOptions>(DEFAULT_SVG_EDITS);
  const [pngBusy, setPngBusy] = useState(false);
  const [pngError, setPngError] = useState<string | null>(null);
  const { copied, copy } = useCopyToClipboard();

  const result = useMemo(() => optimizeSvg(raw), [raw]);
  const baseSvg = result.ok ? result.optimized : '';

  const swatches = useMemo(
    () => (baseSvg ? extractSvgColors(baseSvg) : []),
    [baseSvg]
  );

  const texts = useMemo(
    () => (baseSvg ? extractSvgTexts(baseSvg) : []),
    [baseSvg]
  );

  useEffect(() => {
    const allowed = new Set(swatches.map((s) => s.hex));
    setColorMap((prev) => {
      let changed = false;
      const next: Record<string, string> = {};
      for (const [key, value] of Object.entries(prev)) {
        if (allowed.has(key)) next[key] = value;
        else changed = true;
      }
      return changed ? next : prev;
    });
  }, [swatches]);

  useEffect(() => {
    setEdits((prev) => {
      const nextRepl: Record<string, string> = {};
      let changed = false;
      for (const t of texts) {
        if (prev.textReplacements[t] !== undefined) nextRepl[t] = prev.textReplacements[t];
      }
      for (const key of Object.keys(prev.textReplacements)) {
        if (!texts.includes(key)) changed = true;
      }
      if (
        !changed &&
        Object.keys(prev.textReplacements).length === Object.keys(nextRepl).length
      ) {
        return prev;
      }
      return { ...prev, textReplacements: nextRepl };
    });
  }, [texts]);

  const workingSvg = useMemo(() => {
    if (!baseSvg) return '';
    const colored = applySvgColorMap(baseSvg, colorMap, swatches);
    return applySvgEdits(colored, edits);
  }, [baseSvg, colorMap, swatches, edits]);

  const outputs = useMemo(() => {
    if (!workingSvg) return { optimized: '', react: '', vue: '' };
    return {
      optimized: workingSvg,
      react: svgToReactComponent(workingSvg, filename),
      vue: svgToVueComponent(workingSvg, filename),
    };
  }, [workingSvg, filename]);

  const active =
    tab === 'optimized' ? outputs.optimized : tab === 'react' ? outputs.react : outputs.vue;

  const resetAllEdits = useCallback(() => {
    setColorMap({});
    setEdits(DEFAULT_SVG_EDITS);
    setPngError(null);
  }, []);

  const onFiles = useCallback(async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    try {
      const text = await readSvgFile(file);
      setRaw(text);
      setFilename(file.name);
      resetAllEdits();
    } catch {
      setRaw('');
      setFilename(null);
      resetAllEdits();
    }
  }, [resetAllEdits]);

  const setSwatchColor = useCallback((swatch: SvgColorSwatch, nextHex: string) => {
    setColorMap((prev) => ({ ...prev, [swatch.hex]: nextHex.toLowerCase() }));
  }, []);

  const patchEdits = useCallback((patch: Partial<SvgEditOptions>) => {
    setEdits((prev) => ({ ...prev, ...patch }));
  }, []);

  const writeToSource = useCallback(() => {
    if (!workingSvg) return;
    setRaw(workingSvg);
    resetAllEdits();
  }, [workingSvg, resetAllEdits]);

  const hasPendingEdits = useMemo(() => {
    const colorPending = Object.entries(colorMap).some(
      ([from, to]) => from.toLowerCase() !== to.toLowerCase()
    );
    return colorPending || editsAreActive(edits);
  }, [colorMap, edits]);

  const pngSize = edits.exportSize ?? 256;

  const handleDownloadPng = useCallback(async () => {
    if (!workingSvg) return;
    setPngBusy(true);
    setPngError(null);
    try {
      await downloadSvgAsPng(workingSvg, filename ?? 'icon', pngSize);
    } catch {
      setPngError('PNG export failed in this browser. Try Download SVG instead.');
    } finally {
      setPngBusy(false);
    }
  }, [workingSvg, filename, pngSize]);

  const handleDownloadInverted = useCallback(() => {
    if (!workingSvg) return;
    const inverted = invertSvgColors(workingSvg);
    const base = (filename ?? 'icon').replace(/\.svg$/i, '');
    downloadSvgFile(inverted, `${base}-inverted.svg`);
  }, [workingSvg, filename]);

  return (
    <div className="min-h-[calc(100vh-64px)]" style={{ background: 'var(--ndl-bg)', color: 'var(--ndl-text)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <header className="mb-8">
          <p className="text-[0.6875rem] font-bold tracking-[0.1em] uppercase mb-2" style={{ color: 'var(--ndl-accent)' }}>
            Developer utility
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">Interactive SVG Studio</h1>
          <p className="text-sm font-light max-w-2xl" style={{ color: 'var(--ndl-muted)' }}>
            Optimize, recolor, reshape, and export SVG / React / Vue / PNG — entirely in your browser.
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
              onChange={(e) => {
                setRaw(e.target.value);
                resetAllEdits();
              }}
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

          <div className="flex flex-col gap-4 min-w-0">
            <div
              className="border relative flex items-center justify-center min-h-[160px] p-6"
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
              {result.ok && workingSvg && (
                <button
                  type="button"
                  onClick={() => downloadSvgFile(workingSvg, filename ?? 'icon.svg')}
                  className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1.5 cursor-pointer border-0 z-10"
                  style={{ background: '#2563eb', color: '#fff' }}
                >
                  Download SVG
                </button>
              )}
              {result.ok && workingSvg ? (
                <div
                  className="w-40 h-40 flex items-center justify-center overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: svgForPreview(workingSvg, 160) }}
                />
              ) : (
                <span className="text-xs" style={{ color: '#64748b' }}>Preview unavailable</span>
              )}
            </div>

            {result.ok && (
              <div className="border p-4 space-y-4" style={{ borderColor: 'var(--ndl-border)', background: 'var(--ndl-surface)' }}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[10px] font-bold tracking-widest uppercase m-0" style={{ color: 'var(--ndl-faint)' }}>
                    Edit
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {hasPendingEdits && (
                      <>
                        <button
                          type="button"
                          onClick={writeToSource}
                          className="text-[10px] font-semibold uppercase tracking-wide px-2 py-1 cursor-pointer border-0"
                          style={{ background: '#2563eb', color: '#fff' }}
                        >
                          Write into source
                        </button>
                        <button
                          type="button"
                          onClick={resetAllEdits}
                          className="text-[10px] font-semibold uppercase tracking-wide px-2 py-1 cursor-pointer bg-transparent"
                          style={{ color: 'var(--ndl-faint)', border: '1px solid var(--ndl-border)' }}
                        >
                          Reset edits
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {swatches.length > 0 && (
                  <div>
                    <FieldLabel>Colors</FieldLabel>
                    <ul className="m-0 p-0 list-none space-y-2">
                      {swatches.map((swatch) => {
                        const value = colorMap[swatch.hex] ?? swatch.hex;
                        return (
                          <li key={swatch.hex} className="flex items-center gap-3">
                            <label className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
                              <input
                                type="color"
                                value={value}
                                onChange={(e) => setSwatchColor(swatch, e.target.value)}
                                aria-label={`Color ${swatch.hex}`}
                                className="w-9 h-9 p-0 border cursor-pointer bg-transparent"
                                style={{ borderColor: 'var(--ndl-border)' }}
                              />
                              <span className="text-xs font-mono truncate" style={{ color: 'var(--ndl-muted)' }}>
                                {swatch.originals.join(' · ')} → {value}
                              </span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                    <button
                      type="button"
                      onClick={handleDownloadInverted}
                      className="mt-2 text-[10px] font-semibold uppercase tracking-wide px-2 py-1 cursor-pointer bg-transparent"
                      style={{ color: 'var(--ndl-muted)', border: '1px solid var(--ndl-border)' }}
                    >
                      Download inverted (dark/light pair)
                    </button>
                  </div>
                )}

                {texts.length > 0 && (
                  <div>
                    <FieldLabel>Text</FieldLabel>
                    <ul className="m-0 p-0 list-none space-y-2">
                      {texts.map((t) => (
                        <li key={t}>
                          <input
                            type="text"
                            value={edits.textReplacements[t] ?? t}
                            onChange={(e) =>
                              patchEdits({
                                textReplacements: {
                                  ...edits.textReplacements,
                                  [t]: e.target.value,
                                },
                              })
                            }
                            aria-label={`Edit text ${t}`}
                            className="w-full px-3 py-2 text-sm font-mono outline-none"
                            style={{
                              background: 'var(--ndl-input-bg)',
                              color: 'var(--ndl-text)',
                              border: '1px solid var(--ndl-input-border)',
                            }}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-3">
                  <ControlBox>
                    <FieldLabel>Export size (px)</FieldLabel>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {SVG_SIZE_PRESETS.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => patchEdits({ exportSize: s })}
                          className="text-[10px] font-semibold px-2 py-1 cursor-pointer border-0"
                          style={{
                            background: edits.exportSize === s ? '#2563eb' : 'transparent',
                            color: edits.exportSize === s ? '#fff' : 'var(--ndl-muted)',
                            border: '1px solid var(--ndl-border)',
                          }}
                        >
                          {s}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => patchEdits({ exportSize: null })}
                        className="text-[10px] font-semibold px-2 py-1 cursor-pointer bg-transparent"
                        style={{ color: 'var(--ndl-faint)', border: '1px solid var(--ndl-border)' }}
                      >
                        Auto
                      </button>
                    </div>
                  </ControlBox>

                  <ControlBox>
                    <FieldLabel>ViewBox padding ({edits.paddingPercent}%)</FieldLabel>
                    <input
                      type="range"
                      min={-20}
                      max={40}
                      step={1}
                      value={edits.paddingPercent}
                      onChange={(e) => patchEdits({ paddingPercent: Number(e.target.value) })}
                      className="w-full"
                      aria-label="ViewBox padding"
                    />
                  </ControlBox>

                  <ControlBox>
                    <FieldLabel>Rotate ({edits.rotateDeg}°)</FieldLabel>
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      step={15}
                      value={edits.rotateDeg}
                      onChange={(e) => patchEdits({ rotateDeg: Number(e.target.value) })}
                      className="w-full"
                      aria-label="Rotate"
                    />
                    <div className="flex gap-1 mt-2">
                      {[0, 90, 180, -90].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => patchEdits({ rotateDeg: d })}
                          className="text-[10px] font-semibold px-2 py-1 cursor-pointer bg-transparent"
                          style={{ border: '1px solid var(--ndl-border)', color: 'var(--ndl-muted)' }}
                        >
                          {d}°
                        </button>
                      ))}
                    </div>
                  </ControlBox>

                  <ControlBox>
                    <FieldLabel>Flip</FieldLabel>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--ndl-muted)' }}>
                        <input
                          type="checkbox"
                          checked={edits.flipH}
                          onChange={(e) => patchEdits({ flipH: e.target.checked })}
                        />
                        Horizontal
                      </label>
                      <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--ndl-muted)' }}>
                        <input
                          type="checkbox"
                          checked={edits.flipV}
                          onChange={(e) => patchEdits({ flipV: e.target.checked })}
                        />
                        Vertical
                      </label>
                    </div>
                  </ControlBox>

                  <ControlBox>
                    <FieldLabel>Opacity ({Math.round(edits.opacity * 100)}%)</FieldLabel>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={Math.round(edits.opacity * 100)}
                      onChange={(e) => patchEdits({ opacity: Number(e.target.value) / 100 })}
                      className="w-full"
                      aria-label="Opacity"
                    />
                  </ControlBox>

                  <ControlBox>
                    <FieldLabel>Stroke width</FieldLabel>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        value={edits.strokeWidth ?? ''}
                        placeholder="auto"
                        onChange={(e) => {
                          const v = e.target.value;
                          patchEdits({ strokeWidth: v === '' ? null : Number(v) });
                        }}
                        className="w-full px-2 py-1.5 text-sm outline-none"
                        style={{
                          background: 'var(--ndl-input-bg)',
                          color: 'var(--ndl-text)',
                          border: '1px solid var(--ndl-input-border)',
                        }}
                        aria-label="Stroke width"
                      />
                    </div>
                  </ControlBox>

                  <ControlBox>
                    <FieldLabel>Corner radius (rects)</FieldLabel>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={edits.cornerRadius ?? ''}
                      placeholder="auto"
                      onChange={(e) => {
                        const v = e.target.value;
                        patchEdits({ cornerRadius: v === '' ? null : Number(v) });
                      }}
                      className="w-full px-2 py-1.5 text-sm outline-none"
                      style={{
                        background: 'var(--ndl-input-bg)',
                        color: 'var(--ndl-text)',
                        border: '1px solid var(--ndl-input-border)',
                      }}
                      aria-label="Corner radius"
                    />
                  </ControlBox>

                  <ControlBox>
                    <FieldLabel>Path precision</FieldLabel>
                    <select
                      value={edits.pathPrecision ?? ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        patchEdits({ pathPrecision: v === '' ? null : Number(v) });
                      }}
                      className="w-full px-2 py-1.5 text-sm outline-none"
                      style={{
                        background: 'var(--ndl-input-bg)',
                        color: 'var(--ndl-text)',
                        border: '1px solid var(--ndl-input-border)',
                      }}
                      aria-label="Path precision"
                    >
                      <option value="">Leave as-is</option>
                      {[0, 1, 2, 3, 4].map((n) => (
                        <option key={n} value={n}>{n} decimal{n === 1 ? '' : 's'}</option>
                      ))}
                    </select>
                  </ControlBox>
                </div>

                <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--ndl-muted)' }}>
                  <input
                    type="checkbox"
                    checked={edits.outlineMode}
                    onChange={(e) => patchEdits({ outlineMode: e.target.checked })}
                  />
                  Outline mode (fills → strokes)
                </label>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    disabled={!workingSvg || pngBusy}
                    onClick={() => { void handleDownloadPng(); }}
                    className="text-[10px] font-semibold uppercase tracking-wide px-3 py-1.5 cursor-pointer disabled:opacity-40 border-0"
                    style={{ background: '#0f172a', color: '#e2e8f0', border: '1px solid #334155' }}
                  >
                    {pngBusy ? 'Exporting…' : `Download PNG (${pngSize}px)`}
                  </button>
                </div>
                {pngError && (
                  <p className="text-xs m-0" style={{ color: '#f87171' }} role="alert">{pngError}</p>
                )}
              </div>
            )}

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
                  disabled={!result.ok || !workingSvg}
                  onClick={() => {
                    if (workingSvg) downloadSvgFile(workingSvg, filename ?? 'icon.svg');
                  }}
                  className="ml-auto text-xs font-semibold uppercase tracking-wide px-3 py-1.5 cursor-pointer disabled:opacity-40 bg-transparent"
                  style={{ color: 'var(--ndl-muted)', border: '1px solid var(--ndl-border)' }}
                >
                  Download
                </button>
                <button
                  type="button"
                  disabled={!result.ok}
                  onClick={() => { void copy(active); }}
                  className="text-xs font-semibold uppercase tracking-wide px-3 py-1.5 cursor-pointer disabled:opacity-40"
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
