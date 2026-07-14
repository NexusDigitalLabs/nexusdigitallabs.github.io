import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';

export const metadata = pageMetadata({
  title: 'How to Track Your Car\'s Fuel Efficiency — NexusDigitalLabs',
  description:
    'A practical guide to tracking fuel consumption, calculating L/100km and km/L, and understanding what affects your car\'s real-world efficiency.',
  path: '/articles/how-to-track-car-fuel-efficiency/',
  keywords: [
    'how to track fuel efficiency',
    'calculate L/100km',
    'fuel consumption tracker',
    'km per litre calculator',
    'car fuel economy',
    'petrol cost tracking',
    'fuel log app',
  ],
  absoluteTitle: true,
  type: 'article',
  ogTitle: 'How to Track Your Car\'s Fuel Efficiency',
  ogDescription:
    'Learn how to calculate L/100km, log fill-ups correctly, and spot trends that cost you money at the pump.',
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
  { q: 'What is a good L/100km?', a: 'For a petrol car, anything under 7 L/100km is considered efficient. Small city cars average 5–6 L/100km. SUVs and larger vehicles typically average 9–13 L/100km. Hybrid vehicles often achieve 4–5 L/100km or lower.' },
  { q: 'When should I log a fill-up?', a: 'Log every fill-up at the moment you refuel. Record the odometer reading shown on your dashboard before you start pumping. Consistency matters more than perfection — log every single fill-up, not just some of them.' },
  { q: 'Why does my efficiency vary between fill-ups?', a: 'Short trips, city driving, air conditioning use, tyre pressure, load weight, and driving style all affect per-fill efficiency. Look at your rolling average over 5–10 fills rather than individual readings for a meaningful picture.' },
  { q: 'How do I convert L/100km to km/L?', a: 'Divide 100 by your L/100km figure. For example: 100 ÷ 6.5 = 15.4 km/L. To convert km/L back to L/100km: 100 ÷ km/L.' },
  { q: 'Can I track multiple vehicles?', a: 'Yes. The NexusDigitalLabs Fuel Tracker supports multiple vehicles under a single sync code. Add each vehicle separately and switch between them to view independent efficiency histories.' },
];

export default function FuelEfficiencyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'Article',
        headline: 'How to Track Your Car\'s Fuel Efficiency',
        description: 'A practical guide to tracking fuel consumption, calculating L/100km and km/L.',
        author: { '@type': 'Organization', name: 'NexusDigitalLabs' },
        publisher: { '@type': 'Organization', name: 'NexusDigitalLabs', url: 'https://nexusdigitallabs.dev' },
        url: 'https://nexusdigitallabs.dev/articles/how-to-track-car-fuel-efficiency/',
      })}} />

      <div className="max-w-2xl mx-auto px-6 sm:px-10 py-12 sm:py-16">
        <Link href="/articles/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors no-underline mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          All articles
        </Link>
        <article>
          <header className="mb-10">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="text-[0.6rem] font-bold tracking-widest uppercase text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1">Fuel & Cars</span>
              <span className="text-xs text-slate-500">Jul 2026</span>
              <span className="text-xs text-slate-600">·</span>
              <span className="text-xs text-slate-500">6 min read</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-light text-white tracking-tight leading-snug mb-5">How to Track Your Car&apos;s Fuel Efficiency</h1>
            <p className="text-slate-400 font-light text-base sm:text-lg leading-relaxed">Understanding your real-world fuel consumption helps you spot mechanical issues early, compare driving habits, and cut your monthly fuel bill.</p>
          </header>

          <div className="prose prose-invert max-w-none">
            <P>Most drivers have no idea how much fuel their car actually uses per kilometre. They fill up when the gauge is low, pay what the pump says, and move on. This means small inefficiencies — a slightly underinflated tyre, a dirty air filter, or a change in driving route — go unnoticed for months, costing hundreds of dollars a year.</P>
            <P>Tracking fuel efficiency takes less than 60 seconds per fill-up and gives you a clear, data-driven picture of what your car is actually doing.</P>

            <H2>The Two Key Metrics</H2>
            <P>Fuel efficiency is expressed in one of two ways depending on where you live:</P>
            <UL items={[
              <span key="1"><strong className="text-slate-200">L/100km (litres per 100 kilometres)</strong> — used in Australia, Europe, South Africa, and most of Asia. Lower is better. A reading of 6.0 L/100km means you use 6 litres to travel 100 km.</span>,
              <span key="2"><strong className="text-slate-200">km/L (kilometres per litre)</strong> — used in Japan, India, and parts of Southeast Asia. Higher is better. A reading of 16 km/L means you travel 16 km on each litre of fuel.</span>,
            ]} />
            <P>Both metrics describe the same thing from opposite directions. To convert: L/100km = 100 ÷ km/L. So 6.25 L/100km = 16 km/L.</P>

            <H2>How to Calculate L/100km Manually</H2>
            <P>You need two data points from consecutive fill-ups:</P>
            <UL items={[
              'The odometer reading at fill-up A (start)',
              'The odometer reading at fill-up B (next fill-up)',
              'The number of litres pumped at fill-up B',
            ]} />
            <P>The formula: <strong className="text-slate-200">L/100km = (litres pumped ÷ distance driven) × 100</strong></P>
            <P>Example: You fill up at 45,200 km. Next fill-up is at 45,540 km and you pump 22.4 litres. Distance = 340 km. L/100km = (22.4 ÷ 340) × 100 = <strong className="text-slate-200">6.59 L/100km</strong>.</P>

            <H2>What Affects Fuel Efficiency</H2>
            <UL items={[
              <span key="1"><strong className="text-slate-200">Tyre pressure</strong> — underinflated tyres increase rolling resistance. Check pressure monthly. A tyre that is 10 PSI low can increase fuel consumption by 2–3%.</span>,
              <span key="2"><strong className="text-slate-200">Driving style</strong> — aggressive acceleration and hard braking are the single biggest variables in fuel use. Smooth, anticipatory driving can improve efficiency by 15–30%.</span>,
              <span key="3"><strong className="text-slate-200">Air conditioning</strong> — running the AC increases fuel consumption by 5–15% depending on vehicle size and ambient temperature.</span>,
              <span key="4"><strong className="text-slate-200">Vehicle load</strong> — carrying an extra 50 kg increases fuel consumption by roughly 1–2%. Remove roof racks and heavy items from the boot when not needed.</span>,
              <span key="5"><strong className="text-slate-200">Trip type</strong> — short trips under 5 km are disproportionately inefficient because the engine never reaches optimal operating temperature.</span>,
              <span key="6"><strong className="text-slate-200">Engine condition</strong> — a sudden drop in efficiency often signals a mechanical issue: dirty fuel injectors, a failing oxygen sensor, or a clogged air filter.</span>,
            ]} />

            <H2>How to Log Fill-Ups Consistently</H2>
            <UL items={[
              'Always fill to full — partial fills make calculations unreliable',
              'Record the odometer reading before you start pumping, not after driving away',
              'Log every fill-up, not just memorable ones — the average over 10+ fills is far more useful than individual readings',
              'Note if the fill was partial (travelling, different station) so you can flag it in your records',
            ]} />

            <H2>When to Investigate</H2>
            <P>A single bad fill-up reading can be explained by driving conditions. But if your rolling average worsens by more than 10% over three or more consecutive fill-ups, investigate:</P>
            <UL items={[
              'Check and adjust tyre pressure',
              'Check and replace the air filter if overdue',
              'Check for dashboard warning lights',
              'Book a service if no obvious cause is found',
            ]} />

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
            <p className="text-xs font-semibold tracking-widest text-amber-400 uppercase mb-3">Free tool</p>
            <h3 className="text-base font-semibold text-white mb-2">Fuel Tracker</h3>
            <p className="text-sm text-slate-400 font-light leading-relaxed mb-4">Log fill-ups, track L/100km and km/L automatically, and see your efficiency and spend trend over time. Works across devices with a sync code; optionally link to your account.</p>
            <Link href="/tools/fuel-tracker/" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 no-underline">
              Open Fuel Tracker
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}
