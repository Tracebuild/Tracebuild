import { getAuthUser, ok, unauthorized, err } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { anthropic } from "@/lib/anthropic";
import { getDomain } from "@/lib/domains/bau";

export const maxDuration = 300; // 5 Min für Claude Vision (Vercel Pro)

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const admin = createAdminClient();

  // Projektzugehörigkeit prüfen
  const { data: project } = await admin
    .from("projects")
    .select("id")
    .eq("id", params.id)
    .eq("org_id", user.org_id)
    .single();
  if (!project) return err("Projekt nicht gefunden", 404);

  // PostgREST kann parent-Zeilen nicht über related-table-Filter einschränken
  // → 2-Schritt-Query: erst Dokument-IDs holen, dann Analysen filtern
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

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const admin = createAdminClient();

  // Projekt + Domain + Location laden
  const { data: project } = await admin
    .from("projects")
    .select("*")
    .eq("id", params.id)
    .eq("org_id", user.org_id)
    .single();
  if (!project) return err("Projekt nicht gefunden", 404);

  // Datei aus multipart form data lesen
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return err("Keine Datei hochgeladen");
  const docType = (formData.get("doc_type") as string | null) || "Grundriss";

  const fileBytes = Buffer.from(await file.arrayBuffer());
  const base64Data = fileBytes.toString("base64");
  const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
  const imageMediaType = (isPdf ? "image/jpeg" : (file.type || "image/jpeg")) as "image/jpeg" | "image/png" | "image/webp" | "image/gif";

  // 1. In Supabase Storage hochladen
  const storagePath = `${params.id}/${crypto.randomUUID()}_${file.name}`;
  const { data: uploadData } = await admin.storage
    .from("documents")
    .upload(storagePath, fileBytes, { contentType: file.type || "application/pdf" });

  const fileUrl = uploadData
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/${storagePath}`
    : storagePath;

  // 2. Dokument-Eintrag in DB
  const { data: doc, error: docError } = await admin
    .from("documents")
    .insert({ project_id: params.id, file_url: fileUrl, doc_type: docType })
    .select()
    .single();
  if (docError) return err(docError.message, 500);

  // 3. Analyse-Eintrag anlegen (status: running)
  const { data: analysis, error: analysisError } = await admin
    .from("analyses")
    .insert({ document_id: doc.id, status: "running" })
    .select()
    .single();
  if (analysisError) return err(analysisError.message, 500);

  const domain = getDomain(project.domain);
  const canton = project.location?.canton ?? "";

  try {
    // 4. Claude Vision mit Tool-Loop
    const tools: Parameters<typeof anthropic.messages.create>[0]["tools"] = [{
      name: "get_standards",
      description: "Lädt die relevanten Baunormen für den angegebenen Kanton aus der Datenbank.",
      input_schema: {
        type: "object" as const,
        properties: {
          jurisdiction_name: { type: "string", description: "Kantonskürzel z.B. ZH, BE, SG" },
          jurisdiction_type: { type: "string", description: "Typ: cantonal, municipal, national" },
        },
        required: ["jurisdiction_name"],
      },
    }];

    type MessageParam = Parameters<typeof anthropic.messages.create>[0]["messages"][number];
    // PDFs als document-Block, Bilder als image-Block senden
    const fileBlock = isPdf
      ? ({ type: "document", source: { type: "base64", media_type: "application/pdf" as const, data: base64Data } } as const)
      : ({ type: "image", source: { type: "base64", media_type: imageMediaType, data: base64Data } } as const);

    const messages: MessageParam[] = [{
      role: "user",
      content: [
        fileBlock,
        {
          type: "text",
          text: `Analysiere diesen Bauplan. Kanton: ${canton}. Gemeinde: ${project.location?.municipality ?? "unbekannt"}.`,
        },
      ],
    }];

    let response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: [{ type: "text", text: domain.getAnalysisPrompt(), cache_control: { type: "ephemeral" } }],
      tools,
      messages,
    });

    // Tool-Use-Loop — alle tool_use-Blöcke in einer Runde beantworten
    while (response.stop_reason === "tool_use") {
      const toolUseBlocks = response.content.filter((b) => b.type === "tool_use");
      if (toolUseBlocks.length === 0) break;

      const toolResults = await Promise.all(
        toolUseBlocks.map(async (block) => {
          if (block.type !== "tool_use") return null;
          const input = block.input as { jurisdiction_name?: string; jurisdiction_type?: string };
          const jName = input.jurisdiction_name ?? canton;
          const jType = input.jurisdiction_type ?? "cantonal";

          const { data: standards } = await admin
            .from("standards")
            .select("category, text, source_url")
            .eq("domain", project.domain)
            .eq("jurisdiction_type", jType)
            .eq("jurisdiction_name", jName)
            .limit(20);

          return {
            type: "tool_result" as const,
            tool_use_id: block.id,
            content: JSON.stringify(standards ?? []),
          };
        })
      );

      messages.push({ role: "assistant", content: response.content });
      messages.push({
        role: "user",
        content: toolResults.filter((r): r is NonNullable<typeof r> => r !== null),
      });

      response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        system: [{ type: "text", text: domain.getAnalysisPrompt(), cache_control: { type: "ephemeral" } }],
        tools,
        messages,
      });
    }

    // 5. Antwort parsen
    const textBlock = response.content.find((b) => b.type === "text");
    const rawText = textBlock?.type === "text" ? textBlock.text : "";
    const items = domain.parseAnalysisResult(rawText);

    // 6. Kosten berechnen
    const inputTokens = response.usage?.input_tokens ?? 0;
    const outputTokens = response.usage?.output_tokens ?? 0;
    const costUsd = (inputTokens * 3.0) / 1_000_000 + (outputTokens * 15.0) / 1_000_000;

    // 7. Analysis Items speichern
    if (items.length > 0) {
      await admin.from("analysis_items").insert(
        items.map((item) => ({
          analysis_id: analysis.id,
          status: item.status,
          note: item.note,
          suggestion: item.suggestion,
        }))
      );
    }

    // 8. Analyse abschliessen
    const { data: finalAnalysis } = await admin
      .from("analyses")
      .update({ status: "done", result_json: { items }, cost_usd: costUsd })
      .eq("id", analysis.id)
      .select()
      .single();

    return ok({ ...finalAnalysis, items }, 201);
  } catch (e) {
    await admin
      .from("analyses")
      .update({ status: "error" })
      .eq("id", analysis.id);
    return err(e instanceof Error ? e.message : "Analyse fehlgeschlagen", 500);
  }
}
