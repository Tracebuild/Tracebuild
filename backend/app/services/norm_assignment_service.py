"""
Assign norms from the `norms` table to a project based on location and org.

Matching rules (applied after domain filter):
  Layer 1  national / international  — always included
  Layer 2+ cantonal                  — WHERE jurisdiction_name = canton
  Layer 3+ municipal                 — WHERE jurisdiction_name = municipality
  org-private                        — WHERE org_id = project.org_id

All matches are written as `project_norms` rows (upsert, on_conflict ignored).
Returns the number of norms assigned.
"""
from __future__ import annotations
from supabase import Client


def assign_norms_to_project(
    db: Client,
    project_id: str,
    org_id: str,
    canton: str,
    municipality: str,
    domain: str = "bau",
) -> int:
    res = (
        db.table("norms")
        .select("id, layer, jurisdiction_type, jurisdiction_name, org_id")
        .eq("domain", domain)
        .execute()
    )
    norms = res.data or []

    matching_ids: list[str] = []
    for norm in norms:
        layer = norm.get("layer", 2)
        jtype = norm.get("jurisdiction_type", "")
        jname = norm.get("jurisdiction_name")
        norm_org = norm.get("org_id")

        if layer == 1:
            matching_ids.append(norm["id"])
        elif jtype == "cantonal" and jname == canton:
            matching_ids.append(norm["id"])
        elif jtype == "municipal" and jname == municipality:
            matching_ids.append(norm["id"])
        elif norm_org and norm_org == org_id:
            matching_ids.append(norm["id"])

    if not matching_ids:
        return 0

    rows = [
        {"project_id": project_id, "norm_id": nid, "added_by": "system"}
        for nid in matching_ids
    ]
    db.table("project_norms").upsert(
        rows,
        on_conflict="project_id,norm_id",
        ignore_duplicates=True,
    ).execute()

    return len(rows)
