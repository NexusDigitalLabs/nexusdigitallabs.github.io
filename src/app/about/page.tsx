import type { Metadata } from 'next';
import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal';

export const metadata: Metadata = {
  title: 'About',
  description: 'NexusDigitalLabs is a software studio engineering minimalist web utilities, developer tools, and high-performance software built for speed, privacy, and utility.',
  alternates: { canonical: 'https://nexusdigitallabs.dev/about/' },
  openGraph: {
    title: 'About — NexusDigitalLabs',
    description: 'A software studio engineering minimalist web utilities and developer tools built for speed, privacy, and utility.',
  },
};

const PRINCIPLES = [
  {
    color: 'blue',
    dot: 'bg-blue-400',
    ring: 'bg-blue-500/15 border-blue-500/25',
    title: 'Privacy by default',
    desc: 'Zero cookies. Zero server calls with user data. GDPR/CCPA compliant without a banner.',
  },
  {
    color: 'violet',
    dot: 'bg-violet-400',
    ring: 'bg-violet-500/15 border-violet-500/25',
    title: 'Zero-bloat architecture',
    desc: 'React, Tailwind CSS, and nothing extra. No unnecessary dependencies or client-side state engines.',
  },
  {
    color: 'emerald',
    dot: 'bg-emerald-400',
    ring: 'bg-emerald-500/15 border-emerald-500/25',
    title: 'Performance as a feature',
    desc: 'Every tool targets a perfect Lighthouse score. Fast load, fast interaction, no layout shift.',
  },
  {
    color: 'amber',
    dot: 'bg-amber-400',
    ring: 'bg-amber-500/15 border-amber-500/25',
    title: 'Free forever',
    desc: 'Deployed on Vercel. No infra costs means no paywalls, no freemium gates, no ads.',
  },
];

const VALUES = [
  {
    accent: 'blue',
    iconClass: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    iconPath: 'M13 10V3L4 14h7v7l9-11h-7z',
    title: 'Speed first',
    desc: 'Every millisecond matters. We optimise for LCP, INP, and CLS from the first line of code — not after the fact.',
    delay: 0,
  },
  {
    accent: 'violet',
    iconClass: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
    iconPath: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    title: 'Privacy as architecture',
    desc: "Privacy isn't bolted on — it's the foundation. Client-side execution means zero exposure by design.",
    delay: 120,
  },
  {
    accent: 'emerald',
    iconClass: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    iconPath: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    title: 'Minimal footprint',
    desc: 'React and Tailwind CSS only. The codebase stays readable, auditable, and dependency-minimal.',
    delay: 0,
  },
  {
    accent: 'amber',
    iconClass: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    iconPath: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
    title: 'Keyboard accessible',
    desc: 'Every tool is fully navigable by keyboard with clear focus states. Accessibility is non-negotiable.',
    delay: 120,
  },
];

const STACK = [
  ['React', 'Server + Client components'],
  ['Next.js', 'App Router, Vercel edge'],
  ['Tailwind CSS', 'Utility-first styling'],
  ['Vercel', 'Zero-cost hosting'],
];

export default function AboutPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden ndl-dot-grid py-24 sm:py-32">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute top-[-160px] left-[20%] w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle,rgba(37,99,235,0.12) 0%,transparent 65%)', filter: 'blur(80px)' }} />
          <div className="absolute bottom-0 right-[10%] w-[300px] h-[300px] rounded-full"
            style={{ background: 'radial-gradient(circle,rgba(99,102,241,0.08) 0%,transparent 65%)', filter: 'blur(70px)' }} />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 sm:px-10">
          <div className="ndl-anim-1 inline-flex items-center gap-2 text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-7">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            Est. 2026 — Software Studio
          </div>
          <h1 className="ndl-anim-2 text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.12] mb-6">
            We build tools<br />
            <span className="ndl-gradient-text">engineers trust.</span>
          </h1>
          <p className="ndl-anim-3 text-slate-400 font-light max-w-xl leading-relaxed text-base sm:text-lg">
            NexusDigitalLabs is a software studio focused on engineering minimalist, privacy-first developer utilities. No framework bloat. No cookie banners. No compromises.
          </p>
        </div>
      </section>

      {/* ── MISSION ──────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <ScrollReveal>
              <p className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-4">Mission</p>
              <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight mb-5">Utility over complexity.</h2>
              <p className="text-slate-400 font-light leading-relaxed text-sm sm:text-base">
                The web doesn&apos;t need more bloated SaaS platforms. It needs sharp, single-purpose tools that do exactly what they say — fast, privately, and without requiring a login.
              </p>
              <p className="text-slate-400 font-light leading-relaxed text-sm sm:text-base mt-4">
                Every product we ship runs entirely in the browser. Your data never leaves your device. There are no accounts, no subscriptions, and no telemetry.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={120}>
              <p className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-4">Principles</p>
              <div className="space-y-4">
                {PRINCIPLES.map((p) => (
                  <div key={p.title} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${p.ring}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white mb-0.5">{p.title}</p>
                      <p className="text-xs text-slate-500 font-light leading-relaxed">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── VALUES GRID ──────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-6 sm:px-10">
          <ScrollReveal className="mb-12">
            <p className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-3">What we value</p>
            <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight">The way we build.</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {VALUES.map((v) => (
              <ScrollReveal key={v.title} delay={v.delay}>
                <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/60 transition-all duration-250 hover:border-blue-500/30 hover:-translate-y-0.5">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${v.iconClass}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={v.iconPath} />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-2">{v.title}</h3>
                  <p className="text-xs text-slate-400 font-light leading-relaxed">{v.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECH STACK ───────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-6 sm:px-10">
          <ScrollReveal className="mb-10">
            <p className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-3">Tech stack</p>
            <h2 className="text-2xl font-light text-white tracking-tight">Intentionally lean.</h2>
          </ScrollReveal>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {STACK.map(([name, sub], i) => (
              <ScrollReveal key={name} delay={i * 80}>
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/50 text-center">
                  <p className="text-xs font-bold text-white mb-1">{name}</p>
                  <p className="text-[10px] text-slate-500">{sub}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-6 sm:px-10">
          <ScrollReveal className="mb-10">
            <p className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-3">FAQ</p>
            <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight">Common questions.</h2>
          </ScrollReveal>
          <div className="space-y-6 max-w-2xl">
            {[
              { q: 'Who built NexusDigitalLabs?', a: 'NexusDigitalLabs is an independent software studio. The tools, articles, and games on this site are built and maintained by a small team of developers focused on building useful things without unnecessary complexity.' },
              { q: 'Are the tools really free forever?', a: 'Yes. Every tool on this site is free with no usage limits, no account required, and no paywalled features. The site is deployed on Vercel\'s free tier, which means zero infrastructure cost and no financial pressure to monetise.' },
              { q: 'Do you collect any user data?', a: 'No. None of the tools transmit user input to any server. Everything runs client-side in your browser. We use privacy-respecting, cookie-free analytics (Umami) that records only aggregate page view counts — no personally identifiable information, no session tracking, no fingerprinting.' },
              { q: 'Can I suggest a tool or feature?', a: 'Yes. Use the Contact page to send a suggestion. We build what we find genuinely useful, so real-world requests from real users carry a lot of weight in what gets prioritised next.' },
              { q: 'Is the source code available?', a: 'The site\'s source code is publicly visible on GitHub. You can view the implementation, raise issues, or propose changes via pull request. See the GitHub link in the header or footer.' },
              { q: 'Why not use a popular framework like WordPress or Webflow?', a: "WordPress and Webflow solve the wrong problem for what we're building. Managed CMSs add complexity, cookies, plugin dependencies, and performance overhead that are simply unnecessary for a site built around lightweight, client-side tools. Next.js and React give us full control with zero compromise on speed or privacy." },
            ].map(({ q, a }, i) => (
              <ScrollReveal key={q} delay={i * 60}>
                <div className="border-l-2 border-slate-700 pl-5 py-1">
                  <p className="text-sm font-semibold text-white mb-2">{q}</p>
                  <p className="text-sm text-slate-400 font-light leading-relaxed">{a}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 text-center">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight mb-4">Want to collaborate or give feedback?</h2>
            <p className="text-slate-400 text-sm font-light mb-8 max-w-md mx-auto">
              We&apos;re open to partnerships, feature ideas, and open-source contributions. Reach out anytime.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/contact/"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-7 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 no-underline"
                style={{ boxShadow: '0 4px 20px rgba(37,99,235,0.4)' }}
              >
                Get in touch
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <a
                href="https://github.com/NexusDigitalLabs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 text-sm font-medium px-7 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 no-underline"
              >
                View on GitHub
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
