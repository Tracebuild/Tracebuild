import { getAuthUser, ok, unauthorized, forbidden, err } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/v1/admin/projects — list all org projects with doc + member counts
export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();
  if (!["super_admin", "org_admin"].includes(user.role)) return forbidden();

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("projects")
    .select(`
      id, name, domain, status, created_at, bauzone,
      location,
      documents(count),
      project_members(count)
    `)
    .eq("org_id", user.org_id)
    .order("created_at", { ascending: false });

  if (error) return err(error.message, 500);
  return ok(data);
}
