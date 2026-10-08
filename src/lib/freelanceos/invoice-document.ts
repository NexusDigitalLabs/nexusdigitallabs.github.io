import type { InvoiceSheetProps } from '@/components/invoice/InvoiceSheet';
import { balanceDue, formatHundredths, invoiceDisplayStatus, todayISO } from '@/lib/freelanceos/invoice-math';
import { formatMoney } from '@/lib/freelanceos/money';
import { formatDate } from '@/lib/freelanceos/projects';
import type { InvoiceDetail, PartySnapshot } from '@/lib/freelanceos/queries';

/**
 * Turn an invoice into InvoiceSheet props. Sent/void invoices print the
 * snapshots taken when they were sent; drafts show the live profile + client
 * so edits there are reflected until the invoice goes out.
 */
export function buildInvoiceSheet(
  invoice: Pick<
    InvoiceDetail,
    | 'number' | 'status' | 'currency' | 'issue_date' | 'due_date' | 'tax_rate' | 'discount_rate' | 'notes'
    | 'subtotal_minor' | 'discount_minor' | 'tax_minor' | 'total_minor' | 'amount_paid_minor'
    | 'from_snapshot' | 'bill_to_snapshot' | 'payment_details' | 'items'
  >,
  live: { business: PartySnapshot & { payment_details?: string | null }; client: PartySnapshot | null },
  today: string = todayISO()
): Omit<InvoiceSheetProps, 'sheetRef'> {
  const isDraft = invoice.status === 'draft';
  const from = (isDraft ? live.business : invoice.from_snapshot) ?? live.business;
  const client = (isDraft ? live.client : invoice.bill_to_snapshot) ?? live.client ?? { name: null };
  const paymentText = isDraft ? live.business.payment_details : invoice.payment_details;
  const money = (minor: number) => formatMoney(minor, invoice.currency);

  const summary: InvoiceSheetProps['summary'] = [{ label: 'Subtotal', value: money(invoice.subtotal_minor), tone: 'strong' }];
  if (invoice.discount_minor > 0) {
    summary.push({ label: `Discount (${formatHundredths(Math.round(invoice.discount_rate * 100))}%)`, value: `−${money(invoice.discount_minor)}`, tone: 'negative' });
  }
  if (invoice.tax_minor > 0) {
    summary.push({ label: `Tax (${formatHundredths(Math.round(invoice.tax_rate * 100))}%)`, value: money(invoice.tax_minor) });
  }

  const status = invoiceDisplayStatus(invoice, today);
  const partlyPaid = invoice.amount_paid_minor > 0 && status !== 'paid';
  if (partlyPaid) {
    summary.push({ label: 'Total', value: money(invoice.total_minor), tone: 'strong' });
    summary.push({ label: 'Paid', value: `−${money(invoice.amount_paid_minor)}`, tone: 'negative' });
  }

  const badge: InvoiceSheetProps['badge'] =
    status === 'draft' ? { label: 'Draft', tone: 'draft' }
    : status === 'paid' ? { label: 'Paid', tone: 'paid' }
    : status === 'void' ? { label: 'Void', tone: 'void' }
    : status === 'overdue' ? { label: 'Overdue', tone: 'overdue' }
    : undefined;

  const clientName = client.company || client.name || 'Client';
  const fromName = from.name ?? 'Your business';

  return {
    number: invoice.number ?? 'Draft',
    badge,
    issued: formatDate(invoice.issue_date),
    due: formatDate(invoice.due_date),
    currency: invoice.currency,
    from: {
      name: fromName,
      lines: [from.email, from.phone, from.address, from.tax_id ? `Tax ID: ${from.tax_id}` : null].filter(
        (l): l is string => Boolean(l)
      ),
    },
    billTo: {
      name: clientName,
      lines: [client.company ? client.name : null, client.email, client.phone, client.country].filter(
        (l): l is string => Boolean(l)
      ),
    },
    items: invoice.items.map((item) => ({
      key: item.id,
      description: item.description,
      quantity: formatHundredths(Math.round(item.quantity * 100)),
      rate: money(item.unit_price_minor),
      amount: money(item.amount_minor),
    })),
    summary,
    totalLabel: partlyPaid ? 'Balance due' : status === 'paid' ? 'Total paid' : 'Total due',
    total: money(partlyPaid ? balanceDue(invoice) : invoice.total_minor),
    payment: paymentText ? { text: paymentText } : undefined,
    notes: invoice.notes,
    footerLeft: fromName,
  };
}
