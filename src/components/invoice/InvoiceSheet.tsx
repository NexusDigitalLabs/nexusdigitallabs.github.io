import type { ReactNode, Ref } from 'react';

/**
 * Printable A4 invoice sheet (794px wide), shared by the public Invoice
 * Generator tool and FreelanceOS. Takes pre-formatted strings so each caller
 * keeps its own money math. Inline styles on purpose: html2pdf rasterizes
 * this element, and it must look identical in light and dark site themes.
 */

export type InvoiceSheetProps = {
  number: string;
  issued: string;
  due: string;
  currency: string;
  /** Optional stamp next to the number, e.g. "Paid" or "Draft". */
  badge?: { label: string; tone: 'paid' | 'draft' | 'void' | 'overdue' };
  from: { name: string; lines: string[] };
  billTo: { name: string; lines: string[] };
  items: { key: string | number; description: string; quantity: string; rate: string; amount: string }[];
  /** Rows above the total, e.g. Subtotal / Discount / Tax. */
  summary: { label: string; value: string; tone?: 'strong' | 'muted' | 'negative' }[];
  totalLabel?: string;
  total: string;
  /** Structured rows (bank fields) and/or free text. */
  payment?: { rows?: { label: string; value: string; mono?: boolean }[]; text?: string | null };
  notes?: string | null;
  footerLeft?: string;
  sheetRef?: Ref<HTMLDivElement>;
};

const INK = '#0c0c0c';
const MUTED = '#6b7280';
const FAINT = '#9ca3af';
const LINE = '#ececec';
const ACCENT = '#2563eb';

const BADGE_COLORS: Record<NonNullable<InvoiceSheetProps['badge']>['tone'], { fg: string; bg: string }> = {
  paid: { fg: '#047857', bg: '#d1fae5' },
  draft: { fg: '#4b5563', bg: '#f3f4f6' },
  void: { fg: '#6b7280', bg: '#f3f4f6' },
  overdue: { fg: '#b91c1c', bg: '#fee2e2' },
};

const numberStyle = { margin: 0, fontSize: '28px', fontWeight: 300, letterSpacing: '-0.04em', color: INK, lineHeight: 1.1 } as const;

const sectionLabel = {
  margin: '0 0 12px',
  fontSize: '8px',
  fontWeight: 600,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: FAINT,
} as const;

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ minWidth: '108px' }}>
      <p style={{ margin: 0, fontSize: '8px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: FAINT }}>
        {label}
      </p>
      <p style={{ margin: '4px 0 0', fontSize: '11.5px', fontWeight: 500, color: INK }}>{value}</p>
    </div>
  );
}

function PartyBlock({ title, name, lines }: { title: string; name: string; lines: string[] }) {
  const visible = lines.filter(Boolean);
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ ...sectionLabel, margin: '0 0 10px' }}>{title}</p>
      <p style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 600, color: INK, letterSpacing: '-0.02em', lineHeight: 1.25 }}>
        {name || '—'}
      </p>
      {(visible.length ? visible : ['—']).map((line, i) => (
        <p key={`${i}-${line}`} style={{ margin: '0 0 3px', fontSize: '11px', color: MUTED, lineHeight: 1.55, whiteSpace: 'pre-line' }}>
          {line}
        </p>
      ))}
    </div>
  );
}

function PaymentRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'baseline' }}>
      <span style={{ fontSize: '10px', color: FAINT, flexShrink: 0 }}>{label}</span>
      <span
        style={{
          fontSize: '11.5px',
          color: INK,
          textAlign: 'right',
          fontFamily: mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : undefined,
          letterSpacing: mono ? '0.02em' : undefined,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function SummaryRow({ label, value, tone }: InvoiceSheetProps['summary'][number]): ReactNode {
  const strong = tone === 'strong';
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '6px 0',
        fontSize: strong ? '11.5px' : '11px',
        color: strong ? MUTED : FAINT,
      }}
    >
      <span>{label}</span>
      <span style={{ fontVariantNumeric: 'tabular-nums', color: tone === 'negative' ? '#dc2626' : INK }}>{value}</span>
    </div>
  );
}

export default function InvoiceSheet({
  number,
  issued,
  due,
  currency,
  badge,
  from,
  billTo,
  items,
  summary,
  totalLabel = 'Total due',
  total,
  payment,
  notes,
  footerLeft,
  sheetRef,
}: InvoiceSheetProps) {
  const paymentRows = payment?.rows?.filter((r) => r.value) ?? [];
  const showPayment = paymentRows.length > 0 || Boolean(payment?.text);
  const badgeColors = badge ? BADGE_COLORS[badge.tone] : null;

  return (
    <div
      ref={sheetRef}
      style={{
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif',
        background: '#ffffff',
        color: INK,
        boxSizing: 'border-box',
        width: '794px',
        minHeight: '1123px',
        padding: '0',
        position: 'relative',
      }}
    >
      {/* Accent rail */}
      <div style={{ height: '4px', background: `linear-gradient(90deg, ${ACCENT} 0%, #6366f1 55%, #818cf8 100%)` }} />

      <div style={{ padding: '48px 52px 52px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '32px', marginBottom: '36px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: '0 0 6px', fontSize: '9px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: ACCENT }}>
              Invoice
            </p>
            {badge && badgeColors ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <p style={numberStyle}>{number}</p>
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: badgeColors.fg,
                    background: badgeColors.bg,
                    borderRadius: '999px',
                    padding: '4px 10px',
                  }}
                >
                  {badge.label}
                </span>
              </div>
            ) : (
              <p style={numberStyle}>{number}</p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <MetaChip label="Issued" value={issued} />
            <MetaChip label="Due" value={due} />
            <MetaChip label="Currency" value={currency} />
          </div>
        </div>

        {/* Parties */}
        <div style={{ display: 'flex', gap: '40px', marginBottom: '36px', paddingBottom: '28px', borderBottom: `1px solid ${LINE}` }}>
          <PartyBlock title="From" name={from.name || 'Issuer'} lines={from.lines} />
          <div style={{ width: '1px', background: LINE, alignSelf: 'stretch', flexShrink: 0 }} aria-hidden="true" />
          <PartyBlock title="Bill to" name={billTo.name || 'Client'} lines={billTo.lines} />
        </div>

        {/* Line items */}
        <div style={{ marginBottom: '8px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 64px 88px 96px',
              gap: '12px',
              padding: '0 0 10px',
              borderBottom: `1px solid ${INK}`,
            }}
          >
            {['Description', 'Qty', 'Rate', 'Amount'].map((h, i) => (
              <p
                key={h}
                style={{
                  margin: 0,
                  fontSize: '8px',
                  fontWeight: 600,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: FAINT,
                  textAlign: i === 0 ? 'left' : 'right',
                }}
              >
                {h}
              </p>
            ))}
          </div>

          {items.map((item, idx) => (
            <div
              key={item.key}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 64px 88px 96px',
                gap: '12px',
                padding: '14px 0',
                borderBottom: idx === items.length - 1 ? 'none' : `1px solid ${LINE}`,
                pageBreakInside: 'avoid',
              }}
            >
              <p style={{ margin: 0, fontSize: '12.5px', color: INK, lineHeight: 1.45, whiteSpace: 'pre-line' }}>
                {item.description || '—'}
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: MUTED, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                {item.quantity}
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: MUTED, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                {item.rate}
              </p>
              <p style={{ margin: 0, fontSize: '12.5px', fontWeight: 600, color: INK, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                {item.amount}
              </p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', marginBottom: '32px' }}>
          <div style={{ width: '280px' }}>
            {summary.map((row) => (
              <SummaryRow key={row.label} {...row} />
            ))}
            <div
              style={{
                marginTop: '12px',
                padding: '16px 18px',
                borderRadius: '10px',
                background: '#f8fafc',
                border: `1px solid ${LINE}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED }}>
                {totalLabel}
              </span>
              <span style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.03em', color: INK, fontVariantNumeric: 'tabular-nums' }}>
                {total}
              </span>
            </div>
          </div>
        </div>

        {/* Payment + notes */}
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', pageBreakInside: 'avoid' }}>
          {showPayment && (
            <div style={{ flex: '1 1 280px', minWidth: '240px' }}>
              <p style={sectionLabel}>Payment details</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {paymentRows.map((row) => (
                  <PaymentRow key={row.label} {...row} />
                ))}
                {payment?.text && (
                  <p style={{ margin: 0, fontSize: '11px', color: INK, lineHeight: 1.7, whiteSpace: 'pre-line' }}>{payment.text}</p>
                )}
              </div>
            </div>
          )}
          {notes && (
            <div style={{ flex: '1 1 220px', minWidth: '200px' }}>
              <p style={sectionLabel}>Notes</p>
              <p style={{ margin: 0, fontSize: '11px', color: MUTED, lineHeight: 1.75, whiteSpace: 'pre-line' }}>{notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: '48px',
            paddingTop: '16px',
            borderTop: `1px solid ${LINE}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <p style={{ margin: 0, fontSize: '10px', color: FAINT }}>{footerLeft ?? from.name}</p>
          <p style={{ margin: 0, fontSize: '10px', color: FAINT, letterSpacing: '0.06em' }}>{number}</p>
        </div>
      </div>
    </div>
  );
}
