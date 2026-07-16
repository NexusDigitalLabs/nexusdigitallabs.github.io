import ScrollReveal from '@/components/ScrollReveal';
import ContactForm from '@/components/ContactForm';
import KofiTipLink from '@/components/KofiTipLink';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Contact',
  description:
    'Get in touch with NexusDigitalLabs. Send suggestions, feedback, bug reports, or feature ideas anytime.',
  path: '/contact/',
  ogTitle: 'Contact — NexusDigitalLabs',
  ogDescription:
    'Suggestions, feedback, bug reports, and feature ideas welcome. Reach out to NexusDigitalLabs anytime.',
});

export default function ContactPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden ndl-dot-grid py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute top-[-120px] right-[15%] w-[450px] h-[450px] rounded-full"
            style={{ background: 'radial-gradient(circle,rgba(37,99,235,0.11) 0%,transparent 65%)', filter: 'blur(80px)' }} />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 sm:px-10">
          <div className="ndl-anim-1 inline-flex items-center gap-2 text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-7">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            Feedback &amp; feature ideas welcome
          </div>
          <h1 className="ndl-anim-2 text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.12] mb-6">
            Got something<br />
            <span className="ndl-gradient-text">to share?</span>
          </h1>
          <p className="ndl-anim-3 text-slate-400 font-light max-w-lg leading-relaxed text-base sm:text-lg">
            Whether it&apos;s a feature idea, a bug report, a suggestion, or just a message — we read everything.
          </p>
        </div>
      </section>

      {/* ── CONTACT GRID ─────────────────────────────────────────────────── */}
      <section className="py-4 pb-20">
        <div className="max-w-4xl mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

            {/* ── LEFT: Form (3 cols) ── */}
            <div className="lg:col-span-3">
              <ScrollReveal>
                <p className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-6">Send a message</p>
                <ContactForm />
              </ScrollReveal>
            </div>

            {/* ── RIGHT: Contact options (2 cols) ── */}
            <div className="lg:col-span-2">
              <ScrollReveal delay={120}>
                <p className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-6">Other ways to reach us</p>

                <div className="space-y-4">
                  <a
                    href="mailto:hello@nexusdigitallabs.dev"
                    className="flex items-center gap-4 p-4 rounded-xl no-underline transition-all duration-250 hover:-translate-y-0.5"
                    style={{ background: 'var(--ndl-card-bg)', border: '1px solid var(--ndl-border)' }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium" style={{ color: 'var(--ndl-text)' }}>Email</p>
                      <p className="text-xs truncate" style={{ color: 'var(--ndl-faint)' }}>hello@nexusdigitallabs.dev</p>
                    </div>
                    <svg className="w-4 h-4 ml-auto shrink-0" style={{ color: 'var(--ndl-faint)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>

                  <KofiTipLink variant="card" />

                  <div
                    className="p-4 rounded-xl"
                    style={{ background: 'var(--ndl-surface-2)', border: '1px solid var(--ndl-border)' }}
                  >
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--ndl-muted)' }}>
                      We typically respond within <span className="font-medium" style={{ color: 'var(--ndl-text-secondary)' }}>1–2 business days</span>. For bug reports, please include browser version and steps to reproduce.
                    </p>
                  </div>

                  <div
                    className="flex items-start gap-2.5 p-4 rounded-xl"
                    style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
                  >
                    <svg className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#059669' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <p className="text-xs leading-relaxed" style={{ color: '#047857' }}>
                      Your message is emailed to us via our email provider so we can reply. We don&apos;t keep a separate contact-form database on our servers.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
