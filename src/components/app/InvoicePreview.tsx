'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InvoiceSheet, { type InvoiceSheetData } from '@/components/invoice/InvoiceSheet';
import { downloadInvoicePdf } from '@/components/invoice/pdf';

const SHEET_WIDTH = 794;

/**
 * Scaled-to-fit A4 preview with a real-text PDF download (shared exporter in
 * components/invoice/pdf.tsx — the same one the public Invoice Generator uses).
 */
export default function InvoicePreview({
  sheet,
  filename,
  downloadLabel = 'Download PDF',
}: {
  sheet: InvoiceSheetData;
  filename: string;
  downloadLabel?: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const update = () => {
      const next = Math.min(1, frame.clientWidth / SHEET_WIDTH);
      setScale(next);
      setHeight((sheetRef.current?.offsetHeight ?? 1123) * next);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  const download = useCallback(async () => {
    setError(null);
    setDownloading(true);
    try {
      await downloadInvoicePdf(sheet, filename);
    } catch (e) {
      console.error('[freelanceos] PDF generation failed', e);
      setError('Could not generate the PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  }, [sheet, filename]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold">Preview</h2>
        <Button variant="outline" size="sm" onClick={download} disabled={downloading}>
          <Download aria-hidden="true" />
          {downloading ? 'Generating…' : downloadLabel}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div
        ref={frameRef}
        className="overflow-hidden rounded-xl border bg-white shadow-sm"
        style={{ height: height ?? undefined }}
      >
        <div style={{ width: SHEET_WIDTH, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <InvoiceSheet {...sheet} sheetRef={sheetRef} />
        </div>
      </div>
    </div>
  );
}
