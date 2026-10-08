/**
 * FreelanceOS landing-page FAQ. Rendered on /freelanceos/ AND emitted as
 * FAQPage JSON-LD from the same array, so visible text and structured data
 * can never drift apart (Google requires them to match).
 */
export const FREELANCEOS_FAQ: { q: string; a: string }[] = [
  {
    q: 'Is FreelanceOS really free?',
    a: 'Yes. Everything is free while FreelanceOS is in beta, with no limits on clients, projects or invoices. Paid plans for advanced features may come later, and beta users will get a founding-member offer announced well in advance.',
  },
  {
    q: 'Who is FreelanceOS for?',
    a: 'Freelancers and solo professionals — developers, designers, writers, consultants, photographers, video editors and small studios — who currently juggle spreadsheets, Notion pages and separate invoicing tools.',
  },
  {
    q: 'Does FreelanceOS collect payments from my clients?',
    a: 'Not yet. You send the PDF invoice to your client and record payments in FreelanceOS when they arrive, including partial payments. FreelanceOS then tracks what is paid, unpaid and overdue.',
  },
  {
    q: 'Which currencies are supported?',
    a: 'Any ISO currency. Each client and invoice has its own currency, and dashboard totals are shown separately per currency rather than converted.',
  },
  {
    q: 'Is my business data private?',
    a: 'Yes. Every workspace is isolated at the database level so no other account can read it, there are no ads inside FreelanceOS, and we never sell your data. You can delete your account and all of your FreelanceOS data at any time from Settings.',
  },
  {
    q: 'How is FreelanceOS different from the free Invoice Generator?',
    a: 'The Invoice Generator makes a single invoice in your browser and keeps no history. FreelanceOS saves your clients, projects and invoices, numbers invoices automatically, tracks payments and expenses, and shows your revenue and outstanding money on a dashboard.',
  },
  {
    q: 'Does FreelanceOS handle tax?',
    a: 'You can set a default tax percentage and override it per invoice, plus add your tax or VAT registration number to your business profile. FreelanceOS does not file taxes or apply country-specific tax rules — check with a local accountant for that.',
  },
];
