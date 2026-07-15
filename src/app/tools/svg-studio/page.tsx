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
        <div className="max-w-3xl mx-auto px-6 sm:px-10 space-y-10">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--ndl-accent)' }}>About this tool</p>
            <h2 className="text-2xl font-light tracking-tight mb-4" style={{ color: 'var(--ndl-text)' }}>What is SVG Studio?</h2>
            <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--ndl-muted)' }}>
              Drop or paste SVG markup to strip editor metadata, empty groups, and noisy attributes, then export clean React
              (JSX props) or Vue SFC snippets without leaving the browser.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--ndl-accent)' }}>FAQ</p>
            <div className="space-y-5">
              {[
                {
                  q: 'Is the preview sandboxed?',
                  a: 'Preview injects optimized SVG into the page for visual check. Only process SVGs you trust — same as opening an SVG file locally.',
                },
                {
                  q: 'Will this remove all Inkscape data?',
                  a: 'Common inkscape/sodipodi attributes and metadata blocks are scrubbed. Complex multi-namespace documents may need a second pass in a dedicated SVG optimizer.',
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
