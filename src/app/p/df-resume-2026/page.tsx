import type { Metadata } from 'next';
import {
  CONTACT,
  EDUCATION,
  EXPERIENCE,
  HIGHLIGHT_SKILLS,
  SUMMARY,
} from './content';

export const metadata: Metadata = {
  title: { absolute: `${CONTACT.name} — Resume` },
  description: `${CONTACT.title}. Mobile engineering leadership across Android, React Native, and cross-platform products.`,
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  alternates: { canonical: '/p/df-resume-2026/' },
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-blue-400 mb-4">
      {children}
    </p>
  );
}

export default function PrivateResumePage() {
  return (
    <main className="min-h-[calc(100vh-64px)] bg-[var(--ndl-bg)] text-[var(--ndl-text)]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--ndl-border)]">
        <div className="pointer-events-none absolute inset-0 ndl-dot-grid opacity-40" aria-hidden="true" />
        <div className="relative max-w-3xl mx-auto px-6 sm:px-10 py-16 sm:py-20">
          <p className="text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-amber-500 mb-3">
            Private resume
          </p>
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight leading-tight mb-3">
            {CONTACT.name}
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 font-light mb-8">
            {CONTACT.title}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <a
              href={`mailto:${CONTACT.email}`}
              className="text-blue-400 hover:text-blue-300 underline-offset-4 hover:underline"
            >
              {CONTACT.email}
            </a>
            <a
              href={CONTACT.linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline-offset-4 hover:underline"
            >
              {CONTACT.linkedInLabel}
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 sm:px-10 py-14 sm:py-16 space-y-16">
        {/* Summary */}
        <section>
          <SectionLabel>Summary</SectionLabel>
          <div className="space-y-4">
            {SUMMARY.map((para) => (
              <p key={para.slice(0, 32)} className="text-slate-400 font-light leading-relaxed text-[0.95rem]">
                {para}
              </p>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section>
          <SectionLabel>Core stack</SectionLabel>
          <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
            {HIGHLIGHT_SKILLS.map((skill) => (
              <li
                key={skill}
                className="text-xs tracking-wide text-slate-300 border border-[var(--ndl-border)] px-2.5 py-1"
              >
                {skill}
              </li>
            ))}
          </ul>
        </section>

        {/* Experience */}
        <section>
          <SectionLabel>Experience</SectionLabel>
          <div className="space-y-12">
            {EXPERIENCE.map((job) => (
              <article key={`${job.company}-${job.period}`}>
                <header className="mb-5">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1">
                    <h2 className="text-xl font-medium tracking-tight text-[var(--ndl-text)]">
                      {job.company}
                    </h2>
                    <p className="text-xs tracking-wide text-slate-500 uppercase">{job.period}</p>
                  </div>
                  <p className="text-sm text-slate-400 font-light">{job.role}</p>
                  {job.projectUrl ? (
                    <a
                      href={job.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-xs text-blue-400 hover:text-blue-300 underline-offset-4 hover:underline"
                    >
                      View on Play Store →
                    </a>
                  ) : null}
                </header>

                <div className="space-y-8">
                  {job.projects.map((project) => (
                    <div key={project.name} className="pl-0 sm:pl-4 sm:border-l sm:border-[var(--ndl-border)]">
                      <h3 className="text-base font-medium text-[var(--ndl-text)] mb-2">{project.name}</h3>
                      <p className="text-sm text-slate-400 font-light leading-relaxed mb-3">
                        {project.description}
                      </p>
                      <ul className="space-y-2 mb-4 list-disc pl-5 marker:text-slate-600">
                        {project.contributions.map((item) => (
                          <li key={item.slice(0, 40)} className="text-sm text-slate-400 font-light leading-relaxed">
                            {item}
                          </li>
                        ))}
                      </ul>
                      <p className="text-[0.7rem] leading-relaxed text-slate-500">
                        {project.tech.join(' · ')}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Education */}
        <section>
          <SectionLabel>Education</SectionLabel>
          <ul className="space-y-5 list-none p-0 m-0">
            {EDUCATION.map((ed) => (
              <li key={ed.credential}>
                <p className="text-base font-medium text-[var(--ndl-text)]">{ed.credential}</p>
                <p className="text-sm text-slate-400 font-light">{ed.school}</p>
                <p className="text-xs tracking-wide text-slate-500 uppercase mt-1">{ed.period}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
