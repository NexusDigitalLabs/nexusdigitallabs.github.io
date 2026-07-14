import type { Metadata } from 'next';
import PromptArchitectClient from '@/components/tools/PromptArchitectClient';

export const metadata: Metadata = {
  title: 'Prompt Architect & Token Counter — Free AI Prompt Optimizer Tool',
  description:
    'Free browser-based AI prompt optimizer and GPT token counter. Remove whitespace, flatten prompts, estimate token costs for GPT-4o, Claude, and Gemini — 100% client-side. Zero data sent to any server.',
  keywords: [
    'prompt architect', 'token counter', 'ChatGPT token counter', 'GPT-4 token optimizer',
    'AI prompt engineering', 'reduce token usage', 'prompt optimization tool',
    'LLM prompt builder', 'tiktoken alternative', 'free token counter',
  ],
  alternates: { canonical: 'https://nexusdigitallabs.dev/tools/prompt-architect/' },
  openGraph: {
    title: 'Prompt Architect & Token Counter — Free AI Prompt Optimizer',
    description: 'Optimize AI prompts, count tokens, and estimate API costs instantly. 100% client-side — no data leaves your browser.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Prompt Architect & Token Counter',
    description: 'Free browser-based AI prompt optimizer. Token counting, whitespace removal, and cost estimation — zero server calls.',
  },
};

export default function PromptArchitectPage() {
  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Prompt Architect & Token Counter',
            description:
              'Free browser-based AI prompt optimizer and GPT token counter. Remove whitespace, flatten prompts, and estimate API costs for GPT-4o, Claude, and Gemini — 100% client-side.',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Any',
            browserRequirements: 'Requires JavaScript',
            url: 'https://nexusdigitallabs.dev/tools/prompt-architect/',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            featureList: [
              'Live token counting',
              'Whitespace removal',
              'Single-line flattening',
              'API cost estimation for GPT-4o, Claude, and Gemini',
              '100% client-side — no data transmission',
            ],
          }),
        }}
      />

      {/* Interactive tool — must be a Client Component */}
      <PromptArchitectClient />

      {/* ── SEO content — server-rendered, immediately crawlable ───────── */}
      <section className="border-t border-slate-800/50 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 space-y-12">

          {/* What it is */}
          <div>
            <p className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-4">About this tool</p>
            <h2 className="text-2xl font-light text-white tracking-tight mb-4">What is Prompt Architect?</h2>
            <p className="text-slate-400 font-light leading-relaxed text-sm sm:text-base mb-3">
              Prompt Architect is a free, browser-based AI prompt optimizer and token counter. It measures the token count of any text using Byte Pair Encoding (BPE) — the same tokenization algorithm used by OpenAI's GPT models — and estimates the real API cost across GPT-4o, Claude 3.5 Sonnet, and Gemini 1.5 Pro.
            </p>
            <p className="text-slate-400 font-light leading-relaxed text-sm sm:text-base">
              The tool runs entirely client-side. Your prompts are never sent to any server, stored in any database, or processed outside your browser. This makes it safe for proprietary codebases, confidential instructions, and production prompt templates.
            </p>
          </div>

          {/* How to use */}
          <div>
            <p className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-4">How to use it</p>
            <h2 className="text-2xl font-light text-white tracking-tight mb-5">Step-by-step guide</h2>
            <ol className="space-y-4 text-sm sm:text-base text-slate-400 font-light">
              {[
                ['Paste your prompt', 'Copy your full prompt — system instructions, user message, context blocks, and all — and paste it into the input area. Token count updates instantly.'],
                ['Review the token count', 'The live count shows input tokens. Each model has a different pricing tier; the cost estimate updates automatically to reflect the current token count against each provider\'s published rate.'],
                ['Apply optimizations', 'Use the toolbar buttons to strip trailing whitespace, remove redundant blank lines, normalize line endings, and collapse the prompt to a single line. Each transformation shows the before/after token reduction.'],
                ['Copy the optimized prompt', 'Once satisfied with the compression, copy the optimized output and paste it directly into your production prompt template or API call.'],
              ].map(([title, desc], i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                  <div>
                    <p className="font-medium text-slate-200 mb-1">{title}</p>
                    <p className="text-slate-400 font-light">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* FAQ */}
          <div>
            <p className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-4">FAQ</p>
            <h2 className="text-2xl font-light text-white tracking-tight mb-6">Frequently asked questions</h2>
            <div className="space-y-6">
              {[
                { q: 'Is the token count 100% accurate?', a: 'The tool uses a JavaScript implementation of BPE tokenization that closely approximates the OpenAI tiktoken library. Results are accurate for GPT-3.5, GPT-4, and GPT-4o. Claude and Gemini use slightly different tokenization schemes, so counts for those models are estimates within ±5%.' },
                { q: 'Does this tool send my prompts anywhere?', a: 'No. All processing happens inside your browser using JavaScript. Your text is never transmitted to any server. You can verify this by opening your browser\'s network inspector — no outbound requests are made when you type or paste.' },
                { q: 'What is the most effective way to reduce token count?', a: 'For most prompts, trailing whitespace removal and blank line collapsing together reduce token count by 8–15%. If you are injecting structured data (JSON, YAML, code), flattening nested objects to key-value pairs can reduce token count by an additional 20–40% on the data block.' },
                { q: 'Which AI models does this support?', a: 'Cost estimates are provided for GPT-4o, GPT-4o mini, Claude 3.5 Sonnet, Claude 3 Haiku, and Gemini 1.5 Pro. Pricing is based on published provider rates and updated periodically.' },
                { q: 'Can I use this for free in production?', a: 'Yes, completely. There are no usage limits, no accounts, no API keys required, and no paid tier. The tool is free indefinitely.' },
              ].map(({ q, a }) => (
                <div key={q} className="border-l-2 border-slate-700 pl-5">
                  <p className="text-sm font-semibold text-slate-200 mb-2">{q}</p>
                  <p className="text-sm text-slate-400 font-light leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Related */}
          <div className="pt-6 border-t border-slate-800/40">
            <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase mb-4">Related reading</p>
            <div className="flex flex-col sm:flex-row gap-3">
              {[
                { href: '/articles/optimizing-ai-prompt-tokens-for-llms/', label: 'Optimizing AI Prompt Tokens for LLMs →' },
                { href: '/articles/how-to-reduce-openai-api-costs/', label: 'How to Reduce OpenAI API Costs →' },
              ].map(({ href, label }) => (
                <a key={href} href={href} className="text-sm text-blue-400 hover:text-blue-300 transition-colors no-underline">{label}</a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
