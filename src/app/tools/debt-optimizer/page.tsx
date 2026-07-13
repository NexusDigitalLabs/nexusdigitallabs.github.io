import type { Metadata } from 'next';
import DebtOptimizerClient from '@/components/tools/DebtOptimizerClient';

export const metadata: Metadata = {
  title: 'Debt Settlement & Savings Planner — NexusDigitalLabs',
  description:
    'Simple, free debt payoff planner. Add your income, monthly expenses, and debts to see your debt-free date and a month-by-month repayment runway. Download as PDF. 100% client-side.',
  keywords: [
    'debt payoff calculator',
    'debt free planner',
    'loan payoff',
    'credit card payoff',
    'debt settlement',
    'monthly budget',
    'financial planner',
    'NexusDigitalLabs',
  ],
  alternates: { canonical: 'https://nexusdigitallabs.dev/tools/debt-optimizer/' },
  openGraph: {
    type: 'website',
    url: 'https://nexusdigitallabs.dev/tools/debt-optimizer/',
    title: 'Debt Settlement & Savings Planner — NexusDigitalLabs',
    description:
      'See your debt-free date with a month-by-month repayment plan. Add expenses, loans, and credit cards. Download as PDF.',
    images: [{ url: 'https://nexusdigitallabs.dev/og-image.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Debt Settlement & Savings Planner — NexusDigitalLabs',
    description: 'See your debt-free date with a month-by-month repayment plan. Download as PDF.',
    images: ['https://nexusdigitallabs.dev/og-image.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Debt Settlement & Savings Planner',
  url: 'https://nexusdigitallabs.dev/tools/debt-optimizer/',
  description: 'Simple browser-based debt payoff planner with PDF export.',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

export default function DebtOptimizerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DebtOptimizerClient />
    </>
  );
}
