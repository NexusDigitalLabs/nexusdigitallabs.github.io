import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Odova Privacy Policy',
  description:
    'Privacy Policy for the Odova mobile app. Learn how vehicle, fuel, and maintenance data is stored, how optional accounts and Pro purchases work, and your rights.',
  path: '/odova/privacy-policy/',
  ogTitle: 'Odova Privacy Policy — NexusDigitalLabs',
  ogDescription: 'Privacy Policy for the Odova vehicle tracking app.',
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

export default function OdovaPrivacyPolicyPage() {
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
        <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">Odova Privacy Policy</h1>
        <p className="text-xs text-slate-500 font-light">Last updated: September 23, 2026</p>
      </div>

      <div>
        <P>
          Odova (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is a vehicle fuel and maintenance
          tracking app for Android and iOS, published by NexusDigitalLabs. This Privacy Policy explains
          what information Odova collects, how it is used, and your rights regarding that information.
        </P>

        <Section title="Summary">
          <P>
            Odova works without an account: your vehicles, fill-ups, and maintenance reminders can be used
            entirely on your device, or synced across devices using a sync code backed by our Supabase
            database. Maintenance reminders and notifications stay local to your device and are never
            transmitted anywhere. Signing in is optional and only used to link your sync code to your
            account so your garage can be restored on another device. Odova contains no advertising and no
            third-party analytics or crash-reporting SDKs.
          </P>
        </Section>

        <Section title="Information We Collect">
          <P>
            <strong className="text-slate-300 font-medium">Garage data (sync code).</strong>{' '}
            When you create or join a garage, Odova stores your vehicles and fuel fill-up entries
            (odometer readings, fuel amount, price, date, optional notes) in our Supabase database under a
            sync code generated on your device. You do not need an account or any personal information to
            use this — avoid putting personal identifiers into notes or nicknames if you want to keep the
            sync code fully anonymous.
          </P>
          <P>
            <strong className="text-slate-300 font-medium">Optional account (sign-in).</strong>{' '}
            If you choose to sign in with an email magic link, we store your email address and
            authentication identifiers via Supabase Auth so we can issue and verify your session. Signing
            in lets you &ldquo;link&rdquo; your sync code to your account so it can be restored by signing
            in on another device; you can unlink at any time, and the sync code keeps working on its own.
          </P>
          <P>
            <strong className="text-slate-300 font-medium">Maintenance reminders — local only.</strong>{' '}
            Reminders you create (e.g. oil change, tire rotation) are stored only in local storage on your
            device. They are never uploaded to our servers or included in sync-code data.
          </P>
          <P>
            <strong className="text-slate-300 font-medium">Notifications — local only.</strong>{' '}
            Odova schedules on-device local notifications for maintenance reminders. We do not use push
            notifications and do not register your device with any remote push service, so no device/push
            token is collected.
          </P>
          <P>
            <strong className="text-slate-300 font-medium">Pro purchase.</strong>{' '}
            Odova offers an optional one-time Pro purchase handled by Google Play Billing (Android) or
            Apple StoreKit (iOS) through RevenueCat. RevenueCat and the store process your purchase and
            provide us with purchase/entitlement status (e.g. that a specific installation or, if signed
            in, account holds an active Pro entitlement) so the app can unlock Pro features. We do not
            receive or store your payment details — those are handled entirely by Google/Apple and
            RevenueCat under their own terms.
          </P>
        </Section>

        <Section title="How We Use Information">
          <P>
            We use garage data to operate cross-device sync, account data to authenticate optional
            sign-in and link your sync code, and purchase/entitlement data to unlock Pro features you
            paid for. We do not sell your personal information, and we do not use garage or account data
            for advertising — Odova has no advertising integration.
          </P>
        </Section>

        <Section title="Data Storage &amp; Security">
          <P>
            Garage and account data are stored in Supabase (Postgres) with row-level security enforcing
            that only the sync code holder — or, for a linked garage, the linked account — can read or
            write that garage&apos;s data. Data in transit is encrypted (HTTPS/TLS).
          </P>
        </Section>

        <Section title="Service Providers">
          <P>
            Odova relies on Supabase (database and optional authentication), RevenueCat (purchase and
            entitlement management), and the Google Play Store / Apple App Store (billing). These
            providers process data under their own terms and only as needed for the functionality
            described above.
          </P>
        </Section>

        <Section title="Data Retention &amp; Deletion">
          <P>
            Garage data remains stored until you delete it in the app (individual fills, vehicles, or the
            whole garage) or request deletion. Account data remains while your account exists. To delete
            your account or request deletion of data tied to a sync code, contact us at the address below.
          </P>
        </Section>

        <Section title="Your Rights">
          <P>
            Depending on your location (including GDPR/CCPA where applicable), you may have rights to
            access, correct, delete, or restrict certain personal data, and to object to certain
            processing. Contact us to exercise these rights.
          </P>
        </Section>

        <Section title="Children&apos;s Privacy">
          <P>Odova is not directed at children under 13. We do not knowingly collect personal information from children.</P>
        </Section>

        <Section title="Changes to This Policy">
          <P>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.</P>
        </Section>

        <Section title="Contact" id="contact">
          <P>
            If you have any questions about this Privacy Policy, or to request account or data deletion,
            please contact us at{' '}
            <a href="mailto:hello@nexusdigitallabs.dev" className="text-blue-400 underline">hello@nexusdigitallabs.dev</a>
            {' '}or via the{' '}
            <Link href="/contact/" className="text-blue-400 underline">Contact</Link> page.
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
