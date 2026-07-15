'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  type PackagerFile,
  buildPromptPackage,
  computePackagerStats,
  createPackagerFileId,
  languageFromFilename,
  readTextFile,
} from '@/lib/prompt-packager';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

export default function PromptPackagerClient() {
  const [files, setFiles] = useState<PackagerFile[]>([]);
  const [title, setTitle] = useState('Code context for review');
  const [instructions, setInstructions] = useState(
    'Review the following files. Summarize risks, suggest focused fixes, and call out missing tests.'
  );
  const [includeTree, setIncludeTree] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const { copied, copy } = useCopyToClipboard();

  const packaged = useMemo(
    () =>
      buildPromptPackage(files, {
        title,
        instructions,
        includeTree,
        fenceLanguageFromExtension: true,
      }),
    [files, title, instructions, includeTree]
  );

  const stats = useMemo(
    () => computePackagerStats(packaged, files.length),
    [packaged, files.length]
  );

  const ingestFiles = useCallback(async (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const next: PackagerFile[] = [];
    for (const file of Array.from(list)) {
      try {
        const content = await readTextFile(file);
        next.push({
          id: createPackagerFileId(),
          name: file.name,
          language: languageFromFilename(file.name),
          content,
        });
      } catch {
        /* skip unreadable */
      }
    }
    if (next.length) setFiles((prev) => [...prev, ...next]);
  }, []);

  const addSnippet = useCallback(() => {
    setFiles((prev) => [
      ...prev,
      {
        id: createPackagerFileId(),
        name: `snippet-${prev.length + 1}.txt`,
        language: 'text',
        content: '',
      },
    ]);
  }, []);

  const updateFile = useCallback((id: string, patch: Partial<PackagerFile>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)]" style={{ background: 'var(--ndl-bg)', color: 'var(--ndl-text)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <header className="mb-8">
          <p className="text-[0.6875rem] font-bold tracking-[0.1em] uppercase mb-2" style={{ color: 'var(--ndl-accent)' }}>
            Developer utility
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">Prompt Context Packager</h1>
          <p className="text-sm font-light max-w-2xl" style={{ color: 'var(--ndl-muted)' }}>
            Flatten multiple files into one LLM-ready prompt block with character and token estimates — 100% local.
          </p>
        </header>

        <div className="grid lg:grid-cols-[340px_1fr] gap-6">
          <aside className="space-y-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                void ingestFiles(e.dataTransfer.files);
              }}
              className="p-6 text-center border-2 border-dashed"
              style={{
                borderColor: dragOver ? 'var(--ndl-accent)' : 'var(--ndl-border)',
                background: 'var(--ndl-surface)',
              }}
            >
              <p className="text-sm font-medium mb-3">Drop files</p>
              <label className="inline-block cursor-pointer text-xs font-semibold uppercase tracking-wide px-3 py-2" style={{ background: '#2563eb', color: '#fff' }}>
                Browse
                <input
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={(e) => { void ingestFiles(e.target.files); }}
                />
              </label>
              <button
                type="button"
                onClick={addSnippet}
                className="block w-full mt-3 text-xs font-semibold uppercase tracking-wide py-2 cursor-pointer bg-transparent"
                style={{ color: 'var(--ndl-muted)', border: '1px solid var(--ndl-border)' }}
              >
                + Empty snippet
              </button>
            </div>

            <div className="p-4 border space-y-3" style={{ borderColor: 'var(--ndl-border)', background: 'var(--ndl-surface)' }}>
              <label className="block text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--ndl-faint)' }}>
                Title
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm outline-none"
                  style={{ background: 'var(--ndl-input-bg)', color: 'var(--ndl-text)', border: '1px solid var(--ndl-input-border)' }}
                />
              </label>
              <label className="block text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--ndl-faint)' }}>
                Instructions
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={5}
                  className="mt-1 w-full px-3 py-2 text-sm outline-none resize-y break-words"
                  style={{ background: 'var(--ndl-input-bg)', color: 'var(--ndl-text)', border: '1px solid var(--ndl-input-border)' }}
                />
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--ndl-muted)' }}>
                <input
                  type="checkbox"
                  checked={includeTree}
                  onChange={(e) => setIncludeTree(e.target.checked)}
                />
                Include file tree
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Files', value: String(stats.files) },
                { label: 'Chars', value: stats.chars.toLocaleString('en-US') },
                { label: 'Lines', value: stats.lines.toLocaleString('en-US') },
                { label: '~Tokens', value: stats.tokens.toLocaleString('en-US') },
              ].map((s) => (
                <div key={s.label} className="px-3 py-2 border" style={{ borderColor: 'var(--ndl-border)', background: 'var(--ndl-surface-2)' }}>
                  <p className="text-[10px] font-bold tracking-widest uppercase m-0" style={{ color: 'var(--ndl-faint)' }}>{s.label}</p>
                  <p className="text-sm font-semibold tabular-nums m-0 mt-0.5">{s.value}</p>
                </div>
              ))}
            </div>
          </aside>

          <div className="space-y-4 min-w-0">
            {files.length === 0 ? (
              <p className="text-sm p-6 border" style={{ borderColor: 'var(--ndl-border)', color: 'var(--ndl-muted)', background: 'var(--ndl-surface)' }}>
                Add files or snippets to build a packed prompt.
              </p>
            ) : (
              <ul className="space-y-3 m-0 p-0 list-none">
                {files.map((file) => (
                  <li key={file.id} className="border" style={{ borderColor: 'var(--ndl-border)', background: 'var(--ndl-surface)' }}>
                    <div className="flex flex-wrap gap-2 items-center px-3 py-2 border-b" style={{ borderColor: 'var(--ndl-border)' }}>
                      <input
                        value={file.name}
                        onChange={(e) => updateFile(file.id, {
                          name: e.target.value,
                          language: languageFromFilename(e.target.value),
                        })}
                        className="flex-1 min-w-[8rem] text-xs font-mono px-2 py-1 outline-none"
                        style={{ background: 'var(--ndl-input-bg)', color: 'var(--ndl-text)', border: '1px solid var(--ndl-input-border)' }}
                        aria-label="File name"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="text-xs px-2 py-1 cursor-pointer bg-transparent"
                        style={{ color: '#fca5a5', border: '1px solid rgba(248,113,113,0.35)' }}
                      >
                        Remove
                      </button>
                    </div>
                    <textarea
                      value={file.content}
                      onChange={(e) => updateFile(file.id, { content: e.target.value })}
                      rows={6}
                      spellCheck={false}
                      className="w-full p-3 text-[12px] font-mono outline-none resize-y break-words"
                      style={{ background: 'var(--ndl-input-bg)', color: 'var(--ndl-text)', border: 'none' }}
                      aria-label={`Content for ${file.name}`}
                    />
                  </li>
                ))}
              </ul>
            )}

            <div className="border" style={{ borderColor: 'var(--ndl-border)', background: 'var(--ndl-surface)' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--ndl-border)' }}>
                <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--ndl-faint)' }}>
                  Packaged prompt
                </span>
                <button
                  type="button"
                  onClick={() => { void copy(packaged); }}
                  disabled={files.length === 0}
                  className="text-xs font-semibold uppercase tracking-wide px-3 py-1.5 cursor-pointer disabled:opacity-40"
                  style={{ background: '#2563eb', color: '#fff' }}
                >
                  {copied ? 'Copied' : 'Copy pack'}
                </button>
              </div>
              <pre className="m-0 p-4 text-[12px] font-mono leading-relaxed overflow-auto max-h-[420px] break-words whitespace-pre-wrap" style={{ color: 'var(--ndl-text-secondary)' }}>
                {files.length === 0 ? 'Output appears here after you add files.' : packaged}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
