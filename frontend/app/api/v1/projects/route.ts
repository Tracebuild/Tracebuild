import { getAuthUser, ok, unauthorized, err } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { lookupParcel } from "@/lib/geoportal";
import { assignNorms } from "@/lib/norm-assignment";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("projects")
    .select("*")
    .eq("org_id", user.org_id)
    .order("created_at", { ascending: false });

  if (error) return err(error.message, 500);
  return ok(data);
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const body = await request.json();
  const { name, domain = "bau", location = {}, parcel_number, bauzone: bInput } = body;
  if (!name) return err("Name fehlt");

  // Geoportal: auto-fetch bauzone when parcel provided and not manually set
  let zone: string | null = bInput ?? null;
  if (parcel_number && !zone && location.municipality) {
    const geo = await lookupParcel(parcel_number, location.municipality);
    zone = geo.bauzone;
  }

  const admin = createAdminClient();
  const { data: project, error: insertErr } = await admin
    .from("projects")
    .insert({
      name,
      domain,
      location,
      org_id: user.org_id,
      status: "active",
      parcel_number: parcel_number ?? null,
      bauzone: zone ?? null,
    })
    .select()
    .single();

  if (insertErr) return err(insertErr.message, 500);

  // Assign norms synchronously so the count is in the response
  const assigned_norms_count = await assignNorms(
    project.id,
    user.org_id,
    location.canton ?? "",
    location.municipality ?? "",
    domain
  ).catch(() => 0);

  return ok({ project, assigned_norms_count, zone }, 201);
}
