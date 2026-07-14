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
        background: 'rgba(15,23,42,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          maxWidth: '440px',
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
          padding: '1.75rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <p style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.25rem' }}>
              How to Play
            </p>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent', border: '1px solid #e2e8f0',
              width: '32px', height: '32px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', color: '#64748b', flexShrink: 0,
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>
          {children}
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: '1.5rem', width: '100%',
            background: '#0f172a', color: '#fff', border: 'none',
            padding: '0.625rem', cursor: 'pointer',
            fontSize: '0.75rem', fontWeight: 700,
            letterSpacing: '0.07em', textTransform: 'uppercase',
          }}
        >
          Got it — Let&apos;s Play
        </button>
      </div>
    </div>
  );
}
