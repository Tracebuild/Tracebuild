/**
 * Extracts the plain text of a PDF.
 *
 * pdf-parse v2 is not the callable `pdfParse(buffer)` of v1 — it exports a
 * `PDFParse` class whose instance must be released again via destroy(), otherwise
 * the underlying pdfjs worker keeps the document alive for the lifetime of the
 * serverless invocation.
 *
 * The import is deliberately dynamic: pdf-parse drags in pdfjs-dist (worker +
 * binary assets), and if that fails to resolve in a serverless bundle a top-level
 * import would kill the whole route module — the caller would get an HTML 500 with
 * no clue why. Importing here turns that into a normal, catchable error.
 *
 * Throws on an unreadable/encrypted PDF; callers decide how to surface that.
 */
export async function extractPdfText(bytes: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array(bytes) });
  try {
    const { text } = await parser.getText();
    return text ?? "";
  } finally {
    await parser.destroy();
  }
}
