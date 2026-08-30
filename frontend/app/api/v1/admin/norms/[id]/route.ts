import { getAuthUser, ok, unauthorized, forbidden, err } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

// DELETE /api/v1/admin/norms/[id] — super_admin only. Unlike the org-scoped
// /api/v1/standards/[id] delete, this can remove any norm regardless of owning org.
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getAuthUser();
  if (!user) return unauthorized();
  if (user.role !== "super_admin") return forbidden();

  const admin = createAdminClient();
  const { data, error } = await admin.from("norms").delete().eq("id", params.id).select("id");
  if (error) return err(error.message, 500);
  if (!data?.length) return err("Norm nicht gefunden", 404);
  return ok({ id: params.id });
}
