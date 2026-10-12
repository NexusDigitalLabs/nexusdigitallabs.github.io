import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import AppShell from '@/components/app/AppShell';
import { TrackOnce } from '@/components/AnalyticsFlush';
import { requireOrg } from '@/lib/freelanceos/org';

export const metadata: Metadata = {
  title: { default: 'FreelanceOS', template: '%s — FreelanceOS' },
  description: 'Manage clients, projects and invoices for your freelance business.',
  robots: { index: false, follow: false },
};

export default async function FreelanceOSLayout({ children }: { children: ReactNode }) {
  // Resolves auth + workspace before any page renders (redirects if signed out).
  const { org, isNewWorkspace } = await requireOrg();

  return (
    <AppShell>
      {isNewWorkspace && <TrackOnce event="workspace_created" onceKey={org.id} />}
      {children}
    </AppShell>
  );
}
