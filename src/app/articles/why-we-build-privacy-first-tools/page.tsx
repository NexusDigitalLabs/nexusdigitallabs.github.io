import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';

export const metadata = pageMetadata({
  title: 'Why We Build Privacy-First Tools — NexusDigitalLabs',
  description:
    'The philosophy behind NexusDigitalLabs — why we chose client-side architecture, what privacy-first actually means in practice, and why we think the web deserves better tools.',
  path: '/articles/why-we-build-privacy-first-tools/',
  keywords: [
    'privacy first tools',
    'client side web tools',
    'no account tools',
    'browser based utilities',
    'nexusdigitallabs about',
    'privacy web apps',
  ],
  absoluteTitle: true,
  type: 'article',
  ogTitle: 'Why We Build Privacy-First Tools',
  ogDescription:
    'The philosophy behind NexusDigitalLabs and what privacy-first actually means in practice.',
});

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-medium text-slate-100 tracking-tight mt-10 mb-3">{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-slate-400 font-light leading-relaxed mb-4 text-sm sm:text-base">{children}</p>;
}

export default function PrivacyFirstPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'Article',
        headline: 'Why We Build Privacy-First Tools',
        author: { '@type': 'Organization', name: 'NexusDigitalLabs' },
        publisher: { '@type': 'Organization', name: 'NexusDigitalLabs', url: 'https://nexusdigitallabs.dev' },
        url: 'https://nexusdigitallabs.dev/articles/why-we-build-privacy-first-tools/',
      })}} />

      <div className="max-w-2xl mx-auto px-6 sm:px-10 py-12 sm:py-16">
        <Link href="/articles/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors no-underline mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          All articles
        </Link>
        <article>
          <header className="mb-10">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="text-[0.6rem] font-bold tracking-widest uppercase text-blue-400 bg-blue-500/10 border border-blue-500/25 px-2.5 py-1">About</span>
              <span className="text-xs text-slate-500">Jul 2026</span>
              <span className="text-xs text-slate-600">·</span>
              <span className="text-xs text-slate-500">5 min read</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-light text-white tracking-tight leading-snug mb-5">Why We Build Privacy-First Tools</h1>
            <p className="text-slate-400 font-light text-base sm:text-lg leading-relaxed">Most web tools collect data they do not need, require accounts you did not ask for, and run infrastructure that makes them expensive to maintain. We think the web can do better.</p>
          </header>

          <div className="prose prose-invert max-w-none">
            <P>When we started building NexusDigitalLabs, we had a simple frustration: most web utilities ask for an email address before they let you use them. An invoice generator. A token counter. A debt calculator. Tools that have no logical reason to know who you are.</P>
            <P>The email collection is not for your benefit. It is for the product&apos;s lead generation funnel. You exchange personal data for temporary access to a tool that, with modern browser APIs, could run entirely on your device without ever touching a server.</P>

            <H2>What Privacy-First Actually Means</H2>
            <P>Privacy-first is not a marketing term for us — it is an architectural decision. For tools where data does not need to leave your device, it does not. The Prompt Architect token counter, the Invoice Generator, and the Debt Optimizer all run entirely in your browser. Your prompts, financial figures, and debt balances are never transmitted to any server. You can verify this with your browser&apos;s network inspector — no outbound requests are made when you use those tools.</P>
            <P>For tools where cross-device sync is genuinely useful — like the Fuel Tracker — we use anonymous identifiers rather than accounts. Your sync code is a random string you create. We have no way to link it to you. No email, no name, no profile. The data is associated with a code, not a person.</P>

            <H2>Why Not Just Build a SaaS?</H2>
            <P>We could. A SaaS model with accounts, subscriptions, and a user database would be more financially scalable. But it would also mean:</P>
            <P>Every user becomes a liability. Email addresses are regulated personal data under GDPR and CCPA. Storing them requires consent management, data retention policies, breach notification procedures, and ongoing compliance overhead. For a small team building tools in their spare time, that overhead is a burden that slows everything down.</P>
            <P>More importantly: it changes the incentive structure. When your revenue depends on retaining users, you optimise for engagement rather than utility. You add friction to free features to push upgrades. You collect data because it &quot;might be useful someday&quot; even when you have no immediate use for it. These are rational business decisions, but they are not aligned with building tools that simply work well.</P>

            <H2>The Performance Benefit</H2>
            <P>Client-side architecture has a side effect: it is fast. There is no network round-trip for data processing. No API latency. No server cold start. The Prompt Architect gives you a live token count as you type because the entire computation happens in the JavaScript engine running on your own machine. No request is made. No response is awaited. It is instant because there is nothing in between you and the result.</P>
            <P>This is not a limitation of our infrastructure budget. It is the correct architecture for tools that process text, numbers, and local data.</P>

            <H2>What Privacy-First Does Not Mean</H2>
            <P>It does not mean we collect zero data. We track aggregate page views to understand which tools are useful — this is a page path and a count integer, nothing more. We use Umami Analytics, which stores no personal data, sets no cookies, and has no user profiles. We also use Google Tag Manager for future analytics integration, with the same privacy-conscious approach.</P>
            <P>It does not mean we will never have accounts or paid features. We may introduce optional accounts for features that genuinely benefit from them. If we do, those accounts will be opt-in, the free tier will remain accessible, and we will be explicit about what data is collected and why.</P>

            <H2>The Goal</H2>
            <P>Build tools that are useful, fast, and honest. No dark patterns. No data collection disguised as personalisation. No email gates in front of tools that have no reason to know your email address.</P>
            <P>If a tool we build saves you 10 minutes, it has done its job. We do not need your data to make that happen.</P>
          </div>

          <div className="mt-14 p-6 rounded-2xl bg-slate-900/50 border border-slate-800/60">
            <p className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-3">Our tools</p>
            <h3 className="text-base font-semibold text-white mb-2">Browse NexusDigitalLabs Tools</h3>
            <p className="text-sm text-slate-400 font-light leading-relaxed mb-4">Invoice Generator, Debt Optimizer, Fuel Tracker, and Prompt Architect — all free, all private, no account needed for core features.</p>
            <Link href="/#tools" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 no-underline">
              Browse tools
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}
