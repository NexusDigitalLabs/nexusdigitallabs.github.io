'use client';

import { useState, useRef } from 'react';

interface Props {
  onSubmit: (name: string) => void;
}

/**
 * UsernameGate — renders as a full-height page section (NOT a fixed overlay).
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
        background: 'var(--ndl-bg)',
        padding: '2rem 1rem',
      }}
    >
      <div
        style={{
          background: 'var(--ndl-surface)',
          border: '1px solid var(--ndl-border)',
          padding: '2.25rem',
          maxWidth: '360px',
          width: '100%',
        }}
      >
        <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#16a34a', marginBottom: '0.5rem' }}>
          NexusDigitalLabs Games
        </p>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ndl-text)', marginBottom: '0.375rem' }}>
          Enter Your Name
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--ndl-faint)', fontWeight: 400, marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Your high scores are stored in this browser. Sign in to sync best scores across devices.
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
              border: '1px solid var(--ndl-input-border)',
              background: 'var(--ndl-input-bg)',
              outline: 'none', padding: '0.625rem 0.75rem',
              fontSize: '0.875rem', color: 'var(--ndl-text)',
              marginBottom: '1rem', borderRadius: 0,
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--ndl-accent)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--ndl-input-border)')}
          />
          <button
            type="submit"
            style={{
              width: '100%', background: 'var(--ndl-text)', color: 'var(--ndl-bg)',
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
