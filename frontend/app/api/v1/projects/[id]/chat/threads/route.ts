import { getAuthUser, ok, unauthorized, err } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const admin = createAdminClient();

  const { data: project } = await admin
    .from("projects")
    .select("id")
    .eq("id", params.id)
    .eq("org_id", user.org_id)
    .single();
  if (!project) return err("Projekt nicht gefunden", 404);

  const { data, error } = await admin
    .from("chat_messages")
    .select("thread_id, content, created_at")
    .eq("project_id", params.id)
    .eq("role", "user")
    .order("created_at", { ascending: true });

  if (error) return err(error.message, 500);

  // Group by thread_id; null → "legacy" bucket
  const map = new Map<string, { preview: string; started_at: string }>();
  for (const msg of data ?? []) {
    const tid = (msg.thread_id as string | null) ?? "legacy";
    if (!map.has(tid)) {
      map.set(tid, {
        preview: (msg.content as string).slice(0, 80),
        started_at: msg.created_at as string,
      });
    }
  }

  // Newest first
  const threads = Array.from(map.entries())
    .map(([id, t]) => ({ id, ...t }))
    .reverse();

  return ok(threads);
}
