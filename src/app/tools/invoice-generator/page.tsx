import type { Metadata } from 'next';
import InvoiceGeneratorClient from '@/components/tools/InvoiceGeneratorClient';

export const metadata: Metadata = {
  title: 'Freelancer Invoice Generator — NexusDigitalLabs',
  description:
    'Free browser-based freelancer invoice generator. Create professional PDF invoices with line items, tax calculation, and bank wire details — 100% client-side, zero data transmitted.',
  keywords: [
    'invoice generator',
    'freelancer invoice',
    'PDF invoice maker',
    'free invoice tool',
    'client billing',
    'bank wire invoice',
    'tax invoice',
    'NexusDigitalLabs',
  ],
  alternates: { canonical: 'https://nexusdigitallabs.dev/tools/invoice-generator/' },
  openGraph: {
    type: 'website',
    url: 'https://nexusdigitallabs.dev/tools/invoice-generator/',
    title: 'Freelancer Invoice Generator — NexusDigitalLabs',
    description:
      'Create professional A4 PDF invoices in seconds. Client details, line items, tax, bank wire info — free and fully client-side.',
    images: [{ url: 'https://nexusdigitallabs.dev/og-image.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Freelancer Invoice Generator — NexusDigitalLabs',
    description: 'Create professional A4 PDF invoices in seconds. Free and fully client-side.',
    images: ['https://nexusdigitallabs.dev/og-image.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Freelancer Invoice Generator',
  url: 'https://nexusdigitallabs.dev/tools/invoice-generator/',
  description:
    'Free browser-based freelancer invoice generator. Create professional PDF invoices — 100% client-side.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: {
    '@type': 'Organization',
    name: 'NexusDigitalLabs',
    url: 'https://nexusdigitallabs.dev/',
    logo: { '@type': 'ImageObject', url: 'https://nexusdigitallabs.dev/favicon.png' },
  },
};

export default function InvoiceGeneratorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <InvoiceGeneratorClient />
    </>
  );
}
