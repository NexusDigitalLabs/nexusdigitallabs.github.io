import JsonEngineClient from '@/components/tools/JsonEngineClient';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'JSON & API Mock Engine — TypeScript, Zod & JSONPath Generator',
  description:
    'Free browser-based JSON engine. Generate TypeScript interfaces, Zod schemas, and JSONPath queries from JSON — 100% client-side, zero server cost.',
  path: '/tools/json-engine/',
  keywords: [
    'json to typescript',
    'json to zod',
    'jsonpath generator',
    'api mock json',
    'client-side json tools',
  ],
  absoluteTitle: true,
  ogTitle: 'JSON & API Mock Engine — NexusDigitalLabs',
  ogDescription: 'Turn JSON into TypeScript, Zod, and JSONPath instantly in your browser.',
});

export default function JsonEnginePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'JSON & API Mock Engine',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Any',
            url: 'https://nexusdigitallabs.dev/tools/json-engine/',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }),
        }}
      />
      <JsonEngineClient />
      <section className="border-t py-16 sm:py-20" style={{ borderColor: 'var(--ndl-border)' }}>
        <div className="max-w-3xl mx-auto px-6 sm:px-10 space-y-10">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--ndl-accent)' }}>About this tool</p>
            <h2 className="text-2xl font-light tracking-tight mb-4" style={{ color: 'var(--ndl-text)' }}>What is the JSON &amp; API Mock Engine?</h2>
            <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--ndl-muted)' }}>
              Paste any JSON payload and instantly derive TypeScript interfaces, Zod schema source, and JSONPath listings.
              Everything runs in your browser — ideal for API mocking, contract sketching, and prompt prep without uploading secrets.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--ndl-accent)' }}>FAQ</p>
            <h2 className="text-2xl font-light tracking-tight mb-6" style={{ color: 'var(--ndl-text)' }}>Frequently asked questions</h2>
            <div className="space-y-5">
              {[
                {
                  q: 'Does this send my JSON to a server?',
                  a: 'No. Parsing and codegen execute entirely client-side. No tool-specific network requests are made for your input.',
                },
                {
                  q: 'Is the Zod output a live validator?',
                  a: 'The tool emits Zod schema source you can paste into a project that already depends on zod. It does not load Zod in the browser.',
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
