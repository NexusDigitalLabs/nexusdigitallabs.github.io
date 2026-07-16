import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PWAInstallBanner from '@/components/PWAInstallBanner';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/components/AuthProvider';
import ScrollToTop from '@/components/ScrollToTop';
import { DEFAULT_OG_IMAGE, SITE_NAME } from '@/lib/seo';
import { THEME_BOOT_SCRIPT } from '@/lib/theme';
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0f19' },
  ],
};

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
    siteName: SITE_NAME,
    title: 'NexusDigitalLabs — Software Studio',
    description:
      'Engineering minimalist web utilities, developer tools, and high-performance software built for speed, privacy, and utility.',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1024, height: 540 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NexusDigitalLabs — Software Studio',
    description:
      'Engineering minimalist web utilities, developer tools, and high-performance software built for speed, privacy, and utility.',
    images: [DEFAULT_OG_IMAGE],
  },
  applicationName: SITE_NAME,
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: SITE_NAME,
  },
  formatDetection: {
    telephone: false,
  },
};

// ── Root layout ────────────────────────────────────────────────────────────
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      style={{ scrollBehavior: 'smooth' }}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/* Apply theme before paint to avoid flash of wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        {/* ── Google Tag Manager ── */}
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
        style={{ fontFamily: 'var(--font-geist-sans), system-ui, sans-serif' }}
      >
        {/* GTM noscript fallback */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KB4MRJV6"
            height="0" width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        <ThemeProvider>
          <AuthProvider>
            <ScrollToTop />
            <Header />

            <main className="flex-1">
              {children}
            </main>

            <Footer />
            {/* TODO: Re-enable once the support/tip page is fully ready.
            <KofiTipLink variant="floating" href={KOFI_URL} />
            */}
            <PWAInstallBanner />
          </AuthProvider>
        </ThemeProvider>

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
