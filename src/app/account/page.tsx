import AccountClient from '@/components/AccountClient';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Account',
  description: 'Manage your NexusDigitalLabs account profile, display name, and sign-in.',
  path: '/account/',
  ogTitle: 'Account — NexusDigitalLabs',
  ogDescription: 'View and edit your NexusDigitalLabs profile.',
});

export default function AccountPage() {
  return (
    <section className="relative overflow-hidden">
      <AccountClient />
    </section>
  );
}
