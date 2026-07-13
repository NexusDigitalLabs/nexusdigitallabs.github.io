import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for NexusDigitalLabs. Learn how we handle data, advertising, and analytics on our developer tools and software studio.',
  alternates: { canonical: 'https://nexusdigitallabs.dev/privacy-policy/' },
  openGraph: {
    title: 'Privacy Policy — NexusDigitalLabs',
    description: 'Privacy Policy for NexusDigitalLabs developer tools and software studio.',
  },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h2 className="text-base font-medium text-slate-100 mb-2">{title}</h2>
      {children}
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-light text-slate-400 leading-[1.85] mb-3">{children}</p>;
}

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 sm:py-24">

      {/* Back link */}
      <div className="mb-14">
        <Link
          href="/"
          className="flex items-center gap-2.5 no-underline group w-fit"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-white text-sm"
            style={{ background: 'linear-gradient(135deg,#2563eb,#6366f1)' }}
          >
            N
          </div>
          <span className="text-base font-medium tracking-tight text-white group-hover:text-slate-300 transition-colors">
            NexusDigitalLabs
          </span>
        </Link>
      </div>

      {/* Title */}
      <div className="mb-10 space-y-2 border-b border-slate-800/60 pb-8">
        <p className="text-[11px] font-semibold tracking-widest text-slate-500 uppercase">Legal</p>
        <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">Privacy Policy</h1>
        <p className="text-xs text-slate-500 font-light">Last updated: July 6, 2026</p>
      </div>

      {/* Prose */}
      <div>
        <P>
          NexusDigitalLabs (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) operates the website at{' '}
          <a href="https://nexusdigitallabs.dev" className="text-blue-400 underline">nexusdigitallabs.dev</a>.
          This Privacy Policy explains what information is collected when you visit our site, how it is used, and your rights regarding that information.
        </P>

        <Section title="Information We Collect">
          <P>
            We do not collect personally identifiable information directly. Our analytics platform (Umami) records anonymised page-view data only — no cookies are set, no IP addresses are stored, and no personal profiles are created.
          </P>
          <P>
            We also track aggregate page view counts using our own Supabase-backed counter. This records only the URL path visited (e.g., <code className="text-xs bg-slate-800 text-blue-300 px-1.5 py-0.5 rounded border border-slate-700">/tools/prompt-architect/</code>) and a running integer count — no personal data, no session IDs, no IP addresses.
          </P>
        </Section>

        <Section title="Google AdSense &amp; Advertising">
          <P>
            We use Google AdSense to display advertisements on our pages. Google, as a third-party vendor, uses cookies to serve ads based on your prior visits to this website or other websites. Google&apos;s use of advertising cookies enables it and its partners to serve ads to you based on your visit to our site and/or other sites on the Internet.
          </P>
          <P>
            You may opt out of personalised advertising by visiting{' '}
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Google Ads Settings</a>.
            Alternatively, you can opt out of a third-party vendor&apos;s use of cookies for personalised advertising by visiting{' '}
            <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">aboutads.info</a>.
          </P>
        </Section>

        <Section title="Cookies">
          <P>
            Our own analytics (Umami) and page-view counter are entirely cookie-free. Google AdSense may set cookies to personalise the ads you see. These are third-party cookies governed by Google&apos;s privacy policies, not ours. You can manage or disable cookies through your browser settings at any time.
          </P>
        </Section>

        <Section title="Third-Party Links">
          <P>
            Our site may contain links to external websites. We are not responsible for the privacy practices of those sites. We encourage you to review the privacy policy of any external site you visit.
          </P>
        </Section>

        <Section title="Children's Privacy">
          <P>Our services are not directed at children under 13. We do not knowingly collect personal information from children.</P>
        </Section>

        <Section title="Changes to This Policy">
          <P>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.</P>
        </Section>

        <Section title="Contact">
          <P>
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:hello@nexusdigitallabs.dev" className="text-blue-400 underline">hello@nexusdigitallabs.dev</a>.
          </P>
        </Section>
      </div>

      {/* Footer */}
      <footer className="mt-20 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-light text-slate-500 tracking-wide">
        <div>&copy; {new Date().getFullYear()} NexusDigitalLabs. All rights reserved.</div>
        <div className="flex gap-6">
          {['/about/', '/contact/', '/privacy-policy/'].map((href) => (
            <Link key={href} href={href} className="hover:text-slate-300 transition-colors no-underline capitalize">
              {href.replace(/\//g, '')}
            </Link>
          ))}
          <a href="https://github.com/NexusDigitalLabs" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors no-underline">GitHub</a>
        </div>
      </footer>
    </div>
  );
}
