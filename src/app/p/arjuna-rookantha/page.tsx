import type { Metadata } from 'next';
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
import ThemeScope, { AR_THEME_BOOT_SCRIPT } from './ThemeScope';

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
    <p className="mb-4 text-xs font-semibold tracking-[0.22em] uppercase text-[var(--ar-accent-text)]">
      {children}
    </p>
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
      <script dangerouslySetInnerHTML={{ __html: AR_THEME_BOOT_SCRIPT }} />
      <ThemeScope />

      {/* ── Hero (fixed dark in both themes — sits over a photo) ─────────── */}
      <section className="relative isolate overflow-hidden bg-[#121212]">
        <img
          src={ARTIST.portraitUrl}
          alt={`${ARTIST.name} performing`}
          width={1280}
          height={720}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-45"
        />
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              'linear-gradient(180deg, rgba(18,18,18,0.55) 0%, rgba(18,18,18,0.82) 55%, #121212 100%)',
          }}
        />

        <div className="relative mx-auto max-w-5xl px-6 pt-28 pb-20 sm:px-10 sm:pt-36 sm:pb-28">
          <p className="mb-5 text-xs font-semibold tracking-[0.28em] uppercase text-[#D4AF37]">
            {ARTIST.studioName}
          </p>
          <h1 className="mb-5 text-4xl leading-[1.08] font-light tracking-tight text-[#fafafa] sm:text-6xl">
            {ARTIST.name}
          </h1>
          <p className="mb-9 max-w-xl text-base leading-relaxed font-light text-[#d4d4d8] sm:text-lg">
            {ARTIST.tagline}
          </p>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#tracks"
                className={`inline-flex items-center justify-center rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-semibold tracking-[0.06em] uppercase text-[#121212] transition-opacity duration-200 hover:opacity-90 ${focusRing}`}
              >
                Listen latest track
              </a>
              <a
                href={CONTACT.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold tracking-[0.06em] uppercase text-[#fafafa] transition-colors duration-200 hover:border-[#D4AF37] hover:text-[#D4AF37] ${focusRing}`}
              >
                <WhatsAppIcon className="h-4 w-4" />
                Book for events
              </a>
            </div>
            <SocialRow onDark />
          </div>
        </div>
      </section>

      {/* ── About ────────────────────────────────────────────────────────── */}
      <section className="border-t border-[var(--ar-border)]" id="about">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:px-10 sm:py-24">
          <SectionLabel>About the artist</SectionLabel>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
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
            <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-3 lg:grid-cols-1">
              {STATS.map((stat) => (
                <li
                  key={stat.label}
                  className="rounded-2xl border border-[var(--ar-border)] bg-[var(--ar-surface)] px-5 py-5"
                >
                  <p className="text-2xl font-light tracking-tight text-[var(--ar-accent-text)]">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm font-light text-[var(--ar-muted)]">{stat.label}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Discography ──────────────────────────────────────────────────── */}
      <section className="border-t border-[var(--ar-border)]" id="tracks">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:px-10 sm:py-24">
          <SectionLabel>Discography</SectionLabel>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-2xl font-light tracking-tight sm:text-3xl">Original releases</h2>
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

          <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {TRACKS.map((track) => (
              <li
                key={track.title}
                className="flex flex-col justify-between rounded-2xl border border-[var(--ar-border)] bg-[var(--ar-surface)] p-6 transition-colors duration-200 hover:border-[var(--ar-border-accent)]"
              >
                <div>
                  <div className="mb-2 flex items-baseline justify-between gap-3">
                    <h3 className="text-lg font-medium tracking-tight text-[var(--ar-text)]">
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
                    className={`inline-flex w-fit items-center gap-2 text-sm font-semibold tracking-wide text-[var(--ar-accent-text)] underline-offset-4 transition-opacity duration-200 hover:underline ${focusRing}`}
                  >
                    Watch on YouTube <span aria-hidden="true">↗</span>
                  </a>
                ) : (
                  <p className="text-xs tracking-wide text-[var(--ar-faint)]">
                    Streaming link coming soon
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Media ────────────────────────────────────────────────────────── */}
      <section className="border-t border-[var(--ar-border)]" id="media">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:px-10 sm:py-24">
          <SectionLabel>Media</SectionLabel>
          <h2 className="mb-10 text-2xl font-light tracking-tight sm:text-3xl">Video highlights</h2>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {FEATURED_VIDEOS.map((video) => (
              <figure key={video.videoId} className="m-0">
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
                    className={`group relative block aspect-video overflow-hidden rounded-2xl border border-[var(--ar-border)] bg-[#1e1e1e] ${focusRing}`}
                  >
                    <img
                      src={`https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`}
                      alt=""
                      width={480}
                      height={360}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover opacity-60 transition-opacity duration-200 group-hover:opacity-75"
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
                      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37] text-[#121212]">
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
            ))}
          </div>

          <h2 className="mt-16 mb-8 text-2xl font-light tracking-tight sm:text-3xl">Gallery</h2>
          <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-3">
            {GALLERY_SLOTS.map((slot) => (
              <li
                key={slot.title}
                className="flex aspect-[4/5] flex-col justify-end rounded-2xl border border-dashed border-[var(--ar-border-strong)] bg-[var(--ar-surface)] p-6"
              >
                <p className="text-sm font-medium text-[var(--ar-text)]">{slot.title}</p>
                <p className="mt-1 text-xs leading-relaxed font-light text-[var(--ar-muted)]">
                  {slot.description}
                </p>
                <p className="mt-3 text-[11px] tracking-[0.14em] uppercase text-[var(--ar-faint)]">
                  Photos coming soon
                </p>
              </li>
            ))}
          </ul>

          {youtubeUrl ? (
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
          ) : null}
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────────────────── */}
      <section className="border-t border-[var(--ar-border)]" id="services">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:px-10 sm:py-24">
          <SectionLabel>Services</SectionLabel>
          <h2 className="mb-10 text-2xl font-light tracking-tight sm:text-3xl">
            Work with {ARTIST.name.split(' ')[0]}
          </h2>
          <ul className="m-0 grid list-none grid-cols-1 gap-x-10 gap-y-8 p-0 sm:grid-cols-2">
            {SERVICES.map((service) => (
              <li key={service.title} className="border-t border-[var(--ar-border)] pt-6">
                <h3 className="mb-2 text-base font-medium text-[var(--ar-text)]">
                  {service.title}
                </h3>
                <p className="text-base leading-relaxed font-light text-[var(--ar-muted)]">
                  {service.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────────────────────────── */}
      <section className="border-t border-[var(--ar-border)]" id="contact">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:px-10 sm:py-24">
          <SectionLabel>Bookings</SectionLabel>
          <h2 className="mb-4 text-2xl font-light tracking-tight sm:text-3xl">
            Concerts, private events, coaching, and compositions
          </h2>
          <p className="mb-9 max-w-xl text-base leading-relaxed font-light text-[var(--ar-muted)]">
            Message {ARTIST.studioName} on WhatsApp with your event type, date, and location for
            availability and rates.
          </p>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
            <a
              href={CONTACT.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex w-fit items-center justify-center gap-2 rounded-full bg-[var(--ar-accent)] px-6 py-3 text-sm font-semibold tracking-[0.06em] uppercase text-[var(--ar-on-accent)] transition-opacity duration-200 hover:opacity-90 ${focusRing}`}
            >
              <WhatsAppIcon className="h-4 w-4" />
              WhatsApp {CONTACT.phoneDisplay}
            </a>
            <SocialRow />
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--ar-border)]">
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
      </footer>
    </main>
  );
}
