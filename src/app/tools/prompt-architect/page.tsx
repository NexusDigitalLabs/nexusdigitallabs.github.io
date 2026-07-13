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
    </>
  );
}
