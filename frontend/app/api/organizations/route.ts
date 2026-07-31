import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ok, err, unauthorized } from "@/lib/auth";
import { validateCreate } from "@/lib/validations/organization";
import { slugify, uniqueSlug, formatOrg } from "@/lib/organizations";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("organizations")
    .select("*")
    .is("deleted_at", null)
    .order("is_default", { ascending: false })
    .order("created_at",  { ascending: true });

  if (error) return err(error.message, 500);
  return ok((data ?? []).map(formatOrg));
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  let body: unknown;
  try { body = await req.json(); } catch { return err("Ungültiger JSON-Body"); }

  const validation = validateCreate(body);
  if ("error" in validation) return err(validation.error);
  const input = validation.data;

  const admin = createAdminClient();
  const slug  = await uniqueSlug(admin, slugify(input.name));

  const { data, error } = await admin
    .from("organizations")
    .insert({
      name:             input.name,
      slug,
      description:      input.description    ?? null,
      plan:             input.plan,
      status:           input.status         ?? "active",
      owner_name:       input.ownerName      ?? null,
      owner_email:      input.ownerEmail     ?? null,
      user_limit:       input.userLimit      ?? null,
      project_limit:    input.projectLimit   ?? null,
      storage_limit_gb: input.storageLimitGb ?? null,
      monthly_budget:   input.monthlyBudget  ?? null,
    })
    .select()
    .single();

  if (error) return err(error.message, 500);
  return ok(formatOrg(data), 201);
}
