import EnvFormatterClient from '@/components/tools/EnvFormatterClient';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Secure .env Formatter — Sort, Deduplicate & Validate',
  description:
    'Free browser .env formatter. Alphabetize keys, remove duplicates, flag syntax issues, and copy a clean config — never leaves your device.',
  path: '/tools/env-formatter/',
  keywords: ['env formatter', 'dotenv cleaner', 'sort env keys', 'env validator'],
  absoluteTitle: true,
  ogTitle: 'Secure .env Formatter — NexusDigitalLabs',
  ogDescription: 'Clean .env files locally: sort, dedupe, and validate.',
});

export default function EnvFormatterPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Secure .env Formatter',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Any',
            url: 'https://nexusdigitallabs.dev/tools/env-formatter/',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }),
        }}
      />
      <EnvFormatterClient />
      <section className="border-t py-16 sm:py-20" style={{ borderColor: 'var(--ndl-border)' }}>
        <div className="max-w-3xl mx-auto px-6 sm:px-10 space-y-10">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--ndl-accent)' }}>About this tool</p>
            <h2 className="text-2xl font-light tracking-tight mb-4" style={{ color: 'var(--ndl-text)' }}>Why format .env in the browser?</h2>
            <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--ndl-muted)' }}>
              Environment files often contain secrets. This utility sorts keys, keeps the last duplicate, quotes values that need it,
              and surfaces syntax diagnostics without uploading anything.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--ndl-accent)' }}>FAQ</p>
            <div className="space-y-5">
              {[
                {
                  q: 'Are my secrets stored?',
                  a: 'No. Processing is in-memory in your tab. Refreshing the page clears the editor unless your browser restores form state.',
                },
                {
                  q: 'Which duplicate wins?',
                  a: 'Later declarations override earlier ones for the same key, matching typical dotenv “last wins” behavior.',
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
