import type { Metadata } from 'next';
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

function SocialRow({ onDark = false }: { onDark?: boolean }) {
  return (
    <ul className="m-0 flex list-none flex-wrap items-center gap-3 p-0">
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
  const spotifyUrl = SOCIAL_LINKS.find((link) => link.key === 'spotify')?.href;
  const youtubeUrl = SOCIAL_LINKS.find((link) => link.key === 'youtube')?.href;

  return (
    <main className="ar-page min-h-screen bg-[var(--ar-bg)] text-[var(--ar-text)] antialiased">
      <script dangerouslySetInnerHTML={{ __html: DARK_DEFAULT_BOOT_SCRIPT }} />

      {/* ── Hero (fixed dark in both themes — sits over a photo) ─────────── */}
      <section className="ar-grain relative isolate overflow-hidden bg-[#121212]">
        <div className="ndl-anim-visual absolute inset-0 overflow-hidden">
          <img
            src={ARTIST.portraitUrl}
            alt={`${ARTIST.name} performing`}
            width={1280}
            height={720}
            fetchPriority="high"
            decoding="async"
            className="ar-hero-zoom absolute inset-0 h-full w-full object-cover object-center opacity-45"
          />
        </div>
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              'linear-gradient(180deg, rgba(18,18,18,0.62) 0%, rgba(18,18,18,0.84) 55%, #121212 100%)',
          }}
        />
        <div
          className="ar-glow -top-24 -left-24 h-[26rem] w-[26rem]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-5xl px-6 pt-28 pb-20 sm:px-10 sm:pt-36 sm:pb-28">
          <div className="ndl-anim-1 mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-[#D4AF37]" aria-hidden="true" />
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#D4AF37]">
              {ARTIST.studioName}
            </p>
          </div>
          <h1 className="ar-display ndl-anim-2 mb-6 text-[2.75rem] leading-[1.02] font-normal text-[#fafafa] sm:text-7xl">
            {ARTIST.name}
          </h1>
          <p className="ndl-anim-3 mb-10 max-w-xl text-base leading-relaxed font-light tracking-wide text-[#d4d4d8] sm:text-lg">
            {ARTIST.tagline}
          </p>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
            <div className="ndl-anim-4 flex flex-wrap items-center gap-3">
              <a
                href="#tracks"
                className={`inline-flex items-center justify-center rounded-full bg-[#D4AF37] px-7 py-3.5 text-sm font-semibold tracking-[0.06em] uppercase text-[#121212] shadow-[0_14px_32px_-14px_rgba(212,175,55,0.7)] transition-transform duration-200 hover:-translate-y-0.5 hover:opacity-95 ${focusRing}`}
              >
                Listen latest track
              </a>
              <a
                href={CONTACT.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/[0.03] px-7 py-3.5 text-sm font-semibold tracking-[0.06em] uppercase text-[#fafafa] backdrop-blur-sm transition-colors duration-200 hover:border-[#D4AF37] hover:text-[#D4AF37] ${focusRing}`}
              >
                <WhatsAppIcon className="h-4 w-4" />
                Book for events
              </a>
            </div>
            <div className="ndl-anim-5">
              <SocialRow onDark />
            </div>
          </div>
        </div>
      </section>

      {/* ── About ────────────────────────────────────────────────────────── */}
      <section className="border-t border-[var(--ar-border)]" id="about">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:px-10 sm:py-24">
          <ScrollReveal>
            <SectionLabel>About the artist</SectionLabel>
          </ScrollReveal>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
            <ScrollReveal>
              <div className="space-y-5">
                {ARTIST.bio.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-base leading-[1.8] font-light text-[var(--ar-text-soft)]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </ScrollReveal>
            <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-3 lg:grid-cols-1">
              {STATS.map((stat, i) => (
                <li key={stat.label}>
                  <ScrollReveal delay={i * 80}>
                    <div className="ar-card rounded-2xl border border-[var(--ar-border)] bg-[var(--ar-surface)] px-5 py-6">
                      <p className="ar-display text-3xl font-normal text-[var(--ar-accent-text)]">
                        {stat.value}
                      </p>
                      <p className="mt-1.5 text-xs tracking-[0.14em] uppercase text-[var(--ar-muted)]">
                        {stat.label}
                      </p>
                    </div>
                  </ScrollReveal>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Discography ──────────────────────────────────────────────────── */}
      <section className="border-t border-[var(--ar-border)]" id="tracks">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:px-10 sm:py-24">
          <ScrollReveal>
            <SectionLabel>Discography</SectionLabel>
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <h2 className="ar-display text-3xl font-normal sm:text-4xl">Original releases</h2>
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
          </ScrollReveal>

          <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {TRACKS.map((track, i) => (
              <li key={track.title}>
                <ScrollReveal delay={(i % 3) * 90} className="h-full">
                  <div className="ar-card relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-[var(--ar-border)] bg-[var(--ar-surface)] p-6">
                    <span
                      className="ar-display pointer-events-none absolute -right-1 -bottom-5 text-7xl text-[var(--ar-accent)] opacity-[0.07]"
                      aria-hidden="true"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="relative">
                      <div className="mb-2 flex items-baseline justify-between gap-3">
                        <h3 className="ar-display text-xl font-normal text-[var(--ar-text)]">
                          {track.title}
                        </h3>
                        {track.year ? (
                          <span className="text-xs tracking-[0.14em] text-[var(--ar-faint)]">
                            {track.year}
                          </span>
                        ) : null}
                      </div>
                      <p className="mb-6 text-sm font-light text-[var(--ar-muted)]">{track.subtitle}</p>
                    </div>
                    {track.watchUrl ? (
                      <a
                        href={track.watchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Watch ${track.title} on YouTube`}
                        className={`relative inline-flex w-fit items-center gap-2 rounded-full border border-[var(--ar-border-accent)] px-4 py-2 text-xs font-semibold tracking-[0.1em] uppercase text-[var(--ar-accent-text)] transition-colors duration-200 hover:bg-[var(--ar-accent)] hover:text-[var(--ar-on-accent)] ${focusRing}`}
                      >
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        Watch
                      </a>
                    ) : (
                      <p className="relative text-[11px] tracking-[0.14em] uppercase text-[var(--ar-faint)]">
                        Coming soon
                      </p>
                    )}
                  </div>
                </ScrollReveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Media ────────────────────────────────────────────────────────── */}
      <section className="border-t border-[var(--ar-border)]" id="media">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:px-10 sm:py-24">
          <ScrollReveal>
            <SectionLabel>Media</SectionLabel>
            <h2 className="ar-display mb-10 text-3xl font-normal sm:text-4xl">Video highlights</h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {FEATURED_VIDEOS.map((video, i) => (
              <ScrollReveal key={video.videoId} delay={i * 100}>
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
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal className="mt-16 mb-8">
            <h2 className="ar-display text-3xl font-normal sm:text-4xl">Gallery</h2>
          </ScrollReveal>
          <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-3">
            {GALLERY_SLOTS.map((slot, i) => (
              <li key={slot.title}>
                <ScrollReveal delay={i * 90} className="h-full">
                  <div
                    className={`ar-card ar-slot-${i + 1} flex aspect-[4/5] h-full flex-col justify-end rounded-2xl border border-[var(--ar-border)] bg-[var(--ar-surface)] p-6`}
                  >
                    <p className="ar-display text-lg font-normal text-[var(--ar-text)]">
                      {slot.title}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed font-light text-[var(--ar-muted)]">
                      {slot.description}
                    </p>
                    <p className="mt-4 text-[11px] tracking-[0.14em] uppercase text-[var(--ar-faint)]">
                      Photos coming soon
                    </p>
                  </div>
                </ScrollReveal>
              </li>
            ))}
          </ul>

          {youtubeUrl ? (
            <ScrollReveal>
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
            </ScrollReveal>
          ) : null}
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────────────────── */}
      <section className="border-t border-[var(--ar-border)]" id="services">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:px-10 sm:py-24">
          <ScrollReveal>
            <SectionLabel>Services</SectionLabel>
            <h2 className="ar-display mb-10 text-3xl font-normal sm:text-4xl">
              Work with {ARTIST.name.split(' ')[0]}
            </h2>
          </ScrollReveal>
          <ul className="m-0 grid list-none grid-cols-1 gap-x-12 gap-y-10 p-0 sm:grid-cols-2">
            {SERVICES.map((service, i) => (
              <li key={service.title}>
                <ScrollReveal delay={(i % 2) * 100}>
                  <div className="border-t border-[var(--ar-border)] pt-6">
                    <span className="ar-display mb-3 block text-sm tracking-[0.2em] text-[var(--ar-accent-text)]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="ar-display mb-2.5 text-xl font-normal text-[var(--ar-text)]">
                      {service.title}
                    </h3>
                    <p className="text-base leading-relaxed font-light text-[var(--ar-muted)]">
                      {service.description}
                    </p>
                  </div>
                </ScrollReveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────────────────────────── */}
      <section
        className="relative isolate overflow-hidden border-t border-[var(--ar-border)]"
        id="contact"
      >
        <div
          className="ar-glow -bottom-32 left-1/2 h-[24rem] w-[24rem] -translate-x-1/2"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-5xl px-6 py-20 sm:px-10 sm:py-24">
          <ScrollReveal>
            <SectionLabel>Bookings</SectionLabel>
            <h2 className="ar-display mb-5 max-w-2xl text-3xl leading-[1.15] font-normal sm:text-4xl">
              Concerts, private events, coaching, and compositions
            </h2>
            <p className="mb-10 max-w-xl text-base leading-relaxed font-light text-[var(--ar-muted)]">
              Message {ARTIST.studioName} on WhatsApp with your event type, date, and location for
              availability and rates.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={120}>
            <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:gap-9">
              <a
                href={CONTACT.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex w-fit items-center justify-center gap-2.5 rounded-full bg-[var(--ar-accent)] px-7 py-4 text-sm font-semibold tracking-[0.06em] uppercase text-[var(--ar-on-accent)] shadow-[0_16px_36px_-16px_rgba(212,175,55,0.75)] transition-transform duration-200 hover:-translate-y-0.5 hover:opacity-95 ${focusRing}`}
              >
                <WhatsAppIcon className="h-4 w-4" />
                WhatsApp {CONTACT.phoneDisplay}
              </a>
              <SocialRow />
            </div>
          </ScrollReveal>
        </div>
      </section>

      <footer className="border-t border-[var(--ar-border)]">
        <ScrollReveal>
          <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-10">
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
        </ScrollReveal>
      </footer>
    </main>
  );
}
