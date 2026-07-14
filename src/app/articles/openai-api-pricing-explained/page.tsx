import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';

export const metadata = pageMetadata({
  title: 'OpenAI API Pricing Explained: What You Actually Pay — NexusDigitalLabs',
  description:
    'A plain-language breakdown of how OpenAI API pricing works — tokens, input vs output costs, model tiers, and real-world cost estimates for common use cases.',
  path: '/articles/openai-api-pricing-explained/',
  keywords: [
    'openai api pricing',
    'gpt-4o cost per token',
    'openai api cost calculator',
    'how much does chatgpt api cost',
    'openai token pricing 2026',
    'llm api cost comparison',
  ],
  absoluteTitle: true,
  type: 'article',
  ogTitle: 'OpenAI API Pricing Explained: What You Actually Pay',
  ogDescription:
    'A clear breakdown of OpenAI API token pricing, model tiers, and real cost estimates for common applications.',
});

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-medium text-slate-100 tracking-tight mt-10 mb-3">{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-slate-400 font-light leading-relaxed mb-4 text-sm sm:text-base">{children}</p>;
}
function UL({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="text-slate-400 font-light text-sm sm:text-base leading-relaxed mb-4 space-y-1.5 pl-5 list-disc marker:text-slate-600">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

const FAQ = [
  { q: 'What counts as one token?', a: 'Roughly 4 characters of English text, or about ¾ of a word. "Hello world" is approximately 3 tokens. "The quick brown fox jumps over the lazy dog" is approximately 10 tokens. Code and non-English languages are often more token-dense.' },
  { q: 'Are input and output tokens priced the same?', a: 'No. Output tokens (the model\'s response) are typically 3–4× more expensive than input tokens across OpenAI models. This matters for applications that generate long responses — optimising output length has a disproportionate impact on cost.' },
  { q: 'What is prompt caching and does it save money?', a: 'OpenAI offers discounted rates for repeated prompt prefixes via caching. If your system prompt stays the same across many calls, cached input tokens cost roughly 50% less. Caching is particularly valuable for large system prompts or RAG pipelines with static context.' },
  { q: 'How do I estimate costs before building?', a: 'Estimate your average prompt length in tokens, add your expected average response length, and multiply by the per-token rate for your chosen model. Then multiply by your expected request volume. Use the Prompt Architect tool to measure token counts for your specific prompts.' },
  { q: 'Is GPT-4o always the best choice?', a: 'Not for every use case. GPT-4o mini costs roughly 15× less than GPT-4o and handles the majority of classification, extraction, summarisation, and conversational tasks with comparable quality. Use GPT-4o when you need complex reasoning, nuanced writing, or difficult code generation.' },
];

export default function OpenAIPricingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'Article',
        headline: 'OpenAI API Pricing Explained: What You Actually Pay',
        author: { '@type': 'Organization', name: 'NexusDigitalLabs' },
        publisher: { '@type': 'Organization', name: 'NexusDigitalLabs', url: 'https://nexusdigitallabs.dev' },
        url: 'https://nexusdigitallabs.dev/articles/openai-api-pricing-explained/',
      })}} />

      <div className="max-w-2xl mx-auto px-6 sm:px-10 py-12 sm:py-16">
        <Link href="/articles/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors no-underline mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          All articles
        </Link>
        <article>
          <header className="mb-10">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="text-[0.6rem] font-bold tracking-widest uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-2.5 py-1">LLM Cost</span>
              <span className="text-xs text-slate-500">Jul 2026</span>
              <span className="text-xs text-slate-600">·</span>
              <span className="text-xs text-slate-500">6 min read</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-light text-white tracking-tight leading-snug mb-5">OpenAI API Pricing Explained: What You Actually Pay</h1>
            <p className="text-slate-400 font-light text-base sm:text-lg leading-relaxed">OpenAI charges per token, not per request. Understanding how that works — and how input, output, and cached tokens are priced differently — is essential for managing API costs at any scale.</p>
          </header>

          <div className="prose prose-invert max-w-none">
            <P>Every time you make an API call to OpenAI, you are charged for the number of tokens processed — both the tokens you send (input) and the tokens the model generates (output). The exact price depends on which model you use.</P>

            <H2>How Token Pricing Works</H2>
            <P>OpenAI prices are listed per 1 million tokens (per MTok). A token is roughly 4 characters of English text — about ¾ of a word. The phrase &quot;the quick brown fox&quot; is approximately 4 tokens.</P>
            <P>Key prices for common models (approximate — check OpenAI&apos;s pricing page for current rates):</P>
            <UL items={[
              <span key="1"><strong className="text-slate-200">GPT-4o</strong> — Input: ~$2.50/MTok · Output: ~$10.00/MTok</span>,
              <span key="2"><strong className="text-slate-200">GPT-4o mini</strong> — Input: ~$0.15/MTok · Output: ~$0.60/MTok</span>,
              <span key="3"><strong className="text-slate-200">GPT-4.1</strong> — Input: ~$2.00/MTok · Output: ~$8.00/MTok</span>,
              <span key="4"><strong className="text-slate-200">o3-mini</strong> — Input: ~$1.10/MTok · Output: ~$4.40/MTok</span>,
            ]} />

            <H2>Input vs Output Token Cost</H2>
            <P>Output tokens are consistently 3–5× more expensive than input tokens. This is a critical design consideration. An application that generates long responses will cost dramatically more than one that generates short, structured outputs for the same input length.</P>
            <P>Practical implication: if you can get the same information from a 50-token response vs a 300-token response, instruct the model explicitly: <em className="text-slate-300">&quot;Respond in under 50 words.&quot;</em> This alone can reduce per-call cost by 70–80%.</P>

            <H2>Real-World Cost Estimates</H2>
            <UL items={[
              <span key="1"><strong className="text-slate-200">Simple classification (100 tokens in, 10 tokens out)</strong> on GPT-4o mini: ~$0.000021 per call. At 1M calls/month: ~$21.</span>,
              <span key="2"><strong className="text-slate-200">Customer support reply (500 tokens in, 200 tokens out)</strong> on GPT-4o: ~$0.00325 per call. At 10,000 calls/month: ~$32.50.</span>,
              <span key="3"><strong className="text-slate-200">Long-form content generation (1,000 tokens in, 1,500 tokens out)</strong> on GPT-4o: ~$0.0175 per call. At 1,000 calls/month: ~$17.50.</span>,
            ]} />

            <H2>Three Ways to Reduce Your Bill Without Changing Models</H2>
            <UL items={[
              <span key="1"><strong className="text-slate-200">Trim your system prompt</strong> — most system prompts contain redundant instructions. Every unnecessary sentence adds to input cost on every single call.</span>,
              <span key="2"><strong className="text-slate-200">Use structured output</strong> — instruct the model to respond in JSON with defined keys. Short structured responses cost less than verbose prose answers.</span>,
              <span key="3"><strong className="text-slate-200">Cache repeated context</strong> — if your system prompt or knowledge base context is static, take advantage of prompt caching to reduce input cost by ~50%.</span>,
            ]} />

            <H2>When to Choose a Smaller Model</H2>
            <P>GPT-4o mini handles most tasks that do not require complex reasoning — classification, entity extraction, summarisation, simple Q&A, template filling. It costs roughly 15–17× less than GPT-4o. Running a quick A/B test on your specific use case with both models before committing to the expensive one is always worth 30 minutes of effort.</P>

            <H2>Frequently Asked Questions</H2>
            <div className="space-y-5 mt-2">
              {FAQ.map((item) => (
                <div key={item.q} className="border-l-2 border-slate-700 pl-4">
                  <p className="text-sm font-semibold text-slate-200 mb-1">{item.q}</p>
                  <p className="text-sm text-slate-400 font-light leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-14 p-6 rounded-2xl bg-slate-900/50 border border-slate-800/60">
            <p className="text-xs font-semibold tracking-widest text-indigo-400 uppercase mb-3">Free tool</p>
            <h3 className="text-base font-semibold text-white mb-2">Prompt Architect — Token Counter & Cost Estimator</h3>
            <p className="text-sm text-slate-400 font-light leading-relaxed mb-4">Paste your prompt and see its exact token count plus real-time cost estimates for GPT-4o, GPT-4o mini, Claude, and Gemini — all client-side, nothing sent to any server.</p>
            <Link href="/tools/prompt-architect/" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 ndl-on-accent text-sm font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 no-underline">
              Open Prompt Architect
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}
