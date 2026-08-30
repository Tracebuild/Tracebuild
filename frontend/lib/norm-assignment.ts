import { createAdminClient } from "@/lib/supabase/admin";

export async function assignNorms(
  projectId: string,
  orgId: string,
  canton: string,
  municipality: string,
  domain: string
): Promise<number> {
  // Norms are org-scoped for now (no platform-wide catalog yet) — only this org's
  // own uploads are ever candidates, regardless of layer.
  const admin = createAdminClient();
  const { data: norms } = await admin
    .from("norms")
    .select("id, layer, jurisdiction_type, jurisdiction_name, org_id")
    .eq("domain", domain)
    .eq("org_id", orgId);

  if (!norms?.length) return 0;

  const rows = norms
    .filter((n) => {
      if (n.layer === 1) return true;
      if (n.jurisdiction_type === "cantonal" && n.jurisdiction_name === canton) return true;
      if (n.jurisdiction_type === "municipal" && n.jurisdiction_name === municipality) return true;
      if (n.jurisdiction_type === "org") return true;
      return false;
    })
    .map((n) => ({ project_id: projectId, norm_id: n.id, added_by: "system" }));

  if (!rows.length) return 0;
  await admin
    .from("project_norms")
    .upsert(rows, { onConflict: "project_id,norm_id", ignoreDuplicates: true });
  return rows.length;
}
