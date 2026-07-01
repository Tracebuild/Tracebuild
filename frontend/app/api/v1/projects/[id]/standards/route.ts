import { getAuthUser, ok, unauthorized, err } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const admin = createAdminClient();

  const { data: project } = await admin
    .from("projects")
    .select("domain, location")
    .eq("id", params.id)
    .eq("org_id", user.org_id)
    .single();
  if (!project) return err("Projekt nicht gefunden", 404);

  const canton = project.location?.canton;
  let query = admin
    .from("standards")
    .select("*")
    .eq("domain", project.domain ?? "bau");

  if (canton) {
    query = query
      .eq("jurisdiction_type", "cantonal")
      .eq("jurisdiction_name", canton);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) return err(error.message, 500);
  return ok(data);
}
