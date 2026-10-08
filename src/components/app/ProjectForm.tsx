'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  BILLING_TYPES,
  BILLING_TYPE_LABELS,
  PROJECT_STATUSES,
  PROJECT_STATUS_LABELS,
  type BillingType,
} from '@/lib/freelanceos/projects';

export type ProjectFormValues = {
  client_id: string;
  name: string;
  description: string | null;
  status: string;
  billing_type: BillingType;
  currency: string;
  rate: string;
  budget: string;
  start_date: string | null;
  due_date: string | null;
  notes: string | null;
};

export type ClientChoice = { id: string; label: string; currency: string };

const RATE_LABEL: Partial<Record<BillingType, string>> = {
  hourly: 'Hourly rate',
  retainer: 'Monthly retainer',
};

const BUDGET_LABEL: Record<BillingType, { label: string; hint?: string }> = {
  hourly: { label: 'Budget', hint: 'Optional cap for the whole project.' },
  retainer: { label: 'Budget', hint: 'Optional total for the engagement.' },
  fixed: { label: 'Project price' },
  milestone: { label: 'Total value', hint: 'Sum of all milestones.' },
};

export default function ProjectForm({
  action,
  project,
  clients,
  currencies,
  submitLabel,
  cancelHref,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  project: ProjectFormValues;
  clients: ClientChoice[];
  currencies: CurrencyOption[];
  submitLabel: string;
  cancelHref: string;
}) {
  const [state, formAction] = useActionState(action, initialFormState);
  const [clientId, setClientId] = useState(project.client_id);
  const [currency, setCurrency] = useState(project.currency);
  const [billingType, setBillingType] = useState<BillingType>(project.billing_type);

  function handleClientChange(id: string) {
    setClientId(id);
    // Default the project currency to the client's billing currency.
    const client = clients.find((c) => c.id === id);
    if (client) setCurrency(client.currency);
  }

  const rateLabel = RATE_LABEL[billingType];
  const budget = BUDGET_LABEL[billingType];

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Project</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <SelectField
            name="client_id"
            label="Client"
            required
            state={state}
            value={clientId}
            onValueChange={handleClientChange}
            placeholder="Choose a client…"
            options={clients.map((c) => ({ value: c.id, label: c.label }))}
          />
          <TextField name="name" label="Project name" required state={state} defaultValue={project.name} placeholder="Mobile app" />
          <SelectField
            name="status"
            label="Status"
            required
            state={state}
            defaultValue={project.status}
            options={PROJECT_STATUSES.map((s) => ({ value: s, label: PROJECT_STATUS_LABELS[s] }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <TextField name="start_date" label="Start date" type="date" state={state} defaultValue={project.start_date} />
            <TextField name="due_date" label="Due date" type="date" state={state} defaultValue={project.due_date} />
          </div>
          <TextAreaField
            name="description"
            label="Description"
            rows={3}
            className="md:col-span-2"
            state={state}
            defaultValue={project.description}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <SelectField
            name="billing_type"
            label="Billing type"
            required
            state={state}
            value={billingType}
            onValueChange={(v) => setBillingType(v as BillingType)}
            options={BILLING_TYPES.map((b) => ({ value: b, label: BILLING_TYPE_LABELS[b] }))}
          />
          <SelectField
            name="currency"
            label="Currency"
            required
            state={state}
            value={currency}
            onValueChange={setCurrency}
            options={currencySelectOptions(currencies)}
          />
          {rateLabel && (
            <TextField
              name="rate"
              label={rateLabel}
              inputMode="decimal"
              placeholder="0.00"
              state={state}
              defaultValue={project.rate}
            />
          )}
          <TextField
            name="budget"
            label={budget.label}
            hint={budget.hint}
            inputMode="decimal"
            placeholder="0.00"
            state={state}
            defaultValue={project.budget}
          />
          <TextAreaField name="notes" label="Notes" rows={3} className="md:col-span-2" state={state} defaultValue={project.notes} />
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
