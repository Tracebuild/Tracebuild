import { getAuthUser, ok, unauthorized, err } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain") ?? "bau";
  const jurisdictionType = searchParams.get("jurisdiction_type");
  const jurisdictionName = searchParams.get("jurisdiction_name");

  const admin = createAdminClient();
  let query = admin.from("standards").select("*").eq("domain", domain);

  if (jurisdictionType) query = query.eq("jurisdiction_type", jurisdictionType);
  if (jurisdictionName) query = query.eq("jurisdiction_name", jurisdictionName);

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) return err(error.message, 500);
  return ok(data);
}
