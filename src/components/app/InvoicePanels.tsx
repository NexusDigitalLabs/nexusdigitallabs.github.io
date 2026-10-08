'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Ban, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormMessage, SubmitButton, TextField } from '@/components/app/form';
import { initialFormState, type FormState } from '@/lib/freelanceos/forms';

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

function IntentButton({
  intent,
  confirmText,
  variant = 'outline',
  children,
}: {
  intent: string;
  confirmText?: string;
  variant?: 'default' | 'outline' | 'destructive';
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      name="intent"
      value={intent}
      variant={variant}
      disabled={pending}
      onClick={(e) => {
        if (confirmText && !window.confirm(confirmText)) e.preventDefault();
      }}
    >
      {children}
    </Button>
  );
}

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
          <IntentButton
            intent="send"
            variant="default"
            confirmText={`Issue this invoice as ${upcomingNumber ?? 'the next number'}? It will be locked from further edits, then you can download the PDF and send it.`}
          >
            <Send aria-hidden="true" />
            Ready to send
          </IntentButton>
          <IntentButton intent="delete" confirmText="Delete this draft invoice?">
            <Trash2 aria-hidden="true" />
            Delete draft
          </IntentButton>
        </>
      ) : (
        <IntentButton intent="void" confirmText="Void this invoice? It stays in your records but no longer counts as owed.">
          <Ban aria-hidden="true" />
          Void
        </IntentButton>
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
