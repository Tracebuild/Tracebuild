import { getAuthUser, ok, unauthorized, err } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

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
  const { name, domain = "bau", location = {} } = body;
  if (!name) return err("Name fehlt");

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("projects")
    .insert({ name, domain, location, org_id: user.org_id, status: "active" })
    .select()
    .single();

  if (error) return err(error.message, 500);
  return ok(data, 201);
}
