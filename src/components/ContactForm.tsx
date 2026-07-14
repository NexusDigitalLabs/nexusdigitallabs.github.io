'use client';

import { useState, FormEvent } from 'react';

type StatusType = 'success' | 'error' | null;

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<{ type: StatusType; text: string } | null>(null);

  const inputBase =
    'w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:opacity-60';
  const inputStyle: React.CSSProperties = {
    background: 'var(--ndl-input-bg)',
    border: '1px solid var(--ndl-input-border)',
    color: 'var(--ndl-text)',
  };
  const focusBorder = '1px solid var(--ndl-accent)';
  const blurBorder = '1px solid var(--ndl-input-border)';

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus({ type: 'error', text: 'Please fill in your name, email, and message.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    const mailto =
      'mailto:hello@nexusdigitallabs.dev' +
      '?subject=' + encodeURIComponent(subject || 'Contact from ' + name) +
      '&body=' + encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\n' + message);

    window.location.href = mailto;
    setStatus({
      type: 'success',
      text: 'Opening your email client… If it did not open, email us directly at hello@nexusdigitallabs.dev',
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-medium mb-1.5 tracking-wide" style={{ color: 'var(--ndl-muted)' }} htmlFor="cf-name">Name</label>
          <input
            id="cf-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
            className={inputBase}
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.border = focusBorder; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
            onBlur={(e) => { e.currentTarget.style.border = blurBorder; e.currentTarget.style.boxShadow = ''; }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5 tracking-wide" style={{ color: 'var(--ndl-muted)' }} htmlFor="cf-email">Email</label>
          <input
            id="cf-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className={inputBase}
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.border = focusBorder; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
            onBlur={(e) => { e.currentTarget.style.border = blurBorder; e.currentTarget.style.boxShadow = ''; }}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1.5 tracking-wide" style={{ color: 'var(--ndl-muted)' }} htmlFor="cf-subject">Subject</label>
        <input
          id="cf-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Feature idea, bug report, partnership…"
          className={inputBase}
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.border = focusBorder; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
          onBlur={(e) => { e.currentTarget.style.border = blurBorder; e.currentTarget.style.boxShadow = ''; }}
        />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1.5 tracking-wide" style={{ color: 'var(--ndl-muted)' }} htmlFor="cf-message">Message</label>
        <textarea
          id="cf-message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what's on your mind…"
          className={`${inputBase} resize-y`}
          style={{ ...inputStyle, minHeight: '120px' }}
          onFocus={(e) => { e.currentTarget.style.border = focusBorder; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
          onBlur={(e) => { e.currentTarget.style.border = blurBorder; e.currentTarget.style.boxShadow = ''; }}
        />
      </div>

      <button
        type="submit"
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-7 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
        style={{ boxShadow: '0 4px 20px rgba(37,99,235,0.4)' }}
      >
        Send message
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>

      {status && (
        <div
          className="text-sm rounded-xl px-4 py-3 border"
          style={
            status.type === 'success'
              ? { color: '#059669', background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.25)' }
              : { color: '#dc2626', background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)' }
          }
        >
          {status.text}
        </div>
      )}
    </form>
  );
}
