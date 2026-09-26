import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Odova Terms of Use',
  description:
    'Terms of Use for the Odova mobile app. Rules for using the app, optional accounts, sync codes, and the Pro purchase.',
  path: '/odova/terms/',
  ogTitle: 'Odova Terms of Use — NexusDigitalLabs',
  ogDescription: 'Terms of Use for the Odova vehicle tracking app.',
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

export default function OdovaTermsOfUsePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 sm:py-24">

      <div className="mb-14">
        <Link
          href="/"
          className="flex items-center gap-2.5 no-underline group w-fit"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-semibold ndl-on-accent text-sm"
            style={{ background: 'linear-gradient(135deg,#2563eb,#6366f1)' }}
          >
            N
          </div>
          <span className="text-base font-medium tracking-tight text-white group-hover:text-slate-300 transition-colors">
            NexusDigitalLabs
          </span>
        </Link>
      </div>

      <div className="mb-10 space-y-2 border-b border-slate-800/60 pb-8">
        <p className="text-[11px] font-semibold tracking-widest text-slate-500 uppercase">Legal · Odova</p>
        <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">Odova Terms of Use</h1>
        <p className="text-xs text-slate-500 font-light">Last updated: September 26, 2026</p>
      </div>

      <div>
        <P>
          These Terms of Use (&ldquo;Terms&rdquo;) govern your access to and use of Odova, a vehicle fuel and
          maintenance tracking app for Android and iOS, published by NexusDigitalLabs (the &ldquo;Service&rdquo;).
          By using Odova, you agree to these Terms.
        </P>

        <Section title="What we provide">
          <P>
            Odova lets you track vehicles, fuel fill-ups, and maintenance reminders. The app works fully
            offline for a single device, or you can sync a garage across devices using a sync code, and
            optionally link that sync code to an account. These optional features use our infrastructure as
            described in the{' '}
            <Link href="/odova/privacy-policy/" className="text-blue-400 underline">Privacy Policy</Link>.
          </P>
        </Section>

        <Section title="Acceptable use">
          <P>
            You may use Odova for lawful personal use. You agree not to:
          </P>
          <ul className="list-disc pl-5 text-sm font-light text-slate-400 leading-[1.85] mb-3 space-y-1">
            <li>Probe, disrupt, or overload the Service or related infrastructure</li>
            <li>Attempt to access another user&apos;s account or garage sync code without authorization</li>
            <li>Use the Service to create or distribute malware, spam, or fraudulent content</li>
            <li>Misrepresent affiliation with NexusDigitalLabs</li>
            <li>Violate applicable laws while using the Service</li>
          </ul>
        </Section>

        <Section title="Accounts &amp; sync codes">
          <P>
            Creating an account (email magic link) and linking a garage to it are optional. You are
            responsible for keeping your sync code and account access confidential. Unlinking a garage does
            not delete the underlying data — it only removes the account association; the sync code keeps
            working on its own.
          </P>
        </Section>

        <Section title="Pro purchase">
          <P>
            Odova offers an optional one-time Pro purchase billed through Google Play or the Apple App
            Store. The purchase is processed entirely by the store and RevenueCat; refunds are handled
            according to the applicable store&apos;s refund policy, not by NexusDigitalLabs directly.
          </P>
        </Section>

        <Section title="No professional advice">
          <P>
            Odova&apos;s efficiency and cost figures are estimates for convenience only, based on the data
            you enter. They are not automotive, financial, or safety advice, and you are responsible for
            verifying odometer readings, service intervals, and related figures before relying on them.
          </P>
        </Section>

        <Section title="Intellectual property">
          <P>
            Odova&apos;s design, branding, and code are owned by NexusDigitalLabs or its licensors. You
            retain ownership of the vehicle and fill-up data you enter. You grant us a limited license to
            store and process that data only as needed to operate the sync and account features you enable.
          </P>
        </Section>

        <Section title="Disclaimer of warranties">
          <P>
            The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind,
            whether express or implied, including merchantability, fitness for a particular purpose, and non-infringement.
            We do not warrant that the Service will be uninterrupted, accurate, or error-free.
          </P>
        </Section>

        <Section title="Limitation of liability">
          <P>
            To the fullest extent permitted by law, NexusDigitalLabs and its operators are not liable for any
            indirect, incidental, special, consequential, or punitive damages, or any loss of profits, data, or
            goodwill, arising from your use of the Service. Our total liability for any claim relating to the
            Service will not exceed USD $50.
          </P>
        </Section>

        <Section title="Third-party services">
          <P>
            Odova relies on Supabase (database and optional authentication), RevenueCat (purchase and
            entitlement management), and the Google Play Store / Apple App Store (billing). Their terms and
            privacy practices apply to their processing.
          </P>
        </Section>

        <Section title="Changes">
          <P>
            We may update these Terms from time to time. The &ldquo;Last updated&rdquo; date at the top will change
            when we do. Continued use after changes constitutes acceptance of the updated Terms.
          </P>
        </Section>

        <Section title="Contact">
          <P>
            Questions about these Terms:{' '}
            <Link href="/contact/" className="text-blue-400 underline">Contact</Link>
            {' '}or email{' '}
            <a href="mailto:hello@nexusdigitallabs.dev" className="text-blue-400 underline">
              hello@nexusdigitallabs.dev
            </a>.
          </P>
        </Section>

        <Section title="Related">
          <P>
            See also our{' '}
            <Link href="/odova/privacy-policy/" className="text-blue-400 underline">Odova Privacy Policy</Link>.
          </P>
        </Section>
      </div>

      <footer className="mt-20 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-light text-slate-500 tracking-wide">
        <div>&copy; {new Date().getFullYear()} NexusDigitalLabs. All rights reserved.</div>
        <div className="flex gap-6">
          {[
            { href: '/about/', label: 'About' },
            { href: '/contact/', label: 'Contact' },
            { href: '/odova/privacy-policy/', label: 'Odova Privacy' },
            { href: '/odova/terms/', label: 'Odova Terms' },
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
