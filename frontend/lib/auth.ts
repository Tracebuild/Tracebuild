import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export type UserRole = "super_admin" | "org_admin" | "project_manager" | "member";

export interface AuthUser {
  id:     string;
  email:  string;
  org_id: string;
  role:   UserRole;
}

const ADMIN_EMAILS = new Set([
  "tracebuild.info@gmail.com",
  "livio.thoma07@gmail.com",
  "jonasjud87@gmail.com",
  "liviocyrill.thomamanser@gmail.com",
]);

export const ACTIVE_ORG_COOKIE = "tb_active_org_id";

export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const email = user.email ?? "";
  const admin = createAdminClient();

  if (ADMIN_EMAILS.has(email)) {
    const cookieStore = await cookies();
    const activeOrgId = cookieStore.get(ACTIVE_ORG_COOKIE)?.value;

    if (activeOrgId) {
      const { data: org } = await admin
        .from("organizations")
        .select("id")
        .eq("id", activeOrgId)
        .is("deleted_at", null)
        .maybeSingle();
      if (org) {
        return { id: user.id, email, org_id: activeOrgId, role: "super_admin" };
      }
    }

    // Fallback: use default org, then any org
    const { data: defaultOrg } = await admin
      .from("organizations")
      .select("id")
      .eq("is_default", true)
      .is("deleted_at", null)
      .limit(1)
      .maybeSingle();
    if (defaultOrg) {
      return { id: user.id, email, org_id: defaultOrg.id, role: "super_admin" };
    }

    const { data: anyOrg } = await admin
      .from("organizations")
      .select("id")
      .is("deleted_at", null)
      .limit(1)
      .maybeSingle();
    if (anyOrg) {
      return { id: user.id, email, org_id: anyOrg.id, role: "super_admin" };
    }

    return null;
  }

  // Regular user
  const { data: rows } = await admin
    .from("users")
    .select("org_id, role")
    .eq("id", user.id)
    .limit(1);

  const row = rows?.[0] ?? null;

  if (!row) {
    const { data: org } = await admin
      .from("organizations")
      .insert({ name: `Org von ${email}` })
      .select()
      .single();
    if (!org) return null;

    await admin.from("users").insert({
      id: user.id,
      org_id: org.id,
      email,
      role: "org_admin",
    });

    return { id: user.id, email, org_id: org.id, role: "org_admin" };
  }

  return {
    id:     user.id,
    email,
    org_id: row.org_id,
    role:   (row.role as UserRole) ?? "member",
  };
}

export function requireRole(user: AuthUser | null, ...roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

export function unauthorized() {
  return NextResponse.json({ data: null, error: "Nicht eingeloggt" }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ data: null, error: "Zugriff verweigert" }, { status: 403 });
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data, error: null }, { status });
}

export function err(message: string, status = 400) {
  return NextResponse.json({ data: null, error: message }, { status });
}
