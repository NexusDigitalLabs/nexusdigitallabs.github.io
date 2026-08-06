import SvgStudioClient from '@/components/tools/SvgStudioClient';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Interactive SVG Studio — Optimize SVG to React & Vue',
  description:
    'Free SVG optimizer in the browser. Scrub export junk, preview on a checkerboard, and copy React or Vue components. 100% client-side.',
  path: '/tools/svg-studio/',
  keywords: ['svg optimizer', 'svg to react', 'svg to vue', 'client-side svg cleaner'],
  absoluteTitle: true,
  ogTitle: 'Interactive SVG Studio — NexusDigitalLabs',
  ogDescription: 'Optimize SVGs and export React/Vue components locally.',
});

export default function SvgStudioPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Interactive SVG Studio',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Any',
            url: 'https://nexusdigitallabs.dev/tools/svg-studio/',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }),
        }}
      />
      <SvgStudioClient />
      <section className="border-t py-16 sm:py-20" style={{ borderColor: 'var(--ndl-border)' }}>
        <div className="max-w-3xl mx-auto px-6 sm:px-10 space-y-12">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--ndl-accent)' }}>About this tool</p>
            <h2 className="text-2xl font-light tracking-tight mb-4" style={{ color: 'var(--ndl-text)' }}>What is SVG Studio?</h2>
            <p className="text-sm font-light leading-relaxed mb-4" style={{ color: 'var(--ndl-muted)' }}>
              Drop or paste SVG markup to strip editor metadata, empty groups, and noisy attributes, then export clean React
              (JSX props) or Vue SFC snippets without leaving the browser.
            </p>
            <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--ndl-muted)' }}>
              Design tools often emit SVGs packed with Inkscape or Illustrator namespaces, unused IDs, and nested groups that
              inflate DOM size. Shipping those files unchanged hurts First Contentful Paint and makes icon systems harder to
              theme. SVG Studio is a local scrub-and-export step before icons land in your component library.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--ndl-accent)' }}>Deep dive</p>
            <h2 className="text-2xl font-light tracking-tight mb-4" style={{ color: 'var(--ndl-text)' }}>
              Optimizing SVG paths to prevent DOM bloat in React and Vue
            </h2>
            <h3 className="text-lg font-medium tracking-tight mb-3" style={{ color: 'var(--ndl-text)' }}>
              What “bloat” looks like in practice
            </h3>
            <p className="text-sm font-light leading-relaxed mb-4" style={{ color: 'var(--ndl-muted)' }}>
              A 2 KB icon can become 20 KB of markup when export tools leave editor guides, sodipodi attributes, and
              redundant transforms. In React and Vue, every node is a virtual DOM entry. Multiply that by a dense icon row
              and you pay in hydration cost, style recalculation, and harder CSS overrides when fill and stroke are locked
              inside hard-coded attributes.
            </p>
            <h3 className="text-lg font-medium tracking-tight mb-3" style={{ color: 'var(--ndl-text)' }}>
              A practical optimization loop
            </h3>
            <p className="text-sm font-light leading-relaxed mb-4" style={{ color: 'var(--ndl-muted)' }}>
              Scrub metadata and empty groups first, preview on a checkerboard to catch transparency issues, then export a
              component that maps SVG attributes to JSX or Vue bindings. Prefer currentColor-friendly fills when you want
              themeable icons. Keep path data intact unless you intentionally simplify geometry in a dedicated path editor —
              this studio focuses on markup hygiene and framework export, not Bézier rewriting.
            </p>
            <h3 className="text-lg font-medium tracking-tight mb-3" style={{ color: 'var(--ndl-text)' }}>
              Sanitization, XSS, and safe React / Vue export
            </h3>
            <p className="text-sm font-light leading-relaxed mb-4" style={{ color: 'var(--ndl-muted)' }}>
              SVG is XML. Untrusted markup can carry scriptable payloads — for example{' '}
              <code>onload</code> handlers, <code>&lt;script&gt;</code> tags, or <code>javascript:</code> URLs inside{' '}
              <code>&lt;a&gt;</code> / <code>&lt;image&gt;</code> hrefs. Pasting that into the live DOM or into a React/Vue
              component without review is a classic XSS footgun. Treat every file from the internet as hostile until cleaned.
            </p>
            <p className="text-sm font-light leading-relaxed mb-4" style={{ color: 'var(--ndl-muted)' }}>
              This studio parses and rewrites vector markup in the browser: it strips noisy editor namespaces and empty
              groups, then emits framework-friendly snippets. That reduces DOM bloat and removes many accidental export
              artifacts, but it is not a substitute for a hardened SVG sanitizer (such as DOMPurify configured for SVG) when
              you accept uploads from end users on a production site. For your own design-tool exports, optimize here, then
              commit reviewed components — never <code>dangerouslySetInnerHTML</code> raw third-party SVG in React without
              an allowlist.
            </p>
            <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--ndl-muted)' }}>
              For large sets, process icons one at a time here, then commit the cleaned components so CI and Lighthouse
              scores stay predictable. Pair with tree-shaken icon imports so unused glyphs never reach the client bundle.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--ndl-accent)' }}>How to use it</p>
            <h2 className="text-2xl font-light tracking-tight mb-4" style={{ color: 'var(--ndl-text)' }}>Typical workflow</h2>
            <ol className="list-decimal pl-5 space-y-3 text-sm font-light leading-relaxed" style={{ color: 'var(--ndl-muted)' }}>
              <li>Paste SVG markup or drop a file exported from Figma, Illustrator, or Inkscape.</li>
              <li>Run optimization and inspect the checkerboard preview for clipped paths or missing fills.</li>
              <li>Copy the React JSX or Vue SFC snippet into your design-system package.</li>
              <li>Replace hard-coded colors with <code>currentColor</code> when the icon should follow text color.</li>
            </ol>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--ndl-accent)' }}>FAQ</p>
            <h2 className="text-2xl font-light tracking-tight mb-6" style={{ color: 'var(--ndl-text)' }}>Frequently asked questions</h2>
            <div className="space-y-5">
              {[
                {
                  q: 'Is the preview sandboxed?',
                  a: 'Preview injects optimized SVG into the page for visual check. Only process SVGs you trust — same as opening an SVG file locally. Untrusted third-party SVG can carry XSS payloads; sanitize before rendering user uploads in production.',
                },
                {
                  q: 'Will this remove all Inkscape data?',
                  a: 'Common inkscape/sodipodi attributes and metadata blocks are scrubbed. Complex multi-namespace documents may need a second pass in a dedicated SVG optimizer.',
                },
                {
                  q: 'Does optimization change path geometry?',
                  a: 'The studio prioritizes attribute and metadata cleanup plus framework export. Aggressive path simplification belongs in tools built for geometry (e.g. SVGO path plugins) when you need fewer points.',
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
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--ndl-faint)' }}>Related tools</p>
            <a href="/tools/json-engine/" className="text-sm no-underline" style={{ color: 'var(--ndl-accent)' }}>
              Generate TypeScript &amp; Zod from JSON →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
