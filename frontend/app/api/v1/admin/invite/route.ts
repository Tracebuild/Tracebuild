import { getAuthUser, ok, unauthorized, forbidden, err } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

// POST /api/v1/admin/invite — invite user by email
export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return unauthorized();
  if (!["super_admin", "org_admin"].includes(user.role)) return forbidden();

  const body = await request.json() as { email?: string; role?: string };
  if (!body.email) return err("E-Mail fehlt");

  const role = body.role ?? "member";
  const ALLOWED_ROLES = ["org_admin", "project_manager", "member"];
  if (!ALLOWED_ROLES.includes(role)) return err("Ungültige Rolle");

  const admin = createAdminClient();

  // Check if user already exists in this org
  const { data: existing } = await admin
    .from("users")
    .select("id")
    .eq("email", body.email)
    .eq("org_id", user.org_id)
    .maybeSingle();

  if (existing) return err("Benutzer ist bereits Mitglied dieser Organisation");

  // Invite via Supabase Auth
  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    body.email,
    {
      data: {
        org_id: user.org_id,
        invited_role: role,
      },
    }
  );

  if (inviteError) return err(inviteError.message, 500);

  // Pre-create user row so org_id + role are set before first login
  if (invited.user) {
    await admin.from("users").upsert({
      id: invited.user.id,
      org_id: user.org_id,
      email: body.email,
      role,
    }, { onConflict: "id" });
  }

  return ok({ email: body.email, role }, 201);
}
