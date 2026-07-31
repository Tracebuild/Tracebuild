import { getAuthUser, ok, unauthorized, forbidden, err } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/v1/admin/users — list all users in caller's org
export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();
  if (!["super_admin", "org_admin"].includes(user.role)) return forbidden();

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("users")
    .select("id, email, role, created_at")
    .eq("org_id", user.org_id)
    .order("created_at", { ascending: true });

  if (error) return err(error.message, 500);
  return ok(data);
}
