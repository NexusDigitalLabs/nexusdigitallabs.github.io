import type { Metadata } from 'next';
import BusinessProfileForm, { type BusinessProfile } from '@/components/app/BusinessProfileForm';
import { PageHeader } from '@/components/app/page-parts';
import { currencyOptions } from '@/lib/freelanceos/money';
import { requireOrg } from '@/lib/freelanceos/org';

export const metadata: Metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const { supabase, org, role } = await requireOrg();

  const { data, error } = await supabase
    .from('organizations')
    .select('name, email, phone, address, tax_id, base_currency, default_tax_rate, invoice_prefix, payment_details')
    .eq('id', org.id)
    .single();
  if (error || !data) throw new Error('Could not load your business profile.');

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader title="Settings" description="Your business profile and invoice defaults." />
      <BusinessProfileForm
        profile={{ ...(data as BusinessProfile), default_tax_rate: Number(data.default_tax_rate) }}
        currencies={currencyOptions()}
        canEdit={role === 'owner' || role === 'admin'}
      />
    </div>
  );
}
