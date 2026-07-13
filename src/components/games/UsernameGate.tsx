'use client';

import { useState, useRef } from 'react';

interface Props {
  onSubmit: (name: string) => void;
}

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
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(15,23,42,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: '#fff', border: '1px solid #e2e8f0',
          padding: '2rem', maxWidth: '340px', width: '100%', margin: '0 1rem',
        }}
      >
        <p className="text-[0.625rem] font-bold tracking-[0.1em] uppercase text-slate-400 mb-1">
          NexusDigitalLabs Games
        </p>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Enter Your Name</h2>
        <p className="text-sm text-slate-400 font-light mb-6">
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
            className="block w-full border border-slate-200 focus:border-black outline-none px-3 py-2.5 text-sm text-slate-900 mb-4"
            style={{ borderRadius: 0 }}
          />
          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-700 text-white text-[0.8125rem] font-bold tracking-[0.06em] uppercase py-3 border-none cursor-pointer transition-colors"
            style={{ borderRadius: 0 }}
          >
            Start Playing
          </button>
        </form>
      </div>
    </div>
  );
}
