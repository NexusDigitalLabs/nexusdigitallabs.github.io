import PromptPackagerClient from '@/components/tools/PromptPackagerClient';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Prompt Context Packager — Multi-file LLM Context Builder',
  description:
    'Free multi-file prompt packager for Cursor, Claude, and Gemini. Flatten code into one structured block with token estimates — 100% client-side.',
  path: '/tools/prompt-packager/',
  keywords: [
    'llm context packager',
    'prompt context builder',
    'multi file prompt',
    'cursor context',
  ],
  absoluteTitle: true,
  ogTitle: 'Prompt Context Packager — NexusDigitalLabs',
  ogDescription: 'Pack multiple files into one LLM-ready prompt locally.',
});

export default function PromptPackagerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Prompt Context Packager',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Any',
            url: 'https://nexusdigitallabs.dev/tools/prompt-packager/',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }),
        }}
      />
      <PromptPackagerClient />
      <section className="border-t py-16 sm:py-20" style={{ borderColor: 'var(--ndl-border)' }}>
        <div className="max-w-3xl mx-auto px-6 sm:px-10 space-y-10">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--ndl-accent)' }}>About this tool</p>
            <h2 className="text-2xl font-light tracking-tight mb-4" style={{ color: 'var(--ndl-text)' }}>What is Prompt Context Packager?</h2>
            <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--ndl-muted)' }}>
              Drop source files, add instructions, and export a single structured markdown block with fenced code, optional
              file tree, and approximate token counts suited for Cursor, Claude, Gemini, and similar tools.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--ndl-accent)' }}>FAQ</p>
            <div className="space-y-5">
              {[
                {
                  q: 'How accurate is the token estimate?',
                  a: 'It uses the same BPE-style heuristic as Prompt Architect (~95–98% vs tiktoken for GPT-family text). Treat it as a planning aid, not a billing meter.',
                },
                {
                  q: 'Is there a file size limit?',
                  a: 'Only your device memory and browser UI. Very large packs may feel slow to edit or copy — prune before shipping to an LLM.',
                },
              ].map(({ q, a }) => (
                <div key={q} className="border-l-2 pl-5" style={{ borderColor: 'var(--ndl-border)' }}>
                  <p className="text-sm font-semibold mb-2" style={{ color: 'var(--ndl-text)' }}>{q}</p>
                  <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--ndl-muted)' }}>{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
