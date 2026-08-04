'use client';

import { useState } from 'react';
import { EXPERIENCE, type Role } from './content';

function JobDetails({ job }: { job: Role }) {
  return (
    <div className="mt-4 space-y-8 border-t border-[var(--ndl-border)] pt-4">
      {job.projectUrl ? (
        <a
          href={job.projectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm text-blue-400 hover:text-blue-300 underline-offset-4 hover:underline"
        >
          View on Play Store →
        </a>
      ) : null}
      {job.projects.map((project) => (
        <div key={project.name} className="pl-0 sm:pl-4 sm:border-l sm:border-[var(--ndl-border)]">
          <h3 className="text-lg font-medium text-[var(--ndl-text)] mb-2">{project.name}</h3>
          <p className="text-base text-slate-400 font-light leading-relaxed mb-3">
            {project.description}
          </p>
          <ul className="space-y-2 mb-4 list-disc pl-5 marker:text-slate-600">
            {project.contributions.map((item) => (
              <li key={item.slice(0, 40)} className="text-base text-slate-400 font-light leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
          <p className="text-xs leading-relaxed text-slate-500">
            {project.tech.join(' · ')}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function ExperienceAccordion() {
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {EXPERIENCE.map((job) => {
        const key = `${job.company}-${job.period}`;
        const open = openKey === key;
        const projectNames = job.projects.map((p) => p.name).join(' · ');

        return (
          <article
            key={key}
            className="border border-[var(--ndl-border)] bg-[var(--ndl-surface)]/40"
          >
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpenKey(open ? null : key)}
              className="w-full text-left px-4 py-4 sm:px-5 flex gap-3 items-start justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1">
                  <h2 className="text-lg font-medium tracking-tight text-[var(--ndl-text)]">
                    {job.company}
                  </h2>
                  <p className="text-xs tracking-wide text-slate-500 uppercase shrink-0">
                    {job.period}
                  </p>
                </div>
                <p className="text-base text-slate-400 font-light">{job.role}</p>
                {!open ? (
                  <p className="text-sm text-slate-500 mt-2 truncate">{projectNames}</p>
                ) : null}
              </div>
              <span
                className="text-slate-500 text-lg leading-none mt-0.5 shrink-0 select-none"
                aria-hidden="true"
              >
                {open ? '−' : '+'}
              </span>
            </button>
            {open ? (
              <div className="px-4 pb-5 sm:px-5">
                <JobDetails job={job} />
              </div>
            ) : null}
          </article>
        );
      })}
      <p className="text-sm text-slate-500 pt-2">
        Tap a role to expand full project detail.
      </p>
    </div>
  );
}
