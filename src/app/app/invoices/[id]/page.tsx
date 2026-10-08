import type { Metadata } from 'next';
import Link from 'next/link';
import { Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmSubmit } from '@/components/app/ConfirmSubmit';
import InvoicePreview from '@/components/app/InvoicePreview';
import { InvoiceStatusPanel, RecordPaymentForm } from '@/components/app/InvoicePanels';
import { Detail, InvoiceStatusBadge, PageHeader } from '@/components/app/page-parts';
import { deletePaymentAction, invoiceStatusAction, recordPaymentAction } from '@/app/app/invoices/actions';
import { buildInvoiceSheet } from '@/lib/freelanceos/invoice-document';
import { balanceDue, formatInvoiceNumber, invoiceDisplayStatus, todayISO } from '@/lib/freelanceos/invoice-math';
import { formatMoney, minorToInput } from '@/lib/freelanceos/money';
import { requireOrg } from '@/lib/freelanceos/org';
import { formatDate } from '@/lib/freelanceos/projects';
import { getBusinessProfile, getInvoiceOr404 } from '@/lib/freelanceos/queries';

export const metadata: Metadata = { title: 'Invoice' };

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireOrg();
  const [invoice, business] = await Promise.all([getInvoiceOr404(ctx, id), getBusinessProfile(ctx)]);

  const today = todayISO();
  const status = invoiceDisplayStatus(invoice, today);
  const balance = balanceDue(invoice);
  const money = (minor: number) => formatMoney(minor, invoice.currency);
  const isDraft = invoice.status === 'draft';
  const clientName = invoice.client ? invoice.client.company || invoice.client.name : 'Client';
  // Best guess while drafting; the real number is assigned atomically on issue.
  const upcomingNumber = formatInvoiceNumber(business.invoice_prefix, business.next_invoice_number);
  const sheet = buildInvoiceSheet(invoice, { business, client: invoice.client, upcomingNumber }, today);
  const filename = `invoice-${(invoice.number ?? 'draft').replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase()}.pdf`;
  const missingProfile = invoice.status === 'draft' && !business.email;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        back={{ href: '/app/invoices/', label: 'Invoices' }}
        title={
          <span className="flex flex-wrap items-center gap-2">
            {isDraft ? `Invoice for ${clientName}` : invoice.number}
            <InvoiceStatusBadge status={status} />
          </span>
        }
        description={
          isDraft ? (
            <>Becomes {upcomingNumber} when it&apos;s ready to send.</>
          ) : (
            invoice.client && (
              <Link href={`/app/clients/${invoice.client.id}/`} className="hover:underline">
                {clientName}
              </Link>
            )
          )
        }
        actions={
          <>
            {invoice.status === 'draft' && (
              <Button variant="outline" asChild>
                <Link href={`/app/invoices/${invoice.id}/edit/`}>
                  <Pencil aria-hidden="true" />
                  Edit
                </Link>
              </Button>
            )}
            <InvoiceStatusPanel
              action={invoiceStatusAction.bind(null, invoice.id)}
              status={invoice.status}
              upcomingNumber={upcomingNumber}
            />
          </>
        }
      />

      {missingProfile && (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
          Your business email isn&apos;t set, so the invoice&apos;s “From” section is incomplete.{' '}
          <Link href="/app/settings/" className="font-medium underline">
            Complete your business profile
          </Link>{' '}
          before sending.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <InvoicePreview
          sheet={sheet}
          filename={filename}
          downloadLabel={invoice.status === 'draft' ? 'Download draft PDF' : 'Download PDF'}
        />

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardDescription>{status === 'paid' ? 'Paid in full' : invoice.status === 'void' ? 'Voided' : 'Balance due'}</CardDescription>
              <CardTitle className="text-3xl tabular-nums">{money(invoice.status === 'void' ? 0 : balance)}</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <Detail label="Total">{money(invoice.total_minor)}</Detail>
                <Detail label="Paid">{money(invoice.amount_paid_minor)}</Detail>
                <Detail label="Issued">{formatDate(invoice.issue_date)}</Detail>
                <Detail label="Due">{formatDate(invoice.due_date)}</Detail>
                {invoice.project && (
                  <Detail label="Project">
                    <Link href={`/app/projects/${invoice.project.id}/`} className="hover:underline">
                      {invoice.project.name}
                    </Link>
                  </Detail>
                )}
                {invoice.sent_at && <Detail label="Issued on">{formatDate(invoice.sent_at)}</Detail>}
              </dl>
            </CardContent>
          </Card>

          {invoice.status === 'draft' && (
            <p className="text-sm text-muted-foreground">
              Happy with it? Click <strong>Ready to send</strong> to issue it as {upcomingNumber} and lock it, then
              download the PDF and send it to your client.
            </p>
          )}

          {invoice.status === 'sent' && balance > 0 && (
            <RecordPaymentForm
              action={recordPaymentAction.bind(null, invoice.id)}
              balanceInput={minorToInput(balance, invoice.currency)}
              currency={invoice.currency}
              today={today}
            />
          )}

          {invoice.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col divide-y">
                  {invoice.payments.map((p) => (
                    <li key={p.id} className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="text-sm font-medium tabular-nums">{formatMoney(p.amount_minor, p.currency)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(p.paid_on)}
                          {p.method ? ` · ${p.method}` : ''}
                        </p>
                        {p.note && <p className="text-xs break-words text-muted-foreground">{p.note}</p>}
                      </div>
                      <form action={deletePaymentAction.bind(null, invoice.id, p.id)}>
                        <ConfirmSubmit
                          variant="ghost"
                          size="icon-sm"
                          ariaLabel="Remove payment"
                          title="Remove this payment?"
                          description={`The ${formatMoney(p.amount_minor, p.currency)} payment from ${formatDate(p.paid_on)} will be removed and the balance due goes back up.`}
                          confirmLabel="Remove payment"
                        >
                          <X aria-hidden="true" />
                        </ConfirmSubmit>
                      </form>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
