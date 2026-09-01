import { createAdminClient } from "@/lib/supabase/admin";

interface NormRow {
  id: string;
  layer: number;
  jurisdiction_type: string;
  jurisdiction_name: string | null;
  org_id: string | null;
}

/**
 * Which norms apply to a project of this org, in this canton and municipality:
 *   Bund      — every project gets it
 *   Kanton    — matched on the project's canton
 *   Gemeinde  — matched on the project's municipality
 *   Org       — the org's own Spezialnormen
 *
 * Zone is deliberately NOT part of this. A norm's zone tag is evaluated when the
 * norms are read (Normen tab, analysis prompt) via normMatchesZone, so correcting
 * a project's Bauzone takes effect immediately without re-running assignment.
 */
function applies(n: NormRow, canton: string, municipality: string): boolean {
  if (n.layer === 1) return true;
  if (n.jurisdiction_type === "cantonal" && n.jurisdiction_name === canton) return true;
  if (n.jurisdiction_type === "municipal" && n.jurisdiction_name === municipality) return true;
  if (n.jurisdiction_type === "org") return true;
  return false;
}

/**
 * Brings a project's automatically assigned norms in sync with the catalog:
 * attaches everything that applies and detaches what no longer does (e.g. after the
 * municipality was corrected). Only rows this function created itself
 * (added_by = "system") are ever removed — norms a user attached by hand stay put.
 *
 * Returns how many norms are attached automatically after the sync.
 */
export async function assignNorms(
  projectId: string,
  orgId: string,
  canton: string,
  municipality: string,
  domain: string
): Promise<number> {
  // Candidates are norms owned by this project's org, plus platform-wide norms
  // (org_id IS NULL, e.g. promoted by a super_admin via the admin norms catalog).
  const admin = createAdminClient();
  const { data: norms, error: normsErr } = await admin
    .from("norms")
    .select("id, layer, jurisdiction_type, jurisdiction_name, org_id")
    .eq("domain", domain)
    .or(`org_id.eq.${orgId},org_id.is.null`);
  if (normsErr) throw new Error(`Normen konnten nicht gelesen werden: ${normsErr.message}`);

  const shouldHave = new Set(
    (norms ?? []).filter((n) => applies(n as NormRow, canton, municipality)).map((n) => n.id as string)
  );

  const { data: existing, error: existingErr } = await admin
    .from("project_norms")
    .select("norm_id, added_by")
    .eq("project_id", projectId);
  if (existingErr) throw new Error(`Projekt-Normen konnten nicht gelesen werden: ${existingErr.message}`);

  const alreadyLinked = new Set((existing ?? []).map((r) => r.norm_id as string));

  const toAdd = Array.from(shouldHave)
    .filter((id) => !alreadyLinked.has(id))
    .map((id) => ({ project_id: projectId, norm_id: id, added_by: "system" }));

  // Stale automatic links — a norm that no longer applies after the project's
  // canton/municipality changed. Manual additions are left alone on purpose.
  const toRemove = (existing ?? [])
    .filter((r) => r.added_by === "system" && !shouldHave.has(r.norm_id as string))
    .map((r) => r.norm_id as string);

  if (toAdd.length) {
    const { error } = await admin
      .from("project_norms")
      .upsert(toAdd, { onConflict: "project_id,norm_id", ignoreDuplicates: true });
    if (error) throw new Error(`Normen konnten nicht zugewiesen werden: ${error.message}`);
  }

  if (toRemove.length) {
    const { error } = await admin
      .from("project_norms")
      .delete()
      .eq("project_id", projectId)
      .eq("added_by", "system")
      .in("norm_id", toRemove);
    if (error) throw new Error(`Veraltete Normen konnten nicht entfernt werden: ${error.message}`);
  }

  return shouldHave.size;
}

/**
 * Re-runs assignment for every project of an org — used after a norm was uploaded,
 * so a freshly added law reaches the projects it applies to instead of only ever
 * landing in projects created afterwards.
 *
 * Returns the number of projects touched. Never throws: a norm upload must not fail
 * because one project could not be synced.
 */
export async function assignNormsToOrgProjects(orgId: string): Promise<number> {
  const admin = createAdminClient();
  const { data: projects, error } = await admin
    .from("projects")
    .select("id, domain, location")
    .eq("org_id", orgId);

  if (error || !projects?.length) return 0;

  let synced = 0;
  for (const p of projects) {
    const loc = (p.location ?? {}) as { canton?: string; municipality?: string };
    try {
      await assignNorms(p.id, orgId, loc.canton ?? "", loc.municipality ?? "", p.domain ?? "bau");
      synced++;
    } catch (e) {
      console.error(`Normzuweisung für Projekt ${p.id} fehlgeschlagen:`, e);
    }
  }
  return synced;
}
