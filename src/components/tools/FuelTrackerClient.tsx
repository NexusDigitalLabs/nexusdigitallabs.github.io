'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  type FillUp, type FillStats,
  genCode, normaliseCode, fmt, fmtCurrency, fmtDate, friendlyError, computeStats,
} from '@/lib/fuel-utils';
import { useAuth } from '@/components/AuthProvider';
import AuthGate from '@/components/AuthGate';
import {
  CURRENCIES,
  currencyByCode,
  normalizeCurrencyCode,
  type CurrencyCode,
} from '@/lib/currencies';
import { updateOwnPreferredCurrency } from '@/lib/profile';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

const FUEL_CODE_KEY = 'ndl_fuel_code';
const FUEL_CURRENCY_KEY = 'ndl_fuel_currency';
/** When set to the active sync code, garage UI requires sign-in after logout. */
const FUEL_AUTH_LOCK_KEY = 'ndl_fuel_auth_lock';

function markGarageAuthLock(code: string) {
  try {
    localStorage.setItem(FUEL_AUTH_LOCK_KEY, code);
  } catch {
    /* ignore */
  }
}

function clearGarageAuthLock() {
  try {
    localStorage.removeItem(FUEL_AUTH_LOCK_KEY);
  } catch {
    /* ignore */
  }
}

function isGarageAuthLocked(code: string | null): boolean {
  if (!code) return false;
  try {
    return localStorage.getItem(FUEL_AUTH_LOCK_KEY) === code;
  } catch {
    return false;
  }
}

// ── Local types ────────────────────────────────────────────────────────────────
interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number | null;
  fuel_type: string;
  nickname: string | null;
}

const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'LPG'];

// (genCode, normaliseCode, fmt, fmtCurrency, fmtDate, friendlyError, computeStats imported from @/lib/fuel-utils)

// ── SVG Line Chart ────────────────────────────────────────────────────────────
function LineChart({ points, color, yLabel }: {
  points: { x: string; y: number }[];
  color: string;
  yLabel: string;
}) {
  if (points.length < 2) {
    return (
      <div style={{ height: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
        <p style={{ fontSize: '0.8125rem', color: 'var(--ndl-faint)', textAlign: 'center' }}>Not enough data yet</p>
        <p style={{ fontSize: '0.6875rem', color: '#334155', textAlign: 'center' }}>
          {yLabel === 'L/100km'
            ? 'Log a 3rd fill-up to unlock the efficiency chart'
            : 'Log your first fill-up to see spending over time'}
        </p>
      </div>
    );
  }

  const PAD = { t: 16, r: 24, b: 36, l: 52 };
  const W = 600, H = 200;
  const CW = W - PAD.l - PAD.r;
  const CH = H - PAD.t - PAD.b;

  const ys = points.map(p => p.y);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const range = maxY - minY || 1;
  const pad5 = range * 0.15;

  const scaleY = (y: number) => PAD.t + CH - ((y - (minY - pad5)) / (range + pad5 * 2)) * CH;
  const scaleX = (i: number) => PAD.l + (i / (points.length - 1)) * CW;

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i).toFixed(1)} ${scaleY(p.y).toFixed(1)}`).join(' ');
  const areaD = `${pathD} L ${scaleX(points.length - 1).toFixed(1)} ${(PAD.t + CH).toFixed(1)} L ${scaleX(0).toFixed(1)} ${(PAD.t + CH).toFixed(1)} Z`;

  const ticks = 4;
  const avg = ys.reduce((a, b) => a + b, 0) / ys.length;

  // Show at most 8 x-axis labels evenly
  const labelStep = Math.ceil(points.length / 6);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '180px' }}>
      {/* Y grid + labels */}
      {Array.from({ length: ticks + 1 }, (_, i) => {
        const y = minY - pad5 + ((range + pad5 * 2) * i) / ticks;
        return (
          <g key={i}>
            <line x1={PAD.l} y1={scaleY(y)} x2={W - PAD.r} y2={scaleY(y)}
              stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
            <text x={PAD.l - 6} y={scaleY(y) + 4} textAnchor="end"
              fontSize={10} fill="var(--ndl-faint)">{fmt(y, 1)}</text>
          </g>
        );
      })}

      {/* Average line */}
      <line x1={PAD.l} y1={scaleY(avg)} x2={W - PAD.r} y2={scaleY(avg)}
        stroke={color} strokeWidth={1} strokeDasharray="4 3" opacity={0.45} />
      <text x={W - PAD.r + 2} y={scaleY(avg) + 4} fontSize={9} fill={color} opacity={0.6}>avg</text>

      {/* Area fill */}
      <path d={areaD} fill={color} fillOpacity={0.07} />

      {/* Line */}
      <path d={pathD} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />

      {/* Dots */}
      {points.map((p, i) => (
        <circle key={i} cx={scaleX(i)} cy={scaleY(p.y)} r={3.5} fill={color} />
      ))}

      {/* X labels */}
      {points.map((p, i) => {
        if (i % labelStep !== 0 && i !== points.length - 1) return null;
        return (
          <text key={i} x={scaleX(i)} y={H - 6} textAnchor="middle" fontSize={9} fill="var(--ndl-faint)">
            {p.x}
          </text>
        );
      })}

      {/* Y axis label */}
      <text
        x={10} y={H / 2}
        textAnchor="middle" fontSize={9} fill="var(--ndl-faint)"
        transform={`rotate(-90, 10, ${H / 2})`}
      >
        {yLabel}
      </text>
    </svg>
  );
}

// ── Shared input style ────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid var(--ndl-border)',
  color: 'var(--ndl-text)', padding: '0.5rem 0.75rem',
  fontSize: '0.875rem', outline: 'none', borderRadius: 0,
};

function InputField({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <label style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ndl-faint)' }}>
        {label}
      </label>
      <input
        {...props}
        style={{ ...inputStyle, ...(props.style || {}) }}
        onFocus={e => (e.currentTarget.style.borderColor = 'var(--ndl-accent)')}
        onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
      />
    </div>
  );
}

function SelectField({ label, children, ...props }: { label: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <label style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ndl-faint)' }}>
        {label}
      </label>
      <select
        {...props}
        style={{ ...inputStyle, ...(props.style || {}), appearance: 'none' }}
        onFocus={e => (e.currentTarget.style.borderColor = 'var(--ndl-accent)')}
        onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
      >
        {children}
      </select>
    </div>
  );
}

// ── Sync code display card ────────────────────────────────────────────────────
type ClaimUiState = 'idle' | 'loading' | 'unclaimed' | 'owned' | 'claimed_other' | 'error';

function SyncCodeCard({
  userCode,
  claimState,
  claimMessage,
  claimBusy,
  signedIn,
  onClaim,
  onUnlink,
}: {
  userCode: string | null;
  claimState: ClaimUiState;
  claimMessage: string | null;
  claimBusy: boolean;
  signedIn: boolean;
  onClaim: () => void;
  onUnlink: () => void;
}) {
  const [copied, setCopied] = useState(false);
  // Start collapsed on mobile (< 680px), expanded on desktop
  const [expanded, setExpanded] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 680 : true
  );

  function copy() {
    if (!userCode) return;
    navigator.clipboard.writeText(userCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(245,158,11,0.02) 100%)',
      border: '1px solid rgba(245,158,11,0.25)',
      overflow: 'hidden',
    }}>
      {/* ── Toggle header — always visible ─────────────────────────── */}
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '1rem 1.25rem',
          background: 'none', border: 'none', cursor: 'pointer',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
          <div style={{ width: '8px', height: '8px', flexShrink: 0, borderRadius: '50%', background: '#f59e0b' }} />
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#f59e0b' }}>
            Your Sync Code
          </span>
          {claimState === 'owned' && (
            <span style={{
              fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
              color: '#4ade80', border: '1px solid rgba(74,222,128,0.35)', padding: '0.15rem 0.4rem',
            }}>
              Linked
            </span>
          )}
          {/* Show truncated code in header when collapsed */}
          {!expanded && userCode && (
            <code style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ndl-muted)', letterSpacing: '0.04em' }}>
              {userCode.length > 14 ? `${userCode.slice(0, 14)}…` : userCode}
            </code>
          )}
        </div>
        {/* Chevron */}
        <svg
          width="14" height="14" fill="none" stroke="#64748b" viewBox="0 0 24 24"
          style={{ flexShrink: 0, transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* ── Expandable body ─────────────────────────────────────────── */}
      {expanded && (
        <div style={{ padding: '0 1.25rem 1.5rem' }}>
          {/* Big code */}
          <code style={{
            display: 'block',
            fontSize: 'clamp(1.25rem, 5vw, 2rem)',
            fontWeight: 800,
            color: 'var(--ndl-text)',
            letterSpacing: '0.06em',
            wordBreak: 'break-all',
            lineHeight: 1.25,
            marginBottom: '1.25rem',
          }}>
            {userCode ?? '—'}
          </code>

          {/* Copy button */}
          <button type="button" onClick={copy} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: copied ? 'rgba(74,222,128,0.12)' : 'rgba(245,158,11,0.12)',
            border: `1px solid ${copied ? 'rgba(74,222,128,0.35)' : 'rgba(245,158,11,0.35)'}`,
            color: copied ? '#4ade80' : '#f59e0b',
            padding: '0.625rem 1rem', cursor: 'pointer', width: '100%',
            justifyContent: 'center', borderRadius: 0,
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', transition: 'all 0.2s',
          }}>
            {copied ? (
              <>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3" />
                </svg>
                Copy Code
              </>
            )}
          </button>

          {/* Account link */}
          {userCode && claimState !== 'idle' && claimState !== 'loading' && (
            <div style={{
              marginTop: '1rem',
              padding: '0.875rem',
              border: '1px solid var(--ndl-border)',
              background: 'var(--ndl-surface-2)',
            }}>
              {claimState === 'owned' && (
                <>
                  <p style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', color: '#4ade80', lineHeight: 1.5 }}>
                    Linked to your account — this garage restores automatically when you sign in on a new device.
                  </p>
                  {signedIn && (
                    <button
                      type="button"
                      onClick={onUnlink}
                      disabled={claimBusy}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: '#fca5a5',
                        background: 'transparent',
                        border: '1px solid rgba(248,113,113,0.35)',
                        cursor: claimBusy ? 'wait' : 'pointer',
                        opacity: claimBusy ? 0.6 : 1,
                      }}
                    >
                      {claimBusy ? 'Unlinking…' : 'Unlink from account'}
                    </button>
                  )}
                </>
              )}
              {claimState === 'claimed_other' && (
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#f87171', lineHeight: 1.5 }}>
                  This sync code is linked to another account. You can still use the code on this device.
                </p>
              )}
              {claimState === 'unclaimed' && signedIn && (
                <>
                  <p style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', color: 'var(--ndl-muted)', lineHeight: 1.5 }}>
                    Optional: link this garage to your account so it loads when you sign in elsewhere.
                  </p>
                  <button
                    type="button"
                    onClick={onClaim}
                    disabled={claimBusy}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: '#fff',
                      background: '#6366f1',
                      border: 'none',
                      cursor: claimBusy ? 'wait' : 'pointer',
                      opacity: claimBusy ? 0.6 : 1,
                    }}
                  >
                    {claimBusy ? 'Linking…' : 'Link to my account'}
                  </button>
                </>
              )}
              {claimState === 'unclaimed' && !signedIn && (
                <>
                  <p style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', color: 'var(--ndl-muted)', lineHeight: 1.5 }}>
                    Sign in to link this garage to your account (optional — sync code still works alone).
                  </p>
                  <a
                    href="/login/?next=/tools/fuel-tracker/"
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      textDecoration: 'none',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: '#a5b4fc',
                      border: '1px solid rgba(99,102,241,0.45)',
                      background: 'rgba(99,102,241,0.12)',
                    }}
                  >
                    Sign in to link
                  </a>
                </>
              )}
              {claimState === 'error' && claimMessage && (
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#f87171', lineHeight: 1.5 }}>{claimMessage}</p>
              )}
              {claimMessage && claimState !== 'error' && (
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.7rem', color: 'var(--ndl-faint)' }}>{claimMessage}</p>
              )}
            </div>
          )}

          {/* How it works */}
          <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(245,158,11,0.12)' }}>
            <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ndl-faint)', marginBottom: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              How to use on another device
            </p>
            {[
              'Save this code in your Notes app, or take a screenshot.',
              'Open Fuel Tracker on your other device.',
              'Choose "I Have a Code" and enter it — or sign in if you linked your account.',
            ].map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.625rem', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#f59e0b', minWidth: '14px', marginTop: '0.15rem' }}>
                  {i + 1}.
                </span>
                <p style={{ fontSize: '0.75rem', color: 'var(--ndl-faint)', margin: 0, lineHeight: 1.6 }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
type Step = 'loading' | 'onboarding' | 'vehicle_setup' | 'main';

export default function FuelTrackerClient() {
  const { user, profile, loading: authLoading, setProfile: setAuthProfile } = useAuth();
  const [step, setStep] = useState<Step>('loading');
  const [userCode, setUserCode] = useState<string | null>(null);
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>('USD');
  const currency = currencyByCode(currencyCode);

  // onboarding
  const [onboardMode, setOnboardMode] = useState<'new' | 'existing'>('new');
  const [nicknameInput, setNicknameInput] = useState('');
  const [existingCodeInput, setExistingCodeInput] = useState('');
  const [onboardError, setOnboardError] = useState('');
  const [onboardLoading, setOnboardLoading] = useState(false);

  // vehicle setup
  const [vMake, setVMake] = useState('');
  const [vModel, setVModel] = useState('');
  const [vYear, setVYear] = useState('');
  const [vFuelType, setVFuelType] = useState('Petrol');
  const [vNickname, setVNickname] = useState('');
  const [vehicleError, setVehicleError] = useState('');
  const [vehicleLoading, setVehicleLoading] = useState(false);

  // main state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeVehicleId, setActiveVehicleId] = useState<string | null>(null);
  const [fills, setFills] = useState<FillUp[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // add fill form
  const [showAddFill, setShowAddFill] = useState(false);
  const [fillDate, setFillDate] = useState(new Date().toISOString().slice(0, 10));
  const [fillOdo, setFillOdo] = useState('');
  const [fillLitres, setFillLitres] = useState('');
  const [fillPrice, setFillPrice] = useState('');
  const [fillPartial, setFillPartial] = useState(false);
  const [fillNotes, setFillNotes] = useState('');
  const [fillError, setFillError] = useState('');
  const [fillLoading, setFillLoading] = useState(false);

  // add vehicle form
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  // settings
  const [showSettings, setShowSettings] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  // account claim
  const [claimState, setClaimState] = useState<ClaimUiState>('idle');
  const [claimMessage, setClaimMessage] = useState<string | null>(null);
  const [claimBusy, setClaimBusy] = useState(false);

  // chart
  const [activeChart, setActiveChart] = useState<'efficiency' | 'spend'>('efficiency');

  // When a signed-in user opens/uses a garage, lock it to auth after sign-out.
  const hadSignedInRef = useRef(false);
  useEffect(() => {
    if (user?.id) {
      hadSignedInRef.current = true;
      if (userCode) markGarageAuthLock(userCode);
    }
  }, [user?.id, userCode]);

  // Preferred currency: profile (signed in) > localStorage > USD
  useEffect(() => {
    if (authLoading) return;
    if (profile?.preferred_currency) {
      setCurrencyCode(normalizeCurrencyCode(profile.preferred_currency));
      try { localStorage.setItem(FUEL_CURRENCY_KEY, profile.preferred_currency); } catch { /* ignore */ }
      return;
    }
    try {
      const stored = localStorage.getItem(FUEL_CURRENCY_KEY);
      if (stored) setCurrencyCode(normalizeCurrencyCode(stored));
    } catch { /* ignore */ }
  }, [authLoading, profile?.preferred_currency]);

  useEffect(() => {
    if (claimState === 'owned' && userCode) {
      markGarageAuthLock(userCode);
    }
  }, [claimState, userCode]);

  const garageNeedsSignIn =
    !authLoading &&
    !user &&
    Boolean(userCode) &&
    (step === 'main' || step === 'vehicle_setup') &&
    (isGarageAuthLocked(userCode) || hadSignedInRef.current);

  useEffect(() => {
    if (!garageNeedsSignIn) return;
    setVehicles([]);
    setFills([]);
    setActiveVehicleId(null);
    setShowAddFill(false);
    setShowSettings(false);
  }, [garageNeedsSignIn]);

  // ── Fetch vehicles (only called explicitly, never reactively on userCode change)
  const fetchVehicles = useCallback(async (code: string, signedIn = false) => {
    setDataLoading(true);
    try {
      const res = await fetch(`/api/fuel?code=${encodeURIComponent(code)}&resource=vehicles`);
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        const linked = (json.data as { user_id?: string | null }[]).some((v) => Boolean(v.user_id));
        // Account-linked garage: do not show data while signed out.
        if (linked && !signedIn) {
          markGarageAuthLock(code);
          setUserCode(code);
          setVehicles([]);
          setFills([]);
          setActiveVehicleId(null);
          setStep('main');
          return;
        }
        setVehicles(json.data);
        setActiveVehicleId(json.data[0].id);
        setStep('main');
      } else if (json.data && json.data.length === 0) {
        setVehicles([]);
        setStep('vehicle_setup');
      } else {
        // API error — stay on current step, don't bounce back to onboarding
        setStep(prev => (prev === 'loading' ? 'onboarding' : prev));
      }
    } catch {
      setStep(prev => (prev === 'loading' ? 'onboarding' : prev));
    } finally {
      setDataLoading(false);
    }
  }, []);

  // ── Init — local sync code, else signed-in account garage, else onboarding ─
  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function init() {
      try {
        const cur = localStorage.getItem(FUEL_CURRENCY_KEY);
        if (cur && !cancelled) setCurrencyCode(normalizeCurrencyCode(cur));

        const stored = localStorage.getItem(FUEL_CODE_KEY);
        const code = stored ? normaliseCode(stored) : null;

        if (code) {
          if (!cancelled) {
            setUserCode(code);
            // Linked / previously signed-in garage: don't load data until signed in.
            if (!user && isGarageAuthLocked(code)) {
              setStep('main');
              return;
            }
            await fetchVehicles(code, Boolean(user));
          }
          return;
        }

        if (user) {
          const res = await fetch('/api/fuel?resource=account');
          if (cancelled) return;
          if (res.ok) {
            const json = await res.json();
            if (json.data && json.data.length > 0 && json.code) {
              const accountCode = normaliseCode(json.code);
              try {
                localStorage.setItem(FUEL_CODE_KEY, accountCode);
                markGarageAuthLock(accountCode);
              } catch { /* ignore */ }
              setUserCode(accountCode);
              setVehicles(json.data);
              setActiveVehicleId(json.data[0].id);
              setStep('main');
              return;
            }
          }
        }

        if (!cancelled) setStep('onboarding');
      } catch {
        if (!cancelled) setStep('onboarding');
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.id, fetchVehicles]);

  // ── Fetch fills when active vehicle changes ───────────────────────────────
  const fetchFills = useCallback(async (vehicleId: string, code: string) => {
    setDataLoading(true);
    try {
      const res = await fetch(`/api/fuel?code=${encodeURIComponent(code)}&resource=fills&vehicleId=${vehicleId}`);
      const json = await res.json();
      setFills(json.data ?? []);
    } catch {
      setFills([]);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeVehicleId && userCode) fetchFills(activeVehicleId, userCode);
  }, [activeVehicleId, userCode, fetchFills]);

  // ── Claim status for current sync code ────────────────────────────────────
  const refreshClaimStatus = useCallback(async (code: string) => {
    setClaimState('loading');
    setClaimMessage(null);
    try {
      const res = await fetch(
        `/api/fuel?code=${encodeURIComponent(code)}&resource=claim_status`
      );
      const json = await res.json();
      if (!res.ok) {
        setClaimState('error');
        setClaimMessage(json.error ?? 'Could not check link status');
        return;
      }
      if (json.is_owner) setClaimState('owned');
      else if (json.claimed) setClaimState('claimed_other');
      else setClaimState('unclaimed');
    } catch {
      setClaimState('error');
      setClaimMessage('Could not check link status');
    }
  }, []);

  useEffect(() => {
    if (!userCode || (step !== 'main' && step !== 'vehicle_setup')) {
      setClaimState('idle');
      return;
    }
    // Need at least one vehicle before claim is useful.
    if (vehicles.length === 0) {
      setClaimState('idle');
      return;
    }
    void refreshClaimStatus(userCode);
  }, [userCode, step, user?.id, vehicles.length, refreshClaimStatus]);

  async function handleClaimGarage() {
    if (!userCode || claimBusy) return;
    setClaimBusy(true);
    setClaimMessage(null);
    try {
      const res = await fetch('/api/fuel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource: 'claim', code: userCode }),
      });
      const json = await res.json();
      if (!res.ok) {
        setClaimState(res.status === 409 ? 'claimed_other' : 'error');
        setClaimMessage(json.error ?? 'Could not link garage');
        return;
      }
      setClaimState('owned');
      setClaimMessage('Garage linked to your account.');
      markGarageAuthLock(userCode);
    } catch {
      setClaimState('error');
      setClaimMessage('Could not link garage');
    } finally {
      setClaimBusy(false);
    }
  }

  async function handleUnlinkGarage() {
    if (!userCode || claimBusy) return;
    const ok = window.confirm(
      'Unlink this garage from your account? Your sync code and data stay intact — you’ll need the code (or to link again) on new devices.'
    );
    if (!ok) return;
    setClaimBusy(true);
    setClaimMessage(null);
    try {
      const res = await fetch('/api/fuel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource: 'unlink', code: userCode }),
      });
      const json = await res.json();
      if (!res.ok) {
        setClaimState('error');
        setClaimMessage(json.error ?? 'Could not unlink garage');
        return;
      }
      clearGarageAuthLock();
      setClaimState('unclaimed');
      setClaimMessage('Garage unlinked. Sync code still works.');
    } catch {
      setClaimState('error');
      setClaimMessage('Could not unlink garage');
    } finally {
      setClaimBusy(false);
    }
  }

  // ── Onboarding ────────────────────────────────────────────────────────────
  function handleStartNew() {
    if (!nicknameInput.trim()) { setOnboardError('Enter a nickname first'); return; }
    setOnboardError('');
    const code = genCode(nicknameInput.trim());
    try { localStorage.setItem(FUEL_CODE_KEY, code); } catch { /* ignore */ }
    // Set code in state then go directly to vehicle setup — no API fetch needed
    // for a brand new user who has no vehicles yet.
    setUserCode(code);
    setStep('vehicle_setup');
  }

  async function handleExistingCode() {
    const code = normaliseCode(existingCodeInput);
    if (!code) { setOnboardError('Enter your sync code'); return; }
    setOnboardError('');
    setOnboardLoading(true);
    try {
      const res = await fetch(`/api/fuel?code=${encodeURIComponent(code)}&resource=vehicles`);
      const json = await res.json();
      // A valid existing garage must have at least one vehicle.
      // An empty array means the code was never registered — treat as not found.
      if (json.data && json.data.length > 0) {
        try { localStorage.setItem(FUEL_CODE_KEY, code); } catch { /* ignore */ }
        setUserCode(code);
        setVehicles(json.data);
        setActiveVehicleId(json.data[0].id);
        setStep('main');
      } else {
        setOnboardError('No garage found for that code. Check the full code including the suffix (e.g. MyName-AB3X) and try again.');
      }
    } catch {
      setOnboardError('Could not connect. Please try again.');
    } finally {
      setOnboardLoading(false);
    }
  }

  // ── Vehicle creation ──────────────────────────────────────────────────────
  async function handleCreateVehicle() {
    if (!vMake.trim() || !vModel.trim()) { setVehicleError('Make and model are required'); return; }
    if (!userCode) return;
    setVehicleError('');
    setVehicleLoading(true);
    try {
      const res = await fetch('/api/fuel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource: 'vehicle', code: userCode, make: vMake, model: vModel, year: vYear || null, fuelType: vFuelType, nickname: vNickname }),
      });
      const json = await res.json();
      if (json.data) {
        setVehicles(prev => [...prev, json.data]);
        setActiveVehicleId(json.data.id);
        setShowAddVehicle(false);
        setStep('main');
        setVMake(''); setVModel(''); setVYear(''); setVNickname('');
      } else {
        setVehicleError(friendlyError(json.error ?? 'Failed to save vehicle'));
      }
    } catch {
      setVehicleError('Could not connect. Please check your internet connection and try again.');
    } finally {
      setVehicleLoading(false);
    }
  }

  // ── Add fill-up ───────────────────────────────────────────────────────────
  async function handleAddFill() {
    if (!fillOdo || !fillLitres || !fillPrice) { setFillError('Odometer, litres, and price are required'); return; }
    if (!userCode || !activeVehicleId) return;
    const odo = parseFloat(fillOdo);
    const stats = computeStats(fills);
    const lastOdo = stats.length > 0 ? stats[stats.length - 1].fill.odometer : null;
    if (lastOdo !== null && odo <= lastOdo) {
      setFillError(`Odometer must be greater than last reading (${lastOdo.toLocaleString()} km)`);
      return;
    }
    setFillError('');
    setFillLoading(true);
    try {
      const res = await fetch('/api/fuel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resource: 'fill', code: userCode, vehicleId: activeVehicleId,
          fillDate, odometer: odo, litres: parseFloat(fillLitres),
          pricePerLitre: parseFloat(fillPrice), isPartial: fillPartial, notes: fillNotes,
        }),
      });
      const json = await res.json();
      if (json.data) {
        setFills(prev => [...prev, json.data].sort((a, b) =>
          new Date(a.fill_date).getTime() - new Date(b.fill_date).getTime() || a.odometer - b.odometer
        ));
        setShowAddFill(false);
        setFillOdo(''); setFillLitres(''); setFillPrice('');
        setFillPartial(false); setFillNotes('');
        setFillDate(new Date().toISOString().slice(0, 10));
      } else {
        setFillError(friendlyError(json.error ?? 'Failed to save fill-up'));
      }
    } catch {
      setFillError('Could not connect. Please check your internet connection and try again.');
    } finally {
      setFillLoading(false);
    }
  }

  // ── Delete fill ───────────────────────────────────────────────────────────
  async function handleDeleteFill(id: string) {
    if (!confirm('Delete this fill-up?')) return;
    try {
      await fetch('/api/fuel', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource: 'fill', id }),
      });
      setFills(prev => prev.filter(f => f.id !== id));
    } catch { /* ignore */ }
  }

  // ── Delete all data ───────────────────────────────────────────────────────
  async function handleDeleteAll() {
    if (!confirm('This will permanently delete ALL your vehicles and fill-up history. This cannot be undone. Continue?')) return;
    if (!userCode) return;
    try {
      await fetch('/api/fuel', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource: 'user', code: userCode }),
      });
      try {
        localStorage.removeItem(FUEL_CODE_KEY);
        clearGarageAuthLock();
      } catch { /* ignore */ }
      setUserCode(null); setVehicles([]); setFills([]);
      setStep('onboarding');
      setShowSettings(false);
    } catch { /* ignore */ }
  }

  async function handleCurrencyChange(next: string) {
    const code = normalizeCurrencyCode(next);
    setCurrencyCode(code);
    try { localStorage.setItem(FUEL_CURRENCY_KEY, code); } catch { /* ignore */ }
    if (!user) return;
    const supabase = createBrowserSupabaseClient();
    const { profile: updated } = await updateOwnPreferredCurrency(supabase, user.id, code);
    if (updated) setAuthProfile(updated);
  }

  // ── Export CSV ────────────────────────────────────────────────────────────
  function exportCSV() {
    const stats = computeStats(fills);
    const vehicle = vehicles.find(v => v.id === activeVehicleId);
    const rows = [
      ['Date', 'Odometer (km)', 'Distance (km)', 'Litres', `Price/${currency.code}`, 'Total Cost', 'L/100km', 'km/L', 'Cost/km', 'Partial', 'Notes'],
      ...stats.map(s => [
        s.fill.fill_date,
        s.fill.odometer,
        s.distance ?? '',
        s.fill.litres,
        s.fill.price_per_litre,
        fmt(s.totalCost),
        s.l100km ? fmt(s.l100km) : '',
        s.kmpl ? fmt(s.kmpl) : '',
        s.costPerKm ? fmt(s.costPerKm, 3) : '',
        s.fill.is_partial ? 'Yes' : 'No',
        s.fill.notes ?? '',
      ]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fuel-log-${vehicle?.make ?? 'vehicle'}-${vehicle?.model ?? ''}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Copy sync code ────────────────────────────────────────────────────────
  function copyCode() {
    if (!userCode) return;
    navigator.clipboard.writeText(userCode).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    });
  }

  // ── Computed stats ────────────────────────────────────────────────────────
  const fillStats = computeStats(fills);
  const validStats = fillStats.filter(s => s.l100km !== null && !s.isFirst);
  const avgL100 = validStats.length ? validStats.reduce((a, s) => a + s.l100km!, 0) / validStats.length : null;
  const avgKmpl = validStats.length ? validStats.reduce((a, s) => a + s.kmpl!, 0) / validStats.length : null;
  const bestL100 = validStats.length ? Math.min(...validStats.map(s => s.l100km!)) : null;
  const worstL100 = validStats.length ? Math.max(...validStats.map(s => s.l100km!)) : null;
  const totalSpend = fillStats.reduce((a, s) => a + s.totalCost, 0);
  const totalLitres = fills.reduce((a, f) => a + f.litres, 0);
  const totalKm = fillStats.filter(s => s.distance).reduce((a, s) => a + s.distance!, 0);
  const avgCostKm = totalKm > 0 ? totalSpend / totalKm : null;

  const efficiencyPoints = fillStats
    .filter(s => s.l100km !== null)
    .map(s => ({ x: s.fill.fill_date.slice(5), y: s.l100km! }));

  const spendPoints = (() => {
    let cumulative = 0;
    return fillStats.map(s => { cumulative += s.totalCost; return { x: s.fill.fill_date.slice(5), y: cumulative }; });
  })();

  // ── Shared styles ─────────────────────────────────────────────────────────
  const S = {
    card: { background: 'var(--ndl-surface)', border: '1px solid var(--ndl-border)', padding: '1rem' } as React.CSSProperties,
    btn: (accent: string): React.CSSProperties => ({
      background: 'transparent', border: `1px solid ${accent}`,
      color: accent, padding: '0.5rem 1rem', cursor: 'pointer',
      fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.07em',
      textTransform: 'uppercase' as const, borderRadius: 0,
    }),
    btnFill: (bg: string): React.CSSProperties => ({
      background: bg, border: 'none', color: '#0f172a',
      padding: '0.625rem 1.25rem', cursor: 'pointer',
      fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.07em',
      textTransform: 'uppercase' as const, borderRadius: 0,
    }),
    label: { fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: 'var(--ndl-faint)', marginBottom: '0.25rem' } as React.CSSProperties,
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: Loading
  // ─────────────────────────────────────────────────────────────────────────
  if (step === 'loading') {
    return (
      <div style={{ background: 'var(--ndl-bg)', minHeight: '100vh' }}>
        {/* Top bar skeleton */}
        <div style={{ borderBottom: '1px solid var(--ndl-border)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <div className="ndl-skeleton" style={{ width: '100px', height: '10px' }} />
            <div className="ndl-skeleton" style={{ width: '140px', height: '20px' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div className="ndl-skeleton" style={{ width: '60px', height: '32px' }} />
            <div className="ndl-skeleton" style={{ width: '90px', height: '32px' }} />
          </div>
        </div>
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '1.5rem' }}>
          {/* Vehicle tabs skeleton */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <div className="ndl-skeleton" style={{ width: '140px', height: '36px', borderRadius: '6px' }} />
            <div className="ndl-skeleton" style={{ width: '110px', height: '36px', borderRadius: '6px' }} />
          </div>
          {/* Subtitle skeleton */}
          <div className="ndl-skeleton" style={{ width: '220px', height: '12px', marginBottom: '1.5rem' }} />
          {/* Stats grid skeleton */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '1.5rem' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ background: 'var(--ndl-surface)', padding: '1.25rem' }}>
                <div className="ndl-skeleton" style={{ width: '70px', height: '10px', marginBottom: '0.5rem' }} />
                <div className="ndl-skeleton" style={{ width: '90px', height: '28px' }} />
              </div>
            ))}
          </div>
          {/* Chart skeleton */}
          <div style={{ background: 'var(--ndl-surface)', border: '1px solid var(--ndl-border)', padding: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div className="ndl-skeleton" style={{ width: '80px', height: '12px' }} />
              <div style={{ display: 'flex', gap: '1px' }}>
                <div className="ndl-skeleton" style={{ width: '70px', height: '24px' }} />
                <div className="ndl-skeleton" style={{ width: '80px', height: '24px' }} />
              </div>
            </div>
            <div className="ndl-skeleton" style={{ width: '100%', height: '180px', borderRadius: '4px' }} />
          </div>
          {/* Fills table skeleton */}
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ background: 'var(--ndl-surface)', border: '1px solid var(--ndl-border)', padding: '1rem', marginBottom: '1px', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <div className="ndl-skeleton" style={{ width: '80px', height: '10px' }} />
                <div className="ndl-skeleton" style={{ width: '140px', height: '14px' }} />
              </div>
              <div className="ndl-skeleton" style={{ width: '60px', height: '14px' }} />
              <div className="ndl-skeleton" style={{ width: '60px', height: '14px' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: Onboarding
  // ─────────────────────────────────────────────────────────────────────────
  if (step === 'onboarding') {
    return (
      <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: 'var(--ndl-bg)' }}>
        <div style={{ maxWidth: '420px', width: '100%' }}>
          {/* Header */}
          <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#f59e0b', marginBottom: '0.5rem' }}>
            NexusDigitalLabs
          </p>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--ndl-text)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Fuel Tracker
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--ndl-faint)', marginBottom: '2rem', lineHeight: 1.6 }}>
            Track fuel costs, efficiency, and mileage across all your vehicles. Data syncs via a personal code — account optional for restore-on-login.
          </p>

          {/* Toggle */}
          <div style={{ display: 'flex', gap: '1px', background: 'rgba(255,255,255,0.07)', marginBottom: '1.5rem' }}>
            {(['new', 'existing'] as const).map(m => (
              <button key={m} type="button" onClick={() => { setOnboardMode(m); setOnboardError(''); }}
                style={{
                  flex: 1, padding: '0.625rem', cursor: 'pointer', border: 'none',
                  background: onboardMode === m ? '#f59e0b' : 'transparent',
                  color: onboardMode === m ? '#0f172a' : 'var(--ndl-muted)',
                  fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                {m === 'new' ? 'Start Fresh' : 'I Have a Code'}
              </button>
            ))}
          </div>

          {onboardMode === 'new' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <InputField
                label="Choose a nickname for your garage"
                placeholder="e.g. MyGarage, Dilan_Cars, BluePrius"
                value={nicknameInput}
                onChange={e => { setNicknameInput(e.target.value); setOnboardError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleStartNew()}
                maxLength={20}
              />
              {nicknameInput.includes('@') && (
                <p style={{ fontSize: '0.75rem', color: '#f59e0b', margin: 0 }}>
                  ⚠️ Avoid using your email address — this becomes your sync code.
                </p>
              )}
              <p style={{ fontSize: '0.75rem', color: 'var(--ndl-faint)', margin: 0 }}>
                A unique sync code will be generated from your nickname. Keep it safe — it&apos;s how you access your data on other devices.
              </p>
              {onboardError && <p style={{ fontSize: '0.75rem', color: '#f87171', margin: 0 }}>{onboardError}</p>}
              <button type="button" onClick={handleStartNew} disabled={onboardLoading}
                style={{ ...S.btnFill('#f59e0b'), opacity: onboardLoading ? 0.6 : 1 }}>
                {onboardLoading ? 'Creating…' : 'Create My Garage →'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <InputField
                label="Your sync code"
                placeholder="e.g. MyGarage-7X4P"
                value={existingCodeInput}
                onChange={e => { setExistingCodeInput(e.target.value); setOnboardError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleExistingCode()}
              />
              {onboardError && <p style={{ fontSize: '0.75rem', color: '#f87171', margin: 0 }}>{onboardError}</p>}
              <button type="button" onClick={handleExistingCode} disabled={onboardLoading}
                style={{ ...S.btnFill('#f59e0b'), opacity: onboardLoading ? 0.6 : 1 }}>
                {onboardLoading ? 'Loading…' : 'Load My Data →'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: Auth lock (signed out of an auth-linked garage)
  // ─────────────────────────────────────────────────────────────────────────
  if (garageNeedsSignIn) {
    return (
      <AuthGate
        variant="page"
        next="/tools/fuel-tracker/"
        title="Sign in to unlock your garage"
        description="Your fuel history is still saved. Sign back in to continue logging fill-ups and viewing stats."
        minHeight="calc(100vh - 64px)"
      >
        {null}
      </AuthGate>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: Vehicle Setup
  // ─────────────────────────────────────────────────────────────────────────
  if (step === 'vehicle_setup' && !showAddVehicle) {
    return (
      <div style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--ndl-bg)', display: 'flex', alignItems: 'center', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '3rem', alignItems: 'start' }}
          className="vehicle-setup-grid">
          <style>{`
            @media (max-width: 680px) {
              .vehicle-setup-grid { grid-template-columns: 1fr !important; }
              .sync-code-panel { order: -1; position: static !important; }
            }
          `}</style>

          {/* ── LEFT: Form ──────────────────────────────────────────────── */}
          <div>
            <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4ade80', marginBottom: '0.5rem' }}>
              Step 2 of 2
            </p>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ndl-text)', marginBottom: '0.375rem', letterSpacing: '-0.02em' }}>
              Add your first vehicle
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--ndl-faint)', marginBottom: '2rem', lineHeight: 1.6 }}>
              Set up your vehicle and start logging fill-ups right away.
            </p>
            <VehicleForm
              make={vMake} setMake={setVMake}
              model={vModel} setModel={setVModel}
              year={vYear} setYear={setVYear}
              fuelType={vFuelType} setFuelType={setVFuelType}
              nickname={vNickname} setNickname={setVNickname}
              error={vehicleError} loading={vehicleLoading}
              onSubmit={handleCreateVehicle}
              submitLabel="Add Vehicle & Start Tracking →"
              accentColor="#4ade80"
            />
          </div>

          {/* ── RIGHT: Sync code card ────────────────────────────────────── */}
          <div className="sync-code-panel" style={{ position: 'sticky', top: '2rem' }}>
            <SyncCodeCard
              userCode={userCode}
              claimState={claimState}
              claimMessage={claimMessage}
              claimBusy={claimBusy}
              signedIn={Boolean(user)}
              onClaim={handleClaimGarage}
              onUnlink={handleUnlinkGarage}
            />
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: Main view
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: 'var(--ndl-bg)', minHeight: '100vh' }}>

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid var(--ndl-border)', background: 'var(--ndl-bg)' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <p style={{ ...S.label, color: '#f59e0b' }}>NexusDigitalLabs</p>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ndl-text)', margin: 0, letterSpacing: '-0.02em' }}>
              Fuel Tracker
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <select
              value={currencyCode}
              onChange={(e) => { void handleCurrencyChange(e.target.value); }}
              style={{ ...inputStyle, width: 'auto', fontSize: '0.75rem', padding: '0.375rem 0.625rem' }}
            >
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
            </select>
            <button type="button" onClick={() => setShowSettings(s => !s)}
              style={{ ...S.btn('rgba(255,255,255,0.3)'), padding: '0.375rem 0.75rem' }}>
              ⚙ Settings
            </button>
          </div>
        </div>
      </div>

      {/* ── Settings panel ───────────────────────────────────────────────── */}
      {showSettings && (
        <div style={{ background: 'var(--ndl-surface)', borderBottom: '1px solid var(--ndl-border)' }}>
          <style>{`
            .ft-settings-inner { max-width: 72rem; margin: 0 auto; padding: 1.25rem 1rem; display: flex; flex-direction: column; gap: 1rem; }
            .ft-settings-actions { display: flex; gap: 0.625rem; flex-wrap: wrap; }
            .ft-settings-actions a, .ft-settings-actions button { flex: 1 1 auto; justify-content: center; }
            .ft-settings-danger { padding-top: 0.75rem; border-top: 1px solid rgba(248,113,113,0.15); }
            .ft-settings-danger button { width: 100%; }
            @media (min-width: 640px) {
              .ft-settings-inner { flex-direction: row; align-items: flex-start; padding: 1.25rem 1.5rem; }
              .ft-settings-sync { flex: 1; }
              .ft-settings-right { display: flex; flex-direction: column; gap: 0.625rem; align-items: flex-end; }
              .ft-settings-actions { flex-direction: row; }
              .ft-settings-actions a, .ft-settings-actions button { flex: 0 0 auto; }
              .ft-settings-danger button { width: auto; }
            }
          `}</style>
          <div className="ft-settings-inner">
            {/* Sync code */}
            <div className="ft-settings-sync">
              <p style={S.label}>Your Sync Code</p>
              <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                <code style={{ fontSize: '1.125rem', fontWeight: 800, color: '#f59e0b', letterSpacing: '0.07em', wordBreak: 'break-all' }}>{userCode}</code>
                <button type="button" onClick={copyCode}
                  style={{ ...S.btn(codeCopied ? '#4ade80' : 'rgba(245,158,11,0.5)'), padding: '0.25rem 0.75rem', fontSize: '0.6875rem', flexShrink: 0 }}>
                  {codeCopied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <p style={{ fontSize: '0.6875rem', color: 'var(--ndl-faint)', marginTop: '0.375rem' }}>
                Enter this code on any device to load your full history.
              </p>
              {claimState === 'owned' && (
                <>
                  <p style={{ fontSize: '0.75rem', color: '#4ade80', marginTop: '0.75rem' }}>
                    Linked to your account.
                  </p>
                  {user && (
                    <button
                      type="button"
                      onClick={handleUnlinkGarage}
                      disabled={claimBusy}
                      style={{
                        ...S.btn('rgba(248,113,113,0.55)'),
                        marginTop: '0.5rem',
                        padding: '0.4rem 0.85rem',
                        fontSize: '0.6875rem',
                        color: '#fca5a5',
                        background: 'transparent',
                        border: '1px solid rgba(248,113,113,0.35)',
                        opacity: claimBusy ? 0.6 : 1,
                      }}
                    >
                      {claimBusy ? 'Unlinking…' : 'Unlink from account'}
                    </button>
                  )}
                </>
              )}
              {claimState === 'claimed_other' && (
                <p style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.75rem' }}>
                  Linked to another account.
                </p>
              )}
              {claimState === 'unclaimed' && user && (
                <button
                  type="button"
                  onClick={handleClaimGarage}
                  disabled={claimBusy}
                  style={{
                    ...S.btn('#6366f1'),
                    marginTop: '0.75rem',
                    padding: '0.4rem 0.85rem',
                    fontSize: '0.6875rem',
                    opacity: claimBusy ? 0.6 : 1,
                  }}
                >
                  {claimBusy ? 'Linking…' : 'Link to my account'}
                </button>
              )}
              {claimState === 'unclaimed' && !user && (
                <a
                  href="/login/?next=/tools/fuel-tracker/"
                  style={{
                    ...S.btn('#6366f1'),
                    marginTop: '0.75rem',
                    padding: '0.4rem 0.85rem',
                    fontSize: '0.6875rem',
                    textDecoration: 'none',
                    display: 'inline-block',
                  }}
                >
                  Sign in to link
                </a>
              )}
              {claimMessage && (
                <p style={{ fontSize: '0.7rem', color: 'var(--ndl-faint)', marginTop: '0.5rem' }}>{claimMessage}</p>
              )}
            </div>

            {/* Actions */}
            <div className="ft-settings-right" style={{ minWidth: 0 }}>
              <div className="ft-settings-actions">
                <button type="button" onClick={exportCSV}
                  style={{ ...S.btn('#4ade80'), padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  ↓ Export CSV
                </button>
                <a
                  href={`mailto:?subject=${encodeURIComponent('My Fuel Tracker Sync Code')}&body=${encodeURIComponent(
                    `Hi,\n\nHere is my Fuel Tracker sync code:\n\n  ${userCode}\n\nTo access my data on another device:\n1. Go to https://nexusdigitallabs.dev/tools/fuel-tracker/\n2. Choose "I have a code"\n3. Enter the code above\n\n— Sent from NexusDigitalLabs Fuel Tracker`
                  )}`}
                  style={{ ...S.btn('rgba(99,102,241,0.7)'), padding: '0.5rem 1rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                >
                  ✉ Email my code
                </a>
              </div>
              <div className="ft-settings-danger">
                <button type="button" onClick={handleDeleteAll}
                  style={{ ...S.btn('#f87171'), padding: '0.5rem 1rem' }}>
                  🗑 Delete All My Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '1.5rem' }}>

        {/* ── No vehicles found — recovery state ───────────────────────── */}
        {vehicles.length === 0 && !dataLoading && (
          <div style={{ ...S.card, textAlign: 'center', padding: '2.5rem 1.5rem', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>🚗</p>
            <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--ndl-text)', marginBottom: '0.5rem' }}>No vehicles found</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--ndl-faint)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              Your sync code is valid but no vehicles are saved yet — or they may have been saved under a different code.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button type="button"
                onClick={() => userCode && fetchVehicles(userCode, Boolean(user))}
                style={{ ...S.btnFill('#f59e0b'), padding: '0.5rem 1.25rem', fontSize: '0.75rem' }}>
                Retry
              </button>
              <button type="button"
                onClick={() => { setShowAddVehicle(true); setStep('vehicle_setup'); }}
                style={{ ...S.btn('rgba(255,255,255,0.2)'), padding: '0.5rem 1.25rem', fontSize: '0.75rem' }}>
                + Add Vehicle
              </button>
            </div>
          </div>
        )}

        {/* ── Vehicle switcher ──────────────────────────────────────────── */}
        {vehicles.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.5rem' }}>
          {vehicles.map(v => (
            <button key={v.id} type="button"
              onClick={() => setActiveVehicleId(v.id)}
              style={{
                padding: '0.375rem 0.875rem', cursor: 'pointer', borderRadius: 0,
                border: v.id === activeVehicleId ? '1px solid #f59e0b' : '1px solid var(--ndl-border)',
                background: v.id === activeVehicleId ? 'rgba(245,158,11,0.1)' : 'transparent',
                color: v.id === activeVehicleId ? '#f59e0b' : 'var(--ndl-muted)',
                fontSize: '0.8125rem', fontWeight: 600,
              }}>
              {v.nickname || `${v.make} ${v.model}`}
              {v.year ? ` (${v.year})` : ''}
            </button>
          ))}
          <button type="button"
            onClick={() => { setShowAddVehicle(true); setStep('vehicle_setup'); }}
            style={{ ...S.btn('rgba(255,255,255,0.2)'), padding: '0.375rem 0.875rem', fontSize: '0.6875rem' }}>
            + Add Vehicle
          </button>
        </div>
        )}

        {/* ── Vehicle info ──────────────────────────────────────────────── */}
        {(() => {
          const v = vehicles.find(vv => vv.id === activeVehicleId);
          if (!v) return null;
          return (
            <p style={{ fontSize: '0.75rem', color: 'var(--ndl-faint)', marginBottom: '1.25rem' }}>
              {v.make} {v.model}{v.year ? ` · ${v.year}` : ''} · {v.fuel_type}
              {fills.length > 0 && ` · ${fills.length} fill${fills.length > 1 ? 's' : ''} logged`}
            </p>
          );
        })()}

        {/* ── Stats grid ───────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.07)', marginBottom: '1px' }}>
          {[
            { label: 'Avg L/100km', value: avgL100 ? fmt(avgL100) : '—', accent: '#f59e0b' },
            { label: 'Avg km/L', value: avgKmpl ? fmt(avgKmpl) : '—', accent: '#f59e0b' },
            { label: 'Best Efficiency', value: bestL100 ? `${fmt(bestL100)} L/100` : '—', accent: '#4ade80' },
            { label: 'Total Spent', value: totalSpend > 0 ? fmtCurrency(currency.symbol, totalSpend) : '—', accent: 'var(--ndl-muted)' },
            { label: 'Total Litres', value: totalLitres > 0 ? `${fmt(totalLitres)} L` : '—', accent: 'var(--ndl-muted)' },
            { label: 'Total KM Tracked', value: totalKm > 0 ? `${Math.round(totalKm).toLocaleString()} km` : '—', accent: 'var(--ndl-muted)' },
            { label: 'Cost per km', value: avgCostKm ? fmtCurrency(currency.symbol, avgCostKm) : '—', accent: 'var(--ndl-muted)' },
            { label: 'Worst Efficiency', value: worstL100 ? `${fmt(worstL100)} L/100` : '—', accent: '#f87171' },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'var(--ndl-surface)', padding: '1rem 1.25rem' }}>
              <p style={{ ...S.label, marginBottom: '0.375rem' }}>{stat.label}</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 800, color: stat.accent, margin: 0, letterSpacing: '-0.01em' }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Data loading skeleton ─────────────────────────────────────── */}
        {dataLoading && fills.length === 0 && (
          <>
            <div style={{ background: 'var(--ndl-surface)', border: '1px solid var(--ndl-border)', padding: '1.25rem', marginBottom: '1px' }}>
              <div className="ndl-skeleton" style={{ width: '60px', height: '10px', marginBottom: '1rem' }} />
              <div className="ndl-skeleton" style={{ width: '100%', height: '180px', borderRadius: '4px' }} />
            </div>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ background: 'var(--ndl-surface)', border: '1px solid var(--ndl-border)', padding: '1rem', marginBottom: '1px', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <div className="ndl-skeleton" style={{ width: '80px', height: '10px' }} />
                  <div className="ndl-skeleton" style={{ width: '150px', height: '14px' }} />
                </div>
                <div className="ndl-skeleton" style={{ width: '55px', height: '14px' }} />
                <div className="ndl-skeleton" style={{ width: '55px', height: '14px' }} />
              </div>
            ))}
          </>
        )}

        {/* ── Chart section ─────────────────────────────────────────────── */}
        {fills.length > 0 && (
          <div style={{ ...S.card, marginBottom: '1px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <p style={S.label}>Chart</p>
              <div style={{ display: 'flex', gap: '1px', background: 'rgba(255,255,255,0.07)' }}>
                {(['efficiency', 'spend'] as const).map(c => (
                  <button key={c} type="button" onClick={() => setActiveChart(c)}
                    style={{
                      padding: '0.25rem 0.75rem', cursor: 'pointer', border: 'none',
                      background: activeChart === c ? '#f59e0b' : 'transparent',
                      color: activeChart === c ? '#0f172a' : '#64748b',
                      fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>
                    {c === 'efficiency' ? 'L/100km' : 'Total Spend'}
                  </button>
                ))}
              </div>
            </div>
            {/* Auto-fall back to spend chart when efficiency has insufficient data */}
            {(activeChart === 'efficiency' && efficiencyPoints.length < 2)
              ? <LineChart points={spendPoints} color="#4ade80" yLabel={currency.code} />
              : activeChart === 'efficiency'
                ? <LineChart points={efficiencyPoints} color="#f59e0b" yLabel="L/100km" />
                : <LineChart points={spendPoints} color="#4ade80" yLabel={currency.code} />
            }
          </div>
        )}

        {/* ── Add fill button / form ────────────────────────────────────── */}
        {!showAddFill ? (
          <div style={{ marginBottom: '1px' }}>
            <button type="button" onClick={() => setShowAddFill(true)}
              style={{ ...S.btnFill('#f59e0b'), width: '100%', padding: '0.875rem', fontSize: '0.8125rem' }}>
              + Add Fill-Up
            </button>
          </div>
        ) : (
          <div style={{ ...S.card, marginBottom: '1px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <p style={{ ...S.label, color: '#f59e0b' }}>New Fill-Up</p>
              <button type="button" onClick={() => { setShowAddFill(false); setFillError(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--ndl-faint)', cursor: 'pointer', fontSize: '0.875rem' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <InputField label="Date" type="date" value={fillDate} onChange={e => setFillDate(e.target.value)} />
              <InputField label="Odometer (km)" type="number" placeholder="e.g. 45320" value={fillOdo} onChange={e => setFillOdo(e.target.value)} min="0" step="0.1" />
              <InputField label="Litres pumped" type="number" placeholder="e.g. 42.5" value={fillLitres} onChange={e => setFillLitres(e.target.value)} min="0" step="0.01" />
              <InputField label={`Price per litre (${currency.symbol})`} type="number" placeholder="e.g. 2.19" value={fillPrice} onChange={e => setFillPrice(e.target.value)} min="0" step="0.001" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <InputField label="Notes (optional)" placeholder="e.g. Before highway trip" value={fillNotes} onChange={e => setFillNotes(e.target.value)} />
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.625rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--ndl-muted)', paddingBottom: '0.5rem' }}>
                  <input type="checkbox" checked={fillPartial} onChange={e => setFillPartial(e.target.checked)}
                    style={{ width: '14px', height: '14px', accentColor: '#f59e0b' }} />
                  Partial fill (exclude from efficiency)
                </label>
              </div>
            </div>
            {/* Quick calc preview */}
            {fillLitres && fillPrice && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--ndl-faint)', marginBottom: '0.75rem' }}>
                Total cost: <strong style={{ color: 'var(--ndl-text)' }}>{fmtCurrency(currency.symbol, parseFloat(fillLitres || '0') * parseFloat(fillPrice || '0'))}</strong>
              </p>
            )}
            {fillError && <p style={{ fontSize: '0.75rem', color: '#f87171', marginBottom: '0.75rem' }}>{fillError}</p>}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" onClick={handleAddFill} disabled={fillLoading}
                style={{ ...S.btnFill('#f59e0b'), flex: 1, opacity: fillLoading ? 0.6 : 1 }}>
                {fillLoading ? 'Saving…' : 'Save Fill-Up'}
              </button>
              <button type="button" onClick={() => { setShowAddFill(false); setFillError(''); }}
                style={{ ...S.btn('rgba(255,255,255,0.2)'), padding: '0.625rem 1rem' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Fill history table ────────────────────────────────────────── */}
        {fillStats.length > 0 && (
          <div style={{ ...S.card, overflowX: 'auto' }}>
            <p style={{ ...S.label, marginBottom: '0.875rem', color: '#f59e0b' }}>Fill History</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--ndl-border)' }}>
                  {['Date', 'Odometer', 'Distance', 'Litres', `${currency.symbol}/L`, 'Total', 'L/100km', 'km/L', 'Cost/km', ''].map(h => (
                    <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ndl-faint)', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...fillStats].reverse().map(s => (
                  <tr key={s.fill.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.625rem 0.75rem', color: 'var(--ndl-muted)', whiteSpace: 'nowrap', textAlign: 'right' }}>
                      {fmtDate(s.fill.fill_date)}
                      {s.fill.is_partial && <span style={{ fontSize: '0.6rem', color: '#f59e0b', marginLeft: '0.375rem' }}>PARTIAL</span>}
                      {s.fill.notes && <div style={{ fontSize: '0.6875rem', color: 'var(--ndl-faint)' }}>{s.fill.notes}</div>}
                    </td>
                    <td style={{ padding: '0.625rem 0.75rem', color: 'var(--ndl-text)', textAlign: 'right', whiteSpace: 'nowrap' }}>{s.fill.odometer.toLocaleString()}</td>
                    <td style={{ padding: '0.625rem 0.75rem', color: 'var(--ndl-muted)', textAlign: 'right' }}>{s.distance ? `${Math.round(s.distance)} km` : (s.isFirst ? 'First' : '—')}</td>
                    <td style={{ padding: '0.625rem 0.75rem', color: 'var(--ndl-text)', textAlign: 'right' }}>{fmt(s.fill.litres)} L</td>
                    <td style={{ padding: '0.625rem 0.75rem', color: 'var(--ndl-muted)', textAlign: 'right' }}>{fmt(s.fill.price_per_litre, 3)}</td>
                    <td style={{ padding: '0.625rem 0.75rem', color: 'var(--ndl-text)', textAlign: 'right', whiteSpace: 'nowrap' }}>{fmtCurrency(currency.symbol, s.totalCost)}</td>
                    <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right', color: s.l100km ? (s.l100km <= (bestL100 ?? Infinity) * 1.05 ? '#4ade80' : s.l100km >= (worstL100 ?? 0) * 0.95 ? '#f87171' : 'var(--ndl-text)') : 'var(--ndl-faint)', fontWeight: s.l100km ? 700 : 400 }}>
                      {s.l100km ? fmt(s.l100km) : '—'}
                    </td>
                    <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right', color: 'var(--ndl-muted)' }}>{s.kmpl ? fmt(s.kmpl) : '—'}</td>
                    <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right', color: 'var(--ndl-muted)', whiteSpace: 'nowrap' }}>{s.costPerKm ? fmtCurrency(currency.symbol, s.costPerKm) : '—'}</td>
                    <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right' }}>
                      <button type="button" onClick={() => handleDeleteFill(s.fill.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--ndl-faint)', cursor: 'pointer', fontSize: '0.875rem', padding: '0' }}>
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="button" onClick={exportCSV} style={{ ...S.btn('#4ade80'), padding: '0.375rem 0.875rem', fontSize: '0.6875rem' }}>
                ↓ Export CSV
              </button>
            </div>
          </div>
        )}

        {/* ── Empty state ───────────────────────────────────────────────── */}
        {fills.length === 0 && !dataLoading && (
          <div style={{ ...S.card, textAlign: 'center', padding: '3rem 1.5rem' }}>
            <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⛽</p>
            <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--ndl-text)', marginBottom: '0.375rem' }}>No fill-ups yet</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--ndl-faint)' }}>Add your first fill-up to start tracking efficiency and cost.</p>
          </div>
        )}
      </div>

      {/* ── Add vehicle modal (overlay when in main view) ─────────────── */}
      {step === 'vehicle_setup' && showAddVehicle && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,10,20,0.8)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={() => { setShowAddVehicle(false); setStep('main'); }}>
          <div style={{ background: 'var(--ndl-surface)', border: '1px solid var(--ndl-border)', padding: '2rem', maxWidth: '420px', width: '100%' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--ndl-text)', margin: 0 }}>Add Vehicle</h2>
              <button type="button" onClick={() => { setShowAddVehicle(false); setStep('main'); }}
                style={{ background: 'none', border: 'none', color: 'var(--ndl-faint)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
            </div>
            <VehicleForm
              make={vMake} setMake={setVMake}
              model={vModel} setModel={setVModel}
              year={vYear} setYear={setVYear}
              fuelType={vFuelType} setFuelType={setVFuelType}
              nickname={vNickname} setNickname={setVNickname}
              error={vehicleError} loading={vehicleLoading}
              onSubmit={handleCreateVehicle}
              submitLabel="Save Vehicle"
              accentColor="#4ade80"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Vehicle form (reused in setup + modal) ────────────────────────────────────
function VehicleForm({
  make, setMake, model, setModel, year, setYear,
  fuelType, setFuelType, nickname, setNickname,
  error, loading, onSubmit, submitLabel, accentColor,
}: {
  make: string; setMake: (v: string) => void;
  model: string; setModel: (v: string) => void;
  year: string; setYear: (v: string) => void;
  fuelType: string; setFuelType: (v: string) => void;
  nickname: string; setNickname: (v: string) => void;
  error: string; loading: boolean;
  onSubmit: () => void;
  submitLabel: string;
  accentColor: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <InputField label="Make *" placeholder="e.g. Toyota" value={make} onChange={e => setMake(e.target.value)} />
        <InputField label="Model *" placeholder="e.g. Prius" value={model} onChange={e => setModel(e.target.value)} />
        <InputField label="Year" placeholder="e.g. 2021" value={year} onChange={e => setYear(e.target.value)} type="number" min="1900" max={new Date().getFullYear() + 1} />
        <SelectField label="Fuel Type" value={fuelType} onChange={e => setFuelType(e.target.value)}>
          {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
        </SelectField>
      </div>
      <InputField label="Nickname (optional)" placeholder='e.g. "Daily Driver", "BluePrius"' value={nickname} onChange={e => setNickname(e.target.value)} />
      {error && <p style={{ fontSize: '0.75rem', color: '#f87171', margin: 0 }}>{error}</p>}
      <button
        type="button" onClick={onSubmit} disabled={loading}
        style={{
          background: accentColor, border: 'none', color: '#0f172a',
          padding: '0.75rem', cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.07em',
          textTransform: 'uppercase', borderRadius: 0,
          opacity: loading ? 0.6 : 1,
        }}>
        {loading ? 'Saving…' : submitLabel}
      </button>
    </div>
  );
}
