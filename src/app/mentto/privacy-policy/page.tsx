import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';
import BrandMark from '@/components/BrandMark';

export const metadata = pageMetadata({
  title: 'Mentto Privacy Policy',
  description:
    'Privacy Policy for the Mentto app. Mentto keeps your students, lessons and fees on your device, shows no ads, and only uses your own Google Drive if you turn on backup.',
  path: '/mentto/privacy-policy/',
  ogTitle: 'Mentto Privacy Policy — NexusDigitalLabs',
  ogDescription: 'Privacy Policy for the Mentto tutor planner app.',
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

export default function MenttoPrivacyPolicyPage() {
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
        <p className="text-[11px] font-semibold tracking-widest text-slate-500 uppercase">Legal · Mentto</p>
        <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">Mentto Privacy Policy</h1>
        <p className="text-xs text-slate-500 font-light">Last updated: October 19, 2026</p>
      </div>

      <div>
        <P>
          Mentto (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is a planner for independent
          tutors, music teachers and coaches, published by NexusDigitalLabs. You use it to keep track of your
          students, lessons, attendance and fees. This Privacy Policy explains what information Mentto
          handles, how it is used, and the choices you have.
        </P>

        <Section title="Summary">
          <P>
            Mentto works on your device. There is no Mentto account, no sign-up, no advertising, and no
            analytics or crash-reporting SDK. The records you keep are never sent to NexusDigitalLabs. If you
            turn on the optional Google Drive backup, a copy is saved to a hidden folder in your own Google
            Drive. If you buy Mentto Pro, Google Play handles the payment and our billing provider,
            RevenueCat, confirms the purchase; neither receives your students&apos; details.
          </P>
        </Section>

        <Section title="Information Stored on Your Device">
          <P>
            To work, Mentto stores the following on your device only: your name (if you enter it) and
            currency; the students you add, with any phone number, email address, parent or guardian details
            and notes you choose to record; your groups; lesson times, one-off lessons, cancellations and
            moves; attendance; fee plans and the payments you record; your reminder settings; and any message
            templates you write. This information stays on your device. We do not run a server that receives
            it and we cannot see it.
          </P>
        </Section>

        <Section title="Information About Your Students">
          <P>
            Mentto is used by tutors to record information about the people they teach, some of whom may be
            children. As the tutor, you decide what to record and you are responsible for having your
            students&apos; (or their parents&apos;) permission to keep it. Mentto only uses this information to
            show it to you, remind you of lessons and fees, and include it in backups, exports or messages
            that you choose to make.
          </P>
          <P>
            When you send a reminder or receipt, or share a PDF or spreadsheet, Mentto hands the text or file
            to the app you pick (for example WhatsApp, SMS or email). From then on it is handled by that app
            and its provider under their own terms.
          </P>
        </Section>

        <Section title="Notifications">
          <P>
            Mentto can remind you before each lesson and on the day a fee falls due. These reminders are
            scheduled locally on your device. Mentto does not use remote push notifications and does not
            collect a push or device token. On Android 13 and later you are asked for permission first, and
            you can turn notifications off at any time. Mentto may also ask you to allow &ldquo;Alarms &amp;
            reminders&rdquo; so Android delivers reminders on time; this only affects timing.
          </P>
        </Section>

        <Section title="Optional Google Drive Backup">
          <P>
            If you turn on backup in Settings (a Mentto Pro feature; restoring is always free), Mentto asks
            you to sign in with your Google account and to allow access to the app&apos;s own hidden
            application-data folder in your Drive. Mentto uses this to save copies of your records and to
            restore them on a new phone. Mentto can only see that one folder: it cannot see, read, or change
            any of your other Drive files. Backups go directly between your device and Google; they are not
            sent to NexusDigitalLabs. Mentto shows the email address of the connected Google account in the
            app so you can see which account is in use, and does not send it anywhere else.
          </P>
          <P>
            You can turn backup off at any time in Settings, and you can delete the backups from your Google
            account (Google Drive &rarr; Settings &rarr; Manage apps &rarr; Mentto). Mentto&apos;s use and
            transfer of information received from Google APIs adheres to the{' '}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              className={link}
              target="_blank"
              rel="noopener noreferrer"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.
          </P>
        </Section>

        <Section title="Mentto Pro Purchases">
          <P>
            Mentto Pro is sold through Google Play. Google processes the payment; we never see your card or
            payment details. To confirm and restore purchases, Mentto uses RevenueCat, a billing service
            provider. RevenueCat receives a random identifier for your installation, your purchase and
            subscription status, and basic technical details such as the app version, operating system and
            store country. It does not receive your name, your students&apos; details or any of your records.
            RevenueCat processes this on our behalf under its{' '}
            <a href="https://www.revenuecat.com/privacy/" className={link} target="_blank" rel="noopener noreferrer">
              privacy policy
            </a>
            . You can manage or cancel a subscription in Google Play at any time; if Pro ends, nothing in the
            app is locked or deleted.
          </P>
        </Section>

        <Section title="Files You Export">
          <P>
            Mentto can create PDF receipts and statements and spreadsheet (CSV) exports of your students,
            payments and attendance. These are created on your device and only go where you choose to share
            or save them.
          </P>
        </Section>

        <Section title="Device Backups">
          <P>
            Android may include Mentto&apos;s data in your device backup to your Google account, depending on
            your device settings. That backup is handled by Android and Google under their own terms, not by
            Mentto.
          </P>
        </Section>

        <Section title="Advertising and Analytics">
          <P>Mentto contains no advertising, no third-party analytics, and no tracking.</P>
        </Section>

        <Section title="Google Play Diagnostics">
          <P>
            If you have opted in on your device, Google Play may collect crash and performance diagnostics
            (Android vitals) about apps you use, including Mentto. This is collected by Google under its own
            policies and is available to us only in aggregate through the Play Console.
          </P>
        </Section>

        <Section title="Data Retention &amp; Deletion">
          <P>
            Because your records live on your device, you control them. You can delete any student, payment
            or lesson in the app. Uninstalling Mentto, or clearing its storage in your device settings,
            removes everything from the device. If you used Google Drive backup, you can also remove the
            backups from your Google account as described above. We hold no copy of your records, so there is
            nothing for us to delete on our side. Purchase records are kept by Google Play and RevenueCat as
            required for billing and tax.
          </P>
        </Section>

        <Section title="Your Rights">
          <P>
            Depending on where you live (including under GDPR and CCPA), you may have rights to access,
            correct, delete, or restrict personal data. Since we do not hold your Mentto records, these are
            exercised directly in the app, on your device and in your Google account. You can still contact
            us with any question or request.
          </P>
        </Section>

        <Section title="Children&apos;s Privacy">
          <P>
            Mentto is made for adults who teach, and is not directed at children. We do not knowingly collect
            personal information from children. Information a tutor records about a student stays on the
            tutor&apos;s device and in their own backups, as described above.
          </P>
        </Section>

        <Section title="Changes to This Policy">
          <P>
            We may update this Privacy Policy from time to time. Any changes will be posted on this page with
            an updated date.
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
            { href: '/mentto/', label: 'Mentto' },
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
