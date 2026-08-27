import { getAuthUser, ok, unauthorized, err } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
// pdf-parse hat keinen default-Export in ESM — über require laden
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;

const LAYER_BY_JURISDICTION: Record<string, number> = {
  national: 1,
  cantonal: 3,
  municipal: 4,
};

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const domain = (formData.get("domain") as string) ?? "bau";
  const jurisdictionType = (formData.get("jurisdiction_type") as string) || "cantonal";
  const jurisdictionName = (formData.get("jurisdiction_name") as string) || null;
  const category = formData.get("category") as string;
  const sourceName = (formData.get("source_name") as string) || null;
  const zone = (formData.get("zone") as string) || null;

  if (!file) return err("Keine Datei hochgeladen");
  if (!category) return err("Kategorie fehlt");
  if (jurisdictionType !== "national" && !jurisdictionName) return err("Kanton/Gemeinde fehlt");

  const fileBytes = Buffer.from(await file.arrayBuffer());
  let text = "";

  if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
    try {
      const result = await pdfParse(fileBytes);
      text = result.text;
    } catch {
      return err("PDF konnte nicht gelesen werden");
    }
  } else {
    text = fileBytes.toString("utf-8");
  }

  // Max 100K Zeichen
  text = text.slice(0, 100_000);
  const title = sourceName || file.name;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("norms")
    .insert({
      title,
      domain,
      layer: LAYER_BY_JURISDICTION[jurisdictionType] ?? 3,
      jurisdiction_type: jurisdictionType,
      jurisdiction_name: jurisdictionType === "national" ? null : jurisdictionName,
      category: category.trim(),
      text,
      source_url: sourceName || file.name,
      zone: zone?.trim() || null,
    })
    .select()
    .single();

  if (error) return err(error.message, 500);
  return ok({ count: 1, jurisdiction_name: jurisdictionName, category, id: data.id }, 201);
}
