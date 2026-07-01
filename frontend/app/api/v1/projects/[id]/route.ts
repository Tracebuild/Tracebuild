import { getAuthUser, ok, unauthorized, err } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("projects")
    .select("*")
    .eq("id", params.id)
    .eq("org_id", user.org_id)
    .single();

  if (error || !data) return err("Projekt nicht gefunden", 404);
  return ok(data);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const admin = createAdminClient();

  const { data: project } = await admin
    .from("projects")
    .select("id")
    .eq("id", params.id)
    .eq("org_id", user.org_id)
    .single();

  if (!project) return err("Projekt nicht gefunden", 404);

  const body = await request.json();
  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.location !== undefined) updates.location = body.location;
  if (body.domain !== undefined) updates.domain = body.domain;
  if (body.status !== undefined) updates.status = body.status;

  const { data, error } = await admin
    .from("projects")
    .update(updates)
    .eq("id", params.id)
    .select()
    .single();

  if (error) return err(error.message, 500);
  return ok(data);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const admin = createAdminClient();

  // Zugehörigkeit prüfen
  const { data: project } = await admin
    .from("projects")
    .select("id")
    .eq("id", params.id)
    .eq("org_id", user.org_id)
    .single();

  if (!project) return err("Projekt nicht gefunden", 404);

  const { error } = await admin.from("projects").delete().eq("id", params.id);
  if (error) return err(error.message, 500);
  return ok({ id: params.id });
}
