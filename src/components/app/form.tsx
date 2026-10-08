'use client';

import * as React from 'react';
import { useFormStatus } from 'react-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { FormState } from '@/lib/freelanceos/forms';
import type { CurrencyOption } from '@/lib/freelanceos/money';
import { cn } from '@/lib/utils';

/** Small form kit for FreelanceOS server-action forms (useActionState). */

type FieldProps = {
  name: string;
  label: string;
  state: FormState;
  hint?: string;
  required?: boolean;
  className?: string;
};

function FieldShell({
  name,
  label,
  state,
  hint,
  required,
  className,
  children,
}: FieldProps & { children: (a11y: { id: string; 'aria-invalid'?: true; 'aria-describedby'?: string }) => React.ReactNode }) {
  const id = `field-${name}`;
  const error = state.fieldErrors?.[name]?.[0];
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive" aria-hidden="true">*</span>}
      </Label>
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** After an error the server echoes submitted values; prefer them over the record's. */
function valueFor(state: FormState, name: string, fallback: string | null | undefined): string {
  return state.values?.[name] ?? fallback ?? '';
}

export function TextField({
  defaultValue,
  type = 'text',
  placeholder,
  inputMode,
  ...field
}: FieldProps & {
  defaultValue?: string | null;
  type?: string;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}) {
  return (
    <FieldShell {...field}>
      {(a11y) => (
        <Input
          // Remount when the server echoes values so defaultValue applies.
          key={valueFor(field.state, field.name, defaultValue)}
          {...a11y}
          name={field.name}
          type={type}
          inputMode={inputMode}
          placeholder={placeholder}
          required={field.required}
          defaultValue={valueFor(field.state, field.name, defaultValue)}
        />
      )}
    </FieldShell>
  );
}

export function TextAreaField({
  defaultValue,
  rows = 4,
  placeholder,
  ...field
}: FieldProps & { defaultValue?: string | null; rows?: number; placeholder?: string }) {
  return (
    <FieldShell {...field}>
      {(a11y) => (
        <Textarea
          key={valueFor(field.state, field.name, defaultValue)}
          {...a11y}
          name={field.name}
          rows={rows}
          placeholder={placeholder}
          defaultValue={valueFor(field.state, field.name, defaultValue)}
        />
      )}
    </FieldShell>
  );
}

const selectClass =
  'h-9 w-full rounded-md border border-input bg-transparent px-3 text-base shadow-xs outline-none md:text-sm dark:bg-input/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive';

export function SelectField({
  defaultValue,
  value,
  options,
  placeholder,
  onValueChange,
  ...field
}: FieldProps & {
  defaultValue?: string | null;
  /** Pass with onValueChange to make the select controlled. */
  value?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  onValueChange?: (value: string) => void;
}) {
  const controlled = value !== undefined;
  return (
    <FieldShell {...field}>
      {(a11y) => (
        <select
          key={controlled ? undefined : valueFor(field.state, field.name, defaultValue)}
          {...a11y}
          name={field.name}
          required={field.required}
          value={controlled ? value : undefined}
          defaultValue={controlled ? undefined : valueFor(field.state, field.name, defaultValue)}
          onChange={onValueChange ? (e) => onValueChange(e.target.value) : undefined}
          className={selectClass}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-card text-foreground">
              {o.label}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  );
}

export function currencySelectOptions(options: CurrencyOption[]) {
  return options.map((o) => ({ value: o.code, label: o.label }));
}

export function SubmitButton({ children, pendingLabel = 'Saving…' }: { children: React.ReactNode; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? pendingLabel : children}
    </Button>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  if (state.status === 'idle' || !state.message) return null;
  const success = state.status === 'success';
  const Icon = success ? CheckCircle2 : AlertCircle;
  return (
    <p
      role={success ? 'status' : 'alert'}
      className={cn('flex items-center gap-2 text-sm', success ? 'text-primary' : 'text-destructive')}
    >
      <Icon className="size-4" aria-hidden="true" />
      {state.message}
    </p>
  );
}
