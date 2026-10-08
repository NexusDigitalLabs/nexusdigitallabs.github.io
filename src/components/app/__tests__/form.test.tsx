import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SelectField, TextField } from '../form';
import { initialFormState, type FormState } from '@/lib/freelanceos/forms';

vi.mock('react-dom', async (orig) => ({ ...(await orig<typeof import('react-dom')>()), useFormStatus: () => ({ pending: false }) }));

const options = [
  { value: 'USD', label: 'US Dollar' },
  { value: 'EUR', label: 'Euro' },
];

describe('SelectField', () => {
  it('supports controlled mode', () => {
    render(
      <SelectField name="c2" label="Controlled" state={initialFormState} options={options} value="EUR" onValueChange={() => {}} />
    );
    expect(screen.getByLabelText('Controlled')).toHaveValue('EUR');
  });

  it('shows the field error and marks the control invalid', () => {
    const state: FormState = { status: 'error', fieldErrors: { currency: ['Choose a currency.'] }, values: { currency: '' } };
    render(<SelectField name="currency" label="Currency" state={state} options={options} placeholder="Choose…" />);
    expect(screen.getByText('Choose a currency.')).toBeInTheDocument();
    expect(screen.getByLabelText('Currency')).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('TextField', () => {
  it('prefers values echoed back by the server over the record value', () => {
    const state: FormState = { status: 'error', values: { name: 'Typed by user' } };
    render(<TextField name="name" label="Name" state={state} defaultValue="Saved value" />);
    expect(screen.getByLabelText('Name')).toHaveValue('Typed by user');
  });
});
