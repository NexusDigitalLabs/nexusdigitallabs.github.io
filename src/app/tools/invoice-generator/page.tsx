import InvoiceGeneratorClient from '@/components/tools/InvoiceGeneratorClient';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Freelancer Invoice Generator — NexusDigitalLabs',
  description:
    'Free browser-based freelancer invoice generator. Create professional PDF invoices with line items, tax calculation, and bank wire details — runs in your browser, with an optional signed-in cloud draft.',
  path: '/tools/invoice-generator/',
  keywords: [
    'invoice generator',
    'freelancer invoice',
    'PDF invoice maker',
    'free invoice tool',
    'client billing',
    'bank wire invoice',
    'tax invoice',
    'NexusDigitalLabs',
  ],
  absoluteTitle: true,
  ogDescription:
    'Create professional A4 PDF invoices in seconds. Client details, line items, tax, bank wire info — free and fully client-side.',
});

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Freelancer Invoice Generator',
  url: 'https://nexusdigitallabs.dev/tools/invoice-generator/',
  description:
    'Free browser-based freelancer invoice generator. Create professional PDF invoices — 100% client-side.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: {
    '@type': 'Organization',
    name: 'NexusDigitalLabs',
    url: 'https://nexusdigitallabs.dev/',
    logo: { '@type': 'ImageObject', url: 'https://nexusdigitallabs.dev/favicon.png' },
  },
};

export default function InvoiceGeneratorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <InvoiceGeneratorClient />

      {/* ── SEO content ────────────────────────────────────────────────── */}
      <section className="border-t border-slate-800/50 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 space-y-12">
          <div>
            <p className="text-xs font-semibold tracking-widest text-emerald-400 uppercase mb-4">About this tool</p>
            <h2 className="text-2xl font-light text-white tracking-tight mb-4">What is the Invoice Generator?</h2>
            <p className="text-slate-400 font-light leading-relaxed text-sm sm:text-base mb-3">
              The NexusDigitalLabs Invoice Generator is a free, browser-based tool that lets freelancers and independent contractors create professional PDF invoices in under two minutes. By default everything stays in your browser session. If you sign in, you can optionally enable a cloud draft so you can resume on another device — that copy is stored only for your account and can be turned off anytime.
            </p>
            <p className="text-slate-400 font-light leading-relaxed text-sm sm:text-base">
              It supports dynamic line items, custom payment terms, bank transfer details, optional tax and discount lines, and a live preview that updates as you type. Once complete, a single click generates and downloads a print-ready PDF.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest text-emerald-400 uppercase mb-4">How to use it</p>
            <h2 className="text-2xl font-light text-white tracking-tight mb-5">Creating your invoice</h2>
            <ol className="space-y-4 text-sm sm:text-base text-slate-400 font-light">
              {[
                ['Fill in your details', 'Enter your name or business name, contact email, and optionally your address and bank details in the "From" section. These details appear in the invoice header.'],
                ['Add the client details', 'Fill in your client\'s name, company name, and address in the "Bill To" section.'],
                ['Set invoice metadata', 'Enter an invoice number, the issue date, and the due date. Use a consistent numbering scheme like INV-001, INV-002.'],
                ['Add line items', 'Click "Add Line Item" for each service or product. Enter a description, quantity, and unit price. The tool calculates totals automatically.'],
                ['Apply tax and discounts', 'Optionally add a tax percentage and a discount amount. The subtotal, tax, and grand total update in real time.'],
                ['Download the PDF', 'Click "Download PDF" to generate and download a print-ready invoice. No watermarks, no account required.'],
              ].map(([title, desc], i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                  <div>
                    <p className="font-medium text-slate-200 mb-1">{title}</p>
                    <p className="text-slate-400 font-light">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest text-emerald-400 uppercase mb-4">FAQ</p>
            <h2 className="text-2xl font-light text-white tracking-tight mb-6">Frequently asked questions</h2>
            <div className="space-y-6">
              {[
                { q: 'Is the invoice legally valid?', a: 'The tool generates a professional document with all the fields required for a valid freelance invoice in most jurisdictions — invoice number, dates, itemised services, and totals. Whether an invoice is legally enforceable depends on your local laws and whether you have a signed contract with your client. Consult a local accountant for jurisdiction-specific advice.' },
                { q: 'Does my data get saved anywhere?', a: 'By default, invoice fields stay in your browser session and the PDF is generated locally. If you sign in and enable Cloud draft, a copy of the form JSON is stored under your account so you can resume later — you can disable that anytime. See the Privacy Policy for details.' },
                { q: 'Can I customise the invoice branding?', a: 'You can enter your business name, contact details, and payment information. The tool uses a clean, professional layout that works for most freelance contexts. Custom logos and full brand theming are not currently supported.' },
                { q: 'What payment terms should I set?', a: 'Net 14 (14 days from invoice date) is a practical default for independent contractors. Net 30 is standard for corporate clients. For new clients or projects over $500, consider requesting a 50% deposit upfront with the remainder due on delivery.' },
                { q: 'Can I use this tool for VAT invoices?', a: 'Yes. The tax field allows you to enter a percentage (e.g. 20% for UK standard VAT). The tool calculates and displays the tax amount and total including tax. You will need to manually add your VAT registration number to the notes or description fields.' },
              ].map(({ q, a }) => (
                <div key={q} className="border-l-2 border-slate-700 pl-5">
                  <p className="text-sm font-semibold text-slate-200 mb-2">{q}</p>
                  <p className="text-sm text-slate-400 font-light leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/40">
            <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase mb-4">Related reading</p>
            <a href="/articles/how-to-write-a-freelance-invoice/" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors no-underline">
              How to Write a Freelance Invoice: Complete Guide →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
