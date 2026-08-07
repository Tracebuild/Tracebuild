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

  const { data: existing } = await admin
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) return err("Benutzer ist bereits Mitglied dieser Organisation.");

  const { data: authUser } = await admin.auth.admin.getUserByEmail(email);
  if (!authUser?.user) return err("Kein Supabase-Konto mit dieser E-Mail gefunden.");

  const { error } = await admin.from("users").insert({
    id: authUser.user.id,
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
