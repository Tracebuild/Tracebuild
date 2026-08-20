import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic as client } from "@/lib/anthropic";
import type { GeoportalDocument } from "@/lib/geoportal";

const ExtractedRule = z.object({
  title: z.string().describe("Kurzer, spezifischer Titel der Regel, z.B. \"Grenzabstand Wohnzone W2\""),
  category: z.string().describe("Kategorie, z.B. \"Grenzabstand\", \"Gebäudehöhe\", \"Ausnützungsziffer\", \"Dachneigung\""),
  text: z.string().describe("Der konkrete, anwendbare Wortlaut inkl. Zahlenwerten, prägnant zusammengefasst auf Deutsch"),
});

const ExtractionResult = z.object({
  rules: z.array(ExtractedRule),
});

export interface ExtractedNorm {
  title: string;
  category: string;
  text: string;
}

interface FetchedDocument {
  kind: "pdf" | "text";
  data: string; // base64 for pdf, plain text otherwise
}

// Anchor text that marks the actual regulation (what we want), vs. the approval
// decree/decision paperwork that a legal-basis registry (e.g. an SG "OEREBlex" record)
// often links first (scanned, not useful for extracting numeric rules from).
const REGULATION_LINK_RE = /reglement|verordnung|erlass|gesetz/i;
const APPROVAL_DECREE_RE = /genehmigung/i;

async function fetchRaw(url: string): Promise<{ contentType: string; buf: ArrayBuffer } | null> {
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) return null;
  return { contentType: res.headers.get("content-type") ?? "", buf: await res.arrayBuffer() };
}

function toFetchedDocument(contentType: string, url: string, buf: ArrayBuffer): FetchedDocument | null {
  if (contentType.includes("pdf") || url.toLowerCase().endsWith(".pdf")) {
    // 32MB request-size ceiling on the Messages API; skip documents too large to extract.
    if (buf.byteLength > 25 * 1024 * 1024) return null;
    return { kind: "pdf", data: Buffer.from(buf).toString("base64") };
  }
  const html = Buffer.from(buf).toString("utf-8");
  // Cheap tag strip — Claude reads structured legal HTML fine without a full DOM parse,
  // this just keeps token count down by dropping markup/script/style noise.
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return { kind: "text", data: text };
}

/** Finds the best "this is the actual regulation" link inside an HTML registry/index page. */
function findRegulationLink(html: string, baseUrl: string): string | null {
  let best: { url: string; score: number } | null = null;
  for (const m of Array.from(html.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([^<]*)<\/a>/gi))) {
    const [, href, anchorText] = m;
    if (!REGULATION_LINK_RE.test(anchorText)) continue;
    const score = APPROVAL_DECREE_RE.test(anchorText) ? 0 : 1; // prefer the regulation over its approval decree
    if (!best || score > best.score) {
      try {
        best = { url: new URL(href, baseUrl).toString(), score };
      } catch {
        /* skip unparseable href */
      }
    }
  }
  return best?.url ?? null;
}

/**
 * Some geoportal-linked "documents" are actually registry/index pages (e.g. an SG
 * "OEREBlex" legal-basis record) that only describe a decision and link out to the real
 * regulation PDF, rather than containing any rule text themselves. This follows one such
 * hop when it finds a clearly-labelled regulation link, so extraction reads the actual
 * Baureglement/Verordnung instead of an administrative cover page.
 */
async function fetchDocument(url: string): Promise<FetchedDocument | null> {
  const first = await fetchRaw(url);
  if (!first) return null;

  if (!first.contentType.includes("pdf") && !url.toLowerCase().endsWith(".pdf")) {
    const html = Buffer.from(first.buf).toString("utf-8");
    const regulationUrl = findRegulationLink(html, url);
    if (regulationUrl && regulationUrl !== url) {
      const second = await fetchRaw(regulationUrl).catch(() => null);
      if (second) return toFetchedDocument(second.contentType, regulationUrl, second.buf);
    }
  }
  return toFetchedDocument(first.contentType, url, first.buf);
}

/**
 * Fetches a legal document (PDF or HTML) linked from a geoportal zone record and asks
 * Claude to pull out the concrete, numbered rules that apply to the given zone —
 * not just "see the law", but the actual Grenzabstand/Gebäudehöhe/etc. values.
 * Returns [] on any failure (fetch error, empty doc, no rules found) so the caller can
 * fall back to a plain reference norm rather than lose the norm entirely.
 */
export async function extractNormsFromDocument(
  doc: GeoportalDocument,
  zone: { code: string | null; label: string | null; kanton: string; gemeinde: string }
): Promise<ExtractedNorm[]> {
  if (!doc.link) return [];

  let fetched: FetchedDocument | null;
  try {
    fetched = await fetchDocument(doc.link);
  } catch {
    return [];
  }
  if (!fetched || !fetched.data) return [];

  const zoneDesc = [zone.code, zone.label].filter(Boolean).join(" – ") || "unbekannte Zone";
  const instruction =
    `Dies ist "${doc.titel}" (${doc.typ}), gültig für ${zone.gemeinde}, Kanton ${zone.kanton}. ` +
    `Die betroffene Parzelle liegt in der Zonenkategorie "${zoneDesc}". ` +
    `Extrahiere die konkreten, für einen Architekten/Zeichner beim Bauen in dieser Zone verbindlichen Vorschriften ` +
    `(z.B. Grenzabstand, Gebäudehöhe, Ausnützungsziffer, Geschosszahl, Dachneigung, Firsthöhe). ` +
    `Falls die Zonenkategorie nicht auf eine exakte Ziffer/Unterzone eingrenzt ist (z.B. nur "Wohnzone" statt "Wohnzone W2") ` +
    `und das Dokument mehrere Varianten dieser Kategorie mit unterschiedlichen Werten enthält (z.B. W2, W3, W4), ` +
    `extrahiere JEDE Variante als eigene Regel und benenne sie eindeutig mit ihrer jeweiligen Unterzone im Titel. ` +
    `Ignoriere Verfahrensvorschriften, Definitionen und Vorschriften, die eindeutig zu einer völlig anderen Zonenkategorie gehören (z.B. Gewerbe-/Industriezone, wenn die Parzelle in einer Wohnzone liegt). ` +
    `Falls keine konkreten Werte auffindbar sind, gib eine leere Liste zurück — erfinde nichts.`;

  const content: Anthropic.MessageParam["content"] = fetched.kind === "pdf"
    ? [
        { type: "document", source: { type: "base64", media_type: "application/pdf", data: fetched.data } },
        { type: "text", text: instruction },
      ]
    : [{ type: "text", text: `${instruction}\n\n---\nDokument-Inhalt:\n${fetched.data.slice(0, 150000)}` }];

  try {
    const response = await client.messages.parse({
      model: "claude-sonnet-5",
      max_tokens: 4096,
      messages: [{ role: "user", content }],
      output_config: { format: zodOutputFormat(ExtractionResult) },
    });
    return response.parsed_output?.rules ?? [];
  } catch {
    return [];
  }
}
