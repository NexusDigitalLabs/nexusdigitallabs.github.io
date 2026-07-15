'use client';

import { useState, FormEvent } from 'react';

type StatusType = 'success' | 'error' | null;

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [sending, setSending] = useState(false);
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus({ type: 'error', text: 'Please fill in your name, email, and message.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setSending(true);
    setStatus(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
          website,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; ok?: boolean };
      if (!res.ok) {
        setStatus({
          type: 'error',
          text: data.error || 'Could not send your message. Please try again.',
        });
        return;
      }
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setWebsite('');
      setStatus({
        type: 'success',
        text: 'Message sent. We’ll get back to you soon.',
      });
    } catch {
      setStatus({
        type: 'error',
        text: 'Network error. Please try again, or email hello@nexusdigitallabs.dev directly.',
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Honeypot — hidden from users, left blank intentionally */}
      <div className="absolute -left-[9999px] opacity-0 h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="cf-website">Website</label>
        <input
          id="cf-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

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
            disabled={sending}
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
            disabled={sending}
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
          disabled={sending}
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
          disabled={sending}
          className={`${inputBase} resize-y`}
          style={{ ...inputStyle, minHeight: '120px' }}
          onFocus={(e) => { e.currentTarget.style.border = focusBorder; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
          onBlur={(e) => { e.currentTarget.style.border = blurBorder; e.currentTarget.style.boxShadow = ''; }}
        />
      </div>

      <button
        type="submit"
        disabled={sending}
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:hover:translate-y-0 ndl-on-accent text-sm font-semibold px-7 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
        style={{ boxShadow: '0 4px 20px rgba(37,99,235,0.4)' }}
      >
        {sending ? 'Sending…' : 'Send message'}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>

      {status && (
        <div
          role="status"
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
