import PromptPackagerClient from '@/components/tools/PromptPackagerClient';
import AdSlot from '@/components/AdSlot';
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
        <div className="max-w-3xl mx-auto px-6 sm:px-10 space-y-12">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--ndl-accent)' }}>About this tool</p>
            <h2 className="text-2xl font-light tracking-tight mb-4" style={{ color: 'var(--ndl-text)' }}>What is Prompt Context Packager?</h2>
            <p className="text-sm font-light leading-relaxed mb-4" style={{ color: 'var(--ndl-muted)' }}>
              Drop source files, add instructions, and export a single structured markdown block with fenced code, optional
              file tree, and approximate token counts suited for Cursor, Claude, Gemini, and similar tools.
            </p>
            <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--ndl-muted)' }}>
              Large language models reason better when related files arrive together — types next to callers, tests next to
              implementations — but pasting folders by hand is error-prone. Packager builds a reviewable context packet so you
              control what enters the window instead of dumping an entire monorepo.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--ndl-accent)' }}>Deep dive</p>
            <h2 className="text-2xl font-light tracking-tight mb-4" style={{ color: 'var(--ndl-text)' }}>
              Managing large context windows and token optimization for LLMs
            </h2>
            <h3 className="text-lg font-medium tracking-tight mb-3" style={{ color: 'var(--ndl-text)' }}>
              Context is a budget, not a dumpster
            </h3>
            <p className="text-sm font-light leading-relaxed mb-4" style={{ color: 'var(--ndl-muted)' }}>
              Every token you send costs latency and money, and models degrade when irrelevant files crowd out the signal.
              Effective packaging means selecting the smallest set that still explains the change: public APIs, the files you
              will edit, and one or two exemplars of local conventions. Token estimates on this page help you stay under model
              limits before you hit “send” in Cursor or Claude.
            </p>
            <h3 className="text-lg font-medium tracking-tight mb-3" style={{ color: 'var(--ndl-text)' }}>
              Structure the packet the model can navigate
            </h3>
            <p className="text-sm font-light leading-relaxed mb-4" style={{ color: 'var(--ndl-muted)' }}>
              A short instruction block, an optional tree, and labeled fenced files outperform an undifferentiated paste.
              Put constraints first (“do not refactor unrelated modules”), then code. Prefer paths that match the repo so the
              model can cite locations accurately. After packaging, run a second pass with Prompt Architect if you need
              whitespace flattening or single-line JSON-safe prompts.
            </p>
            <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--ndl-muted)' }}>
              Keep secrets out of packs. Strip <code>.env</code> files, private keys, and customer data before packaging —
              the same privacy discipline as the rest of NexusDigitalLabs tools.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--ndl-accent)' }}>How to use it</p>
            <h2 className="text-2xl font-light tracking-tight mb-4" style={{ color: 'var(--ndl-text)' }}>Typical workflow</h2>
            <ol className="list-decimal pl-5 space-y-3 text-sm font-light leading-relaxed" style={{ color: 'var(--ndl-muted)' }}>
              <li>Add only the files needed for the task; drop lockfiles and generated bundles unless they are the subject.</li>
              <li>Write clear instructions describing the goal, constraints, and desired output format.</li>
              <li>Check the token estimate; prune until you are comfortably under your model’s context budget.</li>
              <li>Copy the packaged markdown into your IDE chat or API request.</li>
            </ol>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--ndl-accent)' }}>FAQ</p>
            <h2 className="text-2xl font-light tracking-tight mb-6" style={{ color: 'var(--ndl-text)' }}>Frequently asked questions</h2>
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
                {
                  q: 'Should I include node_modules?',
                  a: 'Almost never. Prefer your source and types. Dependency internals waste context and rarely improve answers about your app code.',
                },
              ].map(({ q, a }) => (
                <div key={q} className="border-l-2 pl-5" style={{ borderColor: 'var(--ndl-border)' }}>
                  <p className="text-sm font-semibold mb-2" style={{ color: 'var(--ndl-text)' }}>{q}</p>
                  <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--ndl-muted)' }}>{a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t" style={{ borderColor: 'var(--ndl-border)' }}>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--ndl-faint)' }}>Related reading</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="/articles/optimizing-ai-prompt-tokens-for-llms/" className="text-sm no-underline" style={{ color: 'var(--ndl-accent)' }}>
                Optimizing AI Prompt Tokens for LLMs →
              </a>
              <a href="/tools/prompt-architect/" className="text-sm no-underline" style={{ color: 'var(--ndl-accent)' }}>
                Prompt Architect — flatten &amp; estimate cost →
              </a>
            </div>
          </div>
        </div>
      </section>

      <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOOLS} />
    </>
  );
}
