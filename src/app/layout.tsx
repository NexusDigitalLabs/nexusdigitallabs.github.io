import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

// ── Fonts ──────────────────────────────────────────────────────────────────
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

// ── Root metadata ──────────────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL('https://nexusdigitallabs.dev'),
  title: {
    default: 'NexusDigitalLabs — Software Studio',
    template: '%s — NexusDigitalLabs',
  },
  description:
    'Engineering minimalist web utilities, developer tools, and high-performance software built for speed, privacy, and utility.',
  keywords: [
    'developer tools', 'web utilities', 'prompt optimization', 'token counter',
    'software engineering', 'LLM tools', 'AI prompt optimizer', 'software studio',
    'minimalist tools', 'API cost estimator',
  ],
  authors: [{ name: 'NexusDigitalLabs' }],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: 'NexusDigitalLabs',
    title: 'NexusDigitalLabs — Software Studio',
    description:
      'Engineering minimalist web utilities, developer tools, and high-performance software built for speed, privacy, and utility.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NexusDigitalLabs — Software Studio',
    description:
      'Engineering minimalist web utilities, developer tools, and high-performance software built for speed, privacy, and utility.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Fuel Tracker',
  },
};

// ── Root layout ────────────────────────────────────────────────────────────
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      style={{ scrollBehavior: 'smooth' }}
    >
      <head>
        {/* ── Google Tag Manager — replace GTM-XXXXXXX with your container ID ── */}
        <Script id="gtm-head" strategy="beforeInteractive">{`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-KB4MRJV6');
        `}</Script>
      </head>
      <body
        className="min-h-screen flex flex-col"
        style={{ background: '#0b0f19', color: '#f8fafc', fontFamily: 'var(--font-geist-sans), system-ui, sans-serif' }}
      >
        {/* GTM noscript fallback */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KB4MRJV6"
            height="0" width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        <Header />

        <main className="flex-1">
          {children}
        </main>

        <Footer />

        {/* Umami Analytics — cookie-free, GDPR/CCPA compliant */}
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="89ea0001-e2c2-4802-bcb2-bf2ae4809451"
          strategy="afterInteractive"
          defer
        />
      </body>
    </html>
  );
}
