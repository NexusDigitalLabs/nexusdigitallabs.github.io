import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { activityHref, describeActivity, timeAgo, type ActivityEntry } from '@/lib/freelanceos/activity';
import { requireOrg } from '@/lib/freelanceos/org';
import { OPEN_PROJECT_STATUSES } from '@/lib/freelanceos/projects';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const { supabase, org, user } = await requireOrg();
  const firstName = (user.user_metadata?.full_name as string | undefined)?.split(' ')[0];

  const [profile, clients, openProjects, anyProject, activity] = await Promise.all([
    supabase.from('organizations').select('email').eq('id', org.id).single(),
    supabase.from('clients').select('id', { count: 'exact', head: true }).eq('org_id', org.id).is('archived_at', null),
    supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', org.id)
      .in('status', [...OPEN_PROJECT_STATUSES]),
    supabase.from('projects').select('id', { count: 'exact', head: true }).eq('org_id', org.id),
    supabase
      .from('activity_log')
      .select('id, entity_type, entity_id, action, summary, details, created_at')
      .eq('org_id', org.id)
      .order('created_at', { ascending: false })
      .limit(8),
  ]);

  const clientCount = clients.count ?? 0;
  const openProjectCount = openProjects.count ?? 0;
  const entries = (activity.data ?? []) as ActivityEntry[];

  const steps = [
    { label: 'Create your workspace', done: true, href: undefined },
    { label: 'Set up your business profile', done: Boolean(profile.data?.email), href: '/app/settings/' },
    { label: 'Add your first client', done: clientCount > 0, href: '/app/clients/new/' },
    { label: 'Create a project', done: (anyProject.count ?? 0) > 0, href: '/app/projects/new/' },
    { label: 'Send your first invoice', done: false, href: undefined, soon: true },
  ];
  const allCoreDone = steps.slice(0, 4).every((s) => s.done);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{firstName ? `Welcome, ${firstName}` : 'Welcome'}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Here&apos;s where your freelance business stands.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/app/projects/" className="rounded-xl transition-colors hover:bg-muted/40">
          <Card className="h-full bg-transparent">
            <CardHeader>
              <CardDescription>Open projects</CardDescription>
              <CardTitle className="text-3xl tabular-nums">{openProjectCount}</CardTitle>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/app/clients/" className="rounded-xl transition-colors hover:bg-muted/40">
          <Card className="h-full bg-transparent">
            <CardHeader>
              <CardDescription>Active clients</CardDescription>
              <CardTitle className="text-3xl tabular-nums">{clientCount}</CardTitle>
            </CardHeader>
          </Card>
        </Link>
        <Card>
          <CardHeader>
            <CardDescription>Revenue this month</CardDescription>
            <CardTitle className="text-3xl text-muted-foreground">—</CardTitle>
          </CardHeader>
          <CardContent className="-mt-4 text-xs text-muted-foreground">Arrives with invoicing.</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing yet — add a client to get started.</p>
            ) : (
              <ul className="flex flex-col divide-y">
                {entries.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <Link href={activityHref(e)} className="block truncate text-sm font-medium hover:underline">
                        {e.summary}
                      </Link>
                      <p className="text-xs text-muted-foreground">{describeActivity(e)}</p>
                    </div>
                    <time dateTime={e.created_at} className="shrink-0 text-xs text-muted-foreground">
                      {timeAgo(e.created_at)}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          {!allCoreDone && (
            <Card>
              <CardHeader>
                <CardTitle>Getting started</CardTitle>
                <CardDescription>From first client to getting paid.</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="flex flex-col gap-3">
                  {steps.map((step) => (
                    <li key={step.label} className="flex items-center gap-3 text-sm">
                      {step.done ? (
                        <CheckCircle2 className="size-4 shrink-0 text-primary" aria-label="Done" />
                      ) : (
                        <Circle className="size-4 shrink-0 text-muted-foreground" aria-label="Not done" />
                      )}
                      {step.done ? (
                        <span className="text-muted-foreground line-through">{step.label}</span>
                      ) : step.href ? (
                        <Link href={step.href} className="hover:underline">
                          {step.label}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">
                          {step.label}
                          {step.soon && ' (soon)'}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Free beta</CardTitle>
                <Badge variant="secondary">Beta</Badge>
              </div>
              <CardDescription>
                Everything is free while FreelanceOS is in beta. Invoicing is next — your feedback shapes what comes after.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
