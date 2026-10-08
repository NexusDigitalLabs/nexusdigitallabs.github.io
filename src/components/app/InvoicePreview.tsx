'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InvoiceSheet, { type InvoiceSheetProps } from '@/components/invoice/InvoiceSheet';

type Html2PdfInstance = {
  set: (opts: object) => Html2PdfInstance;
  from: (el: HTMLElement) => Html2PdfInstance;
  save: () => Promise<void>;
};

const SHEET_WIDTH = 794;

/**
 * Scaled-to-fit A4 preview with a PDF download. Uses the same html2pdf
 * build as the public Invoice Generator; the scale transform is removed
 * while capturing so the PDF is full resolution.
 */
export default function InvoicePreview({ sheet, filename }: { sheet: Omit<InvoiceSheetProps, 'sheetRef'>; filename: string }) {
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
    const el = sheetRef.current;
    const html2pdf = (window as Window & { html2pdf?: () => Html2PdfInstance }).html2pdf;
    if (!el) return;
    if (!html2pdf) {
      setError('The PDF engine is still loading — try again in a moment.');
      return;
    }
    setError(null);
    setDownloading(true);
    const saved = el.style.transform;
    el.style.transform = 'none';
    try {
      await html2pdf()
        .set({
          margin: [15, 12, 15, 12],
          filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(el)
        .save();
    } catch {
      setError('Could not generate the PDF. Please try again.');
    } finally {
      el.style.transform = saved;
      setDownloading(false);
    }
  }, [filename]);

  return (
    <div className="flex flex-col gap-3">
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" strategy="lazyOnload" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold">Preview</h2>
        <Button variant="outline" size="sm" onClick={download} disabled={downloading}>
          <Download aria-hidden="true" />
          {downloading ? 'Generating…' : 'Download PDF'}
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
        <div style={{ width: SHEET_WIDTH, transform: `scale(${scale})`, transformOrigin: 'top left' }} ref={sheetRef}>
          <InvoiceSheet {...sheet} />
        </div>
      </div>
    </div>
  );
}
