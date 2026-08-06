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
        <div className="max-w-3xl mx-auto px-6 sm:px-10 space-y-12">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--ndl-accent)' }}>About this tool</p>
            <h2 className="text-2xl font-light tracking-tight mb-4" style={{ color: 'var(--ndl-text)' }}>Why format .env in the browser?</h2>
            <p className="text-sm font-light leading-relaxed mb-4" style={{ color: 'var(--ndl-muted)' }}>
              Environment files often contain secrets. This utility sorts keys, keeps the last duplicate, quotes values that need it,
              and surfaces syntax diagnostics without uploading anything.
            </p>
            <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--ndl-muted)' }}>
              Messy <code>.env</code> files cause real outages: shadowed keys, unquoted URLs with <code>#</code>, and copy-paste
              drift between <code>.env.example</code> and local overrides. Cleaning them in a SaaS pastebin is a security smell.
              A client-side formatter keeps credentials on your machine while you normalize structure for Next.js, Vite, and Docker Compose workflows.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--ndl-accent)' }}>Deep dive</p>
            <h2 className="text-2xl font-light tracking-tight mb-4" style={{ color: 'var(--ndl-text)' }}>
              Safe dotenv hygiene for modern JavaScript apps
            </h2>
            <h3 className="text-lg font-medium tracking-tight mb-3" style={{ color: 'var(--ndl-text)' }}>
              Sort, dedupe, then validate
            </h3>
            <p className="text-sm font-light leading-relaxed mb-4" style={{ color: 'var(--ndl-muted)' }}>
              Alphabetical keys make reviews and diffs readable. Duplicate keys almost always mean an accidental paste —
              dotenv loaders typically keep the last assignment, which can silently change which database URL your app uses.
              This tool applies that “last wins” rule explicitly so you see the surviving value, then flags lines that look
              syntactically broken before you commit.
            </p>
            <h3 className="text-lg font-medium tracking-tight mb-3" style={{ color: 'var(--ndl-text)' }}>
              What stays local — and what you should still never commit
            </h3>
            <p className="text-sm font-light leading-relaxed mb-4" style={{ color: 'var(--ndl-muted)' }}>
              Formatting does not encrypt secrets. Keep production credentials in a vault or host env settings, commit only
              <code>.env.example</code> with placeholders, and rotate anything that may have leaked into chat or screenshots.
              Use this page when you need a clean, reviewable file — not as a substitute for secret management.
            </p>
            <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--ndl-muted)' }}>
              Pair with framework conventions: Next.js public vars need the <code>NEXT_PUBLIC_</code> prefix; Vite uses
              <code>VITE_</code>. After formatting, verify those prefixes still match what your code reads at build time.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--ndl-accent)' }}>How to use it</p>
            <h2 className="text-2xl font-light tracking-tight mb-4" style={{ color: 'var(--ndl-text)' }}>Typical workflow</h2>
            <ol className="list-decimal pl-5 space-y-3 text-sm font-light leading-relaxed" style={{ color: 'var(--ndl-muted)' }}>
              <li>Paste the contents of your local <code>.env</code> (never share production secrets in screenshots).</li>
              <li>Run format to sort keys, collapse duplicates, and review diagnostics.</li>
              <li>Copy the cleaned output back into your project or into <code>.env.example</code> with values redacted.</li>
              <li>Restart the dev server so process env picks up the new file.</li>
            </ol>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--ndl-accent)' }}>FAQ</p>
            <h2 className="text-2xl font-light tracking-tight mb-6" style={{ color: 'var(--ndl-text)' }}>Frequently asked questions</h2>
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
                {
                  q: 'Does this support multiline values?',
                  a: 'Standard single-line KEY=value entries are the primary target. Complex multiline or export-prefixed shells may need manual cleanup after formatting.',
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
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--ndl-faint)' }}>Related</p>
            <a href="/articles/why-we-build-privacy-first-tools/" className="text-sm no-underline" style={{ color: 'var(--ndl-accent)' }}>
              Why we build privacy-first tools →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
