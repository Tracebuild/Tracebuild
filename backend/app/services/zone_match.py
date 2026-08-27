"""
A norm's `zone` column is either empty (applies to every zone in its jurisdiction)
or a comma-separated list of zone codes (e.g. "W2,W3"). A norm with a zone tag only
matches a project once the project's own Bauzone is known and equals one of the tags.
"""
from __future__ import annotations


def norm_matches_zone(norm_zone: str | None, project_zone: str | None) -> bool:
    tags = [z.strip().upper() for z in (norm_zone or "").split(",") if z.strip()]
    if not tags:
        return True
    if not project_zone or not project_zone.strip():
        return False
    return project_zone.strip().upper() in tags
