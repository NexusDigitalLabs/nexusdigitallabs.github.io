import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DebtOptimizerClient from '../DebtOptimizerClient';

vi.mock('next/script', () => ({ default: () => null }));

vi.mock('@/components/AuthProvider', () => ({
  useAuth: () => ({
    user: null,
    profile: null,
    loading: false,
    signOut: vi.fn(),
    setProfile: vi.fn(),
  }),
}));

vi.mock('@/lib/supabase/client', () => ({
  createBrowserSupabaseClient: () => ({
    from: () => ({
      select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) }),
      upsert: async () => ({ error: null }),
      delete: () => ({ eq: () => ({ eq: async () => ({ error: null }) }) }),
    }),
  }),
}));

// ── Rendering ──────────────────────────────────────────────────────────────────
describe('DebtOptimizerClient — rendering', () => {
  it('renders the Calculate Plan button', () => {
    render(<DebtOptimizerClient />);
    expect(screen.getByRole('button', { name: /calculate plan/i })).toBeInTheDocument();
  });

  it('renders the income label', () => {
    render(<DebtOptimizerClient />);
    expect(screen.getByText(/monthly net income/i)).toBeInTheDocument();
  });

  it('renders Free Cash Flow preview', () => {
    render(<DebtOptimizerClient />);
    expect(screen.getAllByText(/free cash flow/i).length).toBeGreaterThan(0);
  });

  it('renders default expense names', () => {
    render(<DebtOptimizerClient />);
    expect(screen.getByDisplayValue(/rent/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/groceries/i)).toBeInTheDocument();
  });

  it('renders default debt names', () => {
    render(<DebtOptimizerClient />);
    expect(screen.getByDisplayValue(/credit card/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/car loan/i)).toBeInTheDocument();
  });

  it('renders the currency selector with LKR as default', () => {
    render(<DebtOptimizerClient />);
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect((select as HTMLSelectElement).value).toBe('LKR');
  });

  it('renders the Download PDF button (disabled before calculation)', () => {
    render(<DebtOptimizerClient />);
    const pdfBtn = screen.getByRole('button', { name: /download pdf/i });
    expect(pdfBtn).toBeDisabled();
  });
});

// ── Calculation ────────────────────────────────────────────────────────────────
describe('DebtOptimizerClient — calculation with default values', () => {
  it('shows result summary cards after clicking Calculate Plan', async () => {
    const user = userEvent.setup();
    render(<DebtOptimizerClient />);

    // Before Calculate, result section is not shown — no "Debt-Free In" heading
    expect(screen.queryAllByText(/debt.free in/i).length).toBe(0);

    await user.click(screen.getByRole('button', { name: /calculate plan/i }));

    // calculate() uses setTimeout(fn, 20ms) — waitFor handles real-time async
    await waitFor(
      () => expect(screen.queryAllByText(/debt.free in/i).length).toBeGreaterThan(0),
      { timeout: 2000 },
    );
  });

  it('shows the free cash flow in the result summary', async () => {
    const user = userEvent.setup();
    render(<DebtOptimizerClient />);

    await user.click(screen.getByRole('button', { name: /calculate plan/i }));

    // FCF = 150,000 - 53,000 = 97,000, formatted as "97,000"
    await waitFor(
      () => expect(screen.getAllByText(/97,000/).length).toBeGreaterThan(0),
      { timeout: 2000 },
    );
  });

  it('enables the Download PDF button after a successful calculation', async () => {
    const user = userEvent.setup();
    render(<DebtOptimizerClient />);

    await user.click(screen.getByRole('button', { name: /calculate plan/i }));

    await waitFor(
      () => expect(screen.getByRole('button', { name: /download pdf/i })).not.toBeDisabled(),
      { timeout: 2000 },
    );
  });

  it('shows Short, Medium, and Long plan options after calculation', async () => {
    const user = userEvent.setup();
    render(<DebtOptimizerClient />);

    await user.click(screen.getByRole('button', { name: /calculate plan/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^short/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^medium/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^long/i })).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('shows per-debt put-toward amounts after calculation', async () => {
    const user = userEvent.setup();
    render(<DebtOptimizerClient />);

    await user.click(screen.getByRole('button', { name: /calculate plan/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/what to put toward each debt/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/cleared month/i).length).toBeGreaterThan(0);
    }, { timeout: 2000 });
  });
});

// ── Adding items ────────────────────────────────────────────────────────────────
describe('DebtOptimizerClient — adding rows', () => {
  it('adds a new expense row when the expense + Add button is clicked', async () => {
    const user = userEvent.setup();
    render(<DebtOptimizerClient />);

    // The expense "Add" button is the first "Add" button in the DOM
    const addBtns = screen.getAllByRole('button', { name: /^add$/i });
    const initialExpenseInputs = screen.getAllByPlaceholderText(/expense name/i).length;

    await user.click(addBtns[0]);

    expect(screen.getAllByPlaceholderText(/expense name/i).length).toBe(initialExpenseInputs + 1);
  });

  it('adds a new debt row when the debt + Add button is clicked', async () => {
    const user = userEvent.setup();
    render(<DebtOptimizerClient />);

    const addBtns = screen.getAllByRole('button', { name: /^add$/i });
    const initialDebtInputs = screen.getAllByPlaceholderText(/loan \/ card name/i).length;

    await user.click(addBtns[1]);

    expect(screen.getAllByPlaceholderText(/loan \/ card name/i).length).toBe(initialDebtInputs + 1);
  });
});

// ── Remove rows ─────────────────────────────────────────────────────────────────
describe('DebtOptimizerClient — removing rows', () => {
  it('removes a row when a close icon button is clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(<DebtOptimizerClient />);

    const initialExpenseCount = screen.getAllByPlaceholderText(/expense name/i).length;
    const initialDebtCount = screen.getAllByPlaceholderText(/loan \/ card name/i).length;

    // Remove buttons have a close-path SVG (M6 18L18 6M6 6l12 12)
    const removeBtns = Array.from(
      container.querySelectorAll<HTMLButtonElement>('button'),
    ).filter((b) => b.querySelector('path[d*="M6 18"]'));

    expect(removeBtns.length).toBeGreaterThan(0);
    await user.click(removeBtns[0]); // removes first expense

    // Total input rows decreased by 1 across expense + debt inputs
    const newExpenseCount = screen.queryAllByPlaceholderText(/expense name/i).length;
    const newDebtCount = screen.queryAllByPlaceholderText(/loan \/ card name/i).length;
    expect(newExpenseCount + newDebtCount).toBe(
      initialExpenseCount + initialDebtCount - 1,
    );
  });
});

// ── Error states ────────────────────────────────────────────────────────────────
describe('DebtOptimizerClient — error states after calculation', () => {
  it('shows "Income does not cover" error when income is set to 1', async () => {
    const user = userEvent.setup();
    const { container } = render(<DebtOptimizerClient />);

    // AmountInput stores comma-formatted values — fire a native change event with '1'
    // so the component reads digits='1' → onChange(1) → income = 1
    const incomeInput = container.querySelector<HTMLInputElement>(`input[inputmode="numeric"]`);
    expect(incomeInput).toBeTruthy();

    // fireEvent.change bypasses the complex cursor management in AmountInput
    fireEvent.change(incomeInput!, { target: { value: '1' } });

    await user.click(screen.getByRole('button', { name: /calculate plan/i }));

    // runEngine returns: 'Income does not cover living expenses. Review your expense list.'
    await waitFor(
      () => expect(
        screen.getByText(/income does not cover living expenses/i),
      ).toBeInTheDocument(),
      { timeout: 2000 },
    );
  });
});
