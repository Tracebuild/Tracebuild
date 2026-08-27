import { getAuthUser, ok, unauthorized, err } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { anthropic } from "@/lib/anthropic";
import { normMatchesZone } from "@/lib/zone-match";

export const maxDuration = 300;

// ── Prompt ────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Du bist ein Schweizer Baurechtsexperte und prüfst Baupläne auf Normkonformität.

Dir werden folgende Informationen übergeben:
- Bilder der Baupläne (PDF-Seiten als Bilder)
- Eine Liste der gültigen Normen für dieses Projekt (Titel + Inhalt)
- Projektkontext: Gemeinde, Kanton, Bauzone

Deine Aufgabe:
- Prüfe jeden Plan gegen die übergebenen Normen
- Identifiziere für jede relevante Norm ob sie erfüllt ist (ok), nicht erfüllt (fail) oder unklar ist (warn)
- Begründe jeden Befund konkret mit Bezug auf den Plan
- Bei fail/warn: gib eine konkrete Verbesserungsempfehlung
- Sei präzise, kein Blabla — ein Architekt liest das

Antworte AUSSCHLIESSLICH mit einem JSON-Array von Prüfpunkten. Kein Text davor oder danach.

Schema für jeden Eintrag:
{
  "check_id": "<uuid>",
  "norm_id": "<norm-id aus der Liste oder null>",
  "norm_title": "<Titel der geprüften Norm>",
  "category": "<grenzabstand|gebaeudehöhe|erschliessung|brandschutz|parkierung|andere>",
  "status": "<ok|fail|warn>",
  "finding": "<was konkret im Plan erkannt/gemessen wurde>",
  "suggestion": "<Verbesserungsempfehlung oder null bei ok>",
  "confidence": "<high|medium|low>",
  "page_reference": <Seitennummer als Integer oder null>
}`;

// ── Types ─────────────────────────────────────────────────────────────────────

type Category = "grenzabstand" | "gebaeudehöhe" | "erschliessung" | "brandschutz" | "parkierung" | "andere";
type Status = "ok" | "fail" | "warn";
type Confidence = "high" | "medium" | "low";

interface CheckItem {
  check_id: string;
  norm_id: string | null;
  norm_title: string;
  category: Category;
  status: Status;
  finding: string;
  suggestion: string | null;
  confidence: Confidence;
  page_reference: number | null;
}

const VALID_CATEGORIES = new Set<string>(["grenzabstand", "gebaeudehöhe", "erschliessung", "brandschutz", "parkierung", "andere"]);
const VALID_STATUSES   = new Set<string>(["ok", "fail", "warn"]);
const VALID_CONFS      = new Set<string>(["high", "medium", "low"]);

function normalize(item: Record<string, unknown>): CheckItem {
  return {
    check_id:       String(item.check_id ?? crypto.randomUUID()),
    norm_id:        typeof item.norm_id === "string" ? item.norm_id : null,
    norm_title:     String(item.norm_title ?? ""),
    category:       (VALID_CATEGORIES.has(String(item.category)) ? item.category : "andere") as Category,
    status:         (VALID_STATUSES.has(String(item.status))     ? item.status   : "warn")   as Status,
    finding:        String(item.finding ?? item.note ?? ""),
    suggestion:     typeof item.suggestion === "string" ? item.suggestion : null,
    confidence:     (VALID_CONFS.has(String(item.confidence))    ? item.confidence : "medium") as Confidence,
    page_reference: Number.isInteger(item.page_reference) ? item.page_reference as number : null,
  };
}

function parseItems(raw: string): CheckItem[] {
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = match ? match[1].trim() : raw.trim();
  const data = JSON.parse(jsonStr);
  if (!Array.isArray(data)) throw new Error("Not an array");
  return (data as Record<string, unknown>[]).map(normalize);
}

// ── Norm context builder ──────────────────────────────────────────────────────

interface ProjectNormRow {
  norms: {
    id: string;
    title: string;
    category: string;
    text: string;
    layer: number;
    zone: string | null;
  } | null;
}

function buildNormContext(pnRows: ProjectNormRow[], projectZone: string | null): string {
  const norms = pnRows
    .map((r) => r.norms)
    .filter(Boolean) as NonNullable<ProjectNormRow["norms"]>[];
  const applicable = norms.filter((n) => normMatchesZone(n.zone, projectZone));
  if (applicable.length === 0) {
    return "Keine projektspezifischen Normen hinterlegt. Nutze dein Fachwissen über Schweizer Bauvorschriften.";
  }
  const lines = [`NORMEN (${applicable.length} projektspezifische Normen):\n`];
  applicable.forEach((n, i) => {
    lines.push(
      `[${i + 1}] Norm-ID: ${n.id}\n` +
      `    Titel: ${n.title}\n` +
      `    Kategorie: ${n.category}\n` +
      `    Inhalt: ${n.text}`
    );
  });
  return lines.join("\n\n");
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const admin = createAdminClient();

  const { data: project } = await admin
    .from("projects")
    .select("id")
    .eq("id", params.id)
    .eq("org_id", user.org_id)
    .single();
  if (!project) return err("Projekt nicht gefunden", 404);

  // 2-step query: get doc IDs first, then analyses
  const { data: docs } = await admin
    .from("documents")
    .select("id")
    .eq("project_id", params.id);

  const docIds = (docs ?? []).map((d: { id: string }) => d.id);
  if (docIds.length === 0) return ok([]);

  const { data, error } = await admin
    .from("analyses")
    .select("*, documents(doc_type), analysis_items(*)")
    .in("document_id", docIds)
    .order("created_at", { ascending: false });

  if (error) return err(error.message, 500);
  return ok(data);
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const admin = createAdminClient();

  const { data: project } = await admin
    .from("projects")
    .select("*")
    .eq("id", params.id)
    .eq("org_id", user.org_id)
    .single();
  if (!project) return err("Projekt nicht gefunden", 404);

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return err("Keine Datei hochgeladen");
  const docType = (formData.get("doc_type") as string | null) || "Grundriss";

  const fileBytes = Buffer.from(await file.arrayBuffer());
  const base64Data = fileBytes.toString("base64");
  const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");

  // Upload to Supabase Storage
  const storagePath = `${params.id}/${crypto.randomUUID()}_${file.name}`;
  const { data: uploadData } = await admin.storage
    .from("documents")
    .upload(storagePath, fileBytes, { contentType: file.type || "application/pdf" });

  const fileUrl = uploadData
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/${storagePath}`
    : storagePath;

  // Create document record
  const { data: doc, error: docError } = await admin
    .from("documents")
    .insert({ project_id: params.id, file_url: fileUrl, doc_type: docType })
    .select()
    .single();
  if (docError) return err(docError.message, 500);

  // Create analysis record (status: running)
  const { data: analysis, error: analysisError } = await admin
    .from("analyses")
    .insert({ document_id: doc.id, status: "running" })
    .select()
    .single();
  if (analysisError) return err(analysisError.message, 500);

  try {
    // 1. Load project norms
    const { data: pnRows } = await admin
      .from("project_norms")
      .select("norms(id, title, category, text, layer, zone)")
      .eq("project_id", params.id);

    const normContext = buildNormContext((pnRows ?? []) as unknown as ProjectNormRow[], project.bauzone ?? null);

    // 2. Build file block
    const fileBlock = isPdf
      ? ({ type: "document", source: { type: "base64", media_type: "application/pdf" as const, data: base64Data } } as const)
      : ({ type: "image",    source: { type: "base64", media_type: (file.type || "image/jpeg") as "image/jpeg" | "image/png" | "image/webp" | "image/gif", data: base64Data } } as const);

    const canton       = project.location?.canton      ?? "";
    const municipality = project.location?.municipality ?? "";
    const bauzone      = project.bauzone                ?? "";

    const userText =
      `PROJEKTKONTEXT:\n` +
      `- Gemeinde: ${municipality}\n` +
      `- Kanton: ${canton}\n` +
      `- Bauzone: ${bauzone || "unbekannt"}\n\n` +
      `${normContext}\n\n` +
      `Analysiere den beigefügten Bauplan gegen alle genannten Normen.\n` +
      `Gib für jede Norm mindestens einen Prüfpunkt aus.`;

    type Msg = Parameters<typeof anthropic.messages.create>[0]["messages"][number];
    const messages: Msg[] = [{
      role: "user",
      content: [fileBlock, { type: "text", text: userText }],
    }];

    // 3. First call — no tools, pure JSON
    let response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages,
    });

    let totalInput  = response.usage?.input_tokens  ?? 0;
    let totalOutput = response.usage?.output_tokens ?? 0;

    const textBlock = response.content.find((b) => b.type === "text");
    let rawText = textBlock?.type === "text" ? textBlock.text : "[]";

    // 4. Parse — one retry on failure
    let items: CheckItem[];
    try {
      items = parseItems(rawText);
    } catch {
      const retry = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 8192,
        system: [{ type: "text", text: SYSTEM_PROMPT }],
        messages: [
          ...messages,
          { role: "assistant", content: rawText },
          {
            role: "user",
            content:
              "Deine Antwort konnte nicht als valides JSON geparst werden. " +
              "Gib NUR das JSON-Array aus, absolut kein anderer Text.",
          },
        ],
      });
      totalInput  += retry.usage?.input_tokens  ?? 0;
      totalOutput += retry.usage?.output_tokens ?? 0;
      const retryText = retry.content.find((b) => b.type === "text");
      rawText = retryText?.type === "text" ? retryText.text : "[]";
      items = parseItems(rawText);   // throws → caught by outer try/catch
    }

    // 5. Cost
    const costUsd = totalInput * 3.0 / 1_000_000 + totalOutput * 15.0 / 1_000_000;

    // 6. Save items
    if (items.length > 0) {
      await admin.from("analysis_items").insert(
        items.map((item) => ({
          analysis_id:    analysis.id,
          norm_id:        item.norm_id,
          norm_title:     item.norm_title,
          category:       item.category,
          status:         item.status,
          note:           item.finding,        // 'note' column stores the finding text
          suggestion:     item.suggestion,
          confidence:     item.confidence,
          page_reference: item.page_reference,
        }))
      );
    }

    // 7. Finalise analysis
    const { data: finalAnalysis } = await admin
      .from("analyses")
      .update({ status: "done", result_json: { raw: rawText }, cost_usd: costUsd })
      .eq("id", analysis.id)
      .select()
      .single();

    return ok({ ...finalAnalysis, items }, 201);

  } catch (e) {
    await admin.from("analyses").update({ status: "error" }).eq("id", analysis.id);
    return err(e instanceof Error ? e.message : "Analyse fehlgeschlagen", 500);
  }
}
