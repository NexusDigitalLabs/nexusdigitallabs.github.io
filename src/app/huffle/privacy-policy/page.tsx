import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';
import BrandMark from '@/components/BrandMark';

export const metadata = pageMetadata({
  title: 'Huffle Privacy Policy',
  description:
    'Privacy Policy for the Huffle app. Huffle works on your device without an account, shows no ads, and only uses your own Google Drive if you choose to back up.',
  path: '/huffle/privacy-policy/',
  ogTitle: 'Huffle Privacy Policy — NexusDigitalLabs',
  ogDescription: 'Privacy Policy for the Huffle movement-habit app.',
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

export default function HufflePrivacyPolicyPage() {
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
        <p className="text-[11px] font-semibold tracking-widest text-slate-500 uppercase">Legal · Huffle</p>
        <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">Huffle Privacy Policy</h1>
        <p className="text-xs text-slate-500 font-light">Last updated: October 14, 2026</p>
      </div>

      <div>
        <P>
          Huffle (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is a gentle movement-habit
          app for Android, published by NexusDigitalLabs. You log the movement you did, and a creature
          called a Huffling grows with you. This Privacy Policy explains what information Huffle handles,
          how it is used, and the choices you have.
        </P>

        <Section title="Summary">
          <P>
            Huffle works entirely on your device. There is no account, no sign-up, no advertising, and no
            analytics or crash-reporting SDK. Your data is never sent to NexusDigitalLabs. If you choose to
            turn on the optional Google Drive backup, a copy of your data is saved to a hidden folder in
            your own Google Drive, which only Huffle and you can use.
          </P>
        </Section>

        <Section title="Information Stored on Your Device">
          <P>
            To work, Huffle stores the following on your device only: the name you give your Huffling, the
            sessions you log (the type of movement, the time, and an optional duration and note), your
            streak and progress (XP, evolution stage, streak-freeze tokens), your weekly goal, your
            reminder time, and which cosmetic item your Huffling is wearing. This information stays on
            your device. We do not run a server that receives it and we cannot see it.
          </P>
        </Section>

        <Section title="Notifications">
          <P>
            Huffle can send you a daily reminder and occasional streak and comeback nudges. These are
            scheduled locally on your device. Huffle does not use remote push notifications and does not
            collect a push or device token. On Android 13 and later you are asked for permission, and you
            can turn notifications off at any time in your device settings.
          </P>
        </Section>

        <Section title="Optional Google Drive Backup">
          <P>
            If you tap &ldquo;Connect Google Drive&rdquo; in Settings, Huffle asks you to sign in with
            your Google account and to allow access to the app&apos;s own hidden application-data folder
            in your Drive. Huffle uses this to save a backup file of your Huffling data and to restore it
            on a new phone. Huffle can only see that one folder: it cannot see, read, or change any of your
            other Drive files. The backup goes directly between your device and Google; it is not sent to
            NexusDigitalLabs. Huffle shows the email address of the connected Google account inside the
            app so you can see which account is in use, and does not store or transmit it elsewhere.
          </P>
          <P>
            You can disconnect at any time in Settings, and you can delete the backup from your Google
            account (Google Drive &rarr; Settings &rarr; Manage apps &rarr; Huffle). Huffle&apos;s use and
            transfer of information received from Google APIs adheres to the{' '}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              className="text-blue-400 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.
          </P>
        </Section>

        <Section title="Device Backups">
          <P>
            Android may include Huffle&apos;s data in your device backup to your Google account, depending
            on your device settings. That backup is handled by Android and Google under their own terms,
            not by Huffle.
          </P>
        </Section>

        <Section title="Advertising, Analytics and Purchases">
          <P>
            Huffle contains no advertising, no third-party analytics, and no tracking. It currently offers
            no in-app purchases. If optional purchases are introduced in the future, this policy will be
            updated before they are available.
          </P>
        </Section>

        <Section title="Google Play Diagnostics">
          <P>
            If you have opted in on your device, Google Play may collect crash and performance diagnostics
            (Android vitals) about apps you use, including Huffle. This is collected by Google under its
            own policies and is available to us only in aggregate through the Play Console.
          </P>
        </Section>

        <Section title="Data Retention &amp; Deletion">
          <P>
            Because your data lives on your device, you control it. Uninstalling Huffle, or clearing its
            storage in your device settings, removes it from the device. If you used Google Drive backup,
            you can also remove the backup from your Google account as described above. We hold no copy of
            your data, so there is nothing for us to delete on our side.
          </P>
        </Section>

        <Section title="Your Rights">
          <P>
            Depending on where you live (including under GDPR and CCPA), you may have rights to access,
            correct, delete, or restrict personal data. Since we do not hold your Huffle data, these are
            exercised directly on your device and in your Google account. You can still contact us with any
            question or request.
          </P>
        </Section>

        <Section title="Children&apos;s Privacy">
          <P>
            Huffle is not directed at children under 13 and we do not knowingly collect personal
            information from children.
          </P>
        </Section>

        <Section title="Changes to This Policy">
          <P>
            We may update this Privacy Policy from time to time. Any changes will be posted on this page
            with an updated date.
          </P>
        </Section>

        <Section title="Contact" id="contact">
          <P>
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:hello@nexusdigitallabs.dev" className="text-blue-400 underline">
              hello@nexusdigitallabs.dev
            </a>{' '}
            or via the{' '}
            <Link href="/contact/" className="text-blue-400 underline">
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
            { href: '/huffle/privacy-policy/', label: 'Huffle Privacy' },
            { href: '/odova/privacy-policy/', label: 'Odova Privacy' },
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
