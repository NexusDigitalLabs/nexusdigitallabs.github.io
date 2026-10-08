import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState, MoneyList, PageHeader } from '@/components/app/page-parts';
import {
  EXPENSE_CATEGORY_LABELS,
  formatMonth,
  monthRange,
  parseMonth,
  shiftMonth,
  type ExpenseCategory,
} from '@/lib/freelanceos/expenses';
import { sumByCurrency, todayISO } from '@/lib/freelanceos/invoice-math';
import { formatMoney } from '@/lib/freelanceos/money';
import { requireOrg } from '@/lib/freelanceos/org';
import { formatDate } from '@/lib/freelanceos/projects';
import { EXPENSE_COLUMNS, type Expense } from '@/lib/freelanceos/queries';

export const metadata: Metadata = { title: 'Expenses' };

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { supabase, org } = await requireOrg();
  const today = todayISO();
  const month = parseMonth((await searchParams).month, today);
  const { start, end } = monthRange(month);
  const isCurrentMonth = month === today.slice(0, 7);

  const { data, error } = await supabase
    .from('expenses')
    .select(`${EXPENSE_COLUMNS}, project:projects(id, name)`)
    .eq('org_id', org.id)
    .gte('spent_on', start)
    .lt('spent_on', end)
    .order('spent_on', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw new Error('Could not load expenses.');
  const expenses = (data ?? []) as unknown as (Expense & { project: { id: string; name: string } | null })[];

  const total = sumByCurrency(expenses, (e) => e.currency, (e) => e.amount_minor);
  const byCategory = Object.entries(
    expenses.reduce<Record<string, Expense[]>>((acc, e) => ((acc[e.category] ??= []).push(e), acc), {})
  )
    .map(([category, rows]) => ({ category: category as ExpenseCategory, totals: sumByCurrency(rows, (e) => e.currency, (e) => e.amount_minor) }))
    .sort((a, b) => (b.totals[0]?.amount ?? 0) - (a.totals[0]?.amount ?? 0));

  const newButton = (
    <Button asChild>
      <Link href="/app/expenses/new/">
        <Plus aria-hidden="true" />
        New expense
      </Link>
    </Button>
  );

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader title="Expenses" description="What your business spends, by month." actions={newButton} />

      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon-sm" asChild>
          <Link href={`/app/expenses/?month=${shiftMonth(month, -1)}`} aria-label="Previous month">
            <ChevronLeft aria-hidden="true" />
          </Link>
        </Button>
        <h2 className="min-w-36 text-center text-base font-semibold">{formatMonth(month)}</h2>
        <Button variant="outline" size="icon-sm" asChild disabled={isCurrentMonth}>
          {isCurrentMonth ? (
            <span aria-disabled="true" className="pointer-events-none opacity-40">
              <ChevronRight aria-hidden="true" />
            </span>
          ) : (
            <Link href={`/app/expenses/?month=${shiftMonth(month, 1)}`} aria-label="Next month">
              <ChevronRight aria-hidden="true" />
            </Link>
          )}
        </Button>
        {!isCurrentMonth && (
          <Link href="/app/expenses/" className="ml-2 text-sm text-muted-foreground hover:text-foreground">
            This month
          </Link>
        )}
      </div>

      {expenses.length === 0 ? (
        <EmptyState
          title={isCurrentMonth ? 'No expenses this month' : `No expenses in ${formatMonth(month)}`}
          description="Track software, hosting, travel and other costs to see what your work really earns."
          action={newButton}
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-[16rem_1fr]">
            <Card>
              <CardHeader>
                <CardDescription>Total spent</CardDescription>
                <CardTitle className="text-2xl">
                  <MoneyList totals={total} />
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardContent className="flex flex-wrap gap-x-8 gap-y-3 pt-0 md:pt-6">
                {byCategory.map(({ category, totals }) => (
                  <div key={category} className="flex flex-col">
                    <span className="text-xs text-muted-foreground">{EXPENSE_CATEGORY_LABELS[category]}</span>
                    <span className="text-sm font-medium">
                      <MoneyList totals={totals} />
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expense</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((e) => (
                  <TableRow key={e.id} className="relative">
                    <TableCell>
                      <Link href={`/app/expenses/${e.id}/edit/`} className="font-medium after:absolute after:inset-0 hover:underline">
                        {e.vendor}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {[e.description, e.project?.name].filter(Boolean).join(' · ') || ' '}
                      </p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline">{EXPENSE_CATEGORY_LABELS[e.category]}</Badge>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{formatDate(e.spent_on)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatMoney(e.amount_minor, e.currency)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
