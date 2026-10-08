import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Privacy Policy',
  description:
    'Privacy Policy for NexusDigitalLabs. Learn how we handle data, optional accounts, FreelanceOS business data, Fuel Tracker sync, advertising, and analytics.',
  path: '/privacy-policy/',
  ogTitle: 'Privacy Policy — NexusDigitalLabs',
  ogDescription: 'Privacy Policy for NexusDigitalLabs developer tools and software studio.',
});

function Section({ title, id, children }: { title: string; id?: string; children: React.ReactNode }) {
  return (
    <div className="mt-8 scroll-mt-24" id={id}>
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
        <p className="text-[11px] font-semibold tracking-widest text-slate-500 uppercase">Legal</p>
        <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">Privacy Policy</h1>
        <p className="text-xs text-slate-500 font-light">Last updated: October 8, 2026</p>
      </div>

      <div>
        <P>
          NexusDigitalLabs (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) operates the website at{' '}
          <a href="https://nexusdigitallabs.dev" className="text-blue-400 underline">nexusdigitallabs.dev</a>.
          This Privacy Policy explains what information is collected when you visit our site, how it is used, and your rights regarding that information.
        </P>

        <Section title="Summary">
          <P>
            Most of our calculators and generators run entirely in your browser: the text, numbers, and documents you enter are not uploaded to our servers for processing.
            Optional features that sync across devices (Fuel Tracker) or optional sign-in (Google or magic link) store limited data with our infrastructure providers as described below.
          </P>
          <P>
            FreelanceOS, our business manager for freelancers, is different by design: it stores the business records you enter (clients, projects, invoices, payments and expenses) in our database so you can use them across devices. See the FreelanceOS section below.
          </P>
        </Section>

        <Section title="Information We Collect">
          <P>
            <strong className="text-slate-300 font-medium">Analytics (no account required).</strong>{' '}
            Our analytics platform (Umami) records anonymised page-view data — no cookies are set by Umami, no IP addresses are retained for profiling, and no advertising profiles are built by us.
            We also keep aggregate page-view counts in Supabase (URL path + integer count only — no session IDs or personal identifiers).
          </P>
          <P>
            <strong className="text-slate-300 font-medium">Optional accounts.</strong>{' '}
            If you choose to sign in (Google OAuth or email magic link via Supabase Auth), we store account data needed to operate your session and profile, including:
            email address, authentication identifiers, optional display name, and avatar URL provided by your identity provider (e.g. Google).
            Session tokens are stored in cookies so you stay signed in. Magic-link emails are delivered by Supabase (or a mail provider configured on our Supabase project).
          </P>
          <P>
            <strong className="text-slate-300 font-medium">Fuel Tracker (sync code).</strong>{' '}
            Fuel Tracker stores garage data (vehicles and fill-ups) in Supabase under a sync code you create. You do not need an account to use this.
            We do not require your real name or email for the sync-code flow. Avoid putting personal identifiers (such as an email address) into the nickname or notes fields.
          </P>
          <P>
            <strong className="text-slate-300 font-medium">Optional Fuel Tracker account link.</strong>{' '}
            If you sign in and choose &ldquo;Link to my account,&rdquo; we associate your sync code&apos;s vehicles with your account user ID so the garage can restore when you sign in on another device.
            You can unlink anytime; the sync code continues to work on its own.
          </P>
          <P>
            <strong className="text-slate-300 font-medium">Optional games scores.</strong>{' '}
            High scores default to your browser. If you are signed in, we may store your best scores under your account so they can sync across devices.
          </P>
          <P>
            <strong className="text-slate-300 font-medium">Optional tool drafts (Invoice / Debt).</strong>{' '}
            Invoice Generator and Debt Optimizer stay local unless you explicitly enable &ldquo;cloud draft&rdquo; while signed in.
            Enabling that feature stores a copy of the form JSON in our database solely for resume-on-another-device. You can turn it off and delete the cloud copy at any time.
          </P>
          <P>
            <strong className="text-slate-300 font-medium">Contact form.</strong>{' '}
            If you contact us, we receive the information you voluntarily submit (such as name, email, and message) by email solely to respond to your enquiry.
            Submissions are delivered through our email provider; we do not keep a separate contact-form database.
          </P>
        </Section>

        <Section title="FreelanceOS" id="freelanceos">
          <P>
            <strong className="text-slate-300 font-medium">What we store.</strong>{' '}
            When you use FreelanceOS (at <code>/app</code>, sign-in required), we store the information you enter to run your workspace: your business profile (business name, email, phone, address, tax/registration ID, invoice settings and payment details), clients and their contact details, projects, invoices and line items, payments you record, expenses, and an activity log of changes. When an invoice is issued, we also keep a copy of the business and client details printed on it, so issued invoices stay accurate if you later edit your profile.
          </P>
          <P>
            <strong className="text-slate-300 font-medium">Your clients&apos; details.</strong>{' '}
            You are responsible for having a lawful basis to store the personal details of your own clients (for example, to invoice them). We process that information only on your behalf to provide FreelanceOS, and never contact your clients or use their details for any other purpose.
          </P>
          <P>
            <strong className="text-slate-300 font-medium">Isolation and access.</strong>{' '}
            Each workspace is isolated in the database with row-level security, so other accounts cannot read or change your records. We do not show ads inside FreelanceOS, do not sell your data, and do not use your business data for advertising or to train AI models.
          </P>
          <P>
            <strong className="text-slate-300 font-medium">PDF invoices.</strong>{' '}
            Invoice PDFs are generated in your browser and downloaded to your device; we do not store the PDF files themselves.
          </P>
          <P>
            <strong className="text-slate-300 font-medium">Payments.</strong>{' '}
            FreelanceOS does not process payments or collect card or bank details from you or your clients. Payment details you add to your business profile are only printed on your invoices.
          </P>
          <P>
            <strong className="text-slate-300 font-medium">Deleting your data.</strong>{' '}
            You can delete your account at any time from FreelanceOS Settings. This permanently deletes your workspace and everything in it. Download any invoice PDFs you need to keep first.
          </P>
          <P>
            <strong className="text-slate-300 font-medium">Future features.</strong>{' '}
            FreelanceOS is in beta. If we add features that process your data in new ways (such as an AI assistant), we will update this policy before they launch and explain what is sent to which provider.
          </P>
        </Section>

        <Section title="How We Use Information">
          <P>
            We use information to operate the site and tools, authenticate optional accounts, run your FreelanceOS workspace, sync Fuel Tracker data you choose to store, respond to messages, and measure aggregate traffic.
            We do not sell your personal information. We do not use account, FreelanceOS or Fuel Tracker contents for advertising targeting.
          </P>
        </Section>

        <Section title="Cookies &amp; Local Storage">
          <P>
            <strong className="text-slate-300 font-medium">Our analytics</strong> (Umami) and page-view counter do not rely on first-party tracking cookies.
          </P>
          <P>
            <strong className="text-slate-300 font-medium">Authentication cookies</strong> are set when you voluntarily sign in (Supabase Auth / SSR session cookies). These are necessary to keep you logged in and are not used for advertising.
          </P>
          <P>
            <strong className="text-slate-300 font-medium">Local storage</strong> may store preferences and tool state on your device (for example Fuel Tracker sync code and currency). This stays in your browser unless you clear site data.
          </P>
          <P>
            <strong className="text-slate-300 font-medium">Google AdSense</strong> may set third-party cookies to personalise ads. Those cookies are governed by Google&apos;s policies. You can manage or disable cookies in your browser settings and opt out of personalised ads via{' '}
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Google Ads Settings</a>
            {' '}or{' '}
            <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">aboutads.info</a>.
          </P>
        </Section>

        <Section title="Google AdSense &amp; Advertising">
          <P>
            We may display advertisements on some pages using Google AdSense or similar networks. When ads are enabled, Google (as a third-party vendor) may use cookies to serve ads based on your prior visits to this website or other websites. Google&apos;s use of advertising cookies enables it and its partners to serve ads based on your visit to our site and/or other sites on the Internet. Where required by law, we will present consent choices before non-essential advertising cookies are used.
          </P>
        </Section>

        <Section title="Service Providers">
          <P>
            We use infrastructure and auth providers to run the site, including Vercel (hosting), Supabase (database and authentication), Resend (transactional email for the contact form and account emails where configured), Umami (analytics), and Google (OAuth sign-in and AdSense where applicable).
            These providers process data under their own terms and only as needed for the services described above.
          </P>
        </Section>

        <Section title="Data Retention &amp; Deletion">
          <P>
            Fuel Tracker data remains stored until you delete it in the tool (individual fills, vehicles, or all garage data) or request deletion.
            Account profile data and FreelanceOS records remain while your account exists. You can sign out at any time from the account menu.
            You can delete your account yourself from FreelanceOS Settings, which permanently removes your profile, FreelanceOS workspace, saved tool drafts and game scores (linked Fuel Tracker garages are unlinked and keep working with their sync code).
            You can also ask us to delete your account by contacting us at the address below.
          </P>
        </Section>

        <Section title="Your Rights">
          <P>
            Depending on your location (including GDPR/CCPA where applicable), you may have rights to access, correct, delete, or restrict certain personal data, and to object to certain processing.
            Contact us to exercise these rights. You may also clear cookies and local storage in your browser, and revoke Google access to our app from your Google account settings.
          </P>
        </Section>

        <Section title="Third-Party Links">
          <P>
            Our site may contain links to external websites. We are not responsible for the privacy practices of those sites. We encourage you to review the privacy policy of any external site you visit.
          </P>
        </Section>

        <Section title="Children&apos;s Privacy">
          <P>Our services are not directed at children under 13. We do not knowingly collect personal information from children.</P>
        </Section>

        <Section title="Changes to This Policy">
          <P>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.</P>
        </Section>

        <Section title="Contact">
          <P>
            If you have any questions about this Privacy Policy, or to request account or data deletion, please contact us at{' '}
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
            { href: '/privacy-policy/', label: 'Privacy' },
            { href: '/terms/', label: 'Terms' },
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
