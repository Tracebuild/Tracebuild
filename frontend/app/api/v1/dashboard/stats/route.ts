import { NextRequest } from "next/server";
import { getAuthUser, unauthorized, ok, err } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(_req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const orgId = user.org_id;
  const admin = createAdminClient();

  const { data: projs, error: projErr } = await admin
    .from("projects")
    .select("id")
    .eq("org_id", orgId);
  if (projErr) return err(projErr.message, 500);

  const projectIds = (projs ?? []).map((p: { id: string }) => p.id);
  const projectsCount = projectIds.length;

  if (projectIds.length === 0) {
    return ok({ projects_count: 0, analyses_count: 0, fail_count: 0, ok_pct: null, activities: [] });
  }

  const { data: docs } = await admin
    .from("documents")
    .select("id")
    .in("project_id", projectIds);
  const docIds = (docs ?? []).map((d: { id: string }) => d.id);

  if (docIds.length === 0) {
    return ok({ projects_count: projectsCount, analyses_count: 0, fail_count: 0, ok_pct: null, activities: [] });
  }

  const { data: analyses } = await admin
    .from("analyses")
    .select("id, created_at")
    .eq("status", "done")
    .in("document_id", docIds)
    .order("created_at", { ascending: false });
  const analysisIds = (analyses ?? []).map((a: { id: string }) => a.id);

  if (analysisIds.length === 0) {
    return ok({ projects_count: projectsCount, analyses_count: 0, fail_count: 0, ok_pct: null, activities: [] });
  }

  const { data: items } = await admin
    .from("analysis_items")
    .select("status, analysis_id, note")
    .in("analysis_id", analysisIds);

  const allItems = items ?? [];
  const failCount = allItems.filter((i: { status: string }) => i.status === "fail").length;
  const okCount   = allItems.filter((i: { status: string }) => i.status === "ok").length;
  const warnCount = allItems.filter((i: { status: string }) => i.status === "warn").length;
  const total = failCount + okCount + warnCount;
  const okPct = total > 0 ? Math.round((okCount / total) * 1000) / 10 : null;

  const recentIds = new Set(analysisIds.slice(0, 10));
  const activities = allItems
    .filter((i: { status: string; analysis_id: string }) =>
      (i.status === "fail" || i.status === "warn") && recentIds.has(i.analysis_id)
    )
    .slice(0, 5)
    .map((item: { status: string; analysis_id: string; note?: string }) => {
      const analysis = (analyses ?? []).find((a: { id: string; created_at: string }) => a.id === item.analysis_id);
      return {
        text: item.note ?? (item.status === "fail" ? "Verstoss gefunden" : "Unklarer Punkt"),
        time: analysis?.created_at ?? new Date().toISOString(),
        status: item.status,
      };
    });

  return ok({ projects_count: projectsCount, analyses_count: analysisIds.length, fail_count: failCount, ok_pct: okPct, activities });
}
