import JsonEngineClient from '@/components/tools/JsonEngineClient';
import AdSlot from '@/components/AdSlot';
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
        <div className="max-w-3xl mx-auto px-6 sm:px-10 space-y-12">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--ndl-accent)' }}>About this tool</p>
            <h2 className="text-2xl font-light tracking-tight mb-4" style={{ color: 'var(--ndl-text)' }}>
              What is the JSON &amp; API Mock Engine?
            </h2>
            <p className="text-sm font-light leading-relaxed mb-4" style={{ color: 'var(--ndl-muted)' }}>
              Paste any JSON payload and instantly derive TypeScript interfaces, Zod schema source, and JSONPath listings.
              Everything runs in your browser — ideal for API mocking, contract sketching, and prompt prep without uploading secrets.
            </p>
            <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--ndl-muted)' }}>
              Teams often juggle three representations of the same payload: the wire format (JSON), the compile-time contract
              (TypeScript), and the runtime validator (Zod). Hand-syncing those layers is where drift and production bugs start.
              This engine collapses that loop into one paste: you keep a single source of truth in JSON and regenerate the
              typed surfaces you need for Next.js route handlers, React forms, and LLM tool schemas.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--ndl-accent)' }}>Deep dive</p>
            <h2 className="text-2xl font-light tracking-tight mb-4" style={{ color: 'var(--ndl-text)' }}>
              Runtime type safety with TypeScript and Zod inference
            </h2>
            <h3 className="text-lg font-medium tracking-tight mb-3" style={{ color: 'var(--ndl-text)' }}>
              Why interfaces alone are not enough
            </h3>
            <p className="text-sm font-light leading-relaxed mb-4" style={{ color: 'var(--ndl-muted)' }}>
              TypeScript interfaces disappear at compile time. They catch mistakes in your own code, but they cannot verify
              that a third-party API, webhook body, or LLM tool call actually matches the shape you assumed. Zod (and similar
              schema libraries) reintroduce checks at the boundary: parse once, then work with a typed value that has already
              been validated.
            </p>
            <h3 className="text-lg font-medium tracking-tight mb-3" style={{ color: 'var(--ndl-text)' }}>
              How this tool helps you compile that pipeline
            </h3>
            <p className="text-sm font-light leading-relaxed mb-4" style={{ color: 'var(--ndl-muted)' }}>
              The client-side transformation pipeline is intentional and inspectable:
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-sm font-light leading-relaxed mb-4" style={{ color: 'var(--ndl-muted)' }}>
              <li><strong style={{ color: 'var(--ndl-text)' }}>Parse</strong> — validate the pasted string as JSON into a plain object graph.</li>
              <li><strong style={{ color: 'var(--ndl-text)' }}>Walk</strong> — recurse objects and arrays, inferring primitives, nulls, and nested shapes.</li>
              <li><strong style={{ color: 'var(--ndl-text)' }}>Emit TypeScript</strong> — generate interfaces for IDE autocomplete and compile-time contracts.</li>
              <li><strong style={{ color: 'var(--ndl-text)' }}>Emit Zod source</strong> — produce schema code you paste into a project that already depends on <code>zod</code> for runtime parse + inferred types via <code>z.infer&lt;typeof Schema&gt;</code>.</li>
              <li><strong style={{ color: 'var(--ndl-text)' }}>List JSONPath</strong> — surface selectors for deep fields used in tests and scrapers.</li>
            </ol>
            <p className="text-sm font-light leading-relaxed mb-4" style={{ color: 'var(--ndl-muted)' }}>
              Starting from a real sample payload — a successful REST response, a fixture from Postman, or a mocked GraphQL
              field — keeps the inferred types honest. Client-side inference here means the browser derives shapes from values
              you already trust enough to paste; it does not run the live Zod validator until you wire the emitted schema
              into your app.
            </p>
            <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--ndl-muted)' }}>
              Because generation never leaves the tab, you can safely paste staging payloads that contain tokens or PII
              placeholders without shipping them to a third-party codegen SaaS. Treat the output as a starting scaffold:
              refine optional fields, branded types, and refinements for your domain after you paste into the repo.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--ndl-accent)' }}>How to use it</p>
            <h2 className="text-2xl font-light tracking-tight mb-4" style={{ color: 'var(--ndl-text)' }}>Typical workflow</h2>
            <ol className="list-decimal pl-5 space-y-3 text-sm font-light leading-relaxed" style={{ color: 'var(--ndl-muted)' }}>
              <li>Paste a representative JSON sample (prefer production-shaped fixtures with realistic nulls and arrays).</li>
              <li>Review the generated TypeScript interfaces and adjust names if the heuristic labels are too generic.</li>
              <li>Copy the Zod schema into your API boundary or form parser; add <code>.refine()</code> rules for business logic.</li>
              <li>Use JSONPath output when asserting nested values in tests or documenting queryable fields for consumers.</li>
            </ol>
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
                {
                  q: 'Can I use this for OpenAPI or mock servers?',
                  a: 'Yes as a bootstrap. Generate types and schemas from a sample response, then wire them into MSW handlers, contract tests, or documentation. It is not a full OpenAPI editor.',
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
              <a href="/articles/chatgpt-prompt-templates-for-developers/" className="text-sm no-underline" style={{ color: 'var(--ndl-accent)' }}>
                ChatGPT Prompt Templates for Developers →
              </a>
              <a href="/tools/prompt-packager/" className="text-sm no-underline" style={{ color: 'var(--ndl-accent)' }}>
                Pack multi-file context for LLMs →
              </a>
            </div>
          </div>
        </div>
      </section>

      <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOOLS} />
    </>
  );
}
