// @vitest-environment node
import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { writeFileSync } from 'node:fs';
import { renderToBuffer } from '@react-pdf/renderer';
import InvoicePdfDocument, { registerInvoiceFonts } from '../InvoicePdfDocument';
import type { InvoiceSheetData } from '../InvoiceSheet';

registerInvoiceFonts((file) => path.join(process.cwd(), 'public/fonts/inter', file));

const sheet: InvoiceSheetData = {
  number: 'INV-0001',
  issued: 'Oct 8, 2026',
  due: 'Nov 7, 2026',
  currency: 'USD',
  badge: { label: 'Paid', tone: 'paid' },
  from: { name: 'Dilan Fernando', lines: ['dilan@example.com', '354/22/23\nNagaha Mawatha, Pelanwatta', 'Tax ID: SL123'] },
  billTo: { name: 'Café Müller GmbH', lines: ['Zoë Ångström', 'jane@abc.com'] },
  items: [
    { key: 1, description: 'Merit Book — mobile app', quantity: '1.5', rate: '$33.33', amount: '$50.00' },
    { key: 2, description: 'Hosting (€ and ₹ symbols render)', quantity: '2', rate: '₹1,000.00', amount: '₹2,000.00' },
  ],
  summary: [
    { label: 'Subtotal', value: '$1,200.00', tone: 'strong' },
    { label: 'Tax (10%)', value: '$120.00' },
  ],
  total: '$1,320.00',
  payment: { text: 'NDB\n12345678' },
  notes: 'Thanks for your business!',
};

const count = (pdf: string, re: RegExp) => (pdf.match(re) ?? []).length;

describe('InvoicePdfDocument', () => {
  it('renders a single-page, real-text A4 PDF', async () => {
    const buf = await renderToBuffer(<InvoicePdfDocument {...sheet} />);
    if (process.env.INVOICE_PDF_OUT) writeFileSync(process.env.INVOICE_PDF_OUT, buf);
    const pdf = buf.toString('latin1');
    expect(pdf.startsWith('%PDF-')).toBe(true);
    expect(count(pdf, /\/Type \/Page\b/g)).toBe(1);
    expect(pdf).toMatch(/\/MediaBox \[0 0 595\.2\d* 841\.8\d*\]/);
    expect(count(pdf, /\/Subtype \/Image/g)).toBe(0); // vector text, not a screenshot
    expect(pdf).toMatch(/\/FontFile2|\/FontFile3|\/FontFile /); // fonts embedded
    expect(buf.length).toBeLessThan(150_000);
  }, 30_000);

  it('spills onto more pages for long invoices without crashing', async () => {
    const items = Array.from({ length: 60 }, (_, i) => ({ key: i, description: `Line item ${i + 1}`, quantity: '1', rate: '$10.00', amount: '$10.00' }));
    const buf = await renderToBuffer(<InvoicePdfDocument {...sheet} items={items} />);
    expect(count(buf.toString('latin1'), /\/Type \/Page\b/g)).toBeGreaterThan(1);
  }, 30_000);
});
