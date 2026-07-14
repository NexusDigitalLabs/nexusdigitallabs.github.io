import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Terms of Use',
  description:
    'Terms of Use for NexusDigitalLabs. Rules for using our tools, optional accounts, games, and synced data.',
  path: '/terms/',
  ogTitle: 'Terms of Use — NexusDigitalLabs',
  ogDescription: 'Terms of Use for NexusDigitalLabs developer tools and software studio.',
});

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

export default function TermsOfUsePage() {
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
        <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">Terms of Use</h1>
        <p className="text-xs text-slate-500 font-light">Last updated: July 15, 2026</p>
      </div>

      <div>
        <P>
          These Terms of Use (&ldquo;Terms&rdquo;) govern your access to and use of the website and services
          operated by NexusDigitalLabs at{' '}
          <a href="https://nexusdigitallabs.dev" className="text-blue-400 underline">nexusdigitallabs.dev</a>
          {' '}(the &ldquo;Service&rdquo;). By using the Service, you agree to these Terms.
        </P>

        <Section title="What we provide">
          <P>
            NexusDigitalLabs offers browser-based utilities, generators, optional games, and related content.
            Most tools process your inputs locally in your browser. Optional features (accounts, Fuel Tracker sync,
            cloud high scores, opt-in tool drafts) use our infrastructure as described in the{' '}
            <Link href="/privacy-policy/" className="text-blue-400 underline">Privacy Policy</Link>.
          </P>
        </Section>

        <Section title="Acceptable use">
          <P>
            You may use the Service for lawful personal or business purposes. You agree not to:
          </P>
          <ul className="list-disc pl-5 text-sm font-light text-slate-400 leading-[1.85] mb-3 space-y-1">
            <li>Probe, disrupt, or overload the Service or related infrastructure</li>
            <li>Attempt to access another user&apos;s account, sync code, or draft data without authorization</li>
            <li>Use the Service to create or distribute malware, spam, or fraudulent content</li>
            <li>Misrepresent affiliation with NexusDigitalLabs</li>
            <li>Violate applicable laws while using the Service</li>
          </ul>
        </Section>

        <Section title="Accounts &amp; sync codes">
          <P>
            Creating an account (Google or magic link) and linking a Fuel Tracker garage are optional.
            You are responsible for keeping sync codes and account access confidential.
            Unlinking a garage or deleting drafts does not erase data stored only in your browser until you clear it.
          </P>
        </Section>

        <Section title="No professional advice">
          <P>
            Tools such as Invoice Generator and Debt Optimizer produce outputs for convenience only.
            They are not legal, tax, financial, or accounting advice. You are responsible for verifying
            invoices, payment details, debt plans, and related figures before relying on them.
          </P>
        </Section>

        <Section title="Intellectual property">
          <P>
            The Service&apos;s design, branding, articles, and original code are owned by NexusDigitalLabs
            or its licensors. You retain ownership of content you enter into tools. You grant us a limited
            license to store and process that content only as needed to operate optional cloud features you enable.
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
            The Service may rely on third parties (for example Supabase for auth and data, Umami for analytics,
            and Google AdSense for advertising). Their terms and privacy practices apply to their processing.
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
            <Link href="/privacy-policy/" className="text-blue-400 underline">Privacy Policy</Link>.
          </P>
        </Section>
      </div>

      <div className="mt-14 pt-8 border-t border-slate-800/60 flex flex-wrap gap-4 text-xs text-slate-500">
        {['/about/', '/contact/', '/privacy-policy/', '/terms/'].map((href) => (
          <Link key={href} href={href} className="hover:text-slate-300 transition-colors no-underline">
            {href === '/about/' ? 'About' : href === '/contact/' ? 'Contact' : href === '/privacy-policy/' ? 'Privacy' : 'Terms'}
          </Link>
        ))}
      </div>
    </div>
  );
}
