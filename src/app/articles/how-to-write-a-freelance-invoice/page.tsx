import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';

export const metadata = pageMetadata({
  title: 'How to Write a Freelance Invoice: Complete Guide — NexusDigitalLabs',
  description:
    'Everything a freelancer needs to know about creating professional invoices — what to include, how to structure payment terms, and how to get paid on time and in full.',
  path: '/articles/how-to-write-a-freelance-invoice/',
  keywords: [
    'how to write a freelance invoice',
    'freelance invoice template',
    'invoice for freelancers',
    'freelance payment terms',
    'invoice number format',
    'what to include on an invoice',
    'net 30 invoice',
    'freelance billing guide',
    'professional invoice format',
  ],
  absoluteTitle: true,
  type: 'article',
  ogTitle: 'How to Write a Freelance Invoice: Complete Guide',
  ogDescription:
    'Everything a freelancer needs to know about creating professional invoices and getting paid on time.',
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
function OL({ items }: { items: React.ReactNode[] }) {
  return (
    <ol className="text-slate-400 font-light text-sm sm:text-base leading-relaxed mb-4 space-y-1.5 pl-5 list-decimal marker:text-slate-500">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ol>
  );
}

const FAQ = [
  {
    q: 'What payment terms should I use as a freelancer?',
    a: 'Net 14 (payment due in 14 days) is a good default for independent freelancers. Net 30 is standard for corporate clients. Avoid Net 60 unless the project is large and the client is a trusted enterprise — long payment terms hurt your cash flow.',
  },
  {
    q: 'Do I need a registered business to send an invoice?',
    a: "No. Sole traders and independent contractors can invoice under their personal name. You do not need a registered company, LLC, or Ltd to bill for freelance work. Check your local tax authority's requirements for declaring freelance income.",
  },
  {
    q: 'What should I do if a client doesn\'t pay?',
    a: 'Send a polite reminder at the due date. If no response within 7 days, send a formal overdue notice referencing your late payment clause. After 21 days overdue, consider a collections letter or small claims court depending on the amount. Always have a signed contract or scope-of-work document to support your claim.',
  },
  {
    q: 'Should I charge VAT or sales tax on freelance invoices?',
    a: 'This depends on your country and threshold. In the UK, VAT registration is required once you exceed £90,000 in annual turnover. In the US, services are generally not subject to sales tax (with some state exceptions). Consult a local accountant if you are unsure.',
  },
  {
    q: 'What is an invoice number and how should I format it?',
    a: 'An invoice number is a unique identifier for each invoice you issue. A simple format is INV-001, INV-002, etc. Some freelancers use a year-prefix format like 2025-001. The format does not matter as long as each invoice has a unique number you can reference in communications and your records.',
  },
];

export default function FreelanceInvoicePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: 'How to Write a Freelance Invoice: Complete Guide',
            description: 'Everything a freelancer needs to know about creating professional invoices and getting paid on time.',
            author: { '@type': 'Organization', name: 'NexusDigitalLabs' },
            publisher: { '@type': 'Organization', name: 'NexusDigitalLabs', url: 'https://nexusdigitallabs.dev' },
            url: 'https://nexusdigitallabs.dev/articles/how-to-write-a-freelance-invoice/',
          }),
        }}
      />

      <div className="max-w-2xl mx-auto px-6 sm:px-10 py-12 sm:py-16">
        <Link href="/articles/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors no-underline mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All articles
        </Link>

        <article>
          <header className="mb-10">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="text-[0.6rem] font-bold tracking-widest uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1">
                Freelance Finance
              </span>
              <span className="text-xs text-slate-500">Jun 2025</span>
              <span className="text-xs text-slate-600">·</span>
              <span className="text-xs text-slate-500">6 min read</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-light text-white tracking-tight leading-snug mb-5">
              How to Write a Freelance Invoice: Complete Guide
            </h1>
            <p className="text-slate-400 font-light text-base sm:text-lg leading-relaxed">
              Everything a freelancer needs to know about creating professional invoices — what to include, how to structure payment terms, and how to get paid faster.
            </p>
          </header>

          <div className="prose prose-invert max-w-none">
            <P>
              A freelance invoice is more than a payment request. It is a legal document that records the services you delivered, the amount owed, and the terms under which payment is expected. A well-structured invoice reduces disputes, speeds up payment, and makes you look professional to clients who deal with many contractors.
            </P>
            <P>
              This guide covers every field that should appear on a freelance invoice, common mistakes that delay payment, and best practices for following up without damaging the client relationship.
            </P>

            <H2>What Every Freelance Invoice Must Include</H2>
            <P>
              Regardless of your country or industry, every professional invoice needs these core elements:
            </P>

            <UL items={[
              <span key="1"><strong className="text-slate-200">The word &quot;Invoice&quot;</strong> — prominently at the top. This sounds obvious, but documents missing this label are frequently processed as &quot;quotes&quot; or &quot;receipts&quot; by clients&apos; accounting teams, causing delays.</span>,
              <span key="2"><strong className="text-slate-200">Invoice number</strong> — a unique sequential identifier (e.g. INV-2025-042). Essential for your records and for clients who need to match payments to documents.</span>,
              <span key="3"><strong className="text-slate-200">Issue date</strong> — the date the invoice was created and sent.</span>,
              <span key="4"><strong className="text-slate-200">Due date</strong> — when payment must be received, not when it was sent. Make this explicit (e.g. &quot;Due: 15 July 2025&quot;), not relative (avoid &quot;Net 30&quot; alone without a calculated date).</span>,
              <span key="5"><strong className="text-slate-200">Your name and contact details</strong> — full legal name or business name, email address, and if applicable your business registration number.</span>,
              <span key="6"><strong className="text-slate-200">Client name and address</strong> — the legal entity you are billing. For corporate clients, use the company name, not the individual contact&apos;s name.</span>,
              <span key="7"><strong className="text-slate-200">Itemised line items</strong> — a clear description of each service delivered, the quantity or hours, the unit rate, and the line total.</span>,
              <span key="8"><strong className="text-slate-200">Subtotal, taxes, and total</strong> — break down the final amount so clients can audit each component. If you charge VAT or GST, list it as a separate line.</span>,
              <span key="9"><strong className="text-slate-200">Payment instructions</strong> — your bank account details, PayPal, or other payment method. Never make a client hunt for how to pay you.</span>,
            ]} />

            <H2>How to Write Clear Line Items</H2>
            <P>
              Vague line items are the number one reason invoices get sent back for clarification. Instead of writing &quot;Design work — $1,200&quot;, write something a client&apos;s finance team can easily reconcile:
            </P>
            <UL items={[
              'Website homepage redesign (as per scope agreed 12 May 2025) — 16 hrs @ $75/hr — $1,200',
              'Brand identity package: logo, colour palette, typography guide — Fixed price — $850',
              'Monthly SEO retainer — June 2025 — $500',
            ]} />
            <P>
              Each line item should reference the deliverable (what), the period or agreed scope (when/which), the pricing model (hourly or fixed), and the line total. This eliminates ambiguity and signals professionalism.
            </P>

            <H2>Payment Terms That Get You Paid Faster</H2>
            <P>
              The payment terms you set have a direct impact on how quickly you receive payment. Default industry terms:
            </P>
            <UL items={[
              <span key="1"><strong className="text-slate-200">Net 14</strong> — payment due 14 days from invoice date. Ideal for small projects and independent freelancers who need reliable cash flow.</span>,
              <span key="2"><strong className="text-slate-200">Net 30</strong> — payment due 30 days from invoice date. Standard for corporate clients and larger contracts.</span>,
              <span key="3"><strong className="text-slate-200">50% deposit, 50% on delivery</strong> — recommended for projects over $500. Eliminates non-payment risk on new client relationships.</span>,
              <span key="4"><strong className="text-slate-200">Milestone payments</strong> — for long projects, invoice at defined delivery milestones rather than at the end. Reduces your exposure and keeps the client engaged.</span>,
            ]} />
            <P>
              Include a late payment clause in your terms. A typical clause reads: &quot;Invoices unpaid after the due date will incur a late payment fee of 1.5% per month on the outstanding balance.&quot; Most clients will not pay the fee — but having it in your terms motivates timely payment and gives you legal standing if you need to escalate.
            </P>

            <H2>How to Send Your Invoice</H2>
            <OL items={[
              'Generate the invoice (PDF format is universally accepted and non-editable)',
              'Send by email with a clear subject line: "Invoice INV-2025-042 — [Your Name] — Due 15 July 2025"',
              'Include the invoice as an attachment AND paste the key details (total, due date, payment info) in the email body',
              'CC yourself so you have a timestamped record of delivery',
              'Set a calendar reminder for the due date',
            ]} />

            <H2>Following Up Without Damaging the Relationship</H2>
            <P>
              Late payment is common and usually the result of oversight rather than intent. A professional follow-up sequence:
            </P>
            <UL items={[
              <span key="1"><strong className="text-slate-200">Day of due date:</strong> A polite reminder: &quot;Hi [Name], just a quick note that Invoice INV-2025-042 for $X is due today. Please let me know if you have any questions about payment.&quot;</span>,
              <span key="2"><strong className="text-slate-200">7 days overdue:</strong> Slightly more direct: &quot;Hi [Name], I wanted to follow up on Invoice INV-2025-042, now 7 days past its due date. Could you confirm when payment will be processed?&quot;</span>,
              <span key="3"><strong className="text-slate-200">21 days overdue:</strong> Formal notice referencing your late payment clause and a firm deadline before you escalate.</span>,
            ]} />
            <P>
              Always keep follow-ups professional and factual. Reference the invoice number and amount in every message. Document every communication in writing.
            </P>

            {/* FAQ */}
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

          {/* CTA */}
          <div className="mt-14 p-6 rounded-2xl bg-slate-900/50 border border-slate-800/60">
            <p className="text-xs font-semibold tracking-widest text-emerald-400 uppercase mb-3">Free tool</p>
            <h3 className="text-base font-semibold text-white mb-2">Freelancer Invoice Generator</h3>
            <p className="text-sm text-slate-400 font-light leading-relaxed mb-4">
              Create a professional PDF invoice in under two minutes — entirely in your browser. No account, no watermark, no cost.
            </p>
            <Link
              href="/tools/invoice-generator/"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 ndl-on-accent text-sm font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 no-underline"
            >
              Open Invoice Generator
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}
