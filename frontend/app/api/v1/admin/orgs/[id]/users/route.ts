import { NextRequest } from "next/server";
import { getAuthUser, unauthorized, forbidden, ok, err } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const ADMIN_ROLES = ["super_admin"] as const;

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser();
  if (!user) return unauthorized();
  if (!ADMIN_ROLES.includes(user.role as "super_admin")) return forbidden();

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("users")
    .select("id, email, role, created_at")
    .eq("org_id", params.id)
    .order("created_at", { ascending: true });

  if (error) return err(error.message, 500);
  return ok(data ?? []);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser();
  if (!user) return unauthorized();
  if (!ADMIN_ROLES.includes(user.role as "super_admin")) return forbidden();

  const body = await req.json().catch(() => null);
  const email: string | undefined = body?.email?.trim();
  const role: string = body?.role ?? "member";

  if (!email) return err("E-Mail ist erforderlich.");

  const admin = createAdminClient();

  const { data: existingRow } = await admin
    .from("users")
    .select("id, org_id")
    .eq("email", email)
    .maybeSingle();

  if (existingRow) {
    if (existingRow.org_id === params.id) return err("Benutzer ist bereits Mitglied dieser Organisation.");
    return err("Benutzer gehört bereits einer anderen Organisation an.");
  }

  const { data: listData, error: listError } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (listError) return err(listError.message, 500);
  const authUser = (listData as any)?.users?.find((u: any) => u.email === email);

  let authUserId: string;
  if (authUser) {
    authUserId = authUser.id;
  } else {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${siteUrl}/auth/callback`,
    });
    if (inviteError) return err(inviteError.message, 500);
    authUserId = invited.user.id;
  }

  const { error } = await admin.from("users").insert({
    id: authUserId,
    org_id: params.id,
    email,
    role,
  });

  if (error) return err(error.message, 500);
  return ok({ message: "Benutzer hinzugefügt." }, 201);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser();
  if (!user) return unauthorized();
  if (!ADMIN_ROLES.includes(user.role as "super_admin")) return forbidden();

  const body = await req.json().catch(() => null);
  const userId: string | undefined = body?.userId;
  if (!userId) return err("userId fehlt.");

  const admin = createAdminClient();
  const { error } = await admin
    .from("users")
    .delete()
    .eq("id", userId)
    .eq("org_id", params.id);

  if (error) return err(error.message, 500);
  return ok({ message: "Benutzer entfernt." });
}
