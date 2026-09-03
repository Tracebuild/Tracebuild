import { getAuthUser, ok, unauthorized, forbidden, err } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export interface OrgUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  status: "pending" | "active";
}

interface UserRow {
  id: string;
  email: string;
  role: string;
  org_id: string;
  created_at: string;
  name?: string | null;
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
    // select("*") statt fester Spaltenliste: bleibt lauffähig, auch wenn die
    // Migration für users.name noch nicht eingespielt ist.
    admin.from("users").select("*"),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  if (orgsError) return err(orgsError.message, 500);
  if (usersError) return err(usersError.message, 500);
  if (authError) return err(authError.message, 500);

  const signedInIds = new Set(
    (authList?.users ?? []).filter(u => u.last_sign_in_at).map(u => u.id)
  );

  const rows = (users ?? []) as UserRow[];

  const groups: OrgUsersGroup[] = (orgs ?? [])
    .map(org => ({
      orgId: org.id as string,
      orgName: org.name as string,
      users: rows
        .filter(u => u.org_id === org.id)
        .map(u => ({
          id: u.id,
          email: u.email,
          name: (u.name ?? "").trim() || null,
          role: u.role,
          createdAt: u.created_at,
          status: (signedInIds.has(u.id) ? "active" : "pending") as "pending" | "active",
        }))
        .sort((a, b) => (a.name ?? a.email).localeCompare(b.name ?? b.email)),
    }))
    .sort((a, b) => a.orgName.localeCompare(b.orgName));

  return ok(groups);
}
