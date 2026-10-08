import type { InvoiceSheetData } from '@/components/invoice/InvoiceSheet';

/**
 * Real-text (vector) invoice PDFs, shared by the Invoice Generator tool and
 * FreelanceOS. Rendered client-side with @react-pdf/renderer, loaded only
 * when someone downloads, from the same data as the on-screen InvoiceSheet.
 *
 * Replaces an html2pdf screenshot approach that produced blurry JPEG text
 * (or ~21 MB files as PNG) that couldn't be selected or searched.
 */

/** Self-hosted Inter (see public/fonts/inter) — the PDF never calls a third party. */
export const browserFontSrc = (file: string) => `${window.location.origin}/fonts/inter/${file}`;

export async function renderInvoicePdf(
  sheet: InvoiceSheetData,
  fontSrc: (file: string) => string = browserFontSrc
): Promise<Blob> {
  const [{ pdf }, { default: InvoicePdfDocument, registerInvoiceFonts }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/components/invoice/InvoicePdfDocument'),
  ]);
  registerInvoiceFonts(fontSrc);
  return pdf(<InvoicePdfDocument {...sheet} />).toBlob();
}

export async function downloadInvoicePdf(sheet: InvoiceSheetData, filename: string): Promise<void> {
  const blob = await renderInvoicePdf(sheet);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Give the browser a moment to start the download before freeing the blob.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
