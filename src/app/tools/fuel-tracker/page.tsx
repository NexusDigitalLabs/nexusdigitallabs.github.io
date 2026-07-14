import FuelTrackerClient from '@/components/tools/FuelTrackerClient';
import PWAInstallBanner from '@/components/PWAInstallBanner';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Fuel Tracker — Track Mileage, Cost & Efficiency | Nexus Digital Labs',
  description:
    'Free browser-based fuel tracking tool. Log fill-ups, track L/100km efficiency, visualise spend over time, and sync data across devices — no account needed.',
  path: '/tools/fuel-tracker/',
  absoluteTitle: true,
  ogTitle: 'Fuel Tracker | Nexus Digital Labs',
  ogDescription:
    'Log fill-ups, track fuel efficiency and costs across your vehicles. Free, private, no sign-up.',
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
              'A free, client-side fuel tracking tool. Log fill-ups, track L/100km efficiency, visualise spending and mileage across multiple vehicles with cross-device sync.',
            author: { '@type': 'Organization', name: 'Nexus Digital Labs' },
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }),
        }}
      />

      {/* ── Interactive Tool ─────────────────────────────────────────── */}
      <FuelTrackerClient />

      {/* ── PWA install prompt (mobile only, client-side) ─────────────── */}
      <PWAInstallBanner />

      {/* ── SEO Content Block ─────────────────────────────────────────── */}
      <section style={{ background: '#090d15', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: '52rem', margin: '0 auto' }}>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            What is the Fuel Tracker?
          </h2>
          <p style={{ fontSize: '0.9375rem', color: '#94a3b8', lineHeight: 1.75, marginBottom: '2rem' }}>
            The Nexus Digital Labs Fuel Tracker is a fully browser-based tool for tracking fuel fill-ups, calculating real-world fuel efficiency (L/100km and km/L), and monitoring your spend across one or more vehicles over time. All data is stored in a private cloud database — synced via a personal code you create. No login, no email, no third-party tracking.
          </p>

          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.875rem' }}>
            How to use it
          </h2>
          <ol style={{ paddingLeft: '1.25rem', color: '#94a3b8', lineHeight: 2, marginBottom: '2rem', fontSize: '0.9375rem' }}>
            <li><strong style={{ color: '#f8fafc' }}>Create your garage</strong> — choose a memorable nickname; a unique sync code is generated for you.</li>
            <li><strong style={{ color: '#f8fafc' }}>Add your vehicle</strong> — make, model, year, and fuel type.</li>
            <li><strong style={{ color: '#f8fafc' }}>Log each fill-up</strong> — enter the odometer reading, litres pumped, and price per litre.</li>
            <li><strong style={{ color: '#f8fafc' }}>Read your stats</strong> — average efficiency, best/worst fill, total spend, and cost per km update instantly.</li>
            <li><strong style={{ color: '#f8fafc' }}>Sync anywhere</strong> — enter your sync code on any device to access your full history.</li>
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
              a: 'When you create a garage, a unique sync code (e.g. "MyGarage-7X4P") is generated. This code is stored in your browser\'s local storage so your device loads automatically. On any other device, simply visit the Fuel Tracker and choose "I have a code" — enter your sync code and all your vehicles and fill history loads instantly.',
            },
            {
              q: 'Is my fuel data private?',
              a: 'Yes. The only identifier stored is your randomly-suffixed sync code. We never ask for your name, email, or any personal information. Your data is associated solely with your code — which only you know. We do not share or sell any data.',
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
