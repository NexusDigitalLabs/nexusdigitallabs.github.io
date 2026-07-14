import type { Metadata } from 'next';
import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal';
import SiteStatsClient from '@/components/SiteStatsClient';

export const metadata: Metadata = {
  title: 'NexusDigitalLabs — Software Studio',
  description: 'Engineering minimalist web utilities, developer tools, and high-performance software built for speed, privacy, and utility.',
  alternates: { canonical: 'https://nexusdigitallabs.dev/' },
};

// ── Tool cards ────────────────────────────────────────────────────────────────
const TOOLS = [
  {
    href: '/tools/prompt-architect/',
    accent: 'violet',
    iconPath: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    title: 'Prompt Architect',
    desc: 'Advanced system prompt flattener with live token counting and API cost estimation for LLM workspaces.',
  },
  {
    href: '/tools/invoice-generator/',
    accent: 'emerald',
    iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    title: 'Invoice Generator',
    desc: 'Freelancer invoice builder with live PDF preview, line items, tax configuration, and bank wire details.',
  },
  {
    href: '/tools/debt-optimizer/',
    accent: 'sky',
    iconPath: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    title: 'Debt Optimizer',
    desc: 'Avalanche vs snowball debt payoff calculator with month-by-month runway and HYSA savings compounding.',
  },
  {
    href: '/tools/fuel-tracker/',
    accent: 'amber',
    iconPath: 'M3 10h2l1 2h13l1-5H6L5 5H3m0 5v6a1 1 0 001 1h1a2 2 0 104 0h4a2 2 0 104 0h1a1 1 0 001-1v-3',
    title: 'Fuel Tracker',
    desc: 'Log fill-ups, track L/100km efficiency, and monitor fuel costs across multiple vehicles with cross-device sync.',
  },
] as const;

const GAMES = [
  {
    href: '/games/2048/',
    iconPath: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z',
    title: '2048',
    desc: 'Slide and merge tiles on a 4×4 grid. Reach the 2048 tile to win. Keyboard, WASD, and touch swipe support.',
    cta: 'Play now',
  },
  {
    href: '/games/snake/',
    iconPath: 'M13 10V3L4 14h7v7l9-11h-7z',
    title: 'Snake',
    desc: 'Navigate your snake to eat food and grow. Avoid walls and your own tail. Speed increases as your score climbs.',
    cta: 'Play now',
  },
  {
    href: '/games/blackjack/',
    iconPath: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
    title: 'Blackjack',
    desc: 'Beat the dealer to 21 without going bust. Dealer draws to 17. Hit, stand, or double down. Classic casino rules.',
    cta: 'Play now',
  },
] as const;

function ArrowRight({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

function ToolIcon({ path }: { path: string }) {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
    </svg>
  );
}

const ACCENT_CLASSES: Record<string, { icon: string; border: string; hover: string; text: string }> = {
  violet:  { icon: 'bg-violet-500/10 border border-violet-500/20 text-violet-400', border: '', hover: 'group-hover:bg-violet-500/15', text: 'text-blue-400' },
  emerald: { icon: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400', border: '', hover: 'group-hover:bg-emerald-500/15', text: 'text-blue-400' },
  sky:     { icon: 'bg-sky-500/10 border border-sky-500/20 text-sky-400', border: '', hover: 'group-hover:bg-sky-500/15', text: 'text-blue-400' },
  amber:   { icon: 'bg-amber-500/10 border border-amber-500/20 text-amber-400', border: '', hover: 'group-hover:bg-amber-500/15', text: 'text-amber-400' },
};

export default function HomePage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden ndl-dot-grid"
        style={{ minHeight: 'calc(100vh - 4rem)', display: 'flex', alignItems: 'center' }}
      >
        {/* Ambient orbs */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="ndl-orb ndl-orb-1" />
          <div className="ndl-orb ndl-orb-2" />
          <div className="ndl-orb ndl-orb-3" />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-6 sm:px-10 py-20 lg:py-0 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* LEFT: Text */}
          <div className="relative z-10">
            <Link
              href="/contact/"
              className="ndl-anim-1 inline-flex items-center gap-2 text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-7 no-underline hover:bg-blue-500/20 hover:border-blue-500/40 transition-all duration-200"
            >
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
              Software Studio — Open to new projects
            </Link>
            <h1 className="ndl-anim-2 text-5xl sm:text-6xl lg:text-[3.8rem] xl:text-[4.2rem] font-light tracking-tight leading-[1.12] mb-6">
              Free tools that<br />
              make everyday<br />
              <span className="ndl-gradient-text">tasks effortless.</span>
            </h1>
            <p className="ndl-anim-3 text-slate-400 font-light max-w-md leading-relaxed text-base sm:text-lg mb-10">
              Practical tools built for everyone — fast, private, and simple. Most tools work without an account and collect no personal data.
            </p>
            <div className="ndl-anim-4 flex flex-col sm:flex-row items-start gap-3">
              <Link
                href="#tools"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 no-underline"
                style={{ boxShadow: '0 4px 20px rgba(37,99,235,0.4)' }}
              >
                Explore Tools <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#articles"
                className="inline-flex items-center gap-2 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 text-sm font-medium px-7 py-3.5 rounded-xl transition-all duration-200 no-underline"
              >
                Read Articles
              </Link>
            </div>
            {/* Live metrics strip */}
            <div className="ndl-anim-5">
              <SiteStatsClient />
            </div>
          </div>

          {/* RIGHT: Animated floating UI cluster */}
          <div className="ndl-anim-visual hidden lg:block relative h-[520px] w-full select-none" aria-hidden="true">

            {/* Glow disc */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[440px] h-[440px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 65%)' }} />
            </div>

            {/* Decorative dot cluster */}
            <div className="absolute top-[55px] left-[110px] w-[88px] h-[52px] ndl-dot-grid rounded-sm opacity-60" />

            {/* Accent dots */}
            <div className="absolute top-[18px] left-[72px] w-3 h-3 rounded-full bg-pink-500/65 animate-pulse" />
            <div className="absolute top-[210px] left-[42px] w-2 h-2 rounded-full bg-blue-400/55" />
            <div className="absolute top-[400px] right-[22px] w-3 h-3 rounded-full bg-violet-400/65 animate-pulse" style={{ animationDelay: '1.2s' }} />
            <div className="absolute top-[75px] right-[65px] w-2 h-2 rounded-full bg-emerald-400/60" />

            {/* Decorative rings */}
            <div className="absolute top-[26px] left-[86px] w-14 h-14 rounded-full border border-blue-500/14" />
            <div className="absolute top-[33px] left-[93px] w-7 h-7 rounded-full border border-violet-500/18" />

            {/* CARD 1: Prompt Architect window */}
            <div className="absolute top-0 right-0 w-[295px] rounded-2xl overflow-hidden shadow-2xl ndl-float-a"
              style={{ background: '#0c1222', border: '1px solid rgba(71,85,105,0.65)' }}>
              <div className="px-4 py-2.5 flex items-center gap-2 border-b" style={{ background: 'rgba(30,41,59,0.8)', borderColor: 'rgba(51,65,85,0.5)' }}>
                <div className="flex gap-1.5">
                  {['rgba(239,68,68,0.75)', 'rgba(234,179,8,0.75)', 'rgba(34,197,94,0.75)'].map((bg, i) => (
                    <span key={i} className="w-2.5 h-2.5 rounded-full block" style={{ background: bg }} />
                  ))}
                </div>
                <span className="text-[10px] ml-2 font-mono" style={{ color: '#64748b' }}>system-prompt.txt</span>
              </div>
              <div className="p-4 font-mono text-[11px] space-y-1.5 leading-relaxed">
                <div><span style={{ color: '#a78bfa' }}>system</span><span style={{ color: '#475569' }}>:</span> <span style={{ color: '#cbd5e1' }}>You are an expert software</span></div>
                <div style={{ color: '#94a3b8', paddingLeft: '0.75rem' }}>engineer specialising in LLM</div>
                <div style={{ color: '#94a3b8', paddingLeft: '0.75rem' }}>prompt optimisation...</div>
                <div className="mt-1"><span style={{ color: '#60a5fa' }}>user</span><span style={{ color: '#475569' }}>:</span> <span style={{ color: '#94a3b8' }}>Analyse and reduce token</span></div>
                <div style={{ color: '#64748b', paddingLeft: '0.75rem' }}>overhead by 50%+ without</div>
                <div style={{ color: '#64748b', paddingLeft: '0.75rem' }}>losing semantic meaning</div>
                <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(30,41,59,0.9)' }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-sans" style={{ fontSize: '9px', color: '#64748b', letterSpacing: '0.08em' }}>TOKEN USAGE</span>
                    <span className="font-sans" style={{ fontSize: '9px', color: '#34d399' }}>↓ 58% saved</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1e293b' }}>
                    <div className="h-full w-[42%] rounded-full" style={{ background: 'linear-gradient(to right,#3b82f6,#818cf8)' }} />
                  </div>
                  <div className="flex justify-between mt-1.5 font-sans">
                    <span style={{ fontSize: '10px', color: '#60a5fa' }}>1,204 tokens</span>
                    <span style={{ fontSize: '10px', color: '#475569', textDecoration: 'line-through' }}>2,847</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: Token count metric */}
            <div className="absolute top-[185px] left-0 w-[158px] rounded-2xl p-4 shadow-xl ndl-float-b"
              style={{ background: 'rgba(46,16,101,0.68)', border: '1px solid rgba(139,92,246,0.28)', backdropFilter: 'blur(12px)' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(139,92,246,0.22)' }}>
                  <svg className="w-3.5 h-3.5" style={{ color: '#a78bfa' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <span className="font-bold uppercase" style={{ fontSize: '9px', color: '#c4b5fd', letterSpacing: '0.1em' }}>Tokens</span>
              </div>
              <p className="text-3xl font-bold text-white tabular-nums leading-none mb-1.5">1,204</p>
              <p className="text-xs font-medium" style={{ color: '#34d399' }}>↓ 1,643 saved</p>
            </div>

            {/* CARD 3: API cost */}
            <div className="absolute bottom-[108px] right-[10px] w-[144px] rounded-2xl p-4 shadow-xl ndl-float-c"
              style={{ background: 'rgba(6,46,37,0.68)', border: '1px solid rgba(52,211,153,0.28)', backdropFilter: 'blur(12px)' }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-3" style={{ background: 'rgba(52,211,153,0.18)' }}>
                <svg className="w-3.5 h-3.5" style={{ color: '#34d399' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-bold uppercase mb-1.5" style={{ fontSize: '9px', color: '#6ee7b7', letterSpacing: '0.1em' }}>Est. Cost</p>
              <p className="text-3xl font-bold text-white tabular-nums leading-none mb-1">$0.04</p>
              <p className="text-xs" style={{ color: '#94a3b8' }}>per API call</p>
            </div>

            {/* CARD 4: Invoice preview */}
            <div className="absolute bottom-[10px] left-[26px] w-[192px] rounded-2xl p-4 shadow-xl ndl-float-a"
              style={{ background: 'rgba(15,23,42,0.88)', border: '1px solid rgba(51,65,85,0.55)', backdropFilter: 'blur(12px)', animationDelay: '2s' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: 'rgba(52,211,153,0.15)' }}>
                  <svg className="w-3.5 h-3.5" style={{ color: '#34d399' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-[11px] font-medium" style={{ color: '#94a3b8' }}>INV-2026-047</span>
              </div>
              <div className="space-y-1.5 font-mono text-[10px]">
                {[['Consulting', '$3,200'], ['UI/UX Design', '$800']].map(([l, v]) => (
                  <div key={l} className="flex justify-between" style={{ color: '#64748b' }}><span>{l}</span><span>{v}</span></div>
                ))}
                <div className="flex justify-between pt-1.5 mt-1 font-sans text-[11px] font-semibold" style={{ color: '#fff', borderTop: '1px solid #1e293b' }}>
                  <span>Total</span><span style={{ color: '#34d399' }}>$4,000</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── VALUE PROPS STRIP ─────────────────────────────────────────────── */}
      <div className="border-y border-slate-800/50" style={{ background: 'rgba(15,20,32,0.3)', backdropFilter: 'blur(4px)' }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              ['Privacy', 'No tracking cookies'],
              ['Access', 'Free to get started'],
              ['Data', 'Private by design'],
              ['Signup', 'Not required for free tools'],
            ].map(([label, val], i) => (
              <ScrollReveal key={label} delay={i * 120}>
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase">{label}</p>
                  <p className="text-sm font-semibold text-slate-200">{val}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      {/* ── TOOLS SECTION ────────────────────────────────────────────────── */}
      <section id="tools" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <ScrollReveal className="mb-14">
            <p className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-3">Free Tools</p>
            <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight">Tools built for engineers.</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TOOLS.map((tool, i) => {
              const ac = ACCENT_CLASSES[tool.accent] ?? ACCENT_CLASSES.violet;
              return (
                <ScrollReveal key={tool.href} delay={i * 120}>
                  <Link
                    href={tool.href}
                    className="group flex flex-col p-6 rounded-2xl bg-slate-900/50 border border-slate-800/60 no-underline ndl-card transition-all duration-200 hover:border-blue-500/35 hover:shadow-[0_0_0_1px_rgba(59,130,246,0.12),0_14px_40px_rgba(37,99,235,0.13)]"
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 ${ac.icon} ${ac.hover}`}>
                      <ToolIcon path={tool.iconPath} />
                    </div>
                    <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors duration-200 mb-2">{tool.title}</h3>
                    <p className="text-sm text-slate-400 font-light leading-relaxed flex-1 mb-5">{tool.desc}</p>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${ac.text} group-hover:gap-3 transition-all duration-200`}>
                      Open tool <ArrowRight />
                    </span>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── GAMES SECTION ────────────────────────────────────────────────── */}
      <section id="games" className="py-20 sm:py-28 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <ScrollReveal className="mb-14">
            <p className="text-xs font-semibold tracking-widest text-amber-400 uppercase mb-3">Mini Games</p>
            <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight">Browser games, zero installs.</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {GAMES.map((game, i) => (
              <ScrollReveal key={game.href} delay={i * 120}>
                <Link
                  href={game.href}
                  className="group flex flex-col p-6 rounded-2xl bg-slate-900/50 border border-slate-800/60 no-underline ndl-card transition-all duration-200 hover:border-amber-500/30"
                >
                  <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 group-hover:bg-amber-500/15">
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={game.iconPath} />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-white group-hover:text-amber-400 transition-colors duration-200 mb-2">{game.title}</h3>
                  <p className="text-sm text-slate-400 font-light leading-relaxed flex-1 mb-5">{game.desc}</p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 group-hover:gap-3 transition-all duration-200">
                    {game.cta} <ArrowRight />
                  </span>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── ARTICLES SECTION ─────────────────────────────────────────────── */}
      <section id="articles" className="py-20 sm:py-28 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <ScrollReveal className="mb-14">
            <p className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-3">Engineering Logs</p>
            <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight">Technical articles &amp; deep-dives.</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <ScrollReveal>
              <Link
                href="/articles/optimizing-ai-prompt-tokens-for-llms/"
                className="group flex flex-col p-6 rounded-2xl bg-slate-900/40 border border-slate-800/50 no-underline ndl-card hover:border-slate-600/55 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase">July 2026</span>
                  <span className="text-slate-700">·</span>
                  <span className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase">8 min read</span>
                </div>
                <h3 className="text-base font-semibold text-slate-100 group-hover:text-white transition-colors leading-snug mb-3 flex-1">
                  Maximizing LLM Context: Why Text Flattening Prevents Broken Code Markdown
                </h3>
                <p className="text-sm text-slate-400 font-light leading-relaxed mb-5">
                  How trailing whitespace, nested brackets, and unstructured prompt blocks silently inflate API token costs in modern IDE pipelines.
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 group-hover:gap-3 transition-all duration-200">
                  Read article <ArrowRight />
                </span>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}
