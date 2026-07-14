'use client';

import { useState, useRef } from 'react';

interface Props {
  onSubmit: (name: string) => void;
}

/**
 * UsernameGate — renders as a full-height page section (NOT a fixed overlay).
 * A fixed overlay at z-100 can intercept pointer events from the sticky header
 * even when the header's z-index is higher, depending on browser stacking
 * context resolution. Rendering inline avoids this entirely.
 */
export default function UsernameGate({ onSubmit }: Props) {
  const [name, setName] = useState('');
  const fallback = useRef(`Player_${Math.floor(1000 + Math.random() * 9000)}`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name.trim() || fallback.current);
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0b0f19',
        padding: '2rem 1rem',
      }}
    >
      <div
        style={{
          background: '#0d1117',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '2.25rem',
          maxWidth: '360px',
          width: '100%',
        }}
      >
        <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4ade80', marginBottom: '0.5rem' }}>
          NexusDigitalLabs Games
        </p>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.375rem' }}>
          Enter Your Name
        </h2>
        <p style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 400, marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Your high scores will be saved locally in your browser.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={fallback.current}
            autoFocus
            maxLength={30}
            style={{
              display: 'block', width: '100%', boxSizing: 'border-box',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)',
              outline: 'none', padding: '0.625rem 0.75rem',
              fontSize: '0.875rem', color: '#f8fafc',
              marginBottom: '1rem', borderRadius: 0,
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#f8fafc')}
            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
          <button
            type="submit"
            style={{
              width: '100%', background: '#f8fafc', color: '#0f172a',
              border: 'none', padding: '0.75rem',
              fontSize: '0.8125rem', fontWeight: 700,
              letterSpacing: '0.07em', textTransform: 'uppercase',
              cursor: 'pointer', borderRadius: 0,
            }}
          >
            Start Playing
          </button>
        </form>
      </div>
    </div>
  );
}
