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
import re
from supabase import Client

_SR_RE = re.compile(r'^"?SR\s', re.IGNORECASE)
_BUNDESRECHT_RE = re.compile(r"bundesgesetz|bundesverordnung", re.IGNORECASE)


def _classify_geoportal_document(doc: dict, canton: str, municipality: str) -> dict:
    """
    Classify a geoportal legal-basis document into the same layer/jurisdiction
    scheme used by the `norms` catalog, using signals from the federal
    "MGDM Nutzungsplanung" document schema (not canton-specific):
      - "SR ..." official number (Systematische Rechtssammlung) -> federal law
      - Typ "Rechtsvorschrift" -> the municipal building code (Bau-/Zonenordnung)
      - everything else ("GesetzlicheGrundlage") -> cantonal law/ordinance
    """
    offizielle_nr = doc.get("offizielle_nr") or ""
    titel = doc.get("titel") or ""
    if _SR_RE.match(offizielle_nr) or _BUNDESRECHT_RE.search(titel):
        return {"layer": 1, "jurisdiction_type": "national", "jurisdiction_name": None}
    if doc.get("typ") == "Rechtsvorschrift":
        return {"layer": 4, "jurisdiction_type": "municipal", "jurisdiction_name": municipality}
    return {"layer": 3, "jurisdiction_type": "cantonal", "jurisdiction_name": canton}


def assign_geoportal_norms_to_project(
    db: Client,
    project_id: str,
    domain: str,
    canton: str,
    municipality: str,
    zone_label: str | None,
    documents: list[dict],
) -> int:
    """
    Insert (or reuse) `norms` rows for legal-basis documents found via the geoportal
    zone lookup, and link them to the project with added_by: "geoportal" -- a distinct
    marker from "system" (catalog match) and "user" (manual add) so the UI can flag
    these as already-imported and not needing manual re-entry.
    """
    if not documents:
        return 0

    count = 0
    for doc in documents:
        link = doc.get("link")
        titel = doc.get("titel")
        if not link or not titel:
            continue
        classification = _classify_geoportal_document(doc, canton, municipality)

        existing = db.table("norms").select("id").eq("source_url", link).limit(1).execute()
        norm_id = existing.data[0]["id"] if existing.data else None

        if not norm_id:
            zone_note = f" (Zone: {zone_label})" if zone_label else ""
            inserted = db.table("norms").insert({
                "title": titel,
                "domain": domain,
                "layer": classification["layer"],
                "jurisdiction_type": classification["jurisdiction_type"],
                "jurisdiction_name": classification["jurisdiction_name"],
                "category": "Nutzungsplanung",
                "text": (
                    f"Gesetzliche Grundlage zur Nutzungsplanung{zone_note}, automatisch aus "
                    "dem Geoportal übernommen. Volltext unter der Quelle einsehbar."
                ),
                "source_url": link,
                "source_doc": doc.get("abkuerzung") or doc.get("offizielle_nr"),
            }).execute()
            if not inserted.data:
                continue
            norm_id = inserted.data[0]["id"]

        db.table("project_norms").upsert(
            {"project_id": project_id, "norm_id": norm_id, "added_by": "geoportal"},
            on_conflict="project_id,norm_id",
            ignore_duplicates=True,
        ).execute()
        count += 1

    return count


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
