import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ok, err, unauthorized } from "@/lib/auth";
import { validateChangeStatus } from "@/lib/validations/organization";
import { formatOrg } from "@/lib/organizations";

type RouteContext = { params: { id: string } };

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const { id } = params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  let body: unknown;
  try { body = await req.json(); } catch { return err("Ungültiger JSON-Body"); }

  const validation = validateChangeStatus(body);
  if ("error" in validation) return err(validation.error);
  const { status } = validation.data;

  const admin = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patch: Record<string, any> = { status };

  if (status === "closed") {
    patch.closed_at   = new Date().toISOString();
    patch.archived_at = null;
  } else if (status === "archived") {
    patch.archived_at = new Date().toISOString();
    patch.closed_at   = null;
  } else {
    patch.closed_at   = null;
    patch.archived_at = null;
  }

  const { data, error } = await admin
    .from("organizations")
    .update(patch)
    .eq("id", id)
    .is("deleted_at", null)
    .select()
    .single();

  if (error || !data) return err(error?.message ?? "Organisation nicht gefunden", 404);
  return ok(formatOrg(data));
}
