import type { SupabaseClient } from "@supabase/supabase-js";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-") || "org";
}

export async function uniqueSlug(
  admin: SupabaseClient,
  base: string,
  excludeId?: string,
): Promise<string> {
  let slug = base;
  let n = 0;
  for (;;) {
    let q = admin.from("organizations").select("id").eq("slug", slug);
    if (excludeId) q = q.neq("id", excludeId);
    const { data } = await q.limit(1);
    if (!data?.length) return slug;
    n++;
    slug = `${base}-${n}`;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatOrg(row: Record<string, any>) {
  return {
    id:             row.id               as string,
    name:           row.name             as string,
    slug:           row.slug             as string,
    description:    (row.description     ?? null) as string | null,
    status:         row.status           as string,
    plan:           row.plan             as string,
    ownerName:      (row.owner_name      ?? null) as string | null,
    ownerEmail:     (row.owner_email     ?? null) as string | null,
    userLimit:      (row.user_limit      ?? null) as number | null,
    projectLimit:   (row.project_limit   ?? null) as number | null,
    storageLimitGb: (row.storage_limit_gb ?? null) as number | null,
    monthlyBudget:  (row.monthly_budget  ?? null) as number | null,
    createdAt:      row.created_at       as string,
    updatedAt:      row.updated_at       as string,
    closedAt:       (row.closed_at       ?? null) as string | null,
    archivedAt:     (row.archived_at     ?? null) as string | null,
    isDefault:      (row.is_default      ?? false) as boolean,
  };
}
