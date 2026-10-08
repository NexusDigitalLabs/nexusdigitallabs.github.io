'use client';

import { useActionState } from 'react';
import { Ban, Send, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmSubmit } from '@/components/app/ConfirmSubmit';
import { FormMessage, SubmitButton, TextField } from '@/components/app/form';
import { initialFormState, type FormState } from '@/lib/freelanceos/forms';

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

/** Send / void / delete, depending on the stored status. */
export function InvoiceStatusPanel({
  action,
  status,
  upcomingNumber,
}: {
  action: Action;
  status: 'draft' | 'sent' | 'void';
  upcomingNumber?: string;
}) {
  const [state, formAction] = useActionState(action, initialFormState);
  if (status === 'void') return null;

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      {status === 'draft' ? (
        <>
          <ConfirmSubmit
            name="intent"
            value="send"
            variant="default"
            destructive={false}
            title={`Issue this invoice as ${upcomingNumber ?? 'the next number'}?`}
            description="It gets its invoice number and is locked from further edits. Then download the PDF and send it to your client."
            confirmLabel="Issue invoice"
          >
            <Send aria-hidden="true" />
            Ready to send
          </ConfirmSubmit>
          <ConfirmSubmit
            name="intent"
            value="delete"
            title="Delete this draft?"
            description="The draft and its line items are permanently deleted. This can't be undone."
            confirmLabel="Delete draft"
          >
            <Trash2 aria-hidden="true" />
            Delete draft
          </ConfirmSubmit>
        </>
      ) : (
        <ConfirmSubmit
          name="intent"
          value="void"
          title="Void this invoice?"
          description="It stays in your records for reference but no longer counts as owed. Voiding can't be undone — create a new invoice if you need to bill again."
          confirmLabel="Void invoice"
        >
          <Ban aria-hidden="true" />
          Void
        </ConfirmSubmit>
      )}
      <FormMessage state={state} />
    </form>
  );
}

export function RecordPaymentForm({
  action,
  balanceInput,
  currency,
  today,
}: {
  action: Action;
  balanceInput: string;
  currency: string;
  today: string;
}) {
  const [state, formAction] = useActionState(action, initialFormState);
  // After a successful save, reset to the (new) defaults rather than echo.
  const shown: FormState = state.status === 'success' ? { status: 'idle' } : state;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record a payment</CardTitle>
        <CardDescription>Log money you&apos;ve received — FreelanceOS doesn&apos;t collect payments itself.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4 sm:grid-cols-2">
          <TextField name="amount" label={`Amount (${currency})`} inputMode="decimal" required state={shown} defaultValue={balanceInput} />
          <TextField name="paid_on" label="Date received" type="date" required state={shown} defaultValue={today} />
          <TextField name="method" label="Method" placeholder="Bank transfer, PayPal…" state={shown} defaultValue="" />
          <TextField name="note" label="Note" state={shown} defaultValue="" />
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <SubmitButton pendingLabel="Recording…">Record payment</SubmitButton>
            <FormMessage state={state} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
