'use client';

import { useEffect, useState } from 'react';

/**
 * MetricCounter — client-side page-view tracker and display.
 *
 * On mount, POSTs the current pathname to /api/counters to increment the count,
 * then renders the returned total as a low-contrast monospace footnote.
 * Degrades silently (renders nothing) if the network call fails.
 */
export default function MetricCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const path = window.location.pathname;

    fetch('/api/counters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: { count: number }) => {
        if (typeof data.count === 'number') setCount(data.count);
      })
      .catch(() => {
        // Degrade gracefully — no error shown to the user
      });
  }, []);

  if (count === null) return null;

  return (
    <span className="text-xs text-slate-500 select-none">
      {count.toLocaleString()} visitors
    </span>
  );
}
