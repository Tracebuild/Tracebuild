import io
from supabase import Client
from app.models.schemas import StandardOut

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
        org_id: str,
        category: str,
        source_name: str = "",
        zone: str | None = None,
    ) -> list[StandardOut]:
        """One file = one DB row (no chunking). Writes into the `norms` catalog
        that project norm-matching and plan analysis actually read from.
        Org-scoped for now — visible to every project in this organization,
        not across organizations (no platform-wide catalog yet)."""
        lower = filename.lower()

        if lower.endswith(".pdf"):
            text = self._extract_text_from_pdf(file_bytes)
        else:
            text = file_bytes.decode("utf-8", errors="replace")

        if not text.strip():
            return []

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
