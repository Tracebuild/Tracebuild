import io
import logging
from datetime import datetime, timezone
from uuid import uuid4
from supabase import Client
from app.models.schemas import StandardOut

logger = logging.getLogger(__name__)

_LAYER_BY_JURISDICTION = {"national": 1, "cantonal": 3, "municipal": 4}


class StandardsUploadService:
    def __init__(self, db: Client) -> None:
        self.db = db

    def _extract_text_from_pdf(self, file_bytes: bytes) -> str:
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(file_bytes))
        pages = []
        for page in reader.pages:
            text = page.extract_text() or ""
            text = text.strip()
            if text:
                pages.append(text)
        return "\n\n".join(pages)

    async def upload(
        self,
        file_bytes: bytes,
        filename: str,
        domain: str,
        jurisdiction_type: str,
        jurisdiction_name: str | None,
        org_id: str | None,
        category: str,
        source_name: str = "",
        zone: str | None = None,
    ) -> list[StandardOut]:
        """One file = one DB row (no chunking). Writes into the `norms` catalog
        that project norm-matching and plan analysis actually read from.
        Org-scoped by default (visible to every project in that organization only);
        pass org_id=None to write a platform-wide norm (visible to every org) —
        used by the admin norms catalog."""
        lower = filename.lower()
        is_pdf = lower.endswith(".pdf")

        if is_pdf:
            text = self._extract_text_from_pdf(file_bytes)
        else:
            text = file_bytes.decode("utf-8", errors="replace")

        if not text.strip():
            return []

        # Original PDF bytes in Supabase Storage hochladen, damit die Quelle
        # später angezeigt werden kann — optional, ein Fehlschlag darf das
        # Speichern des extrahierten Texts nicht blockieren.
        pdf_url: str | None = None
        if is_pdf:
            prefix = f"norms/{org_id}" if org_id else "norms/platform"
            storage_path = f"{prefix}/{uuid4()}_{filename}"
            try:
                self.db.storage.from_("documents").upload(
                    storage_path, file_bytes, {"content-type": "application/pdf"}
                )
                pdf_url = self.db.storage.from_("documents").get_public_url(storage_path)
            except Exception:
                logger.exception("Failed to upload norm PDF to storage: %s", storage_path)
                pdf_url = None

        title = source_name or filename
        row = {
            "title": title,
            "domain": domain,
            "layer": _LAYER_BY_JURISDICTION.get(jurisdiction_type, 3),
            "jurisdiction_type": jurisdiction_type,
            "jurisdiction_name": None if jurisdiction_type == "national" else (jurisdiction_name or None),
            "org_id": org_id,
            "category": category,
            "text": text[:100_000],
            "source_url": source_name or filename,
            "zone": zone or None,
            "pdf_url": pdf_url,
        }

        res = self.db.table("norms").insert(row).execute()
        return [StandardOut(**r) for r in (res.data or [])]

    async def list_all(
        self,
        org_id: str,
        domain: str | None = None,
        jurisdiction_type: str | None = None,
        jurisdiction_name: str | None = None,
    ) -> list[StandardOut]:
        query = self.db.table("norms").select("*").eq("org_id", org_id).order("created_at", desc=True)
        if domain:
            query = query.eq("domain", domain)
        if jurisdiction_type:
            query = query.eq("jurisdiction_type", jurisdiction_type)
        if jurisdiction_name:
            query = query.eq("jurisdiction_name", jurisdiction_name)
        res = query.execute()
        return [StandardOut(**row) for row in (res.data or [])]

    async def delete(self, standard_id: str, org_id: str) -> None:
        self.db.table("norms").delete().eq("id", standard_id).eq("org_id", org_id).execute()

    async def list_all_admin(
        self,
        domain: str | None = None,
        jurisdiction_type: str | None = None,
        jurisdiction_name: str | None = None,
        org_id: str | None = None,
        platform_only: bool = False,
    ) -> list[dict]:
        """Admin (super_admin) view: every norm across every organization, each row
        annotated with its owning org's name (org_name=None means platform-wide) and,
        when promoted, the org it was originally uploaded by."""
        query = self.db.table("norms").select("*").order("created_at", desc=True)
        if domain:
            query = query.eq("domain", domain)
        if jurisdiction_type:
            query = query.eq("jurisdiction_type", jurisdiction_type)
        if jurisdiction_name:
            query = query.eq("jurisdiction_name", jurisdiction_name)
        if platform_only:
            query = query.is_("org_id", "null")
        elif org_id:
            query = query.eq("org_id", org_id)

        res = query.execute()
        norms = res.data or []

        org_ids = {n["org_id"] for n in norms if n.get("org_id")}
        org_ids |= {n["promoted_from_org_id"] for n in norms if n.get("promoted_from_org_id")}

        org_name_by_id: dict[str, str] = {}
        if org_ids:
            org_res = self.db.table("organizations").select("id, name").in_("id", list(org_ids)).execute()
            org_name_by_id = {o["id"]: o["name"] for o in (org_res.data or [])}

        return [
            {
                **n,
                "org_name": org_name_by_id.get(n["org_id"]) if n.get("org_id") else None,
                "promoted_from_org_name": (
                    org_name_by_id.get(n["promoted_from_org_id"]) if n.get("promoted_from_org_id") else None
                ),
            }
            for n in norms
        ]

    async def promote(self, norm_id: str) -> dict:
        """Makes an org-owned norm platform-wide (org_id -> null), recording
        provenance in promoted_from_org_id/promoted_at. Raises ValueError("not_found")
        or ValueError("already_platform_wide") on error conditions."""
        res = self.db.table("norms").select("id, org_id").eq("id", norm_id).limit(1).execute()
        row = res.data[0] if res.data else None
        if not row:
            raise ValueError("not_found")
        if not row.get("org_id"):
            raise ValueError("already_platform_wide")

        update_res = (
            self.db.table("norms")
            .update({
                "promoted_from_org_id": row["org_id"],
                "promoted_at": datetime.now(timezone.utc).isoformat(),
                "org_id": None,
            })
            .eq("id", norm_id)
            .execute()
        )
        return (update_res.data or [{}])[0]

    async def delete_any(self, standard_id: str) -> None:
        """Admin (super_admin) delete: removes any norm regardless of owning org."""
        self.db.table("norms").delete().eq("id", standard_id).execute()
