'use client';

import { useState, useEffect, useRef } from 'react';

// ── Smooth count-up hook ──────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1600, startDelay = 0) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (target === 0) return;

    const timeout = setTimeout(() => {
      const startTime = Date.now();

      const tick = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(target * eased));
        if (progress < 1) rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    }, startDelay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, startDelay]);

  return display;
}

// ── Individual animated stat ──────────────────────────────────────────────────
function AnimatedStat({
  value,
  label,
  suffix = '',
  prefix = '',
  delay = 0,
  isLoading = false,
}: {
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
  delay?: number;
  isLoading?: boolean;
}) {
  const count = useCountUp(value, 1600, delay);

  return (
    <div>
      <p className="text-xl font-bold tabular-nums" style={{ color: 'var(--ndl-text)' }}>
        {isLoading ? (
          <span className="ndl-skeleton inline-block w-14 h-5 rounded align-middle" />
        ) : (
          `${prefix}${count.toLocaleString()}${suffix}`
        )}
      </p>
      <p className="text-xs mt-0.5" style={{ color: 'var(--ndl-faint)' }}>{label}</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SiteStatsClient() {
  const [totalViews, setTotalViews] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/counters?aggregate=total')
      .then(r => r.json())
      .then(json => {
        setTotalViews(json.count ?? 0);
      })
      .catch(() => {
        // Degrade silently — show 0
      })
      .finally(() => setLoading(false));
  }, []);

  const STATS = [
    { value: totalViews, label: 'People helped',  suffix: '',  isLoading: loading, delay: 0   },
    { value: 4,          label: 'Free tools',      suffix: '',  isLoading: false,   delay: 120 },
    { value: 5,          label: 'Articles',        suffix: '',  isLoading: false,   delay: 240 },
    { value: 3,          label: 'Browser games',   suffix: '',  isLoading: false,   delay: 360 },
  ] as const;

  return (
    <div className="flex items-center gap-6 mt-12 pt-8 border-t border-slate-800/60 flex-wrap">
      {STATS.map((stat, i, arr) => (
        <div key={stat.label} className="flex items-center gap-6">
          <AnimatedStat {...stat} />
          {i < arr.length - 1 && <div className="w-px h-8 bg-slate-800" />}
        </div>
      ))}
    </div>
  );
}
