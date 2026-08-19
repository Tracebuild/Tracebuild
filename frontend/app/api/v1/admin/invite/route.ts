import { getAuthUser, ok, unauthorized, forbidden, err } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

// POST /api/v1/admin/invite — invite user by email
export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return unauthorized();
  if (!["super_admin", "org_admin"].includes(user.role)) return forbidden();

  const body = await request.json() as { email?: string; role?: string; org_id?: string };
  if (!body.email) return err("E-Mail fehlt");

  const role = body.role ?? "member";
  const ALLOWED_ROLES = ["org_admin", "project_manager", "member"];
  if (!ALLOWED_ROLES.includes(role)) return err("Ungültige Rolle");

  const admin = createAdminClient();
  const { origin } = new URL(request.url);

  // Only super_admin may target an org other than their own
  let targetOrgId = user.org_id;
  if (body.org_id && body.org_id !== user.org_id) {
    if (user.role !== "super_admin") return forbidden();
    const { data: org } = await admin
      .from("organizations")
      .select("id")
      .eq("id", body.org_id)
      .is("deleted_at", null)
      .maybeSingle();
    if (!org) return err("Organisation nicht gefunden", 404);
    targetOrgId = body.org_id;
  }

  // Check for an existing account with this email (global — one auth user per email)
  const { data: existing } = await admin
    .from("users")
    .select("id, org_id")
    .eq("email", body.email)
    .maybeSingle();

  if (existing) {
    if (existing.org_id !== targetOrgId) {
      return err("Benutzer gehört bereits einer anderen Organisation an.");
    }
    const { data: authUser } = await admin.auth.admin.getUserById(existing.id);
    if (authUser?.user?.last_sign_in_at) {
      return err("Benutzer ist bereits aktives Mitglied dieser Organisation.");
    }
    // Existing but never signed in — invite was never completed, fall through to resend.
  }

  // Invite via Supabase Auth — lands the user on /set-password after clicking the email link
  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    body.email,
    {
      redirectTo: `${origin}/auth/callback?next=/set-password`,
      data: {
        org_id: targetOrgId,
        invited_role: role,
      },
    }
  );

  if (inviteError) return err(inviteError.message, 500);

  // Pre-create/update user row so org_id + role are set before first login
  if (invited.user) {
    await admin.from("users").upsert({
      id: invited.user.id,
      org_id: targetOrgId,
      email: body.email,
      role,
    }, { onConflict: "id" });
  }

  return ok({ email: body.email, role, org_id: targetOrgId, resent: !!existing }, 201);
}
