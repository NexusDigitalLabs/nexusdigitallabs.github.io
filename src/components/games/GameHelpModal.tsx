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
        background: 'rgba(5,10,20,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#0d1117',
          border: '1px solid rgba(255,255,255,0.1)',
          maxWidth: '460px',
          width: '100%',
          maxHeight: '82vh',
          overflowY: 'auto',
          padding: '1.75rem',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4ade80', marginBottom: '0.375rem' }}>
              How to Play
            </p>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#f8fafc', margin: 0, letterSpacing: '-0.01em' }}>
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              width: '32px', height: '32px', cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', color: '#64748b', borderRadius: 0,
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content — inherits styles from children but we set base here */}
        <div style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.75 }}>
          {children}
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: '1.75rem', width: '100%',
            background: '#f8fafc', color: '#0f172a', border: 'none',
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
