import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '5 Invoice Mistakes Freelancers Make That Delay Payment — NexusDigitalLabs',
  description: 'The most common freelance invoicing errors that slow down payment — and exactly how to fix each one to get paid faster and more reliably.',
  keywords: ['freelance invoice mistakes', 'why invoices dont get paid', 'invoice late payment', 'freelance billing errors', 'invoice best practices', 'get paid faster freelance'],
  alternates: { canonical: 'https://nexusdigitallabs.dev/articles/freelance-invoice-mistakes/' },
  openGraph: {
    title: '5 Invoice Mistakes Freelancers Make That Delay Payment',
    description: 'Fix these common invoicing errors to get paid faster and reduce disputes with clients.',
    type: 'article',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-medium text-slate-100 tracking-tight mt-10 mb-3">{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-slate-400 font-light leading-relaxed mb-4 text-sm sm:text-base">{children}</p>;
}

const FAQ = [
  { q: 'How quickly should I send an invoice after completing work?', a: 'Send it the same day or the next business day. The longer you wait, the more the client psychologically moves on from the project. Late invoices also signal disorganisation, which gives clients an excuse to deprioritise payment.' },
  { q: 'Should I follow up if a client hasn\'t acknowledged my invoice?', a: 'Yes. Send a brief confirmation email 24 hours after sending: "Hi [Name], just checking you received Invoice INV-042. Let me know if you need anything from me." A simple acknowledgement confirms delivery and sets a paper trail.' },
  { q: 'What if a client disputes the invoice amount?', a: 'Reference the signed contract or written agreement. If there is no written agreement, reference email threads or messages where the scope and price were discussed. Always resolve disputes in writing, not over the phone.' },
  { q: 'Is it unprofessional to charge a late payment fee?', a: 'No. Late payment fees are standard commercial practice. Most professional clients expect them. Frame it as a policy, not a personal accusation: "Our standard terms include a 1.5% monthly fee on overdue balances."' },
];

export default function InvoiceMistakesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'Article',
        headline: '5 Invoice Mistakes Freelancers Make That Delay Payment',
        author: { '@type': 'Organization', name: 'NexusDigitalLabs' },
        publisher: { '@type': 'Organization', name: 'NexusDigitalLabs', url: 'https://nexusdigitallabs.dev' },
        url: 'https://nexusdigitallabs.dev/articles/freelance-invoice-mistakes/',
      })}} />

      <div className="max-w-2xl mx-auto px-6 sm:px-10 py-12 sm:py-16">
        <Link href="/articles/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors no-underline mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          All articles
        </Link>
        <article>
          <header className="mb-10">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="text-[0.6rem] font-bold tracking-widest uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1">Freelance Finance</span>
              <span className="text-xs text-slate-500">Jul 2026</span>
              <span className="text-xs text-slate-600">·</span>
              <span className="text-xs text-slate-500">5 min read</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-light text-white tracking-tight leading-snug mb-5">5 Invoice Mistakes Freelancers Make That Delay Payment</h1>
            <p className="text-slate-400 font-light text-base sm:text-lg leading-relaxed">Getting paid on time is rarely about the client — it is usually about how the invoice was written and sent.</p>
          </header>

          <div className="prose prose-invert max-w-none">
            <P>Late payment is the most common frustration in freelancing. But in most cases, the delay is not because the client is unwilling to pay — it is because the invoice gave them a reason to hesitate, a reason to ask questions, or a reason to send it back for clarification. Fix the invoice, fix the payment timeline.</P>

            <H2>Mistake 1: Vague Line Items</H2>
            <P>Writing &quot;Design work — $1,500&quot; creates a question in the client&apos;s mind: what exactly did I get for this? Questions lead to internal review. Internal review leads to delays.</P>
            <P>Fix: Be specific. &quot;Homepage redesign (Figma mockup + handoff to dev) — 20 hrs @ $75/hr — $1,500.&quot; Each line item should answer: what, how much, and at what rate. Leave no room for ambiguity.</P>

            <H2>Mistake 2: Not Including a Due Date</H2>
            <P>Writing &quot;Net 30&quot; without calculating the actual calendar date gives the client room to argue about when the clock started. They may interpret &quot;Net 30&quot; as 30 days from when they received it, opened it, or approved it.</P>
            <P>Fix: Always include an explicit due date: &quot;Payment due: 14 August 2026.&quot; No ambiguity, no room for interpretation.</P>

            <H2>Mistake 3: Missing Payment Instructions</H2>
            <P>You would be surprised how many invoices list a total with no information on how to actually pay it. The client has to email back and ask — and that email adds 2–5 days minimum.</P>
            <P>Fix: Include your bank details, PayPal link, or preferred payment method on every invoice. Do not make the client work to find out how to give you money.</P>

            <H2>Mistake 4: Sending a PDF Without an Email Summary</H2>
            <P>Sending an invoice as just a PDF attachment means the client has to open it to see the amount and due date. Many accounting teams process invoices by scanning email subjects and bodies, never opening attachments.</P>
            <P>Fix: Include the key details in the email body itself: &quot;Invoice INV-2026-042 for $1,500 is attached. Payment is due by 14 August 2026. Bank details are included on the invoice.&quot; This takes 30 seconds and removes a friction point.</P>

            <H2>Mistake 5: Waiting Too Long to Send</H2>
            <P>Sending an invoice two weeks after completing a project is one of the most reliable ways to delay payment. By that point, the client has mentally closed the project. The invoice arrives as a surprise. Surprises require review.</P>
            <P>Fix: Send the invoice the same day the work is delivered, or set an automatic schedule (e.g. the 1st of each month for retainer work). Speed signals professionalism and keeps payment top of mind while the work is still fresh.</P>

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
            <p className="text-xs font-semibold tracking-widest text-emerald-400 uppercase mb-3">Free tool</p>
            <h3 className="text-base font-semibold text-white mb-2">Freelancer Invoice Generator</h3>
            <p className="text-sm text-slate-400 font-light leading-relaxed mb-4">Create a professional, clearly structured PDF invoice in under two minutes — with line items, due date, and payment instructions all in the right place.</p>
            <Link href="/tools/invoice-generator/" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 no-underline">
              Open Invoice Generator
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}
