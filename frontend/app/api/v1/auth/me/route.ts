import { getAuthUser, ok, unauthorized } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const admin = createAdminClient();
  const { data: org } = await admin
    .from("organizations")
    .select("id, name, slug")
    .eq("id", user.org_id)
    .maybeSingle();

  return ok({
    id:     user.id,
    email:  user.email,
    org_id: user.org_id,
    role:   user.role,
    org:    org ? { id: org.id, name: org.name as string, slug: org.slug as string } : null,
  });
}
