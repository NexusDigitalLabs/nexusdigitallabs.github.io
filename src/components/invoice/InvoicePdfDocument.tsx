import { Defs, Document, Font, LinearGradient, Page, Rect, Stop, StyleSheet, Svg, Text, View } from '@react-pdf/renderer';
import type { InvoiceSheetData } from '@/components/invoice/InvoiceSheet';

/**
 * Vector (real-text) PDF version of InvoiceSheet — same data, same design.
 * Units are points: the HTML sheet's px values × 0.75 (794px = A4's 595pt).
 * Only imported lazily from components/invoice/pdf.tsx when downloading.
 */

const INK = '#0c0c0c';
const MUTED = '#6b7280';
const FAINT = '#9ca3af';
const LINE = '#ececec';
const ACCENT = '#2563eb';

const WEIGHTS = [300, 400, 500, 600, 700] as const;
let fontsRegistered = false;

/**
 * Inter, split by fontsource into a Latin file and a Latin-extended file
 * (the latter has currency symbols like ₹ ₱ ₩); text falls back between them.
 */
export function registerInvoiceFonts(src: (file: string) => string) {
  if (fontsRegistered) return;
  for (const [family, subset] of [
    ['Inter', 'latin'],
    ['InterExt', 'latin-ext'],
  ] as const) {
    Font.register({
      family,
      fonts: WEIGHTS.map((fontWeight) => ({ src: src(`inter-${subset}-${fontWeight}-normal.woff`), fontWeight })),
    });
  }
  // Never hyphenate names, emails or amounts.
  Font.registerHyphenationCallback((word) => [word]);
  fontsRegistered = true;
}

const FONT = ['Inter', 'InterExt'];

const s = StyleSheet.create({
  // Top/bottom padding applies to every page; the rail and footer are absolutely positioned.
  page: { fontFamily: FONT, fontSize: 8.25, color: INK, paddingTop: 39, paddingBottom: 60, backgroundColor: '#ffffff' },
  rail: { position: 'absolute', top: 0, left: 0, right: 0 },
  body: { paddingHorizontal: 39 },
  label: { fontSize: 6, fontWeight: 600, letterSpacing: 0.96, textTransform: 'uppercase', color: FAINT },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 27 },
  eyebrow: { fontSize: 6.75, fontWeight: 600, letterSpacing: 1.35, textTransform: 'uppercase', color: ACCENT, marginBottom: 4.5 },
  number: { fontSize: 21, fontWeight: 300, letterSpacing: -0.84, color: INK },
  badge: { fontSize: 6.75, fontWeight: 700, letterSpacing: 0.95, textTransform: 'uppercase', borderRadius: 999, paddingVertical: 3, paddingHorizontal: 7.5, marginLeft: 9 },
  metaRow: { flexDirection: 'row' },
  meta: { width: 81, marginLeft: 21 },
  metaValue: { fontSize: 8.6, fontWeight: 500, marginTop: 3 },
  parties: { flexDirection: 'row', marginBottom: 27, paddingBottom: 21, borderBottomWidth: 0.75, borderBottomColor: LINE },
  party: { flex: 1 },
  partyDivider: { width: 0.75, backgroundColor: LINE, marginHorizontal: 15 },
  partyName: { fontSize: 11.25, fontWeight: 600, letterSpacing: -0.22, marginTop: 7.5, marginBottom: 4.5 },
  partyLine: { fontSize: 8.25, color: MUTED, lineHeight: 1.55, marginBottom: 2.25 },
  tableHead: { flexDirection: 'row', paddingBottom: 7.5, borderBottomWidth: 0.75, borderBottomColor: INK },
  row: { flexDirection: 'row', paddingVertical: 10.5, borderBottomWidth: 0.75, borderBottomColor: LINE },
  colDesc: { flex: 1, paddingRight: 9 },
  colQty: { width: 48, textAlign: 'right', paddingRight: 9 },
  colRate: { width: 75, textAlign: 'right', paddingRight: 9 },
  colAmount: { width: 72, textAlign: 'right' },
  cellDesc: { fontSize: 9.4, lineHeight: 1.45 },
  cellMuted: { fontSize: 9, color: MUTED },
  cellAmount: { fontSize: 9.4, fontWeight: 600 },
  totalsWrap: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15, marginBottom: 24 },
  totals: { width: 210 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4.5 },
  totalBox: {
    marginTop: 9,
    paddingVertical: 12,
    paddingHorizontal: 13.5,
    borderRadius: 7.5,
    backgroundColor: '#f8fafc',
    borderWidth: 0.75,
    borderColor: LINE,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  totalLabel: { fontSize: 8.25, fontWeight: 600, letterSpacing: 0.66, textTransform: 'uppercase', color: MUTED },
  totalValue: { fontSize: 16.5, fontWeight: 600, letterSpacing: -0.5 },
  extras: { flexDirection: 'row' },
  extraBlock: { flex: 1, marginRight: 24 },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7.5 },
  footer: {
    position: 'absolute',
    bottom: 27,
    left: 39,
    right: 39,
    paddingTop: 12,
    borderTopWidth: 0.75,
    borderTopColor: LINE,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: { fontSize: 7.5, color: FAINT },
});

const BADGE_COLORS = {
  paid: { color: '#047857', backgroundColor: '#d1fae5' },
  draft: { color: '#4b5563', backgroundColor: '#f3f4f6' },
  void: { color: '#6b7280', backgroundColor: '#f3f4f6' },
  overdue: { color: '#b91c1c', backgroundColor: '#fee2e2' },
} as const;

function Party({ title, name, lines }: { title: string; name: string; lines: string[] }) {
  const visible = lines.filter(Boolean);
  return (
    <View style={s.party}>
      <Text style={s.label}>{title}</Text>
      <Text style={s.partyName}>{name || '—'}</Text>
      {(visible.length ? visible : ['—']).map((line, i) => (
        <Text key={`${i}-${line}`} style={s.partyLine}>
          {line}
        </Text>
      ))}
    </View>
  );
}

export default function InvoicePdfDocument({
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
}: InvoiceSheetData) {
  const paymentRows = payment?.rows?.filter((r) => r.value) ?? [];
  const showPayment = paymentRows.length > 0 || Boolean(payment?.text);

  return (
    <Document title={`Invoice ${number}`} author={from.name} creator="NexusDigitalLabs" producer="NexusDigitalLabs">
      <Page size="A4" style={s.page}>
        {/* Accent rail */}
        <Svg width={595.28} height={3} style={s.rail} fixed>
          <Defs>
            <LinearGradient id="rail" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={ACCENT} />
              <Stop offset="0.55" stopColor="#6366f1" />
              <Stop offset="1" stopColor="#818cf8" />
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width={595.28} height={3} fill="url(#rail)" />
        </Svg>

        <View style={s.body}>
          <View style={s.header}>
            <View>
              <Text style={s.eyebrow}>Invoice</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={s.number}>{number}</Text>
                {badge && <Text style={[s.badge, BADGE_COLORS[badge.tone]]}>{badge.label}</Text>}
              </View>
            </View>
            <View style={s.metaRow}>
              {[
                ['Issued', issued],
                ['Due', due],
                ['Currency', currency],
              ].map(([label, value]) => (
                <View key={label} style={s.meta}>
                  <Text style={s.label}>{label}</Text>
                  <Text style={s.metaValue}>{value}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={s.parties}>
            <Party title="From" name={from.name || 'Issuer'} lines={from.lines} />
            <View style={s.partyDivider} />
            <Party title="Bill to" name={billTo.name || 'Client'} lines={billTo.lines} />
          </View>

          <View style={s.tableHead}>
            <Text style={[s.label, s.colDesc]}>Description</Text>
            <Text style={[s.label, s.colQty]}>Qty</Text>
            <Text style={[s.label, s.colRate]}>Rate</Text>
            <Text style={[s.label, s.colAmount]}>Amount</Text>
          </View>
          {items.map((item, idx) => (
            <View
              key={item.key}
              style={[s.row, idx === items.length - 1 ? { borderBottomWidth: 0 } : {}]}
              wrap={false}
            >
              <Text style={[s.cellDesc, s.colDesc]}>{item.description || '—'}</Text>
              <Text style={[s.cellMuted, s.colQty]}>{item.quantity}</Text>
              <Text style={[s.cellMuted, s.colRate]}>{item.rate}</Text>
              <Text style={[s.cellAmount, s.colAmount]}>{item.amount}</Text>
            </View>
          ))}

          <View style={s.totalsWrap} wrap={false}>
            <View style={s.totals}>
              {summary.map((row) => (
                <View key={row.label} style={s.summaryRow}>
                  <Text style={{ fontSize: row.tone === 'strong' ? 8.6 : 8.25, color: row.tone === 'strong' ? MUTED : FAINT }}>
                    {row.label}
                  </Text>
                  <Text style={{ fontSize: row.tone === 'strong' ? 8.6 : 8.25, color: row.tone === 'negative' ? '#dc2626' : INK }}>
                    {row.value}
                  </Text>
                </View>
              ))}
              <View style={s.totalBox}>
                <Text style={s.totalLabel}>{totalLabel}</Text>
                <Text style={s.totalValue}>{total}</Text>
              </View>
            </View>
          </View>

          {(showPayment || notes) && (
            <View style={s.extras} wrap={false}>
              {showPayment && (
                <View style={s.extraBlock}>
                  <Text style={[s.label, { marginBottom: 9 }]}>Payment details</Text>
                  {paymentRows.map((row) => (
                    <View key={row.label} style={s.paymentRow}>
                      <Text style={{ fontSize: 7.5, color: FAINT }}>{row.label}</Text>
                      <Text style={{ fontSize: 8.6 }}>{row.value}</Text>
                    </View>
                  ))}
                  {payment?.text && <Text style={{ fontSize: 8.25, lineHeight: 1.7 }}>{payment.text}</Text>}
                </View>
              )}
              {notes && (
                <View style={s.extraBlock}>
                  <Text style={[s.label, { marginBottom: 9 }]}>Notes</Text>
                  <Text style={{ fontSize: 8.25, color: MUTED, lineHeight: 1.75 }}>{notes}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={s.footer} fixed>
          <Text style={s.footerText}>{footerLeft ?? from.name}</Text>
          <Text
            style={[s.footerText, { letterSpacing: 0.45 }]}
            render={({ pageNumber, totalPages }) => (totalPages > 1 ? `${number} · ${pageNumber}/${totalPages}` : number)}
          />
        </View>
      </Page>
    </Document>
  );
}
