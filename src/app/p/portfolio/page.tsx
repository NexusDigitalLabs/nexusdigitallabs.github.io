import type { Metadata } from 'next';
import ExperienceAccordion from './ExperienceAccordion';
import {
  CONTACT,
  EDUCATION,
  FEATURED_WORK,
  HIGHLIGHT_SKILLS,
  PROFILE,
  FEATURED_RECOMMENDATIONS,
  SERVICES,
} from './content';

export const metadata: Metadata = {
  title: { absolute: `${CONTACT.name} — Portfolio` },
  description: `${CONTACT.title}. ${PROFILE.valueLine}`,
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  alternates: { canonical: '/p/portfolio/' },
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-[0.18em] uppercase text-blue-400 mb-4">
      {children}
    </p>
  );
}

function ContactIcons({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <a
        href={`mailto:${CONTACT.email}`}
        aria-label={`Email ${CONTACT.email}`}
        title={CONTACT.email}
        className="inline-flex h-10 w-10 items-center justify-center border border-[var(--ndl-border)] text-slate-400 transition-colors hover:border-blue-400/50 hover:text-blue-400"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </a>
      <a
        href={CONTACT.linkedInUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn profile"
        title="LinkedIn"
        className="inline-flex h-10 w-10 items-center justify-center border border-[var(--ndl-border)] text-slate-400 transition-colors hover:border-blue-400/50 hover:text-blue-400"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </a>
    </div>
  );
}

function StoreLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm font-medium tracking-wide text-blue-400 hover:text-blue-300 underline-offset-4 hover:underline"
    >
      {label}
      <span aria-hidden="true">↗</span>
    </a>
  );
}

export default function PrivatePortfolioPage() {
  return (
    <main className="min-h-screen bg-[var(--ndl-bg)] text-[var(--ndl-text)]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--ndl-border)]">
        <div className="pointer-events-none absolute inset-0 ndl-dot-grid opacity-40" aria-hidden="true" />
        <div className="relative max-w-3xl mx-auto px-6 sm:px-10 py-16 sm:py-20">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-amber-500">
              {PROFILE.eyebrow}
            </p>
            <span className="text-xs font-semibold tracking-wide uppercase text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1">
              {PROFILE.availability}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight leading-tight mb-3">
            {CONTACT.name}
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 font-light mb-4">
            {CONTACT.title}
          </p>
          <p className="text-base text-slate-400 font-light leading-relaxed max-w-2xl mb-8">
            {PROFILE.valueLine}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href={`mailto:${CONTACT.email}?subject=${encodeURIComponent('Freelance / contract inquiry')}`}
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold tracking-[0.08em] uppercase bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
            >
              Hire me
            </a>
            <ContactIcons />
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 sm:px-10 py-14 sm:py-16 space-y-16">
        {/* Selected work */}
        <section>
          <SectionLabel>Selected work</SectionLabel>
          <div className="space-y-10">
            {FEATURED_WORK.map((project) => (
              <article
                key={project.name}
                className="border-t border-[var(--ndl-border)] pt-8 first:border-t-0 first:pt-0"
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-2">
                  <h2 className="text-2xl font-medium tracking-tight">{project.name}</h2>
                  <p className="text-xs tracking-wide text-slate-500 uppercase">{project.company}</p>
                </div>
                <p className="text-base text-slate-400 font-light leading-relaxed mb-4">
                  {project.blurb}
                </p>
                <ul className="space-y-2 mb-4 list-disc pl-5 marker:text-slate-600">
                  {project.outcomes.map((item) => (
                    <li key={item} className="text-base text-slate-400 font-light leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-xs leading-relaxed text-slate-500 mb-4">
                  {project.tech.join(' · ')}
                </p>
                <div className="flex flex-wrap gap-4">
                  {project.stores.playStore ? (
                    <StoreLink href={project.stores.playStore} label="Google Play" />
                  ) : null}
                  {project.stores.appStore ? (
                    <StoreLink href={project.stores.appStore} label="App Store" />
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Services */}
        <section>
          <SectionLabel>What I can help with</SectionLabel>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 list-none p-0 m-0">
            {SERVICES.map((service) => (
              <li key={service.title}>
                <h3 className="text-base font-medium text-[var(--ndl-text)] mb-1.5">{service.title}</h3>
                <p className="text-base text-slate-400 font-light leading-relaxed">{service.desc}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Recommendations */}
        <section>
          <SectionLabel>Recommendations</SectionLabel>
          <div className="space-y-8">
            {FEATURED_RECOMMENDATIONS.map((rec) => (
              <blockquote
                key={`${rec.name}-${rec.date}`}
                className="border-t border-[var(--ndl-border)] pt-6 first:border-t-0 first:pt-0 m-0"
              >
                <p className="text-base text-slate-400 font-light leading-relaxed mb-4">
                  “{rec.quote}”
                </p>
                <footer>
                  <p className="text-sm text-slate-500 font-light leading-relaxed">{rec.title}</p>
                  <p className="text-xs tracking-wide text-slate-500 uppercase mt-1.5">
                    {rec.relationship} · {rec.date}
                  </p>
                </footer>
              </blockquote>
            ))}
          </div>
          <p className="mt-8 text-sm text-slate-500">
            More on LinkedIn ·{' '}
            <a
              href={CONTACT.linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline-offset-4 hover:underline"
            >
              View profile ↗
            </a>
          </p>
        </section>

        {/* Stack */}
        <section>
          <SectionLabel>Core stack</SectionLabel>
          <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
            {HIGHLIGHT_SKILLS.map((skill) => (
              <li
                key={skill}
                className="text-sm tracking-wide text-slate-300 border border-[var(--ndl-border)] px-2.5 py-1"
              >
                {skill}
              </li>
            ))}
          </ul>
        </section>

        {/* Experience */}
        <section>
          <SectionLabel>Experience</SectionLabel>
          <ExperienceAccordion />
        </section>

        {/* Education */}
        <section>
          <SectionLabel>Education</SectionLabel>
          <ul className="space-y-5 list-none p-0 m-0">
            {EDUCATION.map((ed) => (
              <li key={ed.credential}>
                <p className="text-lg font-medium text-[var(--ndl-text)]">{ed.credential}</p>
                <p className="text-base text-slate-400 font-light">{ed.school}</p>
                <p className="text-xs tracking-wide text-slate-500 uppercase mt-1">{ed.period}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Hire CTA */}
        <section className="border-t border-[var(--ndl-border)] pt-12">
          <SectionLabel>Let&apos;s work together</SectionLabel>
          <p className="text-base text-slate-400 font-light leading-relaxed mb-6 max-w-xl">
            {PROFILE.hireNote}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href={`mailto:${CONTACT.email}?subject=${encodeURIComponent('Freelance / contract inquiry')}`}
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold tracking-[0.08em] uppercase bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
            >
              Email me
            </a>
            <ContactIcons />
          </div>
        </section>
      </div>
    </main>
  );
}
