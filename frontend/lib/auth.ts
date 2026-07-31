import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export type UserRole = "super_admin" | "org_admin" | "project_manager" | "member";

export interface AuthUser {
  id: string;
  email: string;
  org_id: string;
  role: UserRole;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();

  // Only select org_id — avoids breaking if role column is missing
  const { data: rows } = await admin
    .from("users")
    .select("org_id, role")
    .eq("id", user.id)
    .limit(1);

  const row = rows?.[0] ?? null;

  if (!row) {
    // First login: create org + user
    const { data: org } = await admin
      .from("organizations")
      .insert({ name: `Org von ${user.email}` })
      .select()
      .single();
    if (!org) return null;

    await admin.from("users").insert({
      id: user.id,
      org_id: org.id,
      email: user.email ?? "",
      role: "org_admin",
    });

    return { id: user.id, email: user.email ?? "", org_id: org.id, role: "org_admin" };
  }

  return {
    id: user.id,
    email: user.email ?? "",
    org_id: row.org_id,
    role: (row.role as UserRole) ?? "member",
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
