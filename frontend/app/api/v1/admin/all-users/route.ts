import { getAuthUser, ok, unauthorized, forbidden, err } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export interface OrgUsersGroup {
  orgId: string;
  orgName: string;
  users: { id: string; email: string; role: string; createdAt: string }[];
}

// GET /api/v1/admin/all-users — every user across every organization, grouped by org
export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();
  if (user.role !== "super_admin") return forbidden();

  const admin = createAdminClient();

  const [{ data: orgs, error: orgsError }, { data: users, error: usersError }] = await Promise.all([
    admin.from("organizations").select("id, name").is("deleted_at", null),
    admin.from("users").select("id, email, role, org_id, created_at"),
  ]);

  if (orgsError) return err(orgsError.message, 500);
  if (usersError) return err(usersError.message, 500);

  const groups: OrgUsersGroup[] = (orgs ?? [])
    .map(org => ({
      orgId: org.id as string,
      orgName: org.name as string,
      users: (users ?? [])
        .filter(u => u.org_id === org.id)
        .map(u => ({ id: u.id as string, email: u.email as string, role: u.role as string, createdAt: u.created_at as string }))
        .sort((a, b) => a.email.localeCompare(b.email)),
    }))
    .sort((a, b) => a.orgName.localeCompare(b.orgName));

  return ok(groups);
}
