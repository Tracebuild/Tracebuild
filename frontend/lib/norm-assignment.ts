import { createAdminClient } from "@/lib/supabase/admin";
import type { GeoportalDocument } from "@/lib/geoportal";
import { extractNormsFromDocument } from "@/lib/norm-extraction";

/**
 * Classify a geoportal legal-basis document into the same layer/jurisdiction
 * scheme used by the `norms` catalog, using signals from the federal
 * "MGDM Nutzungsplanung" document schema (not canton-specific):
 *   - "SR ..." official number (Systematische Rechtssammlung) → federal law
 *   - Typ "Rechtsvorschrift" → the municipal building code (Bau-/Zonenordnung)
 *   - everything else ("GesetzlicheGrundlage") → cantonal law/ordinance
 */
function classifyGeoportalDocument(
  doc: GeoportalDocument,
  canton: string,
  municipality: string
): { layer: number; jurisdiction_type: string; jurisdiction_name: string | null } {
  const isFederal = /^"?SR\s/i.test(doc.offizielleNr ?? "") || /bundesgesetz|bundesverordnung/i.test(doc.titel);
  if (isFederal) return { layer: 1, jurisdiction_type: "national", jurisdiction_name: null };
  if (doc.typ === "Rechtsvorschrift") return { layer: 4, jurisdiction_type: "municipal", jurisdiction_name: municipality };
  return { layer: 3, jurisdiction_type: "cantonal", jurisdiction_name: canton };
}

/**
 * Insert (or reuse) `norms` rows for legal-basis documents found via the geoportal
 * zone lookup, and link them to the project with added_by: "geoportal" — a distinct
 * marker from "system" (catalog match) and "user" (manual add) so the UI can flag
 * these as already-imported and not needing manual re-entry.
 */
export async function assignGeoportalNorms(
  projectId: string,
  domain: string,
  canton: string,
  municipality: string,
  zoneLabel: string | null,
  documents: GeoportalDocument[]
): Promise<number> {
  if (!documents.length) return 0;
  const admin = createAdminClient();
  let count = 0;

  for (const doc of documents) {
    if (!doc.link || !doc.titel) continue;
    const { layer, jurisdiction_type, jurisdiction_name } = classifyGeoportalDocument(doc, canton, municipality);

    const { data: existing } = await admin
      .from("norms")
      .select("id")
      .eq("source_url", doc.link)
      .maybeSingle();

    let normId: string | undefined = existing?.id;
    if (!normId) {
      const { data: inserted, error } = await admin
        .from("norms")
        .insert({
          title: doc.titel,
          domain,
          layer,
          jurisdiction_type,
          jurisdiction_name,
          category: "Nutzungsplanung",
          text: `Gesetzliche Grundlage zur Nutzungsplanung${zoneLabel ? ` (Zone: ${zoneLabel})` : ""}, automatisch aus dem Geoportal übernommen. Volltext unter der Quelle einsehbar.`,
          source_url: doc.link,
          source_doc: doc.abkuerzung ?? doc.offizielleNr ?? null,
          extracted: false,
        })
        .select("id")
        .single();
      if (error || !inserted) continue;
      normId = inserted.id;
    }

    const { error: linkErr } = await admin
      .from("project_norms")
      .upsert(
        { project_id: projectId, norm_id: normId, added_by: "geoportal" },
        { onConflict: "project_id,norm_id", ignoreDuplicates: true }
      );
    if (!linkErr) count++;
  }

  return count;
}

interface UnextractedNorm {
  id: string;
  title: string;
  domain: string;
  layer: number;
  jurisdiction_type: string;
  jurisdiction_name: string | null;
  source_url: string | null;
  source_doc: string | null;
}

/**
 * Upgrades a project's geoportal-sourced reference norms (title + generic boilerplate
 * text pointing at a source link) into the concrete rules extracted from those source
 * documents (Grenzabstand, Gebäudehöhe, etc.) — norm by norm, each still carrying its
 * own source_url. Runs one Claude call per not-yet-extracted document, so this is meant
 * to be triggered on demand (e.g. when the Normen tab is opened), not at project creation.
 * Falls back to leaving the reference norm in place — untouched, still visible — for any
 * document where extraction finds nothing (failed fetch, no rules found).
 */
export async function enrichGeoportalNorms(
  projectId: string,
  canton: string,
  municipality: string,
  zoneLabel: string | null
): Promise<{ extracted: number; remaining: number }> {
  const admin = createAdminClient();

  const { data: rows } = await admin
    .from("project_norms")
    .select("norm_id, norms!inner(id, title, domain, layer, jurisdiction_type, jurisdiction_name, source_url, source_doc, extracted)")
    .eq("project_id", projectId)
    .eq("added_by", "geoportal")
    .eq("norms.extracted", false);

  const pending = (rows ?? [])
    .map((r) => r.norms as unknown as UnextractedNorm)
    .filter((n): n is UnextractedNorm => !!n?.source_url);

  if (!pending.length) return { extracted: 0, remaining: 0 };

  let extractedCount = 0;
  let remaining = 0;

  for (const norm of pending) {
    const doc: GeoportalDocument = {
      typ: "", titel: norm.title, abkuerzung: norm.source_doc, link: norm.source_url, offizielleNr: null,
    };
    const rules = await extractNormsFromDocument(doc, {
      code: zoneLabel, label: zoneLabel, kanton: canton, gemeinde: municipality,
    }).catch(() => []);

    if (!rules.length) {
      remaining++;
      continue;
    }

    for (const rule of rules) {
      // .is() is a PostgREST null/true/false check — only valid for the null case here,
      // a real jurisdiction_name (e.g. "Mels") needs .eq() instead.
      let dedupQuery = admin
        .from("norms")
        .select("id")
        .eq("title", rule.title)
        .eq("jurisdiction_type", norm.jurisdiction_type)
        .is("org_id", null);
      dedupQuery = norm.jurisdiction_name
        ? dedupQuery.eq("jurisdiction_name", norm.jurisdiction_name)
        : dedupQuery.is("jurisdiction_name", null);
      const { data: existing } = await dedupQuery.maybeSingle();

      let ruleNormId: string | undefined = existing?.id;
      if (!ruleNormId) {
        const { data: inserted, error } = await admin
          .from("norms")
          .insert({
            title: rule.title,
            domain: norm.domain,
            layer: norm.layer,
            jurisdiction_type: norm.jurisdiction_type,
            jurisdiction_name: norm.jurisdiction_name,
            category: rule.category,
            text: rule.text,
            source_url: norm.source_url,
            source_doc: norm.source_doc,
            extracted: true,
          })
          .select("id")
          .single();
        if (error || !inserted) continue;
        ruleNormId = inserted.id;
      }

      await admin
        .from("project_norms")
        .upsert(
          { project_id: projectId, norm_id: ruleNormId, added_by: "geoportal" },
          { onConflict: "project_id,norm_id", ignoreDuplicates: true }
        );
    }

    // Replace the generic placeholder with the now-extracted specific rules.
    await admin.from("project_norms").delete().eq("project_id", projectId).eq("norm_id", norm.id);
    extractedCount += rules.length;
  }

  return { extracted: extractedCount, remaining };
}

export async function assignNorms(
  projectId: string,
  orgId: string,
  canton: string,
  municipality: string,
  domain: string
): Promise<number> {
  const admin = createAdminClient();
  const { data: norms } = await admin
    .from("norms")
    .select("id, layer, jurisdiction_type, jurisdiction_name, org_id")
    .eq("domain", domain);

  if (!norms?.length) return 0;

  const rows = norms
    .filter((n) => {
      if (n.layer === 1) return true;
      if (n.jurisdiction_type === "cantonal" && n.jurisdiction_name === canton) return true;
      if (n.jurisdiction_type === "municipal" && n.jurisdiction_name === municipality) return true;
      if (n.org_id && n.org_id === orgId) return true;
      return false;
    })
    .map((n) => ({ project_id: projectId, norm_id: n.id, added_by: "system" }));

  if (!rows.length) return 0;
  await admin
    .from("project_norms")
    .upsert(rows, { onConflict: "project_id,norm_id", ignoreDuplicates: true });
  return rows.length;
}
