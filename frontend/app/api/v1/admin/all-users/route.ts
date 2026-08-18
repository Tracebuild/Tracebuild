import { getAuthUser, ok, unauthorized, forbidden, err } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export interface OrgUser {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  status: "pending" | "active";
}

export interface OrgUsersGroup {
  orgId: string;
  orgName: string;
  users: OrgUser[];
}

// GET /api/v1/admin/all-users — every user across every organization, grouped by org
export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();
  if (user.role !== "super_admin") return forbidden();

  const admin = createAdminClient();

  const [{ data: orgs, error: orgsError }, { data: users, error: usersError }, { data: authList, error: authError }] = await Promise.all([
    admin.from("organizations").select("id, name").is("deleted_at", null),
    admin.from("users").select("id, email, role, org_id, created_at"),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  if (orgsError) return err(orgsError.message, 500);
  if (usersError) return err(usersError.message, 500);
  if (authError) return err(authError.message, 500);

  const signedInIds = new Set(
    (authList?.users ?? []).filter(u => u.last_sign_in_at).map(u => u.id)
  );

  const groups: OrgUsersGroup[] = (orgs ?? [])
    .map(org => ({
      orgId: org.id as string,
      orgName: org.name as string,
      users: (users ?? [])
        .filter(u => u.org_id === org.id)
        .map(u => ({
          id: u.id as string,
          email: u.email as string,
          role: u.role as string,
          createdAt: u.created_at as string,
          status: (signedInIds.has(u.id as string) ? "active" : "pending") as "pending" | "active",
        }))
        .sort((a, b) => a.email.localeCompare(b.email)),
    }))
    .sort((a, b) => a.orgName.localeCompare(b.orgName));

  return ok(groups);
}
