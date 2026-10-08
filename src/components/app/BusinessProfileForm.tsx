'use client';

import { useActionState } from 'react';
import { updateBusinessProfile } from '@/app/app/settings/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormMessage,
  SelectField,
  SubmitButton,
  TextAreaField,
  TextField,
  currencySelectOptions,
} from '@/components/app/form';
import { initialFormState } from '@/lib/freelanceos/forms';
import type { CurrencyOption } from '@/lib/freelanceos/money';

export type BusinessProfile = {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  tax_id: string | null;
  base_currency: string;
  default_tax_rate: number;
  invoice_prefix: string;
  payment_details: string | null;
};

export default function BusinessProfileForm({
  profile,
  currencies,
  canEdit,
}: {
  profile: BusinessProfile;
  currencies: CurrencyOption[];
  canEdit: boolean;
}) {
  const [state, action] = useActionState(updateBusinessProfile, initialFormState);

  return (
    <form action={action} className="flex flex-col gap-6">
      <fieldset disabled={!canEdit} className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Business details</CardTitle>
            <CardDescription>Shown on your invoices and proposals.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <TextField name="name" label="Business name" required state={state} defaultValue={profile.name} />
            <TextField name="email" label="Business email" type="email" required state={state} defaultValue={profile.email} />
            <TextField name="phone" label="Phone" type="tel" state={state} defaultValue={profile.phone} />
            <TextField
              name="tax_id"
              label="Tax / registration ID"
              hint="Optional — e.g. VAT, GST or business registration number."
              state={state}
              defaultValue={profile.tax_id}
            />
            <TextAreaField
              name="address"
              label="Address"
              rows={3}
              className="md:col-span-2"
              state={state}
              defaultValue={profile.address}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice defaults</CardTitle>
            <CardDescription>Pre-filled on new invoices. You can change them per invoice.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <SelectField
              name="base_currency"
              label="Default currency"
              required
              state={state}
              defaultValue={profile.base_currency}
              options={currencySelectOptions(currencies)}
            />
            <TextField
              name="default_tax_rate"
              label="Default tax rate (%)"
              inputMode="decimal"
              placeholder="0"
              state={state}
              defaultValue={String(profile.default_tax_rate)}
            />
            <TextField
              name="invoice_prefix"
              label="Invoice number prefix"
              hint="e.g. INV- gives INV-0001"
              state={state}
              defaultValue={profile.invoice_prefix}
            />
            <TextAreaField
              name="payment_details"
              label="Payment details"
              rows={4}
              className="md:col-span-3"
              placeholder={'Bank name, account name, account number, SWIFT…'}
              hint="Printed on invoices so clients know how to pay you."
              state={state}
              defaultValue={profile.payment_details}
            />
          </CardContent>
        </Card>
      </fieldset>

      {canEdit ? (
        <div className="flex flex-wrap items-center gap-4">
          <SubmitButton>Save profile</SubmitButton>
          <FormMessage state={state} />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Only workspace owners can edit the business profile.</p>
      )}
    </form>
  );
}
