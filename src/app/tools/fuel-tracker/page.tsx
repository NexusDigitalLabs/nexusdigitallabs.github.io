import FuelTrackerClient from '@/components/tools/FuelTrackerClient';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Fuel Tracker — Track Mileage, Cost & Efficiency | Nexus Digital Labs',
  description:
    'Free browser-based fuel tracking. Log fill-ups, track L/100km, visualise spend, sync with a personal code — optionally link to your account.',
  path: '/tools/fuel-tracker/',
  absoluteTitle: true,
  ogTitle: 'Fuel Tracker | Nexus Digital Labs',
  ogDescription:
    'Log fill-ups, track fuel efficiency and costs. Free sync code; optional account link.',
});

export default function FuelTrackerPage() {
  return (
    <>
      {/* ── JSON-LD ──────────────────────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Fuel Tracker',
            applicationCategory: 'UtilitiesApplication',
            operatingSystem: 'Web',
            url: 'https://nexusdigitallabs.dev/tools/fuel-tracker/',
            description:
              'A free fuel tracking tool with cross-device sync via a personal code, and optional account linking for restore-on-login.',
            author: { '@type': 'Organization', name: 'Nexus Digital Labs' },
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }),
        }}
      />

      {/* ── Interactive Tool ─────────────────────────────────────────── */}
      <FuelTrackerClient />

      {/* ── SEO Content Block ─────────────────────────────────────────── */}
      <section style={{ background: 'var(--ndl-bg)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: '52rem', margin: '0 auto' }}>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            What is the Fuel Tracker?
          </h2>
          <p style={{ fontSize: '0.9375rem', color: '#94a3b8', lineHeight: 1.75, marginBottom: '2rem' }}>
            The Nexus Digital Labs Fuel Tracker is a browser-based tool for tracking fuel fill-ups, calculating real-world fuel efficiency (L/100km and km/L), and monitoring spend across one or more vehicles. Data syncs via a personal code you create — no account required. Optionally sign in and link the garage to your account so it restores on new devices.
          </p>

          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.875rem' }}>
            How to use it
          </h2>
          <ol style={{ paddingLeft: '1.25rem', color: '#94a3b8', lineHeight: 2, marginBottom: '2rem', fontSize: '0.9375rem' }}>
            <li><strong style={{ color: '#f8fafc' }}>Create your garage</strong> — choose a memorable nickname; a unique sync code is generated for you.</li>
            <li><strong style={{ color: '#f8fafc' }}>Add your vehicle</strong> — make, model, year, and fuel type.</li>
            <li><strong style={{ color: '#f8fafc' }}>Log each fill-up</strong> — enter the odometer reading, litres pumped, and price per litre.</li>
            <li><strong style={{ color: '#f8fafc' }}>Read your stats</strong> — average efficiency, best/worst fill, total spend, and cost per km update instantly.</li>
            <li><strong style={{ color: '#f8fafc' }}>Sync anywhere</strong> — enter your sync code on any device, or sign in if you linked the garage to your account.</li>
          </ol>

          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1.25rem' }}>
            Frequently Asked Questions
          </h2>
          {[
            {
              q: 'What is L/100km and why does it matter?',
              a: 'Litres per 100 kilometres (L/100km) is the most common fuel efficiency metric in Europe, Asia, and Oceania. A lower value means your car uses less fuel to travel the same distance — better for your wallet and the environment. Our tracker calculates it automatically: (litres ÷ distance) × 100.',
            },
            {
              q: 'How does cross-device syncing work?',
              a: 'When you create a garage, a unique sync code (e.g. "MyGarage-7X4P") is generated and stored in your browser\'s local storage. On another device, choose "I have a code" and enter it. If you also link the garage to your NexusDigitalLabs account, signing in on a new device can restore your garage automatically.',
            },
            {
              q: 'Is my fuel data private?',
              a: 'With the sync-code flow alone, your garage is keyed only by that code — we do not require your name or email. Avoid putting personal identifiers in nicknames or notes. If you optionally sign in and link the garage, your account email/profile is stored via Supabase Auth and associated with that garage. See our Privacy Policy. We do not sell your data.',
            },
            {
              q: 'Do I need an account?',
              a: 'No. Sync codes work without signing in. An account is optional and useful if you want to restore a linked garage by signing in instead of re-entering the code.',
            },
            {
              q: 'What is a partial fill and how does it affect calculations?',
              a: 'A partial fill means you didn\'t fill the tank to capacity (e.g. a quick top-up before a trip). Because the full tank volume is unknown, efficiency calculations (L/100km) cannot be accurate for a partial fill. Mark them with the "Partial fill" checkbox and they will be excluded from efficiency metrics but still included in spending totals.',
            },
            {
              q: 'Can I track multiple vehicles?',
              a: 'Yes. After your first vehicle is set up, click "Add Vehicle" from the main view at any time. All vehicles share the same sync code and switch with a single tap.',
            },
            {
              q: 'Can I export my data?',
              a: 'Yes. Click the "Export CSV" button in Settings or at the bottom of your fill history. The exported file includes all odometer readings, efficiency calculations, costs, and notes — fully compatible with Excel and Google Sheets.',
            },
          ].map(({ q, a }) => (
            <div key={q} style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.375rem' }}>{q}</h3>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.75 }}>{a}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
