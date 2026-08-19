import { getAuthUser, ok, unauthorized, err } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { lookupParcel, type GeoportalDocument } from "@/lib/geoportal";
import { assignNorms, assignGeoportalNorms } from "@/lib/norm-assignment";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const admin = createAdminClient();
  const { data: project } = await admin
    .from("projects")
    .select("id, location, domain, parcel_number, bauzone")
    .eq("id", params.id)
    .eq("org_id", user.org_id)
    .single();
  if (!project) return err("Projekt nicht gefunden", 404);

  const loc = project.location ?? {};

  // Re-run geoportal if a parcel number is stored
  let zone: string | null = project.bauzone ?? null;
  let documents: GeoportalDocument[] = [];
  if (project.parcel_number && loc.municipality) {
    const geo = await lookupParcel(project.parcel_number, loc.municipality, loc.canton);
    documents = geo.documents;
    if (geo.bauzone) {
      zone = geo.bauzone;
      await admin.from("projects").update({ bauzone: zone }).eq("id", params.id);
    }
  }

  const assigned_norms_count = await assignNorms(
    params.id,
    user.org_id,
    loc.canton ?? "",
    loc.municipality ?? "",
    project.domain ?? "bau"
  ).catch(() => 0);

  const geoportal_norms_count = await assignGeoportalNorms(
    params.id,
    project.domain ?? "bau",
    loc.canton ?? "",
    loc.municipality ?? "",
    zone,
    documents
  ).catch(() => 0);

  return ok({ zone, assigned_norms_count, geoportal_norms_count });
}
