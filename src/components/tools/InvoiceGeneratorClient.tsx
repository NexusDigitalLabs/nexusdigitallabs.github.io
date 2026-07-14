'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Script from 'next/script';
import CloudDraftBar from '@/components/CloudDraftBar';
import { useCloudToolDraft } from '@/hooks/useCloudToolDraft';

// ── Constants ──────────────────────────────────────────────────────────────────
const SYM: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', AUD: 'A$',
  CAD: 'C$', LKR: 'Rs.\u00a0', SGD: 'S$', AED: '\u062f.\u0625\u00a0',
};

const CURRENCIES = [
  { value: 'USD', label: 'USD — $' },
  { value: 'EUR', label: 'EUR — €' },
  { value: 'GBP', label: 'GBP — £' },
  { value: 'AUD', label: 'AUD — A$' },
  { value: 'CAD', label: 'CAD — C$' },
  { value: 'LKR', label: 'LKR — Rs.' },
  { value: 'SGD', label: 'SGD — S$' },
  { value: 'AED', label: 'AED — د.إ' },
];

// ── Types ──────────────────────────────────────────────────────────────────────
interface LineItem {
  id: number;
  desc: string;
  qty: number;
  rate: number;
}

type Html2PdfInstance = {
  set: (opts: object) => Html2PdfInstance;
  from: (el: HTMLElement) => Html2PdfInstance;
  save: () => Promise<void>;
};

// ── Pure helpers ───────────────────────────────────────────────────────────────
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(iso: string, n: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function fmtDate(iso: string) {
  if (!iso) return '—';
  const [y, m, day] = iso.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[+m - 1]} ${+day}, ${y}`;
}

function autoInvoiceNum() {
  const d = new Date();
  return `INV-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}-001`;
}

function fmtMoney(n: number, sym: string) {
  return sym + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function calcTotals(items: LineItem[], discountPct: number, taxPct: number) {
  const sub = items.reduce((s, i) => s + (i.qty || 0) * (i.rate || 0), 0);
  const discAmt = sub * (discountPct / 100);
  const taxAmt = (sub - discAmt) * (taxPct / 100);
  return { sub, discAmt, taxAmt, total: sub - discAmt + taxAmt };
}

// ── Subcomponent: form field label ─────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-[10.5px] font-medium tracking-wide uppercase mb-1"
      style={{ color: 'var(--ndl-muted)', letterSpacing: '0.03em' }}>
      {children}
    </span>
  );
}

// ── Subcomponent: dark form input ──────────────────────────────────────────────
const inputCls =
  'block w-full rounded-[7px] px-[11px] py-[7px] text-[12.5px] outline-none transition-colors font-[Inter,sans-serif] ndl-invoice-input';

// ── Subcomponent: Invoice preview (rendered as JSX, captured by html2pdf) ──────
interface InvoicePreviewProps {
  num: string;
  currency: string;
  date: string;
  due: string;
  issName: string;
  issEmail: string;
  issAddr: string;
  issWeb: string;
  cliName: string;
  cliContact: string;
  cliEmail: string;
  cliAddr: string;
  taxLabel: string;
  taxPct: number;
  discPct: number;
  bankName: string;
  bankAcctName: string;
  bankAcctNum: string;
  bankSwift: string;
  bankIban: string;
  notes: string;
  items: LineItem[];
  sym: string;
  totals: { sub: number; discAmt: number; taxAmt: number; total: number };
  innerRef: React.RefObject<HTMLDivElement | null>;
}

function InvoicePreview({
  num, currency, date, due,
  issName, issEmail, issAddr, issWeb,
  cliName, cliContact, cliEmail, cliAddr,
  taxLabel, taxPct, discPct,
  bankName, bankAcctName, bankAcctNum, bankSwift, bankIban,
  notes, items, sym, totals, innerRef,
}: InvoicePreviewProps) {
  const showBank = bankName || bankAcctNum || bankSwift;

  return (
    <div
      ref={innerRef}
      style={{
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        background: '#ffffff',
        color: '#111827',
        boxSizing: 'border-box',
        width: '794px',
        padding: '52px 48px 56px',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'linear-gradient(135deg,#2563eb,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>N</span>
          </div>
          <p style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: '0 0 3px' }}>{issName || 'Issuer'}</p>
          {issEmail && <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 2px' }}>{issEmail}</p>}
          {issAddr && <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 2px', whiteSpace: 'pre-line' }}>{issAddr}</p>}
          {issWeb && <p style={{ fontSize: '11px', color: '#2563eb', margin: '0' }}>{issWeb}</p>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '30px', fontWeight: 200, color: '#111827', letterSpacing: '-0.03em', margin: '0 0 10px' }}>INVOICE</p>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#111827', margin: '0 0 5px' }}>{num || 'INV-001'}</p>
          <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 2px' }}>Date&ensp;{fmtDate(date)}</p>
          <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 6px' }}>Due&ensp;&ensp;{fmtDate(due)}</p>
          <span style={{ fontSize: '10px', fontWeight: 600, color: '#374151', background: '#f3f4f6', padding: '3px 8px', borderRadius: '4px' }}>{currency}</span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: '#e5e7eb', marginBottom: '26px' }} />

      {/* Bill To */}
      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontSize: '8.5px', fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '8px' }}>Bill To</p>
        <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: '0 0 3px' }}>{cliName || 'Client'}</p>
        {cliContact && <p style={{ fontSize: '11px', color: '#374151', margin: '0 0 2px' }}>{cliContact}</p>}
        {cliEmail && <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 2px' }}>{cliEmail}</p>}
        {cliAddr && <p style={{ fontSize: '11px', color: '#6b7280', margin: '0', whiteSpace: 'pre-line' }}>{cliAddr}</p>}
      </div>

      {/* Line items table */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {[['Description','55%','left'],['Qty','12%','right'],['Rate','16%','right'],['Amount','17%','right']].map(([h, w, align]) => (
              <th key={h} style={{ fontSize: '8.5px', fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#6b7280', padding: '9px 10px', textAlign: align as 'left'|'right', borderBottom: '1.5px solid #e5e7eb', width: w }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const amt = (item.qty || 0) * (item.rate || 0);
            return (
              <tr key={item.id} style={{ pageBreakInside: 'avoid' }}>
                <td style={{ fontSize: '12px', color: '#1f2937', padding: '10px', borderBottom: '1px solid #f3f4f6' }}>{item.desc || '—'}</td>
                <td style={{ fontSize: '12px', color: '#374151', padding: '10px', borderBottom: '1px solid #f3f4f6', textAlign: 'right' }}>{item.qty}</td>
                <td style={{ fontSize: '12px', color: '#374151', padding: '10px', borderBottom: '1px solid #f3f4f6', textAlign: 'right' }}>{fmtMoney(item.rate, sym)}</td>
                <td style={{ fontSize: '12px', fontWeight: 500, color: '#111827', padding: '10px', borderBottom: '1px solid #f3f4f6', textAlign: 'right' }}>{fmtMoney(amt, sym)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '4px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td colSpan={3} style={{ fontSize: '11.5px', color: '#6b7280', padding: '7px 10px', textAlign: 'right' }}>Subtotal</td>
              <td style={{ fontSize: '11.5px', color: '#374151', padding: '7px 10px', textAlign: 'right', minWidth: '110px' }}>{fmtMoney(totals.sub, sym)}</td>
            </tr>
            {discPct > 0 && (
              <tr>
                <td colSpan={3} style={{ fontSize: '11px', color: '#9ca3af', padding: '5px 10px', textAlign: 'right' }}>Discount ({discPct}%)</td>
                <td style={{ fontSize: '11px', color: '#ef4444', padding: '5px 10px', textAlign: 'right' }}>−{fmtMoney(totals.discAmt, sym)}</td>
              </tr>
            )}
            {taxPct > 0 && (
              <tr>
                <td colSpan={3} style={{ fontSize: '11px', color: '#9ca3af', padding: '5px 10px', textAlign: 'right' }}>{taxLabel} ({taxPct}%)</td>
                <td style={{ fontSize: '11px', color: '#374151', padding: '5px 10px', textAlign: 'right' }}>{fmtMoney(totals.taxAmt, sym)}</td>
              </tr>
            )}
            <tr>
              <td colSpan={3} style={{ fontSize: '13.5px', fontWeight: 700, color: '#111827', padding: '11px 10px', textAlign: 'right', borderTop: '2px solid #111827' }}>Total Due</td>
              <td style={{ fontSize: '13.5px', fontWeight: 700, color: '#111827', padding: '11px 10px', textAlign: 'right', borderTop: '2px solid #111827' }}>{fmtMoney(totals.total, sym)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Bank details */}
      {showBank && (
        <div style={{ marginTop: '24px', padding: '14px 16px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '7px', pageBreakInside: 'avoid' }}>
          <p style={{ fontSize: '8.5px', fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '8px' }}>Bank Transfer Details</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
            {bankName && <BankCell label="Bank" value={bankName} />}
            {bankAcctName && <BankCell label="Account Name" value={bankAcctName} />}
            {bankAcctNum && <BankCell label="Account Number" value={bankAcctNum} mono />}
            {bankSwift && <BankCell label="SWIFT / BIC" value={bankSwift} mono />}
            {bankIban && (
              <div style={{ gridColumn: 'span 2' }}>
                <BankCell label="IBAN" value={bankIban} mono />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {notes && (
        <div style={{ marginTop: '20px', pageBreakInside: 'avoid' }}>
          <p style={{ fontSize: '8.5px', fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '8px' }}>Notes</p>
          <p style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.7', whiteSpace: 'pre-line' }}>{notes}</p>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: '44px', paddingTop: '14px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: '9.5px', color: '#d1d5db', margin: '0' }}>{issName}</p>
        <p style={{ fontSize: '9.5px', color: '#d1d5db', margin: '0' }}>{num || 'INV'}</p>
      </div>
    </div>
  );
}

function BankCell({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p style={{ fontSize: '8.5px', color: '#9ca3af', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>{label}</p>
      <p style={{ fontSize: '12px', color: '#111827', margin: '0', fontFamily: mono ? 'monospace' : undefined }}>{value}</p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function InvoiceGeneratorClient() {
  const t = todayISO();

  // Form state
  const [num, setNum] = useState(autoInvoiceNum());
  const [currency, setCurrency] = useState('USD');
  const [date, setDate] = useState(t);
  const [due, setDue] = useState(addDays(t, 30));
  const [issName, setIssName] = useState('NexusDigitalLabs — Software Studio');
  const [issEmail, setIssEmail] = useState('hello@nexusdigitallabs.dev');
  const [issAddr, setIssAddr] = useState('');
  const [issWeb, setIssWeb] = useState('nexusdigitallabs.dev');
  const [cliName, setCliName] = useState('');
  const [cliContact, setCliContact] = useState('');
  const [cliEmail, setCliEmail] = useState('');
  const [cliAddr, setCliAddr] = useState('');
  const [taxLabel, setTaxLabel] = useState('Tax');
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [bankName, setBankName] = useState('');
  const [bankAcctName, setBankAcctName] = useState('');
  const [bankAcctNum, setBankAcctNum] = useState('');
  const [bankSwift, setBankSwift] = useState('');
  const [bankIban, setBankIban] = useState('');
  const [notes, setNotes] = useState('Payment due within 30 days. Thank you for your business.');
  const [items, setItems] = useState<LineItem[]>([
    { id: 1, desc: 'Web Development Services', qty: 10, rate: 150 },
    { id: 2, desc: 'UI/UX Design', qty: 5, rate: 120 },
  ]);
  const [nextId, setNextId] = useState(3);
  const [isDownloading, setIsDownloading] = useState(false);

  type InvoiceDraft = {
    num: string;
    currency: string;
    date: string;
    due: string;
    issName: string;
    issEmail: string;
    issAddr: string;
    issWeb: string;
    cliName: string;
    cliContact: string;
    cliEmail: string;
    cliAddr: string;
    taxLabel: string;
    taxRate: number;
    discount: number;
    bankName: string;
    bankAcctName: string;
    bankAcctNum: string;
    bankSwift: string;
    bankIban: string;
    notes: string;
    items: LineItem[];
    nextId: number;
  };

  const getInvoicePayload = useCallback((): InvoiceDraft => ({
    num, currency, date, due,
    issName, issEmail, issAddr, issWeb,
    cliName, cliContact, cliEmail, cliAddr,
    taxLabel, taxRate, discount,
    bankName, bankAcctName, bankAcctNum, bankSwift, bankIban,
    notes, items, nextId,
  }), [
    num, currency, date, due,
    issName, issEmail, issAddr, issWeb,
    cliName, cliContact, cliEmail, cliAddr,
    taxLabel, taxRate, discount,
    bankName, bankAcctName, bankAcctNum, bankSwift, bankIban,
    notes, items, nextId,
  ]);

  const applyInvoicePayload = useCallback((payload: InvoiceDraft) => {
    if (typeof payload.num === 'string') setNum(payload.num);
    if (typeof payload.currency === 'string') setCurrency(payload.currency);
    if (typeof payload.date === 'string') setDate(payload.date);
    if (typeof payload.due === 'string') setDue(payload.due);
    if (typeof payload.issName === 'string') setIssName(payload.issName);
    if (typeof payload.issEmail === 'string') setIssEmail(payload.issEmail);
    if (typeof payload.issAddr === 'string') setIssAddr(payload.issAddr);
    if (typeof payload.issWeb === 'string') setIssWeb(payload.issWeb);
    if (typeof payload.cliName === 'string') setCliName(payload.cliName);
    if (typeof payload.cliContact === 'string') setCliContact(payload.cliContact);
    if (typeof payload.cliEmail === 'string') setCliEmail(payload.cliEmail);
    if (typeof payload.cliAddr === 'string') setCliAddr(payload.cliAddr);
    if (typeof payload.taxLabel === 'string') setTaxLabel(payload.taxLabel);
    if (typeof payload.taxRate === 'number') setTaxRate(payload.taxRate);
    if (typeof payload.discount === 'number') setDiscount(payload.discount);
    if (typeof payload.bankName === 'string') setBankName(payload.bankName);
    if (typeof payload.bankAcctName === 'string') setBankAcctName(payload.bankAcctName);
    if (typeof payload.bankAcctNum === 'string') setBankAcctNum(payload.bankAcctNum);
    if (typeof payload.bankSwift === 'string') setBankSwift(payload.bankSwift);
    if (typeof payload.bankIban === 'string') setBankIban(payload.bankIban);
    if (typeof payload.notes === 'string') setNotes(payload.notes);
    if (Array.isArray(payload.items)) setItems(payload.items as LineItem[]);
    if (typeof payload.nextId === 'number') setNextId(payload.nextId);
  }, []);

  const cloudDraft = useCloudToolDraft({
    toolKey: 'invoice-generator',
    getPayload: getInvoicePayload,
    applyPayload: applyInvoicePayload,
  });

  useEffect(() => {
    cloudDraft.scheduleSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- autosave when form fields change
  }, [
    num, currency, date, due,
    issName, issEmail, issAddr, issWeb,
    cliName, cliContact, cliEmail, cliAddr,
    taxLabel, taxRate, discount,
    bankName, bankAcctName, bankAcctNum, bankSwift, bankIban,
    notes, items, nextId,
    cloudDraft.optIn, cloudDraft.scheduleSave,
  ]);

  const sym = SYM[currency] || '$';
  const totals = useMemo(() => calcTotals(items, discount, taxRate), [items, discount, taxRate]);

  // Refs for scaling
  const previewPaneRef = useRef<HTMLDivElement>(null);
  const invoiceSheetRef = useRef<HTMLDivElement>(null);
  const invoiceOuterRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (!previewPaneRef.current) return;
      const paneW = previewPaneRef.current.clientWidth - 48;
      setScale(Math.min(1, paneW / 794));
    };
    updateScale();
    const ro = new ResizeObserver(updateScale);
    if (previewPaneRef.current) ro.observe(previewPaneRef.current);
    return () => ro.disconnect();
  }, []);

  // Line item helpers
  const addItem = () => {
    setItems((prev) => [...prev, { id: nextId, desc: '', qty: 1, rate: 0 }]);
    setNextId((n) => n + 1);
  };

  const removeItem = (id: number) => setItems((prev) => prev.filter((i) => i.id !== id));

  const updateItem = (id: number, field: keyof LineItem, value: string | number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  };

  // PDF download
  const handleDownload = useCallback(async () => {
    if (!invoiceSheetRef.current) return;
    const w = window as Window & { html2pdf?: () => Html2PdfInstance };
    if (!w.html2pdf) {
      alert('PDF engine is still loading. Please wait a moment and try again.');
      return;
    }
    setIsDownloading(true);

    // Temporarily reset scale for clean PDF capture
    const sheetEl = invoiceSheetRef.current;
    const outerEl = invoiceOuterRef.current;
    const savedTransform = sheetEl.style.transform;
    sheetEl.style.transform = '';
    if (outerEl) { outerEl.style.width = '794px'; outerEl.style.height = `${sheetEl.offsetHeight}px`; }

    const filename = `invoice-${(num || 'NDL').replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase()}.pdf`;

    try {
      await w.html2pdf()
        .set({
          margin: [15, 12, 15, 12],
          filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(sheetEl)
        .save();
    } finally {
      sheetEl.style.transform = savedTransform;
      if (outerEl) {
        const natH = sheetEl.offsetHeight;
        outerEl.style.width = `${Math.round(794 * scale)}px`;
        outerEl.style.height = `${Math.round(natH * scale)}px`;
      }
      setIsDownloading(false);
    }
  }, [num, scale]);

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
        strategy="lazyOnload"
      />

      <div
        className="flex antialiased"
        style={{
          height: 'calc(100vh - 64px)',
          overflow: 'hidden',
          background: 'var(--ndl-bg)',
          color: 'var(--ndl-text-secondary)',
        }}
      >
        {/* ── LEFT PANE: CONFIG FORM ──────────────────────────────────────── */}
        <div
          className="shrink-0 overflow-y-auto"
          style={{ width: '420px', background: 'var(--ndl-surface)', borderRight: '1px solid var(--ndl-border)' }}
        >
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

            <CloudDraftBar
              signedIn={Boolean(cloudDraft.user)}
              optIn={cloudDraft.optIn}
              status={cloudDraft.status}
              message={cloudDraft.message}
              loginHref="/login/?next=/tools/invoice-generator/"
              onEnable={() => { void cloudDraft.enable(); }}
              onDisable={(del) => { void cloudDraft.disable(del); }}
              onSaveNow={() => { void cloudDraft.saveNow(); }}
            />

            {/* Invoice Details */}
            <Section label="Invoice Details">
              <div className="grid grid-cols-2 gap-[10px]">
                <Field label="Invoice Number">
                  <input className={inputCls} type="text" placeholder="INV-001" value={num} onChange={(e) => setNum(e.target.value)} />
                </Field>
                <Field label="Currency">
                  <select className={inputCls} value={currency} onChange={(e) => setCurrency(e.target.value)}
                    style={{ background: 'var(--ndl-input-bg)', color: 'var(--ndl-text)', border: '1px solid var(--ndl-input-border)' }}>
                    {CURRENCIES.map((c) => <option key={c.value} value={c.value} style={{ background: 'var(--ndl-surface)' }}>{c.label}</option>)}
                  </select>
                </Field>
                <Field label="Invoice Date">
                  <input className={inputCls} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </Field>
                <Field label="Due Date">
                  <input className={inputCls} type="date" value={due} onChange={(e) => setDue(e.target.value)} />
                </Field>
              </div>
            </Section>

            <Hr />

            {/* From — Issuer */}
            <Section label="From — Issuer">
              <div className="flex flex-col gap-[9px]">
                <Field label="Business / Name">
                  <input className={inputCls} type="text" placeholder="NexusDigitalLabs — Software Studio" value={issName} onChange={(e) => setIssName(e.target.value)} />
                </Field>
                <Field label="Email">
                  <input className={inputCls} type="email" placeholder="hello@nexusdigitallabs.dev" value={issEmail} onChange={(e) => setIssEmail(e.target.value)} />
                </Field>
                <Field label="Address">
                  <textarea className={inputCls} rows={2} placeholder="123 Street, City, Country" value={issAddr} onChange={(e) => setIssAddr(e.target.value)} style={{ resize: 'none' }} />
                </Field>
                <Field label="Website">
                  <input className={inputCls} type="text" placeholder="nexusdigitallabs.dev" value={issWeb} onChange={(e) => setIssWeb(e.target.value)} />
                </Field>
              </div>
            </Section>

            <Hr />

            {/* To — Client */}
            <Section label="To — Client">
              <div className="flex flex-col gap-[9px]">
                <Field label="Company / Client Name">
                  <input className={inputCls} type="text" placeholder="Acme Corp" value={cliName} onChange={(e) => setCliName(e.target.value)} />
                </Field>
                <Field label="Contact Name">
                  <input className={inputCls} type="text" placeholder="John Smith" value={cliContact} onChange={(e) => setCliContact(e.target.value)} />
                </Field>
                <Field label="Email">
                  <input className={inputCls} type="email" placeholder="accounts@acmecorp.com" value={cliEmail} onChange={(e) => setCliEmail(e.target.value)} />
                </Field>
                <Field label="Address">
                  <textarea className={inputCls} rows={2} placeholder="456 Avenue, City, Country" value={cliAddr} onChange={(e) => setCliAddr(e.target.value)} style={{ resize: 'none' }} />
                </Field>
              </div>
            </Section>

            <Hr />

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-[10px]">
                <SectionLabel>Line Items</SectionLabel>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1 text-[11.5px] font-medium text-blue-400 hover:text-blue-300 transition-colors bg-transparent border-none cursor-pointer p-0"
                >
                  <svg className="w-[13px] h-[13px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Row
                </button>
              </div>
              <div className="flex flex-col gap-[8px]">
                {items.map((item) => (
                  <div
                    key={item.id}
                    style={{ background: 'var(--ndl-card-bg)', border: '1px solid var(--ndl-border)', borderRadius: '9px', padding: '11px' }}
                  >
                    <div className="flex items-center justify-between mb-[8px]">
                      <span style={{ fontSize: '10px', fontWeight: 500, color: 'var(--ndl-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Item</span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-[color:var(--ndl-muted)] hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer p-0 leading-none"
                      >
                        <svg className="w-[13px] h-[13px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <input
                      type="text"
                      className={inputCls}
                      placeholder="Service or product description"
                      value={item.desc}
                      onChange={(e) => updateItem(item.id, 'desc', e.target.value)}
                      style={{ marginBottom: '8px' }}
                    />
                    <div className="grid grid-cols-2 gap-[8px]">
                      <Field label="Qty / Hrs">
                        <input type="number" min={0} step={0.5} className={inputCls} value={item.qty}
                          onChange={(e) => updateItem(item.id, 'qty', parseFloat(e.target.value) || 0)} />
                      </Field>
                      <Field label="Rate">
                        <input type="number" min={0} step={0.01} className={inputCls} value={item.rate}
                          onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)} />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Hr />

            {/* Tax & Discount */}
            <Section label="Tax & Discount">
              <div className="grid grid-cols-2 gap-[10px]">
                <Field label="Tax Label">
                  <input className={inputCls} type="text" placeholder="GST / VAT" value={taxLabel} onChange={(e) => setTaxLabel(e.target.value)} />
                </Field>
                <Field label="Tax Rate (%)">
                  <input className={inputCls} type="number" min={0} max={100} step={0.1} placeholder="0" value={taxRate || ''} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} />
                </Field>
                <div className="col-span-2">
                  <Field label="Discount (%)">
                    <input className={inputCls} type="number" min={0} max={100} step={0.1} placeholder="0" value={discount || ''} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} />
                  </Field>
                </div>
              </div>
            </Section>

            <Hr />

            {/* Bank Details */}
            <Section label="Bank Details">
              <div className="flex flex-col gap-[9px]">
                <Field label="Bank Name">
                  <input className={inputCls} type="text" placeholder="First National Bank" value={bankName} onChange={(e) => setBankName(e.target.value)} />
                </Field>
                <Field label="Account Name">
                  <input className={inputCls} type="text" placeholder="NexusDigitalLabs" value={bankAcctName} onChange={(e) => setBankAcctName(e.target.value)} />
                </Field>
                <Field label="Account Number">
                  <input className={inputCls} type="text" placeholder="1234 5678 90" value={bankAcctNum} onChange={(e) => setBankAcctNum(e.target.value)} />
                </Field>
                <div className="grid grid-cols-2 gap-[10px]">
                  <Field label="SWIFT / BIC">
                    <input className={inputCls} type="text" placeholder="FNBKUS33" value={bankSwift} onChange={(e) => setBankSwift(e.target.value)} />
                  </Field>
                  <Field label="IBAN (optional)">
                    <input className={inputCls} type="text" placeholder="GB29 NWBK…" value={bankIban} onChange={(e) => setBankIban(e.target.value)} />
                  </Field>
                </div>
              </div>
            </Section>

            <Hr />

            {/* Notes */}
            <div style={{ paddingBottom: '24px' }}>
              <Section label="Payment Notes">
                <textarea
                  className={inputCls}
                  rows={3}
                  placeholder="e.g. Payment due within 30 days. Thank you for your business."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ resize: 'none' }}
                />
              </Section>
            </div>

          </div>
        </div>

        {/* ── RIGHT PANE: LIVE PREVIEW ────────────────────────────────────── */}
        <div
          ref={previewPaneRef}
          className="flex-1 overflow-y-auto flex flex-col items-center"
          style={{ background: 'var(--ndl-surface-2)', padding: '24px 24px 40px' }}
        >
          {/* Action bar */}
          <div className="w-full flex items-center justify-between mb-[18px] shrink-0" style={{ maxWidth: '794px' }}>
            <div className="flex items-center gap-[8px]">
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="inline-flex items-center gap-[7px] text-[13px] font-semibold ndl-on-accent px-[18px] py-[9px] rounded-[10px] border-none cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: '#2563eb', boxShadow: '0 4px 20px rgba(37,99,235,0.35)' }}
              >
                {isDownloading ? (
                  <svg className="w-[15px] h-[15px] animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                {isDownloading ? 'Generating…' : 'Download PDF'}
              </button>
              <span style={{ fontSize: '11px', color: 'var(--ndl-faint)' }}>A4 · Portrait · Vector-quality</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--ndl-muted)', fontStyle: 'italic' }}>Live preview</span>
          </div>

          {/* Invoice paper — scaled to fit pane */}
          <div
            ref={invoiceOuterRef}
            style={{
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              borderRadius: '2px',
              flexShrink: 0,
              overflow: 'hidden',
              width: `${Math.round(794 * scale)}px`,
              height: 'auto',
              transformOrigin: 'top left',
            }}
          >
            <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
              <InvoicePreview
                num={num} currency={currency} date={date} due={due}
                issName={issName} issEmail={issEmail} issAddr={issAddr} issWeb={issWeb}
                cliName={cliName} cliContact={cliContact} cliEmail={cliEmail} cliAddr={cliAddr}
                taxLabel={taxLabel} taxPct={taxRate} discPct={discount}
                bankName={bankName} bankAcctName={bankAcctName} bankAcctNum={bankAcctNum}
                bankSwift={bankSwift} bankIban={bankIban}
                notes={notes} items={items} sym={sym} totals={totals}
                innerRef={invoiceSheetRef}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Small layout helpers ───────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold tracking-widest uppercase mb-[10px]" style={{ color: 'var(--ndl-faint)' }}>
      {children}
    </p>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <SectionLabel>{label}</SectionLabel>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  );
}

function Hr() {
  return <hr style={{ borderColor: 'rgba(30,41,59,0.5)', margin: '0' }} />;
}
