'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  FormMessage,
  SelectField,
  SubmitButton,
  TextAreaField,
  TextField,
  currencySelectOptions,
} from '@/components/app/form';
import { initialFormState, type FormState } from '@/lib/freelanceos/forms';
import type { CurrencyOption } from '@/lib/freelanceos/money';

export type ClientFormValues = {
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  currency: string;
  notes: string | null;
};

export default function ClientForm({
  action,
  client,
  currencies,
  submitLabel,
  cancelHref,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  client: ClientFormValues;
  currencies: CurrencyOption[];
  submitLabel: string;
  cancelHref: string;
}) {
  const [state, formAction] = useActionState(action, initialFormState);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Card>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <TextField name="name" label="Client name" required state={state} defaultValue={client.name} placeholder="Jane Smith" />
          <TextField name="company" label="Company" state={state} defaultValue={client.company} placeholder="ABC Corporation" />
          <TextField name="email" label="Email" type="email" state={state} defaultValue={client.email} />
          <TextField name="phone" label="Phone" type="tel" state={state} defaultValue={client.phone} />
          <TextField name="country" label="Country" state={state} defaultValue={client.country} />
          <SelectField
            name="currency"
            label="Billing currency"
            required
            hint="Default currency for this client's projects and invoices."
            state={state}
            defaultValue={client.currency}
            options={currencySelectOptions(currencies)}
          />
          <TextAreaField name="notes" label="Notes" className="md:col-span-2" state={state} defaultValue={client.notes} />
        </CardContent>
      </Card>
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton>{submitLabel}</SubmitButton>
        <Button variant="ghost" asChild>
          <Link href={cancelHref}>Cancel</Link>
        </Button>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
