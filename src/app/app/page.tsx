import type { Metadata } from 'next';
import { CheckCircle2, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireOrg } from '@/lib/freelanceos/org';

export const metadata: Metadata = { title: 'Dashboard' };

const GETTING_STARTED = [
  { label: 'Create your workspace', done: true },
  { label: 'Set up your business profile', done: false },
  { label: 'Add your first client', done: false },
  { label: 'Create a project', done: false },
  { label: 'Send your first invoice', done: false },
];

export default async function DashboardPage() {
  const { user } = await requireOrg();
  const firstName = (user.user_metadata?.full_name as string | undefined)?.split(' ')[0];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {firstName ? `Welcome, ${firstName}` : 'Welcome'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Here&apos;s where your freelance business stands.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Getting started</CardTitle>
            <CardDescription>From first client to getting paid.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="flex flex-col gap-3">
              {GETTING_STARTED.map((step) => (
                <li key={step.label} className="flex items-center gap-3 text-sm">
                  {step.done ? (
                    <CheckCircle2 className="size-4 text-primary" aria-label="Done" />
                  ) : (
                    <Circle className="size-4 text-muted-foreground" aria-label="Not done" />
                  )}
                  <span className={step.done ? 'text-muted-foreground line-through' : undefined}>{step.label}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Free beta</CardTitle>
              <Badge variant="secondary">Beta</Badge>
            </div>
            <CardDescription>
              Everything is free while FreelanceOS is in beta. New modules are rolling out over the coming weeks —
              your feedback shapes what comes next.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
