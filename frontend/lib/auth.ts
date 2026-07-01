import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export interface AuthUser {
  id: string;
  email: string;
  org_id: string;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from("users")
    .select("org_id")
    .eq("id", user.id)
    .limit(1)
    .single();

  if (!data) {
    // Erster Login: Organisation + User anlegen
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
      role: "owner",
    });

    return { id: user.id, email: user.email ?? "", org_id: org.id };
  }

  return { id: user.id, email: user.email ?? "", org_id: data.org_id };
}

export function unauthorized() {
  return NextResponse.json({ data: null, error: "Nicht eingeloggt" }, { status: 401 });
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data, error: null }, { status });
}

export function err(message: string, status = 400) {
  return NextResponse.json({ data: null, error: message }, { status });
}
