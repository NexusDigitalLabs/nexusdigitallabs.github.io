import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ScrollReveal from '@/components/ScrollReveal';
import { SITE_NAME, SITE_URL } from '@/lib/seo';
import {
  ARTIST,
  CONTACT,
  FEATURED_VIDEOS,
  GALLERY_SLOTS,
  SERVICES,
  SOCIAL_LINKS,
  STATS,
  TRACKS,
} from './content';
import { SOCIAL_ICONS, WhatsAppIcon } from './icons';
import { DARK_DEFAULT_BOOT_SCRIPT } from './theme-default';

export const metadata: Metadata = {
  title: { absolute: `${ARTIST.name} — ${ARTIST.tagline}` },
  description: `${ARTIST.name} is a Sri Lankan singer, songwriter, music composer, and vocal coach. Original releases, live performances, vocal coaching, and event bookings.`,
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  alternates: { canonical: '/p/arjuna-rookantha/' },
};

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ar-accent)]';

const quietLink = `text-[var(--ar-muted)] underline-offset-4 transition-colors duration-200 hover:text-[var(--ar-accent-text)] hover:underline ${focusRing}`;

/** Lighter reveals for this long page — fire early, fade only (see .ar-page CSS). */
function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <ScrollReveal className={className} delay={delay} threshold={0.01} rootMargin="140px 0px">
      {children}
    </ScrollReveal>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-semibold tracking-[0.22em] uppercase text-[var(--ar-accent-text)]">
        {children}
      </p>
      <div className="ar-rule mt-3" aria-hidden="true" />
    </div>
  );
}

function SocialRow({
  onDark = false,
  className = '',
}: {
  onDark?: boolean;
  className?: string;
}) {
  return (
    <ul className={`m-0 flex list-none flex-wrap items-center gap-3 p-0 ${className}`}>
      {SOCIAL_LINKS.map((link) => {
        const Icon = SOCIAL_ICONS[link.key];
        return (
          <li key={link.key}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${ARTIST.name} on ${link.label}`}
              title={link.label}
              className={
                onDark
                  ? `inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/[0.04] text-[#e4e4e7] transition-colors duration-200 hover:border-[#D4AF37] hover:text-[#D4AF37] ${focusRing}`
                  : `inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--ar-border-strong)] bg-[var(--ar-chip-bg)] text-[var(--ar-muted)] transition-colors duration-200 hover:border-[var(--ar-border-accent)] hover:text-[var(--ar-accent-text)] ${focusRing}`
              }
            >
              <Icon />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export default function ArjunaRookanthaPage() {
  // Offline in production builds/deploys; still available under `next dev`.
  if (process.env.NODE_ENV === 'production') notFound();

  const spotifyUrl = SOCIAL_LINKS.find((link) => link.key === 'spotify')?.href;
  const youtubeUrl = SOCIAL_LINKS.find((link) => link.key === 'youtube')?.href;

  return (
    <main className="ar-page min-h-screen bg-[var(--ar-bg)] text-[var(--ar-text)] antialiased">
      <script dangerouslySetInnerHTML={{ __html: DARK_DEFAULT_BOOT_SCRIPT }} />

      {/* ── Hero (fixed dark in both themes — sits over a photo) ─────────── */}
      <section className="ar-grain relative isolate flex min-h-svh overflow-hidden bg-[#121212]">
        <div className="ndl-anim-visual absolute inset-0 overflow-hidden">
          <img
            src={ARTIST.coverUrl}
            alt={`${ARTIST.name} performing on stage`}
            width={1024}
            height={682}
            fetchPriority="high"
            decoding="async"
            className="ar-hero-zoom absolute inset-0 h-full w-full object-cover object-[center_22%] opacity-70 sm:object-center"
          />
        </div>
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              'linear-gradient(180deg, rgba(18,18,18,0.35) 0%, rgba(18,18,18,0.55) 42%, rgba(18,18,18,0.9) 76%, #121212 100%)',
          }}
        />
        <div
          className="ar-glow -top-24 -left-24 h-[18rem] w-[18rem] sm:h-[26rem] sm:w-[26rem]"
          aria-hidden="true"
        />

        <nav
          aria-label="Artist page"
          className="absolute top-0 right-0 left-0 z-10 mx-auto flex max-w-6xl items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-5 sm:px-10 sm:py-7"
        >
          <a
            href="#top"
            className={`ar-display text-lg tracking-wide text-white ${focusRing}`}
          >
            AR
          </a>
          <div className="mr-28 flex items-center gap-4 text-[10px] font-semibold tracking-[0.16em] uppercase text-white/70 sm:gap-5 lg:mr-36 lg:gap-7 lg:text-[11px] lg:tracking-[0.18em]">
            <a className={`hover:text-[#D4AF37] lg:hidden ${focusRing}`} href="#tracks">Music</a>
            <a className={`hover:text-[#D4AF37] lg:hidden ${focusRing}`} href="#contact">Book</a>
            <a className={`hidden hover:text-[#D4AF37] lg:inline ${focusRing}`} href="#about">Biography</a>
            <a className={`hidden hover:text-[#D4AF37] lg:inline ${focusRing}`} href="#tracks">Music</a>
            <a className={`hidden hover:text-[#D4AF37] lg:inline ${focusRing}`} href="#media">Gallery</a>
            <a className={`hidden hover:text-[#D4AF37] lg:inline ${focusRing}`} href="#contact">Booking</a>
          </div>
        </nav>

        <div
          id="top"
          className="relative mx-auto flex w-full max-w-6xl flex-col justify-end px-5 pt-28 pb-10 sm:px-10 sm:pt-44 sm:pb-20"
        >
          <div className="ndl-anim-1 mb-4 flex items-center gap-3 sm:mb-6">
            <span className="h-px w-8 bg-[#D4AF37]" aria-hidden="true" />
            <p className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[#D4AF37] sm:text-xs sm:tracking-[0.3em]">
              Professional singer · Sri Lanka
            </p>
          </div>
          <h1 className="ar-display ndl-anim-2 max-w-4xl text-[2.65rem] leading-[0.96] font-normal text-[#fafafa] sm:text-8xl lg:text-[7rem]">
            {ARTIST.name}
          </h1>

          <div className="mt-6 grid gap-5 border-t border-white/20 pt-5 sm:mt-9 sm:gap-8 sm:pt-7 md:grid-cols-[1fr_auto] md:items-end">
            <div className="ndl-anim-3 max-w-xl">
              <p className="text-sm leading-relaxed font-light tracking-wide text-white/70 sm:text-base">
                {ARTIST.tagline}
              </p>
              <p className="mt-3 hidden max-w-lg text-sm leading-relaxed text-white/55 sm:block">
                Original Sinhala music, expressive live performance, and vocal coaching rooted in
                storytelling.
              </p>
            </div>
            <div className="ndl-anim-4 grid w-full grid-cols-2 gap-2.5 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-3">
              <a
                href="#tracks"
                className={`inline-flex items-center justify-center bg-[#D4AF37] px-3 py-3.5 text-[11px] font-semibold tracking-[0.08em] uppercase text-[#121212] transition-colors hover:bg-white sm:px-7 sm:text-xs sm:tracking-[0.12em] ${focusRing}`}
              >
                Explore music
              </a>
              <a
                href={CONTACT.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center gap-1.5 border border-white/30 px-3 py-3.5 text-[11px] font-semibold tracking-[0.08em] uppercase text-white transition-colors hover:border-[#D4AF37] hover:text-[#D4AF37] sm:gap-2 sm:px-7 sm:text-xs sm:tracking-[0.12em] ${focusRing}`}
              >
                <WhatsAppIcon className="h-4 w-4" />
                Book now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── About ────────────────────────────────────────────────────────── */}
      <section className="border-t border-[var(--ar-border)]" id="about">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-10 sm:py-28">
          <Reveal>
            <SectionLabel>Biography</SectionLabel>
          </Reveal>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-20">
            <Reveal className="order-2 lg:order-1">
              <div>
                <h2 className="ar-display mb-6 max-w-xl text-3xl leading-[1.1] font-normal sm:mb-8 sm:text-6xl">
                  A voice shaped by story, emotion, and experiment.
                </h2>
                <div className="space-y-5">
                {ARTIST.bio.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-[0.95rem] leading-[1.8] font-light text-[var(--ar-text-soft)] sm:text-base"
                  >
                    {paragraph}
                  </p>
                ))}
                </div>
                <div className="mt-8">
                  <SocialRow className="justify-center sm:justify-start" />
                </div>
              </div>
            </Reveal>
            <Reveal delay={100} className="order-1 lg:order-2">
              <figure className="relative m-0 mx-auto max-w-sm overflow-hidden sm:mx-0 sm:max-w-full sm:overflow-visible">
                <div className="absolute -right-3 -bottom-3 hidden h-full w-full border border-[var(--ar-border-accent)] sm:block" aria-hidden="true" />
                <div className="relative aspect-square overflow-hidden bg-[var(--ar-surface)] sm:mr-3 sm:mb-3">
                  <img
                    src={ARTIST.portraitUrl}
                    alt={`Portrait of ${ARTIST.name}`}
                    width={954}
                    height={960}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover object-center"
                  />
                </div>
              </figure>
            </Reveal>
          </div>

          <ul className="m-0 mt-12 grid list-none grid-cols-3 border-y border-[var(--ar-border)] p-0 sm:mt-16">
              {STATS.map((stat, i) => (
                <li
                  key={stat.label}
                  className="border-r border-[var(--ar-border)] last:border-r-0"
                >
                  <Reveal delay={i * 80}>
                    <div className="px-2 py-4 text-center sm:px-6 sm:py-7">
                      <p className="ar-display text-xl font-normal text-[var(--ar-accent-text)] sm:text-4xl">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-[9px] leading-snug tracking-[0.1em] uppercase text-[var(--ar-muted)] sm:mt-1.5 sm:text-xs sm:tracking-[0.14em]">
                        {stat.label}
                      </p>
                    </div>
                  </Reveal>
                </li>
              ))}
          </ul>
        </div>
      </section>

      {/* ── Discography ──────────────────────────────────────────────────── */}
      <section className="border-t border-[var(--ar-border)]" id="tracks">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-10 sm:py-28">
          <Reveal>
            <SectionLabel>Latest releases</SectionLabel>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
              <h2 className="ar-display max-w-2xl text-3xl leading-tight font-normal sm:text-6xl">
                Music made to be felt.
              </h2>
              {spotifyUrl ? (
                <a
                  href={spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-sm font-medium tracking-wide ${quietLink}`}
                >
                  Full catalogue on Spotify <span aria-hidden="true">↗</span>
                </a>
              ) : null}
            </div>
          </Reveal>

          <ul className="m-0 grid list-none grid-cols-2 gap-x-3 gap-y-8 p-0 sm:gap-x-8 sm:gap-y-14 lg:grid-cols-3">
            {TRACKS.map((track, i) => (
              <li key={track.title}>
                <Reveal delay={(i % 3) * 90} className="h-full">
                  <article className="group">
                    <a
                      href={track.appleMusicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Listen to ${track.title} on Apple Music`}
                      className={`relative block aspect-square overflow-hidden bg-[var(--ar-surface)] ${focusRing}`}
                    >
                      <img
                        src={track.artworkUrl}
                        alt={`${track.title} cover artwork`}
                        width={800}
                        height={800}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"
                      />
                      <span className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/25" aria-hidden="true" />
                      <span className="absolute right-2.5 bottom-2.5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37] text-[#121212] opacity-100 shadow-xl transition-all duration-300 sm:right-5 sm:bottom-5 sm:h-14 sm:w-14 sm:translate-y-3 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
                        <svg className="h-4 w-4 translate-x-px sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                    </a>
                    <div className="mt-3 flex items-start justify-between gap-2 sm:mt-5 sm:gap-4">
                      <div>
                        <p className="mb-1.5 text-[9px] font-semibold tracking-[0.16em] uppercase text-[var(--ar-accent-text)] sm:mb-2 sm:text-[10px] sm:tracking-[0.2em]">
                          {track.genre} · {track.year}
                        </p>
                        <h3 className="ar-display text-base font-normal text-[var(--ar-text)] sm:text-2xl">
                          {track.title}
                        </h3>
                        <p className="mt-1 text-xs font-light text-[var(--ar-muted)] sm:text-sm">{track.subtitle}</p>
                      </div>
                      <span className="ar-display hidden pt-1 text-sm text-[var(--ar-faint)] sm:inline" aria-hidden="true">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold tracking-[0.1em] uppercase sm:mt-5 sm:gap-4 sm:text-xs sm:tracking-[0.12em]">
                      <a
                        href={track.appleMusicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex min-h-10 items-center text-[var(--ar-accent-text)] ${focusRing}`}
                      >
                        Apple Music <span aria-hidden="true">↗</span>
                      </a>
                      {track.watchUrl ? (
                      <a
                        href={track.watchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Watch ${track.title} on YouTube`}
                        className={`inline-flex min-h-10 items-center text-[var(--ar-muted)] hover:text-[var(--ar-accent-text)] ${focusRing}`}
                      >
                        YouTube <span aria-hidden="true">↗</span>
                      </a>
                      ) : null}
                    </div>
                  </article>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Media ────────────────────────────────────────────────────────── */}
      <section className="border-t border-[var(--ar-border)]" id="media">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-10 sm:py-28">
          <Reveal>
            <SectionLabel>Media</SectionLabel>
            <h2 className="ar-display mb-8 text-2xl font-normal sm:mb-10 sm:text-4xl">Video highlights</h2>
          </Reveal>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {FEATURED_VIDEOS.map((video, i) => (
              <Reveal key={video.videoId} delay={i * 100}>
                <figure className="m-0">
                  {video.embeddable ? (
                    <div className="overflow-hidden rounded-2xl border border-[var(--ar-border)] bg-[var(--ar-surface)]">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${video.videoId}`}
                        title={`${video.title} — ${ARTIST.name}`}
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="aspect-video w-full border-0"
                      />
                    </div>
                  ) : (
                    <a
                      href={video.watchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Watch ${video.title} on YouTube`}
                      className={`ar-card group relative block aspect-video overflow-hidden rounded-2xl border border-[var(--ar-border)] bg-[#1e1e1e] ${focusRing}`}
                    >
                      <img
                        src={`https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`}
                        alt=""
                        width={480}
                        height={360}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full scale-105 object-cover opacity-60 transition-all duration-500 group-hover:scale-100 group-hover:opacity-80"
                      />
                      <span
                        className="absolute inset-0"
                        aria-hidden="true"
                        style={{
                          background:
                            'linear-gradient(180deg, rgba(18,18,18,0.35) 0%, rgba(18,18,18,0.85) 100%)',
                        }}
                      />
                      <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
                        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#D4AF37] text-[#121212] shadow-[0_12px_30px_-10px_rgba(212,175,55,0.8)] transition-transform duration-300 group-hover:scale-110">
                          <svg
                            className="h-6 w-6 translate-x-[1px]"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </span>
                        <span className="text-xs tracking-[0.16em] uppercase text-[#e4e4e7]">
                          Watch on YouTube
                        </span>
                      </span>
                    </a>
                  )}
                  <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-sm font-light text-[var(--ar-text-soft)]">
                      {video.title}
                      <span className="text-[var(--ar-faint)]"> · {video.note}</span>
                    </span>
                    <a
                      href={video.watchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-xs tracking-wide ${quietLink}`}
                    >
                      Open on YouTube <span aria-hidden="true">↗</span>
                    </a>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-14 mb-6 sm:mt-20 sm:mb-8">
            <SectionLabel>Gallery</SectionLabel>
            <h2 className="ar-display text-3xl font-normal sm:text-6xl">Behind the music.</h2>
          </Reveal>
          <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-3">
            {GALLERY_SLOTS.map((slot, i) => (
              <li key={slot.title}>
                <Reveal delay={i * 90} className="h-full">
                  <div className="group relative aspect-[5/4] h-full overflow-hidden bg-[#161616] sm:aspect-[4/5]">
                    <img
                      src={slot.imageUrl}
                      alt=""
                      width={960}
                      height={935}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover grayscale-[20%] transition-all duration-700 sm:grayscale-[35%] group-hover:scale-105 group-hover:grayscale-0"
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent"
                      aria-hidden="true"
                    />
                    <div className="absolute right-0 bottom-0 left-0 p-5 text-white sm:p-6">
                      <p className="ar-display text-lg font-normal sm:text-xl">{slot.title}</p>
                      <p className="mt-1.5 text-xs leading-relaxed font-light text-white/65">
                        {slot.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>

          {youtubeUrl ? (
            <Reveal>
              <p className="mt-8 text-sm font-light text-[var(--ar-muted)]">
                More performances on the{' '}
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-[var(--ar-accent-text)] underline-offset-4 transition-opacity duration-200 hover:underline ${focusRing}`}
                >
                  official YouTube channel <span aria-hidden="true">↗</span>
                </a>
              </p>
            </Reveal>
          ) : null}
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────────────────── */}
      <section className="border-t border-[var(--ar-border)]" id="services">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-10 sm:py-28">
          <Reveal>
            <SectionLabel>Work together</SectionLabel>
            <h2 className="ar-display mb-8 max-w-2xl text-3xl leading-tight font-normal sm:mb-12 sm:text-6xl">
              Music for stages, stories, and new voices.
            </h2>
          </Reveal>
          <ul className="m-0 list-none border-t border-[var(--ar-border)] p-0">
            {SERVICES.map((service, i) => (
              <li key={service.title}>
                <Reveal delay={(i % 2) * 100}>
                  <div className="grid gap-2 border-b border-[var(--ar-border)] py-6 sm:grid-cols-[5rem_1fr_1.2fr] sm:items-baseline sm:gap-8 sm:py-7">
                    <span className="text-xs font-semibold tracking-[0.2em] text-[var(--ar-accent-text)]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="ar-display text-xl font-normal text-[var(--ar-text)] sm:text-2xl">
                      {service.title}
                    </h3>
                    <p className="text-sm leading-relaxed font-light text-[var(--ar-muted)]">
                      {service.description}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────────────────────────── */}
      <section
        className="relative isolate overflow-hidden border-t border-white/10 bg-[#121212] text-white"
        id="contact"
      >
        <div
          className="ar-glow -bottom-32 left-1/2 h-[16rem] w-[16rem] -translate-x-1/2 sm:h-[24rem] sm:w-[24rem]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-10 sm:py-32">
          <Reveal>
            <SectionLabel>Bookings</SectionLabel>
            <h2 className="ar-display mb-5 max-w-4xl text-3xl leading-[1.08] font-normal sm:mb-6 sm:text-7xl">
              Let&apos;s make something memorable.
            </h2>
            <p className="mb-8 max-w-xl text-sm leading-relaxed font-light text-white/60 sm:mb-12 sm:text-base">
              Message {ARTIST.studioName} on WhatsApp with your event type, date, and location for
              availability and rates.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-9">
              <a
                href={CONTACT.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Message on WhatsApp"
                className={`inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-[var(--ar-accent)] px-7 py-4 text-sm font-semibold tracking-[0.06em] uppercase text-[var(--ar-on-accent)] shadow-[0_16px_36px_-16px_rgba(212,175,55,0.75)] transition-transform duration-200 hover:-translate-y-0.5 hover:opacity-95 sm:w-fit ${focusRing}`}
              >
                <WhatsAppIcon className="h-4 w-4" />
                WhatsApp
              </a>
              <SocialRow onDark className="justify-center sm:justify-start" />
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-[var(--ar-border)] pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:pb-[env(safe-area-inset-bottom)]">
        <Reveal>
          <div className="mx-auto flex max-w-5xl flex-col gap-6 px-5 py-8 sm:flex-row sm:items-start sm:justify-between sm:gap-8 sm:px-10 sm:py-10">
            <div>
              <p className="text-sm font-light text-[var(--ar-muted)]">
                © {new Date().getFullYear()} {ARTIST.studioName}
              </p>
              <p className="mt-1 text-xs tracking-wide text-[var(--ar-faint)]">
                {ARTIST.name} · {ARTIST.location}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs tracking-wide text-[var(--ar-faint)]">
                Website by{' '}
                <a href={`${SITE_URL}/`} className={quietLink}>
                  {SITE_NAME}
                </a>
              </p>
              <p className="mt-1.5 text-xs tracking-wide">
                <a href="/contact/" className={quietLink}>
                  Looking for a website like this? Get in touch
                </a>
              </p>
            </div>
          </div>
        </Reveal>
      </footer>

      {/* Mobile-only sticky booking bar */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 sm:hidden">
        <div
          className="pointer-events-auto border-t border-white/10 bg-[#121212]/95 px-4 pt-3 backdrop-blur-md"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          <a
            href={CONTACT.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Message on WhatsApp"
            className={`flex w-full items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-5 py-3.5 text-xs font-semibold tracking-[0.12em] uppercase text-[#121212] ${focusRing}`}
          >
            <WhatsAppIcon className="h-4 w-4" />
            Book on WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}
