import { z } from 'zod';

/** Result of a form server action, consumed by useActionState. */
export type FormState = {
  status: 'idle' | 'error' | 'success';
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  /** Submitted values, so inputs keep what the user typed after an error. */
  values?: Record<string, string>;
};

export const initialFormState: FormState = { status: 'idle' };

/** Read the given string fields from FormData; missing fields become ''. */
export function readForm(formData: FormData, fields: readonly string[]): Record<string, string> {
  const values: Record<string, string> = {};
  for (const field of fields) {
    const value = formData.get(field);
    values[field] = typeof value === 'string' ? value : '';
  }
  return values;
}

export function validationErrorState(error: z.ZodError, values: Record<string, string>): FormState {
  return {
    status: 'error',
    message: 'Please fix the highlighted fields.',
    fieldErrors: z.flattenError(error).fieldErrors as Record<string, string[] | undefined>,
    values,
  };
}

export function errorState(message: string, values?: Record<string, string>): FormState {
  return { status: 'error', message, values };
}
