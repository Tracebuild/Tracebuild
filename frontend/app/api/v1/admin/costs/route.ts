import { getAuthUser, ok, unauthorized, forbidden, err } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export interface OrgCostRow {
  orgId: string;
  orgName: string;
  month: string; // "YYYY-MM"
  analyseCount: number;
  analyseCost: number;
  storageCost: number;
  databaseCost: number;
  ocrCost: number;
  infraCost: number;
  totalCost: number;
  currency: "CHF";
  status: "laufend" | "final";
  storageGB: number;
}

function monthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// GET /api/v1/admin/costs — real Claude analysis costs, aggregated per org per month
export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();
  if (user.role !== "super_admin") return forbidden();

  const admin = createAdminClient();

  const [
    { data: orgs, error: orgsErr },
    { data: projects, error: projErr },
    { data: docs, error: docErr },
  ] = await Promise.all([
    admin.from("organizations").select("id, name").is("deleted_at", null),
    admin.from("projects").select("id, org_id"),
    admin.from("documents").select("id, project_id"),
  ]);
  if (orgsErr) return err(orgsErr.message, 500);
  if (projErr) return err(projErr.message, 500);
  if (docErr) return err(docErr.message, 500);

  const { data: analyses, error: anErr } = await admin
    .from("analyses")
    .select("cost_usd, created_at, document_id")
    .eq("status", "done")
    .not("cost_usd", "is", null);
  if (anErr) return err(anErr.message, 500);

  const orgNameById = new Map((orgs ?? []).map(o => [o.id as string, o.name as string]));
  const orgIdByProjectId = new Map((projects ?? []).map(p => [p.id as string, p.org_id as string]));
  const projectIdByDocId = new Map((docs ?? []).map(d => [d.id as string, d.project_id as string]));

  const nowMonth = monthKey(new Date().toISOString());
  const buckets = new Map<string, OrgCostRow>();

  for (const a of analyses ?? []) {
    const projectId = projectIdByDocId.get(a.document_id as string);
    const orgId = projectId ? orgIdByProjectId.get(projectId) : undefined;
    if (!orgId) continue;
    const orgName = orgNameById.get(orgId) ?? "Unbekannt";
    const month = monthKey(a.created_at as string);
    const key = `${orgId}:${month}`;
    const cost = Number(a.cost_usd) || 0;

    const existing = buckets.get(key);
    if (existing) {
      existing.analyseCount += 1;
      existing.analyseCost += cost;
      existing.totalCost += cost;
    } else {
      buckets.set(key, {
        orgId,
        orgName,
        month,
        analyseCount: 1,
        analyseCost: cost,
        storageCost: 0,
        databaseCost: 0,
        ocrCost: 0,
        infraCost: 0,
        totalCost: cost,
        currency: "CHF",
        status: month === nowMonth ? "laufend" : "final",
        storageGB: 0,
      });
    }
  }

  const result = Array.from(buckets.values())
    .map(c => ({ ...c, analyseCost: +c.analyseCost.toFixed(4), totalCost: +c.totalCost.toFixed(4) }))
    .sort((a, b) => b.month.localeCompare(a.month) || a.orgName.localeCompare(b.orgName));

  return ok(result);
}
