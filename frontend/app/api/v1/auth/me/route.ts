import { getAuthUser, ok, unauthorized } from "@/lib/auth";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();
  return ok({ id: user.id, email: user.email, org_id: user.org_id });
}
