import { getAuthUser, ok, unauthorized, err } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { enrichGeoportalNorms } from "@/lib/norm-assignment";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const admin = createAdminClient();
  const { data: project } = await admin
    .from("projects")
    .select("id, location, bauzone")
    .eq("id", params.id)
    .eq("org_id", user.org_id)
    .single();
  if (!project) return err("Projekt nicht gefunden", 404);

  const loc = project.location ?? {};
  const result = await enrichGeoportalNorms(
    params.id,
    loc.canton ?? "",
    loc.municipality ?? "",
    project.bauzone ?? null
  ).catch(() => ({ extracted: 0, remaining: 0 }));

  return ok(result);
}
