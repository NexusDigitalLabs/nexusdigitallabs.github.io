import type { Metadata } from 'next';
import ScrollReveal from '@/components/ScrollReveal';
import ContactForm from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact',
  description: "Get in touch with NexusDigitalLabs. We're open to partnerships, feature requests, bug reports, and open-source contributions.",
  alternates: { canonical: 'https://nexusdigitallabs.dev/contact/' },
  openGraph: {
    title: 'Contact — NexusDigitalLabs',
    description: 'Get in touch with NexusDigitalLabs. Partnerships, feature ideas, and open-source contributions welcome.',
  },
};

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
            Open to new projects &amp; collaborations
          </div>
          <h1 className="ndl-anim-2 text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.12] mb-6">
            Let&apos;s build<br />
            <span className="ndl-gradient-text">something useful.</span>
          </h1>
          <p className="ndl-anim-3 text-slate-400 font-light max-w-lg leading-relaxed text-base sm:text-lg">
            Whether it&apos;s a feature idea, a bug report, a collaboration, or just a message — we read everything.
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
            <div className="lg:col-span-2 space-y-4">
              <ScrollReveal delay={120}>
                <p className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-6">Other ways to reach us</p>

                <a
                  href="https://github.com/NexusDigitalLabs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800/60 no-underline transition-all duration-250 hover:border-blue-500/28 hover:-translate-y-0.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-800/60 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.165c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">GitHub</p>
                    <p className="text-xs text-slate-500 truncate">github.com/NexusDigitalLabs</p>
                  </div>
                  <svg className="w-4 h-4 text-slate-600 ml-auto shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>

                <a
                  href="mailto:hello@nexusdigitallabs.dev"
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800/60 no-underline transition-all duration-250 hover:border-blue-500/28 hover:-translate-y-0.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">Email</p>
                    <p className="text-xs text-slate-500 truncate">hello@nexusdigitallabs.dev</p>
                  </div>
                  <svg className="w-4 h-4 text-slate-600 ml-auto shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>

                <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/40">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    We typically respond within <span className="text-slate-300 font-medium">1–2 business days</span>. For bug reports, please include browser version and steps to reproduce.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-4 rounded-xl" style={{ background: 'rgba(6,78,59,0.3)', border: '1px solid rgba(5,46,37,0.6)' }}>
                  <svg className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(52,211,153,0.8)' }}>
                    Form data is sent via <span className="font-medium">mailto:</span> — nothing is stored on our servers.
                  </p>
                </div>
              </ScrollReveal>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
