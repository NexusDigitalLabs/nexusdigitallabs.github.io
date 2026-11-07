import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';
import BrandMark from '@/components/BrandMark';

export const metadata = pageMetadata({
  title: 'PDFly Privacy Policy',
  description:
    'Privacy Policy for the PDFly app. PDFly processes your PDFs and photos on your device, never uploads them, and shows ads through Google AdMob.',
  path: '/pdfly/privacy-policy/',
  ogTitle: 'PDFly Privacy Policy — NexusDigitalLabs',
  ogDescription: 'Privacy Policy for the PDFly PDF toolbox app.',
});

function Section({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <div id={id} className="mt-8 scroll-mt-24">
      <h2 className="text-base font-medium text-slate-100 mb-2">{title}</h2>
      {children}
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-light text-slate-400 leading-[1.85] mb-3">{children}</p>;
}

const link = 'text-blue-400 underline';

export default function PdflyPrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
      <div className="mb-14">
        <Link href="/" className="flex items-center gap-2.5 no-underline group w-fit">
          <BrandMark size={32} />
          <span className="text-base font-medium tracking-tight text-white group-hover:text-slate-300 transition-colors">
            NexusDigitalLabs
          </span>
        </Link>
      </div>

      <div className="mb-10 space-y-2 border-b border-slate-800/60 pb-8">
        <p className="text-[11px] font-semibold tracking-widest text-slate-500 uppercase">Legal · PDFly</p>
        <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">PDFly Privacy Policy</h1>
        <p className="text-xs text-slate-500 font-light">Last updated: November 4, 2026</p>
      </div>

      <div>
        <P>
          PDFly (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is a PDF toolbox for compressing, merging
          and splitting PDFs and turning photos into a PDF, published by NexusDigitalLabs. This Privacy Policy
          explains what information PDFly handles, how it is used, and the choices you have.
        </P>

        <Section title="Summary">
          <P>
            PDFly works on your device. There is no PDFly account, no sign-up, and no server that receives your
            files. Your PDFs and photos are never uploaded to NexusDigitalLabs. PDFly is free and shows ads
            through Google AdMob; that is the only way information about your device leaves it, and it is handled
            by Google as described below.
          </P>
        </Section>

        <Section title="Your Files">
          <P>
            When you compress, merge, split or convert files, PDFly reads only the files and photos you choose
            through the system file or photo picker. They are processed entirely on your device. The result is
            saved in the app&apos;s own storage until you share it or the system clears it, and goes only where you
            choose to send it (for example Mail, Messages or the Files app). We do not see your files, and we
            cannot recover them for you.
          </P>
        </Section>

        <Section title="Permissions">
          <P>
            PDFly does not ask for access to your whole photo library or your whole storage. It uses the system
            pickers, which give the app access only to the items you select. On iPhone, PDFly asks one permission,
            described under Advertising below.
          </P>
        </Section>

        <Section title="Advertising">
          <P>
            PDFly displays banner and interstitial ads through Google AdMob to pay for the app. AdMob may collect
            and use your device&apos;s advertising identifier, your approximate location (derived from your IP
            address), information about how you interact with ads, and crash and performance data, to show and
            measure ads and to prevent fraud. This is collected by Google, not by PDFly, and is described in
            Google&apos;s own policies. You can learn more at{' '}
            <a
              href="https://policies.google.com/technologies/partner-sites"
              className={link}
              target="_blank"
              rel="noopener noreferrer"
            >
              policies.google.com/technologies/partner-sites
            </a>{' '}
            and manage ad personalization at{' '}
            <a href="https://adssettings.google.com" className={link} target="_blank" rel="noopener noreferrer">
              adssettings.google.com
            </a>
            .
          </P>
          <P>
            If you are in the European Economic Area, the United Kingdom or another region with similar rules,
            PDFly shows a consent form (Google&apos;s User Messaging Platform) before any ad is requested or
            personalized. You can change your choice at any time in the app under Settings, Privacy options.
          </P>
          <P>
            On iPhone, PDFly may then ask permission under Apple&apos;s App Tracking Transparency framework
            before using the advertising identifier. If you choose &ldquo;Ask App Not to Track&rdquo;, ads are
            still shown but are not personalized, and the app works the same. You can change this at any time in
            your iPhone&apos;s Settings, under Privacy &amp; Security, Tracking.
          </P>
        </Section>

        <Section title="Analytics and Accounts">
          <P>
            PDFly contains no analytics SDK and no account system. We do not know who you are or what you do in
            the app.
          </P>
        </Section>

        <Section title="Store Diagnostics">
          <P>
            If you have opted in on your device, Google Play may collect crash and performance diagnostics about
            apps you use, including PDFly, and on iPhone Apple may share analytics with app developers if you
            have chosen to. This is collected by Google or Apple under their own policies and is available to us
            only in aggregate through the Play Console or App Store Connect.
          </P>
        </Section>

        <Section title="Data Retention &amp; Deletion">
          <P>
            Because your files stay on your device, you control them. Uninstalling PDFly removes everything it
            stored. We hold no copy of your files, so there is nothing for us to delete on our side.
          </P>
        </Section>

        <Section title="Your Rights">
          <P>
            Depending on where you live (including under GDPR and CCPA), you may have rights to access, correct,
            delete, or restrict personal data. We do not hold personal data about you, so these are exercised
            with Google (ad data) and on your device. You can still contact us with any question or request.
          </P>
        </Section>

        <Section title="Children&apos;s Privacy">
          <P>
            PDFly is a general-purpose utility not directed at children, and we do not knowingly collect personal
            information from children.
          </P>
        </Section>

        <Section title="Changes to This Policy">
          <P>
            We may update this Privacy Policy from time to time. Any changes will be posted on this page with an
            updated date.
          </P>
        </Section>

        <Section title="Contact" id="contact">
          <P>
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:hello@nexusdigitallabs.dev" className={link}>
              hello@nexusdigitallabs.dev
            </a>{' '}
            or via the{' '}
            <Link href="/contact/" className={link}>
              Contact
            </Link>{' '}
            page.
          </P>
        </Section>
      </div>

      <footer className="mt-20 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-light text-slate-500 tracking-wide">
        <div>&copy; {new Date().getFullYear()} NexusDigitalLabs. All rights reserved.</div>
        <div className="flex gap-6">
          {[
            { href: '/about/', label: 'About' },
            { href: '/contact/', label: 'Contact' },
          ].map(({ href, label }) => (
            <Link key={href} href={href} className="hover:text-slate-300 transition-colors no-underline">
              {label}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
