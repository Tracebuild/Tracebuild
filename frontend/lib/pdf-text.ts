import { PDFParse } from "pdf-parse";

/**
 * Extracts the plain text of a PDF.
 *
 * pdf-parse v2 is not the callable `pdfParse(buffer)` of v1 — it exports a
 * `PDFParse` class whose instance must be released again via destroy(), otherwise
 * the underlying pdfjs worker keeps the document alive for the lifetime of the
 * serverless invocation.
 *
 * Throws on an unreadable/encrypted PDF; callers decide how to surface that.
 */
export async function extractPdfText(bytes: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(bytes) });
  try {
    const { text } = await parser.getText();
    return text ?? "";
  } finally {
    await parser.destroy();
  }
}
