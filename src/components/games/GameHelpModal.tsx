'use client';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function GameHelpModal({ isOpen, onClose, title, children }: Props) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(15, 23, 42, 0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--ndl-surface)',
          border: '1px solid var(--ndl-border)',
          maxWidth: '460px',
          width: '100%',
          maxHeight: '82vh',
          overflowY: 'auto',
          padding: '1.75rem',
          boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#16a34a', marginBottom: '0.375rem' }}>
              How to Play
            </p>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--ndl-text)', margin: 0, letterSpacing: '-0.01em' }}>
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'var(--ndl-surface-2)', border: '1px solid var(--ndl-border)',
              width: '32px', height: '32px', cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', color: 'var(--ndl-faint)', borderRadius: 0,
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div style={{ fontSize: '0.875rem', color: 'var(--ndl-muted)', lineHeight: 1.75 }}>
          {children}
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: '1.75rem', width: '100%',
            background: 'var(--ndl-text)', color: 'var(--ndl-bg)', border: 'none',
            padding: '0.75rem',
            fontSize: '0.75rem', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            cursor: 'pointer', borderRadius: 0,
          }}
        >
          Got it — Let&apos;s Play
        </button>
      </div>
    </div>
  );
}
