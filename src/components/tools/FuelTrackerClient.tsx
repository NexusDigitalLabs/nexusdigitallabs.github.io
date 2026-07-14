'use client';

import { useState, useEffect, useCallback } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number | null;
  fuel_type: string;
  nickname: string | null;
}

interface FillUp {
  id: string;
  vehicle_id: string;
  fill_date: string;
  odometer: number;
  litres: number;
  price_per_litre: number;
  is_partial: boolean;
  notes: string | null;
}

interface FillStats {
  fill: FillUp;
  distance: number | null;
  l100km: number | null;
  kmpl: number | null;
  totalCost: number;
  costPerKm: number | null;
  isFirst: boolean;
}

const CURRENCIES = [
  { code: 'USD', symbol: '$' }, { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' }, { code: 'AUD', symbol: 'A$' },
  { code: 'LKR', symbol: 'Rs' }, { code: 'INR', symbol: '₹' },
  { code: 'SGD', symbol: 'S$' }, { code: 'CAD', symbol: 'C$' },
  { code: 'JPY', symbol: '¥' },
];

const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'LPG'];

// ── Helpers ───────────────────────────────────────────────────────────────────
function genCode(nickname: string): string {
  const clean = nickname.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20) || 'mygarage';
  const suffix = Math.random().toString(36).slice(2, 6);
  // Normalise to lowercase so the code is case-insensitive on re-entry
  return `${clean}-${suffix}`.toLowerCase();
}

function normaliseCode(raw: string): string {
  return raw.trim().toLowerCase();
}

function fmt(n: number, dp = 2) { return n.toFixed(dp); }
function fmtCurrency(sym: string, n: number) { return `${sym}${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function fmtDate(d: string) { return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }); }

function computeStats(fills: FillUp[]): FillStats[] {
  const sorted = [...fills].sort((a, b) =>
    new Date(a.fill_date).getTime() - new Date(b.fill_date).getTime() ||
    a.odometer - b.odometer
  );
  return sorted.map((fill, i) => {
    const totalCost = fill.litres * fill.price_per_litre;
    if (i === 0) return { fill, distance: null, l100km: null, kmpl: null, totalCost, costPerKm: null, isFirst: true };
    if (fill.is_partial) return { fill, distance: null, l100km: null, kmpl: null, totalCost, costPerKm: null, isFirst: false };
    const dist = fill.odometer - sorted[i - 1].odometer;
    if (dist <= 0) return { fill, distance: null, l100km: null, kmpl: null, totalCost, costPerKm: null, isFirst: false };
    return {
      fill, distance: dist,
      l100km: (fill.litres / dist) * 100,
      kmpl: dist / fill.litres,
      totalCost,
      costPerKm: totalCost / dist,
      isFirst: false,
    };
  });
}

// ── SVG Line Chart ────────────────────────────────────────────────────────────
function LineChart({ points, color, yLabel }: {
  points: { x: string; y: number }[];
  color: string;
  yLabel: string;
}) {
  if (points.length < 2) {
    return (
      <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '0.8125rem', color: '#475569' }}>Add at least 2 full fill-ups to see the chart</p>
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
              fontSize={10} fill="#475569">{fmt(y, 1)}</text>
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
          <text key={i} x={scaleX(i)} y={H - 6} textAnchor="middle" fontSize={9} fill="#475569">
            {p.x}
          </text>
        );
      })}

      {/* Y axis label */}
      <text
        x={10} y={H / 2}
        textAnchor="middle" fontSize={9} fill="#475569"
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
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#f8fafc', padding: '0.5rem 0.75rem',
  fontSize: '0.875rem', outline: 'none', borderRadius: 0,
};

function InputField({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <label style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b' }}>
        {label}
      </label>
      <input
        {...props}
        style={{ ...inputStyle, ...(props.style || {}) }}
        onFocus={e => (e.currentTarget.style.borderColor = '#f8fafc')}
        onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
      />
    </div>
  );
}

function SelectField({ label, children, ...props }: { label: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <label style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b' }}>
        {label}
      </label>
      <select
        {...props}
        style={{ ...inputStyle, ...(props.style || {}), appearance: 'none' }}
        onFocus={e => (e.currentTarget.style.borderColor = '#f8fafc')}
        onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
      >
        {children}
      </select>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
type Step = 'loading' | 'onboarding' | 'vehicle_setup' | 'main';

export default function FuelTrackerClient() {
  const [step, setStep] = useState<Step>('loading');
  const [userCode, setUserCode] = useState<string | null>(null);
  const [currencyCode, setCurrencyCode] = useState('USD');
  const currency = CURRENCIES.find(c => c.code === currencyCode) ?? CURRENCIES[0];

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

  // chart
  const [activeChart, setActiveChart] = useState<'efficiency' | 'spend'>('efficiency');

  // ── Fetch vehicles (only called explicitly, never reactively on userCode change)
  const fetchVehicles = useCallback(async (code: string) => {
    setDataLoading(true);
    try {
      const res = await fetch(`/api/fuel?code=${encodeURIComponent(code)}&resource=vehicles`);
      const json = await res.json();
      if (json.data && json.data.length > 0) {
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

  // ── Init — only runs once on mount ────────────────────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ndl_fuel_code');
      const code = stored ? normaliseCode(stored) : null;
      const cur = localStorage.getItem('ndl_fuel_currency');
      if (cur) setCurrencyCode(cur);
      if (code) {
        setUserCode(code);
        // Explicitly fetch for returning users only
        fetchVehicles(code);
      } else {
        setStep('onboarding');
      }
    } catch {
      setStep('onboarding');
    }
  // fetchVehicles is stable (useCallback with []) — safe to include
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // ── Onboarding ────────────────────────────────────────────────────────────
  function handleStartNew() {
    if (!nicknameInput.trim()) { setOnboardError('Enter a nickname first'); return; }
    setOnboardError('');
    const code = genCode(nicknameInput.trim());
    try { localStorage.setItem('ndl_fuel_code', code); } catch { /* ignore */ }
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
      if (json.data) {
        try { localStorage.setItem('ndl_fuel_code', code); } catch { /* ignore */ }
        setUserCode(code);
        // Navigate directly — don't rely on a reactive useEffect
        if (json.data.length > 0) {
          setVehicles(json.data);
          setActiveVehicleId(json.data[0].id);
          setStep('main');
        } else {
          setStep('vehicle_setup');
        }
      } else {
        setOnboardError('No data found for that code. Double-check and try again.');
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
        setVehicleError(json.error ?? 'Failed to save vehicle');
      }
    } catch {
      setVehicleError('Could not connect. Please try again.');
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
        setFillError(json.error ?? 'Failed to save fill-up');
      }
    } catch {
      setFillError('Could not connect. Please try again.');
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
      try { localStorage.removeItem('ndl_fuel_code'); } catch { /* ignore */ }
      setUserCode(null); setVehicles([]); setFills([]);
      setStep('onboarding');
      setShowSettings(false);
    } catch { /* ignore */ }
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
    card: { background: '#0d1117', border: '1px solid rgba(255,255,255,0.07)', padding: '1rem' } as React.CSSProperties,
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
    label: { fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#475569', marginBottom: '0.25rem' } as React.CSSProperties,
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: Loading
  // ─────────────────────────────────────────────────────────────────────────
  if (step === 'loading') {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#475569', fontSize: '0.875rem' }}>Loading your garage…</p>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: Onboarding
  // ─────────────────────────────────────────────────────────────────────────
  if (step === 'onboarding') {
    return (
      <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: '#0b0f19' }}>
        <div style={{ maxWidth: '420px', width: '100%' }}>
          {/* Header */}
          <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#f59e0b', marginBottom: '0.5rem' }}>
            NexusDigitalLabs
          </p>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Fuel Tracker
          </h1>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '2rem', lineHeight: 1.6 }}>
            Track fuel costs, efficiency, and mileage across all your vehicles. Data syncs across devices via a personal code — no account needed.
          </p>

          {/* Toggle */}
          <div style={{ display: 'flex', gap: '1px', background: 'rgba(255,255,255,0.07)', marginBottom: '1.5rem' }}>
            {(['new', 'existing'] as const).map(m => (
              <button key={m} type="button" onClick={() => { setOnboardMode(m); setOnboardError(''); }}
                style={{
                  flex: 1, padding: '0.625rem', cursor: 'pointer', border: 'none',
                  background: onboardMode === m ? '#f59e0b' : 'transparent',
                  color: onboardMode === m ? '#0f172a' : '#94a3b8',
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
              <p style={{ fontSize: '0.75rem', color: '#475569', margin: 0 }}>
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
  // RENDER: Vehicle Setup
  // ─────────────────────────────────────────────────────────────────────────
  if (step === 'vehicle_setup' && !showAddVehicle) {
    return (
      <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: '#0b0f19' }}>
        <div style={{ maxWidth: '440px', width: '100%' }}>
          <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4ade80', marginBottom: '0.5rem' }}>
            Step 2 of 2
          </p>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.375rem', letterSpacing: '-0.02em' }}>
            Add your first vehicle
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '2rem', lineHeight: 1.6 }}>
            Your sync code is <strong style={{ color: '#f8fafc' }}>{userCode}</strong>. Save it — you&apos;ll need it to access your data on other devices.
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
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: Main view
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: '#0b0f19', minHeight: '100vh' }}>

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: '#0b0f19' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <p style={{ ...S.label, color: '#f59e0b' }}>NexusDigitalLabs</p>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>
              Fuel Tracker
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <select
              value={currencyCode}
              onChange={e => { setCurrencyCode(e.target.value); try { localStorage.setItem('ndl_fuel_currency', e.target.value); } catch { /* ignore */ } }}
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
        <div style={{ background: '#0d1117', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '1.25rem 1.5rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-end' }}>
              <div>
                <p style={S.label}>Your Sync Code</p>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <code style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f59e0b', letterSpacing: '0.05em' }}>{userCode}</code>
                  <button type="button" onClick={copyCode}
                    style={{ ...S.btn(codeCopied ? '#4ade80' : 'rgba(255,255,255,0.2)'), padding: '0.25rem 0.625rem', fontSize: '0.6875rem' }}>
                    {codeCopied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <p style={{ fontSize: '0.6875rem', color: '#475569', marginTop: '0.25rem' }}>
                  Enter this code on any device to access your data.
                </p>
              </div>
              <button type="button" onClick={exportCSV}
                style={{ ...S.btn('#4ade80'), padding: '0.375rem 0.875rem' }}>
                ↓ Export CSV
              </button>
              <button type="button" onClick={handleDeleteAll}
                style={{ ...S.btn('#f87171'), padding: '0.375rem 0.875rem', marginLeft: 'auto' }}>
                Delete All My Data
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '1.5rem' }}>

        {/* ── Vehicle switcher ──────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.5rem' }}>
          {vehicles.map(v => (
            <button key={v.id} type="button"
              onClick={() => setActiveVehicleId(v.id)}
              style={{
                padding: '0.375rem 0.875rem', cursor: 'pointer', borderRadius: 0,
                border: v.id === activeVehicleId ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                background: v.id === activeVehicleId ? 'rgba(245,158,11,0.1)' : 'transparent',
                color: v.id === activeVehicleId ? '#f59e0b' : '#94a3b8',
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

        {/* ── Vehicle info ──────────────────────────────────────────────── */}
        {(() => {
          const v = vehicles.find(vv => vv.id === activeVehicleId);
          if (!v) return null;
          return (
            <p style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '1.25rem' }}>
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
            { label: 'Total Spent', value: totalSpend > 0 ? fmtCurrency(currency.symbol, totalSpend) : '—', accent: '#94a3b8' },
            { label: 'Total Litres', value: totalLitres > 0 ? `${fmt(totalLitres)} L` : '—', accent: '#94a3b8' },
            { label: 'Total KM Tracked', value: totalKm > 0 ? `${Math.round(totalKm).toLocaleString()} km` : '—', accent: '#94a3b8' },
            { label: 'Cost per km', value: avgCostKm ? fmtCurrency(currency.symbol, avgCostKm) : '—', accent: '#94a3b8' },
            { label: 'Worst Efficiency', value: worstL100 ? `${fmt(worstL100)} L/100` : '—', accent: '#f87171' },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#0d1117', padding: '1rem 1.25rem' }}>
              <p style={{ ...S.label, marginBottom: '0.375rem' }}>{stat.label}</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 800, color: stat.accent, margin: 0, letterSpacing: '-0.01em' }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

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
            {activeChart === 'efficiency'
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
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.875rem' }}>✕</button>
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
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8125rem', color: '#94a3b8', paddingBottom: '0.5rem' }}>
                  <input type="checkbox" checked={fillPartial} onChange={e => setFillPartial(e.target.checked)}
                    style={{ width: '14px', height: '14px', accentColor: '#f59e0b' }} />
                  Partial fill (exclude from efficiency)
                </label>
              </div>
            </div>
            {/* Quick calc preview */}
            {fillLitres && fillPrice && (
              <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '0.75rem' }}>
                Total cost: <strong style={{ color: '#f8fafc' }}>{fmtCurrency(currency.symbol, parseFloat(fillLitres || '0') * parseFloat(fillPrice || '0'))}</strong>
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
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {['Date', 'Odometer', 'Distance', 'Litres', `${currency.symbol}/L`, 'Total', 'L/100km', 'km/L', 'Cost/km', ''].map(h => (
                    <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...fillStats].reverse().map(s => (
                  <tr key={s.fill.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.625rem 0.75rem', color: '#94a3b8', whiteSpace: 'nowrap', textAlign: 'right' }}>
                      {fmtDate(s.fill.fill_date)}
                      {s.fill.is_partial && <span style={{ fontSize: '0.6rem', color: '#f59e0b', marginLeft: '0.375rem' }}>PARTIAL</span>}
                      {s.fill.notes && <div style={{ fontSize: '0.6875rem', color: '#475569' }}>{s.fill.notes}</div>}
                    </td>
                    <td style={{ padding: '0.625rem 0.75rem', color: '#f8fafc', textAlign: 'right', whiteSpace: 'nowrap' }}>{s.fill.odometer.toLocaleString()}</td>
                    <td style={{ padding: '0.625rem 0.75rem', color: '#94a3b8', textAlign: 'right' }}>{s.distance ? `${Math.round(s.distance)} km` : (s.isFirst ? 'First' : '—')}</td>
                    <td style={{ padding: '0.625rem 0.75rem', color: '#f8fafc', textAlign: 'right' }}>{fmt(s.fill.litres)} L</td>
                    <td style={{ padding: '0.625rem 0.75rem', color: '#94a3b8', textAlign: 'right' }}>{fmt(s.fill.price_per_litre, 3)}</td>
                    <td style={{ padding: '0.625rem 0.75rem', color: '#f8fafc', textAlign: 'right', whiteSpace: 'nowrap' }}>{fmtCurrency(currency.symbol, s.totalCost)}</td>
                    <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right', color: s.l100km ? (s.l100km <= (bestL100 ?? Infinity) * 1.05 ? '#4ade80' : s.l100km >= (worstL100 ?? 0) * 0.95 ? '#f87171' : '#f8fafc') : '#475569', fontWeight: s.l100km ? 700 : 400 }}>
                      {s.l100km ? fmt(s.l100km) : '—'}
                    </td>
                    <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right', color: '#94a3b8' }}>{s.kmpl ? fmt(s.kmpl) : '—'}</td>
                    <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right', color: '#94a3b8', whiteSpace: 'nowrap' }}>{s.costPerKm ? fmtCurrency(currency.symbol, s.costPerKm) : '—'}</td>
                    <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right' }}>
                      <button type="button" onClick={() => handleDeleteFill(s.fill.id)}
                        style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '0.875rem', padding: '0' }}>
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
            <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.375rem' }}>No fill-ups yet</p>
            <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>Add your first fill-up to start tracking efficiency and cost.</p>
          </div>
        )}
      </div>

      {/* ── Add vehicle modal (overlay when in main view) ─────────────── */}
      {step === 'vehicle_setup' && showAddVehicle && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,10,20,0.8)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={() => { setShowAddVehicle(false); setStep('main'); }}>
          <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', padding: '2rem', maxWidth: '420px', width: '100%' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>Add Vehicle</h2>
              <button type="button" onClick={() => { setShowAddVehicle(false); setStep('main'); }}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
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
