const PLAY_URL =
  'https://play.google.com/store/apps/details?id=dev.nexusdigitallabs.odova' +
  '&referrer=utm_source%3Dnexusdigitallabs%26utm_medium%3Dweb%26utm_campaign%3Dfuel_tracker';

export default function AndroidAppBanner() {
  return (
    <aside
      aria-label="Odova Android app"
      style={{ background: 'var(--ndl-bg)', borderBottom: '1px solid var(--ndl-border)' }}
    >
      <div
        style={{
          maxWidth: '72rem',
          margin: '0 auto',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem 1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <p style={{ margin: 0, flex: '1 1 20rem', fontSize: '0.875rem', color: 'var(--ndl-muted)', lineHeight: 1.5 }}>
          <strong style={{ color: 'var(--ndl-text)' }}>Odova for Android</strong>{' '}
          — the Fuel Tracker as a
          phone app. Choose &ldquo;Have a Code&rdquo; and enter your sync code to bring your garage over.
        </p>
        <a href={PLAY_URL} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', lineHeight: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/badges/google-play-badge.png"
            alt="Get it on Google Play"
            width={148}
            height={44}
            style={{ display: 'block', height: '2.75rem', width: 'auto' }}
          />
        </a>
      </div>
    </aside>
  );
}
