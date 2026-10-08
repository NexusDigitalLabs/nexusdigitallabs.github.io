'use client';

import Link from 'next/link';
import { useActionState, useMemo, useState } from 'react';
import { Plus, Trash2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  FormMessage,
  SelectField,
  SubmitButton,
  TextAreaField,
  TextField,
  currencySelectOptions,
} from '@/components/app/form';
import { ConfirmAction } from '@/components/app/ConfirmSubmit';
import type { ClientChoice } from '@/components/app/ProjectForm';
import { initialFormState, type FormState } from '@/lib/freelanceos/forms';
import { computeTotals, lineAmountMinor, parseHundredths } from '@/lib/freelanceos/invoice-math';
import { formatMoney, minorToInput, parseMoneyToMinor, type CurrencyOption } from '@/lib/freelanceos/money';
import { invoiceLineFromProject, type BillingType } from '@/lib/freelanceos/projects';

export type ProjectChoice = {
  id: string;
  client_id: string;
  name: string;
  billing_type: BillingType;
  currency: string;
  rate_minor: number | null;
  budget_minor: number | null;
};

export type LineDraft = { description: string; quantity: string; unit_price: string };

export type InvoiceDraftValues = {
  client_id: string;
  project_id: string;
  currency: string;
  issue_date: string;
  due_date: string;
  tax_rate: string;
  discount_rate: string;
  notes: string | null;
  items: LineDraft[];
};

type Line = LineDraft & { key: number };

const EMPTY_LINE: LineDraft = { description: '', quantity: '1', unit_price: '' };

// React keys for line rows (never rendered, so SSR/client values needn't match).
let lineKeySeq = 0;
const withKey = (l: LineDraft): Line => ({ ...l, key: ++lineKeySeq });

export default function InvoiceBuilder({
  action,
  invoice,
  clients,
  projects,
  currencies,
  submitLabel,
  cancelHref,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  invoice: InvoiceDraftValues;
  clients: ClientChoice[];
  projects: ProjectChoice[];
  currencies: CurrencyOption[];
  submitLabel: string;
  cancelHref: string;
}) {
  const [state, formAction] = useActionState(action, initialFormState);

  const [clientId, setClientId] = useState(invoice.client_id);
  const [projectId, setProjectId] = useState(invoice.project_id);
  const [currency, setCurrency] = useState(invoice.currency);
  const [taxRate, setTaxRate] = useState(invoice.tax_rate);
  const [discountRate, setDiscountRate] = useState(invoice.discount_rate);
  const [lines, setLines] = useState<Line[]>(() => (invoice.items.length ? invoice.items : [EMPTY_LINE]).map(withKey));

  const clientProjects = projects.filter((p) => p.client_id === clientId);
  const selectedProject = projects.find((p) => p.id === projectId);

  function handleClientChange(id: string) {
    setClientId(id);
    const client = clients.find((c) => c.id === id);
    if (client) setCurrency(client.currency);
    if (!projects.some((p) => p.id === projectId && p.client_id === id)) setProjectId('');
  }

  function addFromProject() {
    if (!selectedProject) return;
    const line = invoiceLineFromProject(selectedProject, minorToInput);
    // Replace a single untouched empty line rather than appending after it.
    setLines((prev) =>
      prev.length === 1 && !prev[0].description && !prev[0].unit_price ? [withKey(line)] : [...prev, withKey(line)]
    );
  }

  const updateLine = (key: number, patch: Partial<LineDraft>) =>
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  // Live preview of the math the DB will do on save.
  const preview = useMemo(() => {
    const parsed = lines.map((l) => {
      const q = parseHundredths(l.quantity);
      const p = parseMoneyToMinor(l.unit_price, currency);
      return q !== null && p.ok && p.value !== null ? { quantityHundredths: q, unitPriceMinor: p.value } : null;
    });
    const valid = parsed.filter((p): p is NonNullable<typeof p> => p !== null);
    return {
      perLine: parsed.map((p) => (p ? lineAmountMinor(p.quantityHundredths, p.unitPriceMinor) : null)),
      totals: computeTotals(valid, parseHundredths(discountRate || '0') ?? 0, parseHundredths(taxRate || '0') ?? 0),
    };
  }, [lines, currency, taxRate, discountRate]);

  const money = (minor: number) => formatMoney(minor, currency);
  const itemsError = state.fieldErrors?.items;
  const itemsJson = JSON.stringify(lines.map(({ description, quantity, unit_price }) => ({ description, quantity, unit_price })));

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="items_json" value={itemsJson} />

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
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
          <SelectField
            name="project_id"
            label="Project"
            hint={clientId && clientProjects.length === 0 ? 'This client has no projects.' : 'Optional.'}
            state={state}
            value={projectId}
            onValueChange={setProjectId}
            placeholder="No project"
            options={clientProjects.map((p) => ({ value: p.id, label: p.name }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <TextField name="issue_date" label="Issue date" type="date" required state={state} defaultValue={invoice.issue_date} />
            <TextField name="due_date" label="Due date" type="date" required state={state} defaultValue={invoice.due_date} />
          </div>
          <SelectField
            name="currency"
            label="Currency"
            required
            state={state}
            value={currency}
            onValueChange={setCurrency}
            options={currencySelectOptions(currencies)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle>Line items</CardTitle>
          {selectedProject && (
            <Button type="button" variant="outline" size="sm" onClick={addFromProject}>
              <Wand2 aria-hidden="true" />
              Add from {selectedProject.name}
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="hidden grid-cols-[1fr_6rem_8rem_7rem_2.25rem] gap-2 px-1 text-xs text-muted-foreground md:grid">
            <span>Description</span>
            <span>Qty / hours</span>
            <span>Unit price</span>
            <span className="text-right">Amount</span>
            <span />
          </div>
          {lines.map((line, i) => (
            <div
              key={line.key}
              className="grid grid-cols-[1fr_auto] gap-2 rounded-lg border p-3 md:grid-cols-[1fr_6rem_8rem_7rem_2.25rem] md:items-center md:border-0 md:p-0"
            >
              <Input
                aria-label={`Line ${i + 1} description`}
                placeholder="What did you do?"
                value={line.description}
                onChange={(e) => updateLine(line.key, { description: e.target.value })}
                className="col-span-2 md:col-span-1"
              />
              <Input
                aria-label={`Line ${i + 1} quantity`}
                inputMode="decimal"
                placeholder="1"
                value={line.quantity}
                onChange={(e) => updateLine(line.key, { quantity: e.target.value })}
              />
              <Input
                aria-label={`Line ${i + 1} unit price`}
                inputMode="decimal"
                placeholder="0.00"
                value={line.unit_price}
                onChange={(e) => updateLine(line.key, { unit_price: e.target.value })}
              />
              <p className="self-center text-right text-sm tabular-nums md:pr-1">
                {preview.perLine[i] !== null ? money(preview.perLine[i] as number) : '—'}
              </p>
              {line.description || line.unit_price ? (
                <ConfirmAction
                  ariaLabel={`Remove line ${i + 1}`}
                  disabled={lines.length === 1}
                  title="Remove this line?"
                  description={line.description ? `“${line.description}” will be removed from the invoice.` : 'This line will be removed from the invoice.'}
                  confirmLabel="Remove line"
                  onConfirm={() => setLines((prev) => prev.filter((l) => l.key !== line.key))}
                >
                  <Trash2 aria-hidden="true" />
                </ConfirmAction>
              ) : (
                // Blank lines go without asking — nothing to lose.
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove line ${i + 1}`}
                  disabled={lines.length === 1}
                  onClick={() => setLines((prev) => prev.filter((l) => l.key !== line.key))}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              )}
            </div>
          ))}
          {itemsError && (
            <ul className="text-xs text-destructive" role="alert">
              {itemsError.map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          )}
          <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => setLines((prev) => [...prev, withKey(EMPTY_LINE)])}>
            <Plus aria-hidden="true" />
            Add line
          </Button>

          <div className="mt-2 grid gap-6 border-t pt-4 md:grid-cols-[1fr_18rem]">
            <div className="grid grid-cols-2 gap-4 self-start">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="field-discount_rate" className="text-sm font-medium">
                  Discount (%)
                </label>
                <Input
                  id="field-discount_rate"
                  name="discount_rate"
                  inputMode="decimal"
                  placeholder="0"
                  value={discountRate}
                  onChange={(e) => setDiscountRate(e.target.value)}
                  aria-invalid={state.fieldErrors?.discount_rate ? true : undefined}
                />
                {state.fieldErrors?.discount_rate && <p className="text-xs text-destructive">{state.fieldErrors.discount_rate[0]}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="field-tax_rate" className="text-sm font-medium">
                  Tax (%)
                </label>
                <Input
                  id="field-tax_rate"
                  name="tax_rate"
                  inputMode="decimal"
                  placeholder="0"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  aria-invalid={state.fieldErrors?.tax_rate ? true : undefined}
                />
                {state.fieldErrors?.tax_rate && <p className="text-xs text-destructive">{state.fieldErrors.tax_rate[0]}</p>}
              </div>
            </div>
            <dl className="flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <dt>Subtotal</dt>
                <dd className="tabular-nums text-foreground">{money(preview.totals.subtotal)}</dd>
              </div>
              {preview.totals.discount > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <dt>Discount</dt>
                  <dd className="tabular-nums text-destructive">−{money(preview.totals.discount)}</dd>
                </div>
              )}
              {preview.totals.tax > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <dt>Tax</dt>
                  <dd className="tabular-nums text-foreground">{money(preview.totals.tax)}</dd>
                </div>
              )}
              <div className="mt-1 flex justify-between border-t pt-2 text-base font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{money(preview.totals.total)}</dd>
              </div>
            </dl>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <TextAreaField
            name="notes"
            label="Notes"
            rows={3}
            placeholder="Thanks for your business!"
            hint="Printed on the invoice."
            state={state}
            defaultValue={invoice.notes}
          />
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
