import { getAuthUser, ok, unauthorized, err } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const admin = createAdminClient();
  const { error } = await admin.from("standards").delete().eq("id", params.id);
  if (error) return err(error.message, 500);
  return ok({ id: params.id });
}
